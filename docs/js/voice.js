// voice.js: speak or type in your own language (owner, 2026-11-03). A slim dictation dock at the bottom of the drawing column, level with
// the message box (12:22: "only 2 rows ... a settings popup that must not stay and take my space ... control everything by words"; one row
// since 2026-11-03 afternoon: "the English translation already appears in the chat's message box", so the English row was dropped):
//   - one row: the microphone toggle, the language code (e.g. "RO") and what the browser's speech recognition understands, in the
//     dictation language, live and editable in place. Its English translation goes straight into the chat's message box as soon as it is
//     translated; the English is edited there. A status (translating, no translation, the microphone not allowed, a download to start)
//     is a small note at the end of the row (dockNote); a recognised command is a toast above the dock. The code opens a small settings
//     popover (language, send after a pause, read replies aloud, the opt-in online translation, what this browser supports), closed by a
//     click outside it or Escape.
//   - speech to text: the browser's Web Speech API (SpeechRecognition / webkitSpeechRecognition). Once the mic is on it stays on (12:22):
//     Chrome ends a session on silence, after about a minute, on no-speech / network / aborted errors and when the tab is hidden; the dock
//     starts a new session after a short backoff, keeps the text gathered so far, and its "listening" indicator does not flicker. It stops
//     for real only on "stop listening" / "oprește", a click on the mic, a refused permission (said plainly) or when the page closes.
//     The mic being on is remembered: after a reload a one-tap "Resume listening" shows (the browser needs a click to start the microphone).
//   - spoken commands (COMMANDS, one table per language: Romanian and English): send, clear, stop listening, do it anyway, edit. A command
//     is recognised only when it is the whole utterance or ends it; the command words are never sent ("make Done red send" sends
//     "make Done red"). "undo" is not a dock command: it is a normal message to the readers.
//   - translation to English when the language is not English: the browser's built-in on-device Translator API (Chrome's `Translator`, or
//     the older `translation` / `ai.translator`), feature-detected, its availability checked per language pair, its model download shown;
//     translated as soon as a transcript is final, and after a short pause for interim text. Without it the dock's note says plainly that
//     there is no translation, nothing goes to the message box, and nothing is sent until the user writes the English in the message box
//     (untranslated text is never sent: the readers would misread it). An online fallback (MyMemory, free and keyless) is
//     used only when the user turns it on (off by default; the popover says what is sent).
//   - what reaches the chat: the English text in the message box, as a normal message (every reader reads English); the original goes along
//     as `meta` and the chat shows it under the message in small text; docs/js/collect.js stores both.
//   - text to speech (optional, off by default): VSS-BERT's reply to a message sent from the dock is read aloud with speechSynthesis, in the
//     user's language when the same Translator can translate it back without a download, else in English. Recognition pauses while the
//     reply is spoken (the dock does not listen to its own voice) and resumes after it.
//   - every choice (language, switches, mic on) is kept in localStorage (guarded; the dock works without it).
// The pure parts (language list, translation flow, commands, restart backoff, voice choice, preferences) are exported for node tests
// (training/sketch/test_voice.mjs); mount() builds the dock in the page.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.VoiceKit = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PREFS_KEY = 'sop.voice';
  const FIRST = ['ro-RO', 'en-US'];
  // The Web Speech API has no call that lists its recognition languages; these are the languages Chrome's recognition documents (a selection),
  // added after Romanian, English, the browser's own preferred languages and the languages of its speech synthesis voices.
  const COMMON = ['en-GB', 'fr-FR', 'de-DE', 'es-ES', 'es-MX', 'it-IT', 'pt-PT', 'pt-BR', 'nl-NL', 'pl-PL', 'hu-HU', 'cs-CZ', 'sk-SK', 'bg-BG',
    'el-GR', 'uk-UA', 'ru-RU', 'tr-TR', 'sv-SE', 'da-DK', 'fi-FI', 'nb-NO', 'hr-HR', 'sr-RS', 'sl-SI', 'lt-LT', 'lv-LV', 'et-EE', 'ca-ES',
    'ar-SA', 'he-IL', 'hi-IN', 'bn-IN', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'id-ID', 'ms-MY', 'vi-VN', 'th-TH', 'fil-PH'];
  // autoSend: send after a pause in speech (off by default); micOn: the mic was on when the page was left (a one-tap resume after a reload)
  const DEFAULT_PREFS = { lang: 'ro-RO', autoSend: false, pauseMs: 2000, tts: false, online: false, micOn: false };
  const ONLINE = { name: 'MyMemory', host: 'api.mymemory.translated.net', max: 480 };

  /* ---------------- languages ---------------- */
  /** a BCP-47 tag in its canonical form ("ro-ro" -> "ro-RO"), or null when it is not a valid tag */
  function normTag(t) {
    t = String(t || '').trim().replace(/_/g, '-'); if (!t) return null;
    try { const c = Intl.getCanonicalLocales(t); return c[0] || null; } catch (e) { return null; }
  }
  const primary = t => String(t || '').toLowerCase().split(/[-_]/)[0];
  const isEnglish = t => primary(t) === 'en';
  /** the language's name in English ("ro-RO" -> "Romanian (Romania)") */
  function langName(t) {
    try { const d = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'standard' }); const n = d.of(t); if (n && n !== t) return n; } catch (e) { /* no Intl.DisplayNames */ }
    return t;
  }
  /** the name of the language alone ("ro-RO" -> "Romanian"): for sentences such as "Translation Romanian → English" */
  const shortName = t => langName(primary(t));
  /**
   * The list of the language select: Romanian and English first, then the browser's preferred languages, the languages of its speech
   * synthesis voices, then COMMON; no tag twice (case-insensitive). -> [{tag, name}]
   */
  function languageList(o) {
    o = o || {};
    const seen = new Set(), out = [];
    const add = t => { const c = normTag(t); if (!c) return; const k = c.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push({ tag: c, name: langName(c) }); };
    FIRST.forEach(add);
    (o.navigatorLanguages || []).forEach(add);
    (o.voiceLangs || []).forEach(add);
    COMMON.forEach(add);
    (o.extra || []).forEach(add);
    return out;
  }

  /* ---------------- preferences ---------------- */
  function loadPrefs(storage) {
    let p = {};
    try { const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null); const raw = s && s.getItem(PREFS_KEY); if (raw) p = JSON.parse(raw) || {}; } catch (e) { p = {}; }
    const out = Object.assign({}, DEFAULT_PREFS);
    if (normTag(p.lang)) out.lang = normTag(p.lang);
    for (const k of ['autoSend', 'tts', 'online', 'micOn']) if (typeof p[k] === 'boolean') out[k] = p[k];
    if (typeof p.pauseMs === 'number' && p.pauseMs >= 800 && p.pauseMs <= 10000) out.pauseMs = p.pauseMs;
    return out;
  }
  function savePrefs(p, storage) {
    try { const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null); if (s) s.setItem(PREFS_KEY, JSON.stringify(p)); return true; } catch (e) { return false; }
  }

  /* ---------------- translation ---------------- */
  /**
   * The translator of the browser, if any: {kind: 'Translator' | 'translation' | 'ai', availability(from, to) -> state, create(from, to, onProgress)}.
   * state: 'available' (on this device), 'downloadable' (the model must be downloaded once; creating it needs a click), 'downloading',
   * 'unavailable' (not this pair). g: the global object (window).
   */
  function builtinTranslator(g) {
    g = g || (typeof self !== 'undefined' ? self : {});
    const monitor = onProgress => m => { try { m.addEventListener('downloadprogress', e => { if (onProgress) onProgress(typeof e.loaded === 'number' ? (e.total > 1 ? e.loaded / e.total : e.loaded) : null); }); } catch (e) { /* no progress */ } };
    if (g.Translator && typeof g.Translator.availability === 'function') {
      return { kind: 'Translator',
        availability: async (s, t) => normState(await g.Translator.availability({ sourceLanguage: s, targetLanguage: t })),
        create: (s, t, onProgress) => g.Translator.create({ sourceLanguage: s, targetLanguage: t, monitor: monitor(onProgress) }) };
    }
    if (g.translation && typeof g.translation.canTranslate === 'function') {
      return { kind: 'translation',
        availability: async (s, t) => normState(await g.translation.canTranslate({ sourceLanguage: s, targetLanguage: t })),
        create: (s, t, onProgress) => g.translation.createTranslator({ sourceLanguage: s, targetLanguage: t, monitor: monitor(onProgress) }) };
    }
    if (g.ai && g.ai.translator && typeof g.ai.translator.create === 'function') {
      return { kind: 'ai',
        availability: async (s, t) => { const c = await g.ai.translator.capabilities(); return normState(c.languagePairAvailable(s, t)); },
        create: (s, t, onProgress) => g.ai.translator.create({ sourceLanguage: s, targetLanguage: t, monitor: monitor(onProgress) }) };
    }
    return null;
  }
  /** the states of the three versions of the API as one: readily -> available, after-download -> downloadable, no -> unavailable */
  function normState(s) {
    s = String(s || '');
    if (s === 'readily' || s === 'available') return 'available';
    if (s === 'after-download' || s === 'downloadable') return 'downloadable';
    if (s === 'downloading') return 'downloading';
    return 'unavailable';
  }
  /**
   * The translation flow. env: {global, fetch, online: () => bool (the user's opt-in to the online fallback)}.
   * -> {check(from, to) -> {state, api}, translate(text, from, to, {onProgress, onState}) -> {text, by, state, error?}, ready(from, to)}
   * by: 'not-needed' (English), 'builtin' (on this device), 'online' (MyMemory, only when opted in), 'none' (the text is returned as it is).
   * Instances are cached per pair; a failed create is not cached (the next try may work, e.g. after a click).
   */
  function createTranslation(env) {
    env = env || {};
    const api = builtinTranslator(env.global);
    const inst = new Map(), states = new Map();
    const pair = (s, t) => `${primary(s)}>${primary(t)}`;
    async function check(from, to) {
      if (primary(from) === primary(to)) return { state: 'not-needed', api: api ? api.kind : null };
      if (!api) return { state: 'none', api: null };
      if (inst.has(pair(from, to))) return { state: 'available', api: api.kind };
      try { const s = await api.availability(primary(from), primary(to)); states.set(pair(from, to), s); return { state: s, api: api.kind }; }
      catch (e) { return { state: 'unavailable', api: api.kind, error: String(e && e.message || e) }; }
    }
    /** create the translator now (call it inside a click when the state is downloadable: the browser needs the user's gesture) */
    async function ready(from, to, onProgress) {
      const k = pair(from, to); if (inst.has(k)) return inst.get(k);
      if (!api) return null;
      const t = await api.create(primary(from), primary(to), onProgress);
      inst.set(k, t); states.set(k, 'available'); return t;
    }
    async function online(text, from, to) {
      const f = env.fetch || (typeof fetch !== 'undefined' ? fetch : null); if (!f) throw new Error('no fetch');
      const q = String(text).slice(0, ONLINE.max);
      const url = `https://${ONLINE.host}/get?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(primary(from))}|${encodeURIComponent(primary(to))}`;
      const r = await f(url); if (!r.ok) throw new Error(`${ONLINE.name} answered ${r.status}`);
      const j = await r.json(); const out = j && j.responseData && j.responseData.translatedText;
      if (!out || (j.responseStatus && +j.responseStatus !== 200)) throw new Error(`${ONLINE.name}: ${(j && j.responseDetails) || 'no translation'}`);
      return String(out);
    }
    async function translate(text, from, to, o) {
      o = o || {};
      text = String(text || '');
      if (!text.trim()) return { text: '', by: 'none', state: 'empty' };
      const c = await check(from, to);
      if (c.state === 'not-needed') return { text, by: 'not-needed', state: c.state };
      let err = null;
      if (c.state === 'available' || c.state === 'downloadable' || c.state === 'downloading') {
        try {
          if (o.onState) o.onState(c.state);
          const t = await ready(from, to, o.onProgress);
          const out = await t.translate(text);
          return { text: String(out), by: 'builtin', state: 'available' };
        } catch (e) { err = String(e && e.message || e); }
      }
      if (env.online && env.online()) {
        try { return { text: await online(text, from, to), by: 'online', state: c.state, error: err || undefined }; }
        catch (e) { err = String(e && e.message || e); }
      }
      return { text, by: 'none', state: c.state, error: err || undefined };
    }
    return { api: api ? api.kind : null, check, ready, translate, cached: (s, t) => inst.has(pair(s, t)) };
  }

  /* ---------------- speech ---------------- */
  const recognitionCtor = g => (g = g || (typeof self !== 'undefined' ? self : {}), g.SpeechRecognition || g.webkitSpeechRecognition || null);
  /** an error of SpeechRecognition in plain words */
  function recognitionError(code) {
    return ({
      'not-allowed': 'The browser did not allow the microphone. Allow it for this site (the icon in the address bar) and try again.',
      'service-not-allowed': 'The browser does not allow speech recognition here.',
      'no-speech': 'No speech was heard. Try again, closer to the microphone.',
      'audio-capture': 'No microphone was found.',
      'network': 'Speech recognition needs the network in this browser, and the network failed.',
      'language-not-supported': 'This browser cannot recognise this language. Pick another one, or type.',
      'aborted': 'Stopped.'
    })[code] || `Speech recognition stopped (${code}).`;
  }
  /** the voices of speechSynthesis for a tag: the exact tag first, then the same language */
  function voicesFor(voices, tag) {
    const t = String(tag || '').toLowerCase().replace(/_/g, '-'), p = primary(tag);
    const L = v => String(v.lang || '').toLowerCase().replace(/_/g, '-');
    const exact = (voices || []).filter(v => L(v) === t), same = (voices || []).filter(v => L(v) !== t && primary(L(v)) === p);
    return exact.concat(same);
  }
  const pickVoice = (voices, tag) => voicesFor(voices, tag)[0] || null;

  /** what this browser supports, as the settings popover's three lines say it (pure: tests). s: {sr: bool, tr: {state, api}, voices: n for the language,
   *  voicesEn: n English, total: n, lang} */
  function supportLines(s) {
    const L = shortName(s.lang);
    const sr = s.sr ? 'yes (the browser’s Web Speech API)' : 'no: this browser has no Web Speech API; you can type instead';
    const st = s.tr ? s.tr.state : 'none';
    const tr = st === 'not-needed' ? 'not needed (English)'
      : st === 'available' ? 'yes, on this device (the browser’s built-in Translator)'
      : st === 'downloadable' ? 'yes, after a one-time download of the language model to this device (starts when you translate)'
      : st === 'downloading' ? 'the language model is downloading to this device…'
      : st === 'unavailable' ? `no: this browser’s built-in Translator does not translate ${L} to English`
      : 'no: this browser has no built-in translation';
    const tts = !s.total ? 'no voices in this browser' : s.voices ? `${s.voices} voice${s.voices === 1 ? '' : 's'} for ${L}` : `no voice for ${L}${s.voicesEn ? `; replies would be read in English (${s.voicesEn} voice${s.voicesEn === 1 ? '' : 's'})` : ''}`;
    return { sr: `Speech recognition: ${sr}`, tr: isEnglish(s.lang) ? 'Translation: not needed (English)' : `Translation ${L} → English: ${tr}`, tts: `Speech synthesis: ${tts}` };
  }

  /* ---------------- the dock's note ---------------- */
  /** the words "no translation" for a language (the note at the end of the dock's row, and its title) */
  const noTranslationText = lang => `No translation on this device for ${shortName(lang)} → English: write the English in the message box, or turn on online translation in the dock settings`;
  /**
   * The small note at the end of the dock's row (pure: tests). s: {status: {text, kind} | null (a status of the dock: translating,
   * downloading, the microphone stopped), lang, noTranslation: the last text could not be translated and the message box holds no English
   * from the user} -> {text, kind: 'note' | 'busy' | 'err'} | null (no note: the English is in the message box, or there is no text).
   */
  function dockNote(s) {
    s = s || {};
    if (s.status && s.status.text) return { text: s.status.text, kind: s.status.kind || 'note' };
    if (s.noTranslation && !isEnglish(s.lang)) return { text: noTranslationText(s.lang), kind: 'err' };
    return null;
  }

  /* ---------------- spoken commands ---------------- */
  /**
   * The spoken commands, one table per language (its primary subtag). A command is looked up in the table of the dictation language and in
   * the English one, and it counts only when it is the whole utterance or its end: "make Done red send" sends "make Done red", while "send
   * Start to the back" is a message. `tail`: the words dropped between the message and a trailing command ("make Done red and send").
   * Matching ignores case, diacritics (speech recognition often drops them: "sterge", "opreste"), hyphens and punctuation.
   * To add a language, add a table with the same keys (a missing key simply has no command in that language), e.g.
   *   fr: { send: ['envoie'], clear: ['efface'], stop: ['arrête d’écouter'], anyway: ['fais-le quand même'], edit: ['modifie'], tail: ['et'] }
   * "undo" is deliberately absent: it is a message to the readers, sent as text like any other.
   */
  const COMMANDS = {
    en: { send: ['send', 'send it', 'send the message'], clear: ['clear', 'clear it', 'clear all'], stop: ['stop listening'],
      anyway: ['do it anyway'], edit: ['edit'], tail: ['and', 'then', 'now', 'please', 'ok', 'okay'] },
    ro: { send: ['trimite', 'trimite-l', 'trimite mesajul', 'trimite acum'], clear: ['șterge', 'șterge tot', 'anulează'],
      stop: ['oprește', 'oprește-te', 'nu mai asculta'], anyway: ['fă-o oricum', 'fă oricum'], edit: ['editează'],
      tail: ['și', 'apoi', 'acum', 'te rog'] }
  };
  const COMMAND_KEYS = ['send', 'clear', 'stop', 'anyway', 'edit'];
  const foldWord = w => String(w).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  /** the words of a text with their offsets: [{w (folded), i (start), j (end)}] (letters and digits; hyphens and punctuation split) */
  function words(s) { const out = []; for (const m of String(s).matchAll(/[\p{L}\p{N}]+/gu)) out.push({ w: foldWord(m[0]), i: m.index, j: m.index + m[0].length }); return out; }
  /** the command phrases for a dictation language: its table, then English; longest first. -> [{cmd, phrase, ws}] */
  function commandPhrases(lang) {
    const tabs = [COMMANDS[primary(lang)], COMMANDS.en].filter((t, k, a) => t && a.indexOf(t) === k);
    const out = [];
    for (const t of tabs) for (const cmd of COMMAND_KEYS) for (const phrase of t[cmd] || []) out.push({ cmd, phrase, ws: words(phrase).map(x => x.w) });
    return out.sort((a, b) => b.ws.length - a.ws.length);
  }
  function tailWords(lang) { return [COMMANDS[primary(lang)], COMMANDS.en].filter(Boolean).flatMap(t => (t.tail || []).map(p => words(p).map(x => x.w))).sort((a, b) => b.length - a.length); }
  const endsWith = (ws, p) => p.length && ws.length >= p.length && p.every((w, k) => ws[ws.length - p.length + k].w === w);
  /**
   * An utterance -> {text, command, phrase}: command is one of COMMAND_KEYS when the utterance is that command or ends with it (text: the words
   * before it, without a joining "and" / "și" and trailing punctuation), else null and text is the utterance unchanged.
   */
  function parseCommand(utterance, lang) {
    const u = String(utterance || ''), ws = words(u);
    for (const c of commandPhrases(lang)) {
      if (!endsWith(ws, c.ws)) continue;
      let rest = ws.slice(0, ws.length - c.ws.length);
      for (let again = true; again && rest.length;) { again = false; for (const t of tailWords(lang)) if (endsWith(rest, t)) { rest = rest.slice(0, rest.length - t.length); again = true; break; } }
      const text = rest.length ? u.slice(0, rest[rest.length - 1].j).trim() : '';
      return { text, command: c.cmd, phrase: c.phrase };
    }
    return { text: u, command: null, phrase: null };
  }
  /** the command words of a language, for the popover ("trimite (send), ...") */
  function commandHelp(lang) {
    const t = COMMANDS[primary(lang)] || COMMANDS.en, en = COMMANDS.en;
    const NAME = { send: 'send', clear: 'clear', stop: 'stop listening', anyway: 'do it anyway', edit: 'edit' };
    return COMMAND_KEYS.map(k => ({ cmd: k, name: NAME[k], say: (t[k] || en[k])[0] }));
  }

  /* ---------------- staying on ---------------- */
  /** errors after which listening stops for real: the permission was refused, or it can never work here (no microphone, no such language) */
  const FATAL = new Set(['not-allowed', 'service-not-allowed', 'language-not-supported', 'audio-capture']);
  /** the wait before a new recognition session: short after a session that heard something, then doubling up to 5 s while sessions keep
   *  ending without a result (a network failure, a blocked microphone that does not say so) */
  const restartDelay = fails => fails <= 0 ? 150 : Math.min(5000, 300 * 2 ** (fails - 1));

  /* ---------------- the dock ---------------- */
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MIC = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>';
  const CARET = '<svg class="vd-caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 4l3 3 3-3"/></svg>';
  const code = t => primary(t).toUpperCase();

  /**
   * Build the dictation dock.
   * opts: {dock (the element to fill), composer (the chat's message box: the English text goes there), send(meta) (sends the message box
   *        with this meta, as the send button does), actions: {anyway() -> bool, edit() -> bool} (press the last such button in the chat),
   *        global (window), document, storage}
   * meta: {via: 'voice' | 'typed', lang, original, translation: {by, edited}, speak: bool}
   * -> {consume(text) -> meta | null, onReply(meta, text), setMic(on), command(name), prefs, el, translation, state()}
   */
  function mount(opts) {
    const g = opts.global || window, doc = opts.document || document, ta = opts.composer;
    const prefs = loadPrefs(opts.storage);
    const save = () => savePrefs(prefs, opts.storage);
    const tr = createTranslation({ global: g, fetch: g.fetch ? g.fetch.bind(g) : null, online: () => prefs.online });
    const SR = recognitionCtor(g), synth = g.speechSynthesis || null;
    const voices = () => { try { return synth ? synth.getVoices() || [] : []; } catch (e) { return []; } };
    const list = () => languageList({ navigatorLanguages: (g.navigator && g.navigator.languages) || [], voiceLangs: voices().map(v => v.lang) });

    const el = opts.dock;
    el.classList.add('vd');
    el.innerHTML = `<button type="button" class="vd-mic" data-vd="mic" aria-pressed="false">${MIC}</button>
<div class="vd-row"><button type="button" class="vd-lang" data-vd="lang" aria-haspopup="dialog" aria-expanded="false" aria-controls="vd-pop"><span class="vd-code"></span>${CARET}</button><input class="vd-src" id="vd-src" type="text" autocomplete="off" spellcheck="false" enterkeyhint="send"><span class="vd-st" role="status" aria-live="polite"></span></div>
<div class="vd-aside"><button type="button" class="vd-resume" data-vd="resume" hidden>${MIC}<span>Resume listening</span></button><button type="button" class="vd-resume" data-vd="download" hidden><span>Download</span></button><span class="vd-toast" role="status" aria-live="polite"></span></div>
<div class="vd-pop" id="vd-pop" role="dialog" aria-label="Dictation settings" hidden>
  <div class="vd-pl"><label for="vd-lang">Language</label><select id="vd-lang"></select></div>
  <input id="vd-tag" type="text" placeholder="BCP-47 tag, e.g. pt-BR" aria-label="Language tag (BCP-47)" autocomplete="off" spellcheck="false" hidden>
  <div class="vd-tagerr" role="alert" hidden></div>
  <label class="vd-ck"><input type="checkbox" data-pref="autoSend"> <span>Send after a pause of 2 seconds</span></label>
  <label class="vd-ck"><input type="checkbox" data-pref="tts"> <span>Read replies aloud (listening pauses meanwhile)</span></label>
  <label class="vd-ck"><input type="checkbox" data-pref="online"> <span>Online translation (${ONLINE.name}) when this browser has none: your text is then sent to ${ONLINE.host}</span></label>
  <p class="vd-cmds"></p>
  <details class="vd-more"><summary>What this browser supports</summary><ul class="vd-support"><li data-k="sr"></li><li data-k="tr"></li><li data-k="tts"></li></ul>
  <p class="vd-note">Speech recognition is the browser’s: Chrome may send the audio to its vendor’s servers (Google). Translation runs on this device.</p></details>
</div>`;
    const $ = s => el.querySelector(s);
    const micBtn = $('[data-vd="mic"]'), langBtn = $('[data-vd="lang"]'), src = $('#vd-src'), noteEl = $('.vd-st'), pop = $('#vd-pop');
    const sel = $('#vd-lang'), tagIn = $('#vd-tag'), toastEl = $('.vd-toast'), resumeBtn = $('[data-vd="resume"]'), downloadBtn = $('[data-vd="download"]');

    const lang = () => prefs.lang;
    const english = () => isEnglish(lang());
    // what the recognition gathered: base (the text before this session) + finals (this session's final results) + interim (not final yet)
    let base = '', finals = '', interim = '', heard = false;
    let wantOn = false, paused = false, rec = null, fails = 0, gotResult = false, restartT = null;
    // putInBox: the last text the dock put in the message box (a box holding something else holds the user's own English)
    let lastTr = null, trSeq = 0, trT = null, pauseT = null, toastT = null, putInBox = '', status = null;

    /* ---- the row ---- */
    const gathered = withInterim => { const t = base + finals; return withInterim && interim ? (t && !/\s$/.test(t) ? t + ' ' : t) + interim : t; };
    function render() {
      const v = gathered(true).trim();
      if (src.value !== v) { src.value = v; if (doc.activeElement !== src) src.scrollLeft = src.scrollWidth; }
      el.classList.toggle('has-text', !!v.trim());
    }
    function placeholder() {
      const n = shortName(lang());
      src.placeholder = !SR ? `Type in ${n} here (this browser cannot listen)` : wantOn ? (paused ? 'Paused while the reply is read aloud…' : `Listening… speak ${n}`) : `Tap the mic and speak ${n}, or type here`;
      src.setAttribute('aria-label', `What you said, in ${n} (you can edit it)`);
    }
    /** the user's own English in the message box: something the dock did not put there */
    const ownEnglish = () => !!(ta && ta.value.trim() && ta.value !== putInBox);
    /** the note at the end of the row (dockNote): a status, or "no translation" while the box holds no English of the user's */
    function showOut() {
      const n = dockNote({ status, lang: lang(), noTranslation: !!(lastTr && lastTr.by === 'none' && gathered(false).trim() && !ownEnglish()) });
      noteEl.textContent = n ? n.text : ''; noteEl.title = n ? n.text : ''; noteEl.className = 'vd-st' + (n ? ' ' + n.kind : '');
      el.classList.toggle('has-note', !!n);
      downloadBtn.hidden = !(status && status.download);
    }
    const setStatus = s => { status = s; showOut(); };
    function toast(t, kind) {
      clearTimeout(toastT); toastEl.textContent = t; toastEl.className = 'vd-toast on' + (kind ? ' ' + kind : '');
      toastT = setTimeout(() => { toastEl.className = 'vd-toast'; }, kind === 'err' ? 4000 : 1800);
    }

    /* ---- the message box ---- */
    /** put the English text in the chat's box, unless the user has written something else there since the dock last did */
    function putBox(t, force) {
      if (!ta) return;
      if (force || ta.value === putInBox || !ta.value.trim()) { ta.value = t; putInBox = t; ta.dispatchEvent(new Event('input')); }
    }

    /* ---- translation ---- */
    // Never send untranslated text to the readers (owner, 2026-11-03): when there is no translation, the dock keeps the text, puts nothing in
    // the message box, says so in the note at the end of its row, and sends only what the user writes in English in the message box.
    async function translateNow(o) {
      o = o || {};
      const text = (o.text != null ? o.text : stripCommand(gathered(true))).trim(), seq = ++trSeq;
      if (english()) { lastTr = { src: text, text, by: 'not-needed' }; putBox(text); setStatus(null); return lastTr; }
      if (!text) { lastTr = null; putBox(''); setStatus(null); return null; }
      const c = await tr.check(lang(), 'en');
      if (c.state === 'downloadable' && !o.gesture && !tr.cached(lang(), 'en')) {
        setStatus({ kind: 'note', text: `The ${shortName(lang())} → English model downloads once to this device: press Download`, download: true });
        return null;
      }
      if (c.state === 'downloadable' || c.state === 'downloading') setStatus({ kind: 'busy', text: 'Downloading the language model…' });
      else if (!lastTr) setStatus({ kind: 'busy', text: 'Translating…' });
      const r = await tr.translate(text, lang(), 'en', { onProgress: p => { if (seq === trSeq && p != null) setStatus({ kind: 'busy', text: `Downloading the language model… ${Math.round(p * 100)}%` }); } });
      const res = r.by === 'none' ? { src: text, text: '', by: 'none', error: r.error } : { src: text, text: r.text, by: r.by };
      if (seq !== trSeq) return res;   // a newer text is being translated: this one is still the right answer for its own text
      lastTr = res; status = null;
      if (res.by === 'none') { if (ta && ta.value === putInBox) putBox(''); }
      else putBox(res.text);
      showOut();
      if (o.gesture && r.by === 'builtin' && c.state !== 'available') support();
      return res;
    }
    const translateSoon = ms => { clearTimeout(trT); trT = setTimeout(() => translateNow(), ms); };
    const stripCommand = t => { const p = parseCommand(t, lang()); return p.command ? p.text : t; };
    /* ---- recognition: on until stopped for real ---- */
    function micUI() {
      micBtn.setAttribute('aria-pressed', String(wantOn));
      micBtn.classList.toggle('on', wantOn); micBtn.classList.toggle('paused', wantOn && paused);
      const t = !SR ? 'This browser cannot listen (no Web Speech API); type in the dock instead' : wantOn ? (paused ? 'Listening is paused while the reply is read aloud. Click to stop listening' : `Listening in ${langName(lang())}. Click to stop`) : `Start listening in ${langName(lang())}`;
      micBtn.title = t; micBtn.setAttribute('aria-label', t); micBtn.disabled = !SR;
      el.classList.toggle('listening', wantOn);
      resumeBtn.hidden = !(SR && !wantOn && prefs.micOn && !gathered(false).trim());
      placeholder();
    }
    function startSession() {
      clearTimeout(restartT);
      if (!SR || !wantOn || paused || rec) return;
      if (doc.hidden) return;   // a hidden tab cannot listen; visibilitychange starts it again
      let r;
      try { r = new SR(); } catch (e) { stopFor(`Speech recognition could not start: ${e.message}`); return; }
      r.lang = lang(); r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
      const b = src.value; base = b && !/\s$/.test(b) ? b + ' ' : b; finals = ''; interim = ''; gotResult = false;
      r.onresult = ev => onResult(r, ev);
      r.onerror = ev => onError(r, ev && ev.error);
      r.onend = () => onEnd(r);
      rec = r;
      try { r.start(); } catch (e) { rec = null; fails++; restartT = setTimeout(startSession, restartDelay(fails)); }
    }
    function onResult(r, ev) {
      if (r !== rec || paused) return;
      gotResult = true; fails = 0; clearTimeout(pauseT);
      let inter = '';
      const cmds = [];
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const res = ev.results[i], t = res[0] ? res[0].transcript : '';
        if (!res.isFinal) { inter += t; continue; }
        const p = parseCommand(t.trim(), lang());
        if (p.text) { finals += (finals && !/\s$/.test(finals) ? ' ' : '') + p.text; heard = true; }
        if (p.command) cmds.push(p);
      }
      interim = inter.trim(); if (interim) heard = true;
      render();
      if (cmds.length) { interim = ''; render(); cmds.forEach(p => command(p.command, p.phrase)); return; }
      if (status && status.from === 'mic') setStatus(null);
      if (interim) translateSoon(600);
      else { translateSoon(0); if (prefs.autoSend && gathered(false).trim()) pauseT = setTimeout(() => sendNow('pause'), prefs.pauseMs); }
    }
    function onError(r, code) {
      if (r !== rec) return;
      if (FATAL.has(code)) { stopFor(recognitionError(code)); return; }
      // no-speech, network, aborted, ...: onend follows and a new session starts; nothing to show (the dock keeps listening)
    }
    function onEnd(r) {
      if (r !== rec) return;
      rec = null;
      if (interim) { finals += (finals && !/\s$/.test(finals) ? ' ' : '') + interim; interim = ''; render(); }   // keep what was heard
      if (!wantOn || paused) return;
      if (!gotResult) fails++;
      clearTimeout(restartT); restartT = setTimeout(startSession, restartDelay(gotResult ? 0 : fails));
    }
    function endSession(abort) {
      clearTimeout(restartT); const r = rec;
      if (!r) return;
      try { if (abort && r.abort) r.abort(); else r.stop(); } catch (e) { rec = null; }
    }
    function setMic(on) {
      if (on && !SR) return;
      wantOn = !!on; prefs.micOn = wantOn; save(); fails = 0;
      if (wantOn) {
        if (status && status.from === 'mic') setStatus(null);
        if (!english()) tr.check(lang(), 'en').then(c => { if (c.state === 'available' || c.state === 'downloadable') tr.ready(lang(), 'en').catch(() => {}); });   // inside the click
        startSession();
      } else { clearTimeout(pauseT); endSession(false); }
      micUI();
    }
    function stopFor(msg) { wantOn = false; prefs.micOn = false; save(); endSession(true); setStatus({ kind: 'err', text: msg, from: 'mic' }); micUI(); }
    doc.addEventListener('visibilitychange', () => { if (!doc.hidden && wantOn && !rec) { clearTimeout(restartT); restartT = setTimeout(startSession, 150); } });
    g.addEventListener && g.addEventListener('pagehide', () => { endSession(true); });

    /* ---- the commands ---- */
    function resetDock() {
      clearTimeout(pauseT); clearTimeout(trT); trSeq++;
      base = ''; finals = ''; interim = ''; heard = false; lastTr = null; status = null; putInBox = '';
      render(); showOut(); micUI();
    }
    /**
     * What may be sent for the dock's text s, with the message box holding box: {meta} or {refuse: why}. The English is the dock's
     * translation (by: builtin | online), the user's own English when there was no translation (by: user; written in the message box), or the
     * words themselves when the dictation language is English. Without any English, nothing is sent.
     */
    function decide(s, box, r) {
      const meta = { via: heard ? 'voice' : 'typed', lang: lang() };
      if (prefs.tts) { meta.speak = true; if (!english()) tr.check('en', lang()).then(c => { if (c.state === 'available') tr.ready('en', lang()).catch(() => {}); }); }
      if (english()) return box.trim() ? { meta } : { refuse: 'Nothing to send' };
      meta.original = s;
      if (r && r.by !== 'none') { if (!box.trim()) return { refuse: 'Nothing to send' }; meta.translation = { by: r.by, edited: r.text.trim() !== box.trim() }; return { meta }; }
      // no translation: only English the user wrote (the dock never puts the original in the box)
      if (box.trim() && box.trim() !== s.trim()) { meta.translation = { by: 'user', edited: true }; return { meta }; }
      return { refuse: 'Not sent: no English text yet' };
    }
    function refuse(why) { showOut(); toast(why, 'err'); }
    let sending = false;
    async function sendNow(how) {
      if (sending) return false;
      clearTimeout(pauseT); clearTimeout(trT);
      const s = stripCommand(gathered(true)).trim();
      if (!s) {   // nothing in the dock: a spoken "send" sends the message box as it is (e.g. after "edit")
        if (!ta || !ta.value.trim()) { toast('Nothing to send'); return false; }
        const meta = { via: 'typed' }; if (prefs.tts) meta.speak = true;
        opts.send(meta); toast('Sent'); return true;
      }
      sending = true;
      try {
        let r = lastTr && lastTr.src === s ? lastTr : null;
        if (!r && !english()) r = await translateNow({ text: s, gesture: true });
        if (english()) { putBox(s); r = { src: s, text: s, by: 'not-needed' }; }
        else if (r && r.by !== 'none') putBox(r.text);
        const d = decide(s, ta ? ta.value : '', r);
        if (d.refuse) { refuse(d.refuse); return false; }
        resetDock();
        opts.send(d.meta);
        toast(how === 'pause' ? 'Sent after a pause' : 'Sent');
        return true;
      } finally { sending = false; }
    }
    function clearAll() { resetDock(); if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input')); } }
    /** run a command (spoken, or from a test): send, clear, stop, anyway, edit */
    function command(name, phrase) {
      const said = phrase ? `“${phrase}”: ` : '';
      if (name === 'send') { sendNow('command'); return; }
      if (name === 'clear') { clearAll(); toast(`${said}cleared`); return; }
      if (name === 'stop') { setMic(false); toast(`${said}stopped listening`); return; }
      if (name === 'anyway') { const ok = opts.actions && opts.actions.anyway && opts.actions.anyway(); toast(ok ? `${said}doing it anyway` : `${said}no request to do anyway`, ok ? '' : 'err'); return; }
      if (name === 'edit') { const ok = opts.actions && opts.actions.edit && opts.actions.edit(); if (ok) { resetDock(); putInBox = ta ? ta.value : ''; } toast(ok ? `${said}the clearer command is in the message box` : `${said}nothing to edit`, ok ? '' : 'err'); }
    }
    /**
     * The chat's send button (or Enter in the box) is sending box: when the dock holds text, -> its meta (the dock is emptied), or {block}
     * (nothing may be sent: no English yet; or the translation is not ready, and the dock sends it as soon as it is); else null (typed).
     */
    function consume(box) {
      const s = stripCommand(gathered(true)).trim();
      if (!s) return null;
      const r = english() ? { src: s, text: s, by: 'not-needed' } : lastTr && lastTr.src === s ? lastTr : null;
      if (!r && !(box.trim() && box !== putInBox)) { sendNow('button'); return { block: true }; }   // translating: sent when it is done
      const d = decide(s, box, r);
      if (d.refuse) { refuse(d.refuse); return { block: true }; }
      resetDock();
      return d.meta;
    }

    /* ---- the settings popover ---- */
    function fillSelect() {
      const L = list(), cur = lang();
      if (!L.some(x => x.tag.toLowerCase() === cur.toLowerCase())) L.splice(2, 0, { tag: cur, name: langName(cur) });
      sel.innerHTML = L.map(x => `<option value="${escH(x.tag)}">${escH(x.name)} (${escH(x.tag)})</option>`).join('') + '<option value="other">Other: type a BCP-47 tag…</option>';
      sel.value = L.find(x => x.tag.toLowerCase() === cur.toLowerCase()).tag;
    }
    async function support() {
      const vs = voices(), c = english() ? { state: 'not-needed' } : await tr.check(lang(), 'en');
      const S = supportLines({ lang: lang(), sr: !!SR, tr: c, voices: voicesFor(vs, lang()).length, voicesEn: voicesFor(vs, 'en').length, total: vs.length });
      $('[data-k="sr"]').textContent = S.sr; $('[data-k="tr"]').textContent = S.tr; $('[data-k="tts"]').textContent = S.tts;
      return c;
    }
    function popContent() {
      fillSelect(); support();
      pop.querySelectorAll('[data-pref]').forEach(c => { c.checked = !!prefs[c.dataset.pref]; });
      const H = commandHelp(lang()), en = english();
      $('.vd-cmds').innerHTML = `Spoken commands, alone or at the end: ${H.map(h => `<b>${escH(h.say)}</b>${en ? '' : ` (${escH(h.name)})`}`).join(', ')}${en ? '' : '; the English words work too'}.`;
    }
    function openPop() { popContent(); pop.hidden = false; langBtn.setAttribute('aria-expanded', 'true'); el.classList.add('pop-open'); sel.focus(); }
    function closePop(focusBack) { if (pop.hidden) return; pop.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); el.classList.remove('pop-open'); tagIn.hidden = true; $('.vd-tagerr').hidden = true; if (focusBack) langBtn.focus(); }
    doc.addEventListener('pointerdown', ev => { if (!pop.hidden && !pop.contains(ev.target) && !langBtn.contains(ev.target)) closePop(false); }, true);
    doc.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !pop.hidden) { ev.preventDefault(); ev.stopPropagation(); closePop(true); } }, true);
    doc.addEventListener('focusin', ev => { if (!pop.hidden && !pop.contains(ev.target) && !langBtn.contains(ev.target)) closePop(false); });
    sel.addEventListener('change', () => {
      if (sel.value === 'other') { tagIn.hidden = false; tagIn.value = ''; tagIn.focus(); return; }
      tagIn.hidden = true; $('.vd-tagerr').hidden = true; setLang(sel.value);
    });
    tagIn.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); applyTag(); } });
    tagIn.addEventListener('change', applyTag);
    function applyTag() {
      const t = normTag(tagIn.value), err = $('.vd-tagerr');
      if (!t) { err.hidden = false; err.textContent = `“${tagIn.value}” is not a BCP-47 language tag (examples: pt-BR, sr-Latn-RS, en-IE).`; return; }
      err.hidden = true; tagIn.hidden = true; setLang(t);
    }
    function setLang(t) {
      prefs.lang = t; save(); lastTr = null; status = null;
      $('.vd-code').textContent = code(t); langBtn.title = `${langName(t)}: dictation settings`; langBtn.setAttribute('aria-label', langBtn.title);
      popContent(); micUI(); showOut();
      if (rec) { const r = rec; rec = null; try { r.abort ? r.abort() : r.stop(); } catch (e) { /* ended */ } if (wantOn) { clearTimeout(restartT); restartT = setTimeout(startSession, 150); } }
      if (gathered(false).trim()) translateSoon(0);
    }
    pop.addEventListener('change', ev => {
      const c = ev.target.closest('[data-pref]'); if (!c) return;
      prefs[c.dataset.pref] = c.checked; save();
      if (c.dataset.pref === 'online' && gathered(false).trim()) translateSoon(0);
      if (c.dataset.pref === 'tts' && c.checked && !english()) tr.check('en', lang()).then(x => { if (x.state === 'available' || x.state === 'downloadable') tr.ready('en', lang()).catch(() => {}); });   // inside the click
    });

    /* ---- events ---- */
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-vd]'); if (!b) return;
      const k = b.dataset.vd;
      if (k === 'mic' || k === 'resume') { setMic(!wantOn); if (wantOn && k === 'resume') toast('Listening again'); }
      else if (k === 'lang') { if (pop.hidden) openPop(); else closePop(true); }
      else if (k === 'download') translateNow({ gesture: true });
    });
    src.addEventListener('input', () => {
      // an edit in place: the edited text is the new base; listening goes on after it
      base = src.value; finals = ''; interim = ''; if (!src.value.trim()) heard = false;
      el.classList.toggle('has-text', !!src.value.trim()); micUI();
      if (english()) translateNow(); else translateSoon(500);
    });
    // English the user writes in the message box is what is sent: the "no translation" note goes away while the box holds it
    if (ta) ta.addEventListener('input', () => { if (lastTr && lastTr.by === 'none') showOut(); });
    src.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); sendNow('enter'); } else if (ev.key === 'Escape' && src.value) { ev.preventDefault(); clearAll(); } });
    if (synth && typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', () => { if (!pop.hidden) popContent(); });

    /* ---- read the reply aloud, with listening paused meanwhile ---- */
    function pauseWhileSpeaking(u) {
      paused = true; micUI(); clearTimeout(pauseT);
      if (rec) { const r = rec; rec = null; interim = ''; render(); try { r.abort ? r.abort() : r.stop(); } catch (e) { /* ended */ } }
      const t0 = Date.now(); let seen = false, done = false, poll = null;
      const resume = () => {
        if (done) return; done = true; clearInterval(poll);
        paused = false; micUI();
        if (wantOn) { clearTimeout(restartT); restartT = setTimeout(startSession, 250); }
      };
      u.onend = resume; u.onerror = resume;
      // Chrome sometimes never fires onend: also watch speechSynthesis.speaking (and give up after 2 minutes)
      poll = setInterval(() => { let sp = false; try { sp = !!synth.speaking; } catch (e) { /* no state */ } if (sp) seen = true; else if (seen || Date.now() - t0 > 3000) resume(); if (Date.now() - t0 > 120000) resume(); }, 400);
    }
    async function onReply(meta, text) {
      if (!meta || !meta.speak || !synth || !text) return null;
      let say = String(text), sayLang = 'en-US';
      if (meta.lang && !isEnglish(meta.lang)) {
        const c = await tr.check('en', meta.lang);
        if (c.state === 'available') { const r = await tr.translate(say, 'en', meta.lang); if (r.by === 'builtin') { say = r.text; sayLang = meta.lang; } }
      } else if (meta.lang) sayLang = meta.lang;
      try {
        const u = new g.SpeechSynthesisUtterance(say); u.lang = sayLang;
        const v = pickVoice(voices(), sayLang); if (v) try { u.voice = v; } catch (e) { /* the language alone picks a voice */ }
        synth.cancel(); pauseWhileSpeaking(u); synth.speak(u);
        return { text: say, lang: sayLang };
      } catch (e) { paused = false; micUI(); return null; }
    }

    // start: the language code, the row, the one-tap resume when the mic was on before a reload (the browser needs a click to listen)
    $('.vd-code').textContent = code(lang()); langBtn.title = `${langName(lang())}: dictation settings`; langBtn.setAttribute('aria-label', langBtn.title);
    render(); showOut(); micUI();
    return { consume, onReply, setMic, command, prefs, el, translation: tr,
      state: () => ({ on: wantOn, paused, session: !!rec, text: gathered(true), english: lastTr ? lastTr.text : '', note: noteEl.textContent, fails }) };
  }

  return { PREFS_KEY, FIRST, COMMON, DEFAULT_PREFS, ONLINE, normTag, primary, isEnglish, langName, shortName, languageList, loadPrefs, savePrefs,
    builtinTranslator, normState, createTranslation, recognitionCtor, recognitionError, voicesFor, pickVoice, supportLines, noTranslationText, dockNote,
    COMMANDS, COMMAND_KEYS, parseCommand, commandHelp, FATAL, restartDelay, mount };
});
