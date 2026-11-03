// voice.js: speak or type in your own language (owner, 2026-11-03). A popup, opened by the microphone button beside the message box:
//   - speech to text: the browser's Web Speech API (SpeechRecognition / webkitSpeechRecognition), in the language chosen from a list
//     (Romanian and English first) or written as a BCP-47 tag; the interim transcript is shown live; the user stops, edits and sends.
//     Optional continuous mode: keeps listening and sends after a pause (off by default).
//   - translation to English when the language is not English: the browser's built-in on-device Translator API (Chrome's `Translator`, or
//     the older `translation` / `ai.translator`), feature-detected, its availability checked per language pair, its model download shown.
//     Without it the popup says plainly that this browser has no built-in translation and sends the text as it is unless the user edits it.
//     An online fallback (MyMemory, free and keyless) is used only when the user turns it on (off by default; the popup says what is sent).
//   - what reaches the chat: the English text, as a normal message (every reader reads English); the original goes along as `meta` and the
//     chat shows it under the message in small text; docs/js/collect.js stores both.
//   - text to speech (optional, off by default): VSS-BERT's reply to a message sent from the popup is read aloud with speechSynthesis, in the
//     user's language when the same Translator can translate it back without a download, else in English.
//   - every choice (language, switches) is kept in localStorage (guarded; the popup works without it).
// The pure parts (language list, translation flow, voice choice, preferences) are exported for node tests (training/sketch/test_voice.mjs);
// mount() builds the popup in the page.
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
  const DEFAULT_PREFS = { lang: 'ro-RO', continuous: false, pauseMs: 2000, tts: false, online: false };
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
    for (const k of ['continuous', 'tts', 'online']) if (typeof p[k] === 'boolean') out[k] = p[k];
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

  /** what this browser supports, as the popup's three lines say it (pure: tests). s: {sr: bool, tr: {state, api}, voices: n for the language,
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

  /* ---------------- the popup ---------------- */
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MIC = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>';
  const STOP = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';
  const CLOSE = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /**
   * Build the popup and bind it to the microphone button.
   * opts: {button, composer (the message box: its text goes into the popup when the popup opens, and is cleared when the popup sends),
   *        send(englishText, meta), global (window), document, storage}
   * meta: {via: 'voice' | 'typed', lang, original, translation: {by, edited}, speak: bool}
   * -> {open, close, onReply(meta, text), prefs, el}
   */
  function mount(opts) {
    const g = opts.global || window, doc = opts.document || document;
    const prefs = loadPrefs(opts.storage);
    const save = () => savePrefs(prefs, opts.storage);
    const tr = createTranslation({ global: g, fetch: g.fetch ? g.fetch.bind(g) : null, online: () => prefs.online });
    const SR = recognitionCtor(g), synth = g.speechSynthesis || null;
    const voices = () => { try { return synth ? synth.getVoices() || [] : []; } catch (e) { return []; } };
    const list = () => languageList({ navigatorLanguages: (g.navigator && g.navigator.languages) || [], voiceLangs: voices().map(v => v.lang) });

    const scrim = doc.createElement('div'); scrim.className = 'vx-scrim'; scrim.hidden = true;
    const el = doc.createElement('div'); el.className = 'vx'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'vx-title');
    el.innerHTML = `<div class="vx-head"><h2 id="vx-title">Speak or type in your language</h2><button class="ib" type="button" data-vx="close" aria-label="Close">${CLOSE}</button></div>
<div class="vx-body">
  <div class="vx-langrow"><label for="vx-lang">Your language</label><select id="vx-lang"></select><input id="vx-tag" type="text" placeholder="BCP-47 tag, e.g. pt-BR" aria-label="Language tag (BCP-47)" autocomplete="off" spellcheck="false" hidden></div>
  <div class="vx-tagerr" role="alert" hidden></div>
  <ul class="vx-support" aria-live="polite"><li data-k="sr"></li><li data-k="tr"></li><li data-k="tts"></li></ul>
  <div class="vx-microw"><button type="button" class="vx-rec" data-vx="rec" aria-pressed="false">${MIC}<span>Start speaking</span></button><span class="vx-state" role="status" aria-live="polite"></span></div>
  <label class="vx-l" for="vx-orig" data-l="orig">What you said or typed</label>
  <textarea id="vx-orig" rows="3" autocomplete="off"></textarea>
  <div class="vx-interim" aria-live="polite" hidden></div>
  <div class="vx-trrow" data-row="tr"><button type="button" class="btn" data-vx="translate">Translate to English</button><span class="vx-trstate" role="status" aria-live="polite"></span></div>
  <label class="vx-l" for="vx-en" data-row="en">In English: this is what is sent (you can edit it)</label>
  <textarea id="vx-en" rows="3" autocomplete="off" data-row="en"></textarea>
  <details class="vx-opts"><summary>Options</summary>
    <label><input type="checkbox" data-pref="continuous"> <span>Keep listening, and send after a pause of 2 seconds</span></label>
    <label><input type="checkbox" data-pref="tts"> <span>Read VSS-BERT’s reply to what I send from here aloud (in my language when this browser can translate it on the device, else in English)</span></label>
    <label><input type="checkbox" data-pref="online"> <span>When this browser cannot translate, use ${ONLINE.name}, a free online translation service: <b>your text is then sent to ${ONLINE.host}</b>. Off by default.</span></label>
  </details>
  <p class="vx-note">Speech recognition is the browser’s (the Web Speech API), not ours: Chrome may send the audio to its vendor’s servers (Google) to recognise it. The built-in translation runs on this device. The demo itself sends nothing anywhere; your messages stay in this browser.</p>
</div>
<div class="vx-foot"><button type="button" class="btn" data-vx="close">Cancel</button><button type="button" class="btn solid" data-vx="send">Send</button></div>`;
    doc.body.appendChild(scrim); doc.body.appendChild(el);
    const $ = s => el.querySelector(s);
    const sel = $('#vx-lang'), tagIn = $('#vx-tag'), orig = $('#vx-orig'), en = $('#vx-en'), interim = $('.vx-interim'), stateEl = $('.vx-state'), trState = $('.vx-trstate'), recBtn = $('[data-vx="rec"]');
    let recBase = '', recFinals = '';
    let rec = null, listening = false, heard = false, enEdited = false, lastTr = null, trSeq = 0, pauseT = null, trT = null, opener = null;

    const lang = () => prefs.lang;
    const english = () => isEnglish(lang());
    function fillSelect() {
      const L = list(), cur = lang();
      if (!L.some(x => x.tag.toLowerCase() === cur.toLowerCase())) L.splice(2, 0, { tag: cur, name: langName(cur) });
      sel.innerHTML = L.map(x => `<option value="${escH(x.tag)}">${escH(x.name)} (${escH(x.tag)})</option>`).join('') + '<option value="other">Other: type a BCP-47 tag…</option>';
      sel.value = L.find(x => x.tag.toLowerCase() === cur.toLowerCase()).tag;
    }
    function layout() {
      const E = english(), name = shortName(lang());
      $('[data-l="orig"]').textContent = E ? 'Your message' : `What you said or typed, in ${name}`;
      el.querySelectorAll('[data-row="tr"], [data-row="en"]').forEach(x => { x.hidden = E; });
      $('[data-vx="send"]').textContent = E ? 'Send' : 'Send in English';
      el.querySelectorAll('[data-pref]').forEach(c => { c.checked = !!prefs[c.dataset.pref]; });
    }
    async function support() {
      const vs = voices(), c = english() ? { state: 'not-needed' } : await tr.check(lang(), 'en');
      const S = supportLines({ lang: lang(), sr: !!SR, tr: c, voices: voicesFor(vs, lang()).length, voicesEn: voicesFor(vs, 'en').length, total: vs.length });
      $('[data-k="sr"]').textContent = S.sr; $('[data-k="tr"]').textContent = S.tr; $('[data-k="tts"]').textContent = S.tts;
      recBtn.disabled = !SR;
      return c;
    }
    const setState = t => { stateEl.textContent = t || ''; };
    function setTr(t) { trState.textContent = t || ''; }

    /* translation of the original box into the English box */
    async function translateNow(fromClick) {
      if (english()) { en.value = orig.value; return null; }
      const text = orig.value.trim(); const seq = ++trSeq;
      if (!text) { if (!enEdited) en.value = ''; setTr(''); return null; }
      const c = await tr.check(lang(), 'en');
      if (c.state === 'downloadable' && !fromClick && !tr.cached(lang(), 'en')) { setTr('Press “Translate to English”: the language model downloads to this device once.'); if (!enEdited) en.value = ''; return null; }
      setTr(c.state === 'downloadable' || c.state === 'downloading' ? 'Downloading the language model…' : 'Translating…');
      const r = await tr.translate(text, lang(), 'en', { onProgress: p => { if (seq === trSeq && p != null) setTr(`Downloading the language model… ${Math.round(p * 100)}%`); } });
      if (seq !== trSeq) return null;
      lastTr = r;
      if (!enEdited || fromClick) { en.value = r.text; enEdited = false; }
      setTr(r.by === 'builtin' ? 'Translated on this device.' : r.by === 'online' ? `Translated by ${ONLINE.name} (online).`
        : `This browser has no built-in translation from ${shortName(lang())} to English${r.error ? ` (${r.error})` : ''}, so the text above is sent as it is. Write it in English in the box below if you can, or turn on the online translation in Options.`);
      support();
      return r;
    }
    const translateSoon = () => { clearTimeout(trT); trT = setTimeout(() => translateNow(false), 700); };

    /* speech recognition */
    function startRec() {
      if (!SR || listening) return;
      if (!english()) tr.check(lang(), 'en').then(c => { if (c.state === 'available') tr.ready(lang(), 'en').catch(() => {}); });
      try { rec = new SR(); } catch (e) { setState(`Speech recognition could not start: ${e.message}`); return; }
      rec.lang = lang(); rec.interimResults = true; rec.continuous = !!prefs.continuous; rec.maxAlternatives = 1;
      recBase = orig.value && !/\s$/.test(orig.value) ? orig.value + ' ' : orig.value; recFinals = '';
      rec.onresult = ev => {
        let inter = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i], t = r[0] ? r[0].transcript : '';
          if (r.isFinal) recFinals += (recFinals && !/\s$/.test(recFinals) ? ' ' : '') + t.trim(); else inter += t;
        }
        heard = true;
        orig.value = (recBase + recFinals).trimStart();
        interim.hidden = !inter; interim.textContent = inter;
        if (!inter && recFinals) { translateSoon(); if (prefs.continuous) { clearTimeout(pauseT); pauseT = setTimeout(() => { if (orig.value.trim()) sendNow(); }, prefs.pauseMs); } }
        else clearTimeout(pauseT);
      };
      rec.onerror = ev => { setState(recognitionError(ev.error)); };
      rec.onend = () => {
        listening = false; recUI(); interim.hidden = true; interim.textContent = '';
        if (prefs.continuous && el.hidden === false && rec && rec._keep) { try { rec.start(); listening = true; recUI(); return; } catch (e) { /* stays stopped */ } }
        if (orig.value.trim()) translateNow(false);
      };
      rec._keep = !!prefs.continuous;
      try { rec.start(); listening = true; setState(`Listening (${langName(lang())})…`); } catch (e) { setState(`Speech recognition could not start: ${e.message}`); }
      recUI();
    }
    function stopRec() { if (rec) { rec._keep = false; try { rec.stop(); } catch (e) { /* already stopped */ } } listening = false; clearTimeout(pauseT); recUI(); setState(orig.value.trim() ? 'Stopped. Check the text, then send.' : 'Stopped.'); }
    function recUI() { recBtn.setAttribute('aria-pressed', String(listening)); recBtn.classList.toggle('on', listening); recBtn.innerHTML = listening ? `${STOP}<span>Stop</span>` : `${MIC}<span>${heard ? 'Speak again' : 'Start speaking'}</span>`; }

    /* send */
    async function sendNow() {
      clearTimeout(pauseT); clearTimeout(trT);
      const E = english();
      let text = (E ? orig.value : en.value).trim(), r = lastTr;
      if (!E && !text && orig.value.trim()) { r = await translateNow(true); text = en.value.trim() || orig.value.trim(); }
      if (!text) { setState('Say or type something first.'); return; }
      if (!E && prefs.tts) tr.check('en', lang()).then(c => { if (c.state === 'available') tr.ready('en', lang()).catch(() => {}); });   // for the reply, inside the click
      const meta = { via: heard ? 'voice' : 'typed', lang: lang(), speak: !!prefs.tts };
      if (!E) { meta.original = orig.value.trim(); meta.translation = { by: r ? r.by : 'none', edited: !!enEdited || (r ? r.text.trim() !== text : false) }; }
      else if (!heard) meta.via = 'typed';
      if (opts.composer && opts.composer.value.trim() === (prefilled || '').trim()) { opts.composer.value = ''; opts.composer.dispatchEvent(new Event('input')); }
      orig.value = ''; en.value = ''; recBase = ''; recFinals = ''; enEdited = false; lastTr = null; heard = false; prefilled = ''; setTr(''); interim.hidden = true;
      if (!(prefs.continuous && listening)) { stopRec(); close(); }
      else setState(`Sent. Listening (${langName(lang())})…`);
      opts.send(text, meta);
    }

    /* open / close */
    let prefilled = '';
    function open() {
      opener = doc.activeElement; fillSelect(); layout(); support();
      if (opts.composer && opts.composer.value.trim() && !orig.value.trim()) { orig.value = prefilled = opts.composer.value; translateSoon(); }
      setState(SR ? '' : 'This browser cannot listen; type your message instead.');
      scrim.hidden = false; el.hidden = false;
      (SR ? recBtn : orig).focus();
    }
    function close() {
      if (listening) { if (rec) rec._keep = false; try { rec.stop(); } catch (e) { /* stopped */ } listening = false; recUI(); }
      el.hidden = true; scrim.hidden = true; setState('');
      if (opener && opener.focus) opener.focus(); else if (opts.button) opts.button.focus();
    }

    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-vx]'); if (!b) return;
      const k = b.dataset.vx;
      if (k === 'close') close();
      else if (k === 'rec') { if (listening) stopRec(); else startRec(); }
      else if (k === 'translate') translateNow(true);
      else if (k === 'send') sendNow();
    });
    el.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey) && (ev.target === orig || ev.target === en)) { ev.preventDefault(); sendNow(); return; }
      if (ev.key === 'Tab') {   // keep the focus inside the popup
        const f = [...el.querySelectorAll('button, select, input, textarea, summary')].filter(x => !x.disabled && !x.hidden && x.offsetParent !== null);
        if (!f.length) return; const first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && doc.activeElement === first) { ev.preventDefault(); last.focus(); } else if (!ev.shiftKey && doc.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    });
    scrim.addEventListener('click', close);
    orig.addEventListener('input', () => { if (!english()) translateSoon(); });
    en.addEventListener('input', () => { enEdited = true; });
    sel.addEventListener('change', () => {
      if (sel.value === 'other') { tagIn.hidden = false; tagIn.value = ''; tagIn.focus(); return; }
      tagIn.hidden = true; $('.vx-tagerr').hidden = true; setLang(sel.value);
    });
    tagIn.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); applyTag(); } });
    tagIn.addEventListener('change', applyTag);
    function applyTag() {
      const t = normTag(tagIn.value), err = $('.vx-tagerr');
      if (!t) { err.hidden = false; err.textContent = `“${tagIn.value}” is not a BCP-47 language tag (examples: pt-BR, sr-Latn-RS, en-IE).`; return; }
      err.hidden = true; tagIn.hidden = true; setLang(t);
    }
    function setLang(t) {
      if (listening) stopRec();
      prefs.lang = t; save(); fillSelect(); layout(); support(); enEdited = false; lastTr = null;
      if (orig.value.trim()) translateSoon(); else en.value = '';
    }
    el.addEventListener('change', ev => {
      const c = ev.target.closest('[data-pref]'); if (!c) return;
      prefs[c.dataset.pref] = c.checked; save();
      if (c.dataset.pref === 'online' && orig.value.trim()) translateSoon();
      if (c.dataset.pref === 'tts' && c.checked && !english()) tr.check('en', lang()).then(x => { if (x.state === 'available' || x.state === 'downloadable') tr.ready('en', lang()).catch(() => {}); });   // inside the click
    });
    if (opts.button) opts.button.addEventListener('click', () => { if (el.hidden) open(); else close(); });
    if (synth && typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', () => { if (!el.hidden) { fillSelect(); support(); } });

    /** VSS-BERT's reply to a message: read aloud when the message came from the popup with "read aloud" on */
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
        synth.cancel(); synth.speak(u);
        return { text: say, lang: sayLang };
      } catch (e) { return null; }
    }
    return { open, close, onReply, prefs, el, translation: tr };
  }

  return { PREFS_KEY, FIRST, COMMON, DEFAULT_PREFS, ONLINE, normTag, primary, isEnglish, langName, shortName, languageList, loadPrefs, savePrefs,
    builtinTranslator, normState, createTranslation, recognitionCtor, recognitionError, voicesFor, pickVoice, supportLines, mount };
});
