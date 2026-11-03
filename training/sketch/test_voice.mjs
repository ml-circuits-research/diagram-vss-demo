// test_voice.mjs: node tests of the pure parts of docs/js/voice.js (voice input with translation).
//   node training/sketch/test_voice.mjs
// 1. languages: tags canonical, invalid tags refused, the list starts with Romanian and English, then the browser's languages and the voices'
//    languages, no tag twice; names in English;
// 2. preferences: defaults (Romanian, send after a pause off, read aloud off, online off, mic not on), kept and read back, bad values
//    ignored, a storage that throws is harmless;
// 3. the translation flow with mocked browser APIs: no API -> "none" and the text unchanged; Translator available -> translated on the device;
//    downloadable -> created with a download monitor whose progress is reported; unavailable pair -> "none"; the legacy `translation` and
//    `ai.translator` APIs; English -> not needed; the instance is cached per pair; the online fallback is used only when opted in, with the
//    MyMemory URL, and its failure falls back to the text as it is;
// 4. speech: the recognition constructor (standard and webkit), the errors in plain words, the voice for a language, the support lines;
//    staying on: which errors stop listening for real, the restart backoff;
// 5. spoken commands: the whole utterance or its end, in the dictation language and in English, never in the middle; the command words are
//    not part of the message; a joining "and" / "și" and punctuation dropped; diacritics optional; one table per language, a new language
//    is one more table;
// 6. the dock's note (one row since 2026-11-03: the English is in the message box): a status, or "no translation" with what to do.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const V = require("../../docs/js/voice.js");
let fails = 0, n = 0;
const check = (name, ok, detail = "") => { n++; if (!ok) { fails++; console.log(`FAIL ${name}${detail ? "\n     " + detail : ""}`); } else console.log(`ok   ${name}`); };
const eq = (name, got, want) => check(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

// 1. languages
eq("1. canonical tags", ["ro-ro", "EN_us", "pt-br", "sr-latn-rs", "ro"].map(V.normTag), ["ro-RO", "en-US", "pt-BR", "sr-Latn-RS", "ro"]);
eq("1. invalid tags", ["", "  ", "not a tag", "x-", "123"].map(V.normTag), [null, null, null, null, null]);
eq("1. primary and English", [V.primary("ro-RO"), V.isEnglish("en-GB"), V.isEnglish("ro-RO")], ["ro", true, false]);
{
  const L = V.languageList({ navigatorLanguages: ["fr-FR", "en-US", "ro"], voiceLangs: ["de_DE", "ro-RO", "ja-JP"] });
  eq("1. Romanian and English first", L.slice(0, 2).map(x => x.tag), ["ro-RO", "en-US"]);
  eq("1. then the browser's languages, then the voices'", L.slice(2, 6).map(x => x.tag), ["fr-FR", "ro", "de-DE", "ja-JP"]);
  check("1. no tag twice", new Set(L.map(x => x.tag.toLowerCase())).size === L.length);
  check("1. common languages follow", L.some(x => x.tag === "hu-HU") && L.length > 30);
  check("1. names in English", L[0].name === "Romanian (Romania)" && L[1].name === "English (United States)", L[0].name);
  eq("1. short names", [V.shortName("ro-RO"), V.shortName("pt-BR")], ["Romanian", "Portuguese"]);
  check("1. a bad tag from the browser is skipped", !V.languageList({ navigatorLanguages: ["!!"] }).some(x => x.tag === "!!"));
}

// 2. preferences
const mem = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), m }; };
{
  const s = mem();
  eq("2. defaults", V.loadPrefs(s), { lang: "ro-RO", autoSend: false, pauseMs: 2000, tts: false, online: false, micOn: false });
  V.savePrefs({ lang: "fr-FR", autoSend: true, pauseMs: 2000, tts: true, online: false, micOn: true }, s);
  eq("2. kept", V.loadPrefs(s), { lang: "fr-FR", autoSend: true, pauseMs: 2000, tts: true, online: false, micOn: true });
  s.setItem(V.PREFS_KEY, JSON.stringify({ lang: "??", autoSend: "yes", online: 1, pauseMs: 5, micOn: "on" }));
  eq("2. bad values ignored", V.loadPrefs(s), V.DEFAULT_PREFS);
  s.setItem(V.PREFS_KEY, "{broken");
  eq("2. broken JSON -> defaults", V.loadPrefs(s), V.DEFAULT_PREFS);
  const bad = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  let threw = false, ok; try { V.loadPrefs(bad); ok = V.savePrefs(V.DEFAULT_PREFS, bad); } catch (e) { threw = true; }
  check("2. a storage that throws is harmless", !threw && ok === false);
}

// 3. translation
/** a mock of Chrome's Translator API: pairs {"ro>en": state}, a dictionary, a log of calls */
function mockTranslator(pairs, dict, log) {
  return {
    async availability({ sourceLanguage, targetLanguage }) { log.push(`availability ${sourceLanguage}>${targetLanguage}`); return pairs[`${sourceLanguage}>${targetLanguage}`] || "unavailable"; },
    async create({ sourceLanguage, targetLanguage, monitor }) {
      log.push(`create ${sourceLanguage}>${targetLanguage}`);
      const st = pairs[`${sourceLanguage}>${targetLanguage}`];
      if (st === "unavailable" || !st) throw new Error("Unable to create translator for the given source and target language.");
      if (st === "downloadable" && monitor) { const ls = []; monitor({ addEventListener: (ev, f) => ls.push(f) }); ls.forEach(f => { f({ loaded: 0.5 }); f({ loaded: 1 }); }); }
      return { translate: async t => { log.push(`translate ${t}`); return dict[t] || `[${targetLanguage}] ${t}`; } };
    }
  };
}
const run = async () => {
  {
    const T = V.createTranslation({ global: {} });
    eq("3. no API: check", await T.check("ro-RO", "en"), { state: "none", api: null });
    eq("3. no API: the text as it is", await T.translate("fă Start roșu", "ro-RO", "en"), { text: "fă Start roșu", by: "none", state: "none" });
    eq("3. English: not needed", await T.translate("make Start red", "en-GB", "en"), { text: "make Start red", by: "not-needed", state: "not-needed" });
    eq("3. empty text", (await T.translate("  ", "ro-RO", "en")).by, "none");
  }
  {
    const log = [], g = { Translator: mockTranslator({ "ro>en": "available", "en>ro": "available" }, { "fă Start roșu": "make Start red" }, log) };
    const T = V.createTranslation({ global: g });
    eq("3. Translator: the API kind", T.api, "Translator");
    eq("3. Translator available: check uses the primary subtags", await T.check("ro-RO", "en"), { state: "available", api: "Translator" });
    eq("3. Translator available: translated on the device", await T.translate("fă Start roșu", "ro-RO", "en"), { text: "make Start red", by: "builtin", state: "available" });
    await T.translate("fă Done verde", "ro-RO", "en-US");
    eq("3. the instance is cached per pair (one create)", log.filter(x => x.startsWith("create")), ["create ro>en"]);
    check("3. cached() says so", T.cached("ro-RO", "en") && !T.cached("en", "ro-RO"));
    eq("3. the reply back en > ro", (await T.translate("Done.", "en", "ro-RO")).by, "builtin");
  }
  {
    const log = [], prog = [], states = [], g = { Translator: mockTranslator({ "ro>en": "downloadable" }, { "salut": "hello" }, log) };
    const T = V.createTranslation({ global: g });
    eq("3. downloadable: check", (await T.check("ro-RO", "en")).state, "downloadable");
    const r = await T.translate("salut", "ro-RO", "en", { onProgress: p => prog.push(p), onState: s => states.push(s) });
    eq("3. downloadable: translated after the download", [r.text, r.by], ["hello", "builtin"]);
    eq("3. downloadable: the progress is reported", prog, [0.5, 1]);
    eq("3. downloadable: the state is reported", states, ["downloadable"]);
    eq("3. after the download the pair is available", (await T.check("ro-RO", "en")).state, "available");
  }
  {
    const log = [], g = { Translator: mockTranslator({ "ro>en": "available" }, {}, log) };
    const T = V.createTranslation({ global: g });
    const r = await T.translate("bonjour", "fr-FR", "en");
    eq("3. unavailable pair: the text as it is", [r.text, r.by, r.state], ["bonjour", "none", "unavailable"]);
    check("3. unavailable pair: no create tried", !log.some(x => x.startsWith("create fr")));
  }
  {
    const g = { Translator: { availability: async () => "available", create: async () => { throw new Error("NotAllowedError: needs a user gesture"); } } };
    const T = V.createTranslation({ global: g });
    const r = await T.translate("salut", "ro-RO", "en");
    check("3. a failed create: the text as it is, with the error", r.by === "none" && r.text === "salut" && /gesture/.test(r.error), JSON.stringify(r));
  }
  {
    const g = { translation: { canTranslate: async () => "readily", createTranslator: async () => ({ translate: async t => "EN " + t }) } };
    const T = V.createTranslation({ global: g });
    eq("3. legacy translation API", [T.api, (await T.check("ro", "en")).state, (await T.translate("x", "ro", "en")).text], ["translation", "available", "EN x"]);
    const g2 = { translation: { canTranslate: async () => "after-download", createTranslator: async () => ({ translate: async t => t }) } };
    eq("3. legacy after-download -> downloadable", (await V.createTranslation({ global: g2 }).check("ro", "en")).state, "downloadable");
    const g3 = { ai: { translator: { capabilities: async () => ({ languagePairAvailable: () => "no" }), create: async () => ({}) } } };
    eq("3. ai.translator 'no' -> unavailable", (await V.createTranslation({ global: g3 }).check("ro", "en")).state, "unavailable");
    eq("3. normState", ["readily", "available", "after-download", "downloadable", "downloading", "no", "unavailable", undefined].map(V.normState), ["available", "available", "downloadable", "downloadable", "downloading", "unavailable", "unavailable", "unavailable"]);
  }
  {
    const urls = []; let on = false;
    const fetch = async u => { urls.push(u); return { ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: "make Start red" } }) }; };
    const T = V.createTranslation({ global: {}, fetch, online: () => on });
    eq("3. online fallback off by default: nothing sent", [(await T.translate("fă Start roșu", "ro-RO", "en")).by, urls.length], ["none", 0]);
    on = true;
    const r = await T.translate("fă Start roșu", "ro-RO", "en");
    eq("3. online fallback when opted in", [r.text, r.by], ["make Start red", "online"]);
    check("3. online fallback: the MyMemory URL, keyless", urls[0] === "https://api.mymemory.translated.net/get?q=f%C4%83%20Start%20ro%C8%99u&langpair=ro|en", urls[0]);
    const T2 = V.createTranslation({ global: {}, fetch: async () => ({ ok: false, status: 429 }), online: () => true });
    const r2 = await T2.translate("salut", "ro-RO", "en");
    check("3. online failure: the text as it is, with the error", r2.by === "none" && r2.text === "salut" && /429/.test(r2.error), JSON.stringify(r2));
    const log = [], g = { Translator: mockTranslator({ "ro>en": "available" }, { salut: "hello" }, log) };
    urls.length = 0;
    const T3 = V.createTranslation({ global: g, fetch, online: () => true });
    eq("3. the device's translator comes before the online one", [(await T3.translate("salut", "ro-RO", "en")).by, urls.length], ["builtin", 0]);
  }

  // 4. speech
  class SR { } class WSR { }
  check("4. SpeechRecognition, then webkitSpeechRecognition, else null", V.recognitionCtor({ SpeechRecognition: SR, webkitSpeechRecognition: WSR }) === SR && V.recognitionCtor({ webkitSpeechRecognition: WSR }) === WSR && V.recognitionCtor({}) === null);
  check("4. errors in plain words", /microphone/.test(V.recognitionError("not-allowed")) && /language/.test(V.recognitionError("language-not-supported")) && /odd-code/.test(V.recognitionError("odd-code")));
  const voices = [{ name: "A", lang: "en-US" }, { name: "B", lang: "ro_RO" }, { name: "C", lang: "ro-MD" }, { name: "D", lang: "en-GB" }];
  eq("4. voices for ro-RO: the exact tag first", V.voicesFor(voices, "ro-RO").map(v => v.name), ["B", "C"]);
  eq("4. a voice for en", V.pickVoice(voices, "en").name, "A");
  check("4. no voice for ja", V.pickVoice(voices, "ja-JP") === null);
  const S = V.supportLines({ lang: "ro-RO", sr: true, tr: { state: "available" }, voices: 2, voicesEn: 3, total: 9 });
  check("4. support lines: all yes", /^Speech recognition: yes/.test(S.sr) && /^Translation Romanian → English: yes, on this device/.test(S.tr) && /2 voices for Romanian/.test(S.tts), JSON.stringify(S));
  const N = V.supportLines({ lang: "ro-RO", sr: false, tr: { state: "none" }, voices: 0, voicesEn: 1, total: 1 });
  check("4. support lines: nothing", /no: this browser has no Web Speech API/.test(N.sr) && /no: this browser has no built-in translation/.test(N.tr) && /no voice for Romanian; replies would be read in English/.test(N.tts), JSON.stringify(N));
  check("4. support lines: unavailable pair, English", /does not translate Romanian/.test(V.supportLines({ lang: "ro", sr: true, tr: { state: "unavailable" }, total: 0 }).tr) && /not needed/.test(V.supportLines({ lang: "en-US", sr: true, tr: { state: "not-needed" }, total: 0 }).tr));
  check("4. support lines: downloadable", /one-time download/.test(V.supportLines({ lang: "ro", sr: true, tr: { state: "downloadable" }, total: 0 }).tr));

  check("4. stop for real: permission refused, no microphone, language not supported", ["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"].every(c => V.FATAL.has(c)));
  check("4. keep listening: silence, network, aborted end a session only", ["no-speech", "network", "aborted"].every(c => !V.FATAL.has(c)));
  eq("4. restart backoff: short after a session that heard something, doubling up to 5 s", [0, 1, 2, 3, 4, 5, 6, 20].map(V.restartDelay), [150, 300, 600, 1200, 2400, 4800, 5000, 5000]);

  // 5. spoken commands
  const P = (u, l = "ro-RO") => { const r = V.parseCommand(u, l); return [r.command, r.text]; };
  eq("5. the whole utterance: trimite", P("trimite"), ["send", ""]);
  eq("5. the whole utterance, capitalised, with punctuation", P("Trimite."), ["send", ""]);
  eq("5. a trailing command (Romanian)", P("fă Done roșu trimite"), ["send", "fă Done roșu"]);
  eq("5. a trailing command (English) while dictating Romanian", P("fă Done roșu send"), ["send", "fă Done roșu"]);
  eq("5. a trailing command (English)", P("make Done red send", "en-US"), ["send", "make Done red"]);
  eq("5. 'send' in the middle is a message, not a command", P("send Start to the back", "en-US"), [null, "send Start to the back"]);
  eq("5. 'trimite' in the middle is a message", P("trimite Start în spate"), [null, "trimite Start în spate"]);
  eq("5. a joining 'and' / 'și' and a comma dropped", [P("make Done red and send it", "en-US"), P("fă Done roșu și trimite"), P("make Done red, send.", "en-US")],
    [["send", "make Done red"], ["send", "fă Done roșu"], ["send", "make Done red"]]);
  eq("5. clear: șterge, anulează, clear", [P("șterge"), P("Anulează!"), P("clear")], [["clear", ""], ["clear", ""], ["clear", ""]]);
  eq("5. 'șterge Start' is a message (delete Start)", P("șterge Start"), [null, "șterge Start"]);
  eq("5. stop listening: oprește, stop listening", [P("oprește"), P("Stop listening.")], [["stop", ""], ["stop", ""]]);
  eq("5. 'stop' alone is not 'stop listening' in English", P("stop", "en-US"), [null, "stop"]);
  eq("5. do it anyway: fă-o oricum (with or without the hyphen), do it anyway", [P("fă-o oricum"), P("fa o oricum"), P("do it anyway")], [["anyway", ""], ["anyway", ""], ["anyway", ""]]);
  eq("5. edit: editează, edit", [P("editează"), P("edit")], [["edit", ""], ["edit", ""]]);
  eq("5. diacritics optional (recognisers often drop them)", [P("sterge"), P("opreste"), P("editeaza"), P("anuleaza")], [["clear", ""], ["stop", ""], ["edit", ""], ["clear", ""]]);
  eq("5. undo is a message, sent as text", [P("undo", "en-US"), P("anulează ultima schimbare")], [[null, "undo"], [null, "anulează ultima schimbare"]]);
  eq("5. the longest phrase wins ('send it' over 'send')", V.parseCommand("make Done red send it", "en-US").phrase, "send it");
  eq("5. a language without a table: only the English commands", [P("mets Done en rouge send", "fr-FR"), P("trimite", "fr-FR")], [["send", "mets Done en rouge"], [null, "trimite"]]);
  V.COMMANDS.fr = { send: ["envoie"], tail: ["et"] };
  eq("5. a new language is one more table", [P("mets Done en rouge et envoie", "fr-FR"), P("mets Done en rouge send", "fr-FR")], [["send", "mets Done en rouge"], ["send", "mets Done en rouge"]]);
  delete V.COMMANDS.fr;
  eq("5. the commands said in the popover, in the dictation language", V.commandHelp("ro-RO").map(h => h.say), ["trimite", "șterge", "oprește", "fă-o oricum", "editează"]);
  check("5. every language table has only known keys", Object.values(V.COMMANDS).every(t => Object.keys(t).every(k => k === "tail" || V.COMMAND_KEYS.includes(k))));

  // 6. the dock's one row: a status or "no translation" is a note at the end of it (the English is edited in the message box)
  eq("6. no note when nothing is to be said (the English is in the message box)", V.dockNote({ lang: "ro-RO" }), null);
  eq("6. a status is the note", V.dockNote({ lang: "ro-RO", status: { kind: "busy", text: "Translating…" } }), { text: "Translating…", kind: "busy" });
  eq("6. a status without a kind is a plain note", V.dockNote({ lang: "ro-RO", status: { text: "x" } }), { text: "x", kind: "note" });
  const nt = V.dockNote({ lang: "fr-FR", noTranslation: true });
  check("6. no translation: an error note that says to write the English in the message box", nt && nt.kind === "err" && /^No translation on this device for French → English: write the English in the message box/.test(nt.text), JSON.stringify(nt));
  eq("6. English needs no translation: no note", V.dockNote({ lang: "en-US", noTranslation: true }), null);
  check("6. the microphone's error, as a status, wins over 'no translation'", V.dockNote({ lang: "fr-FR", noTranslation: true, status: { kind: "err", text: V.recognitionError("not-allowed") } }).text.startsWith("The browser did not allow the microphone"));

  console.log(`\n${n - fails}/${n} passed`);
  process.exit(fails ? 1 : 0);
};
run();
