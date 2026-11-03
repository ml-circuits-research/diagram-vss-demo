// collect.js: the collected requests (owner, 2026-11-03: "request collection to improve the test data"). Every message the user sends to
// the demo is kept in this browser's localStorage, with what VSS-BERT executed or held, and what the user did about it later (Do it anyway,
// Edit, superseded, undo right after). Format 2 (owner, 2026-11-03): no reader's full reading is stored, since the text, the names on the
// drawing and the model versions reproduce every reading locally; only VSS-BERT's decision per request (its words, executed or held, its
// confidence) and the user's actions, which are the labels of whether a reading was right. Nothing leaves the browser unless the user downloads the file (⋮ › Settings ›
// Collected requests › Download). The file is JSON Lines, one entry per message; its format is training/sketch/COLLECT_FORMAT.md, and
// training/sketch/collect_to_bench.py turns it into an un-annotated llm_bench folder.
//
// Two parts:
//   - createStore(opts): the storage (cap, quota, JSONL, events). Pure, no DOM: node tests (training/sketch/test_collect.mjs) run it with a fake
//     localStorage.
//   - buildEntry(rec, env): one entry from a turn of docs/js/ui.js (its `rec` object), and modelVersions(files): the model stamps; also pure.
//   - mountSettings(...) / settingsHTML(): the section "Collected requests" of ⋮ › Settings (browser only).
// Browser storage is a convenience: every access is guarded, and without it the entries live in memory for this page only (the section says so).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CollectKit = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const FORMAT = 'sop-collect/2';
  const KEY = 'sop.collect.v1', ON_KEY = 'sop.collect.off', CAP = 5000;

  const isQuota = e => !!e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
  const pad = n => String(n).padStart(2, '0');
  /** the local date (and time) for the file name: sop-requests-2026-11-03-1530.jsonl */
  function fileName(d) {
    d = d || new Date();
    return `sop-requests-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.jsonl`;
  }
  const rid = () => Math.random().toString(36).slice(2, 8);

  /**
   * The store of collected entries.
   * opts: {storage (a localStorage-like object; null: memory only), key, onKey, cap, now() -> Date}
   * -> {enabled, setEnabled, add(entry) -> entry, event(session, turn, ev) -> bool, list, count, last(n), clear, jsonl, status}
   * Storage: one key holding a JSON array of entries, oldest first, at most `cap` (the oldest are dropped). When the browser refuses a write
   * (quota), the oldest tenth (at least one entry) is dropped and the write is tried again, until it fits; what was dropped is counted in
   * status().dropped. When the storage cannot be read or written at all (private window, blocked site data), the entries are kept in memory
   * and status().persistent is false.
   */
  function createStore(opts) {
    opts = opts || {};
    const st = opts.storage === undefined ? safeLocalStorage() : opts.storage;
    const key = opts.key || KEY, onKey = opts.onKey || ON_KEY, cap = opts.cap || CAP, now = opts.now || (() => new Date());
    const status = { persistent: !!st, dropped: 0, error: null, savedBytes: 0 };
    let items = [];
    const get = k => { if (!st) return null; try { return st.getItem(k); } catch (e) { status.persistent = false; status.error = String(e && e.message || e); return null; } };
    const setRaw = (k, v) => { if (!st) return false; if (v == null) st.removeItem(k); else st.setItem(k, v); return true; };
    try { const raw = get(key); if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) items = a.filter(x => x && typeof x === 'object'); } } catch (e) { items = []; status.error = 'the stored entries could not be read: ' + (e && e.message || e); }
    let on = get(onKey) !== '1';
    /** write the whole list; on a quota error drop the oldest tenth and try again */
    function save() {
      if (!st) return false;
      for (;;) {
        let s;
        try { s = JSON.stringify(items); setRaw(key, s); status.persistent = true; status.error = null; status.savedBytes = s.length; return true; }
        catch (e) {
          if (isQuota(e) && items.length > 0) { const n = Math.max(1, Math.ceil(items.length / 10)); items.splice(0, n); status.dropped += n; continue; }
          status.persistent = false; status.error = String(e && e.message || e); return false;
        }
      }
    }
    return {
      FORMAT, cap,
      enabled: () => on,
      setEnabled(v) { on = !!v; try { if (st) setRaw(onKey, on ? null : '1'); } catch (e) { /* the switch is then for this page only */ } },
      /** add one entry (built by buildEntry); its id and time are set here when missing. Returns the entry, or null when collection is off */
      add(entry) {
        if (!on || !entry) return null;
        const t = now();
        entry = Object.assign({ format: FORMAT, id: `c-${t.getTime().toString(36)}-${rid()}`, time: t.toISOString() }, entry);
        if (!Array.isArray(entry.events)) entry.events = [];
        items.push(entry);
        if (items.length > cap) { const n = items.length - cap; items.splice(0, n); status.dropped += n; }
        save();
        return entry;
      },
      /** a later user action on the entry of turn `turn` of page session `session`: {kind, ...}; false when there is no such entry */
      event(session, turn, ev) {
        const e = items.find(x => x.session === session && x.turn === turn);
        if (!e) return false;
        e.events.push(Object.assign({ time: now().toISOString() }, ev));
        save(); return true;
      },
      find: (session, turn) => items.find(x => x.session === session && x.turn === turn) || null,
      list: () => items.slice(),
      count: () => items.length,
      last: n => items.slice(-n).reverse(),
      clear() { items = []; status.dropped = 0; try { if (st) setRaw(key, null); } catch (e) { status.error = String(e && e.message || e); } },
      /** the entries as JSON Lines (one entry per line, oldest first, a final newline when not empty) */
      jsonl: () => items.map(x => JSON.stringify(x)).join('\n') + (items.length ? '\n' : ''),
      status: () => Object.assign({}, status)
    };
  }
  function safeLocalStorage() { try { const s = typeof localStorage !== 'undefined' ? localStorage : null; if (s) s.getItem('x'); return s; } catch (e) { return null; } }

  /* ---------------- one entry from a turn ---------------- */
  const num = x => typeof x === 'number' && isFinite(x) ? Math.round(x * 10000) / 10000 : null;
  /** the reply as kept: at most REPLY_MAX characters (an ellipsis when cut) */
  const REPLY_MAX = 280;
  const shortText = t => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > REPLY_MAX ? t.slice(0, REPLY_MAX - 1) + '…' : t; };
  /**
   * The model versions of an entry, from docs/model/versions.json ("files": {path: content version}): `combined` (VSS-BERT's confidence
   * model), `neural` (SOP-BERT), `micro` (one short digest of the registry's nine worlds and two cutters: every micro/ stamp), and `all`
   * (a digest of every stamp: the exact set, matched against versions.json in the repository history to recompute with the same models).
   */
  function modelVersions(files) {
    if (!files || typeof files !== 'object') return null;
    const keys = Object.keys(files).sort(), dig = ks => fnv(ks.map(k => `${k}=${files[k]}`).join('\n'));
    const o = { all: dig(keys) };
    const micro = keys.filter(k => k.startsWith('micro/')); if (micro.length) o.micro = dig(micro);
    if (files['neural/sop-bert']) o.neural = String(files['neural/sop-bert']);
    if (files['confidence/combined.json']) o.combined = String(files['confidence/combined.json']);
    return o;
  }
  /** FNV-1a 32 bits, as 8 hex digits: a short, stable digest (not a security hash) */
  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
  /**
   * One entry from a turn of docs/js/ui.js (format 2: training/sketch/COLLECT_FORMAT.md).
   * rec: ui.js's turn record {id, text (read, after spelling), typed (as sent), readers: {combined: {gate: {units: [{index, src, conf,
   *      execute}]}, error}}, off: {id: text}}
   * env: {session, names (the drawing of the tab the chat speaks for, before the message), source: {via, lang, original, translation},
   *      models (modelVersions(versions.json files)), reply: the text of the line that answered in the chat, tab: the active tab}
   * -> the entry (no id / time: createStore().add sets them). The readings themselves are not kept: text + names + models reproduce them.
   */
  function buildEntry(rec, env) {
    env = env || {};
    const src = env.source || {};
    const source = { via: src.via || 'typed' };
    if (src.lang) source.lang = String(src.lang);
    if (src.original != null && src.original !== '') source.original = String(src.original);
    if (src.translation) { const t = src.translation; source.translation = { by: t.by != null ? String(t.by) : 'none', edited: !!t.edited }; }
    const r = rec.readers ? rec.readers.combined : null;
    let decision;
    if (!r) decision = { status: 'off', note: (rec.off && rec.off.combined) || 'did not read this' };
    else if (r.error && r.error.message !== 'No wires.') decision = { status: 'error', error: String(r.error.message || r.error) };
    else {
      const units = (r.gate && r.gate.units) || [];
      decision = { status: 'read', units: units.map(u => ({ index: u.index, src: u.src != null ? String(u.src) : '', execute: !!u.execute, conf: num(u.conf) })) };
    }
    const e = {
      format: FORMAT,
      session: env.session || null,
      turn: rec.id,
      domain: 'collected from the demo',
      names: (env.names || []).slice(),
      text: String(rec.typed != null ? rec.typed : rec.text),
      source,
      models: env.models || null,
      decision,
      events: [],
      wires: []
    };
    if (env.tab) e.tab = env.tab;
    if (env.reply) e.reply = shortText(env.reply);
    return e;
  }

  /* ---------------- Settings › Collected requests (browser only) ---------------- */
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EVENT_WORDS = { anyway: 'done anyway', edit: 'Edit used', 'edit-sent': 'edited and sent', superseded: 'superseded', 'undo-next': 'undone right after' };
  /** what VSS-BERT did with an entry's message, in words (format 2: `decision`; format 1: `readings.combined`) */
  function decisionWords(e) {
    const d = e.decision || (e.readings && e.readings.combined && Object.assign({}, e.readings.combined, e.readings.combined.units ? {} : { units: null }));
    if (!d) return '';
    if (d.status === 'off') return 'VSS-BERT did not read it';
    if (d.status === 'error') return 'VSS-BERT could not read it';
    if (d.units) { const x = d.units.filter(u => u.execute).length; return `VSS-BERT executed ${x}, held ${d.units.length - x}`; }
    return d.wires ? `VSS-BERT read ${d.wires.length} request${d.wires.length === 1 ? '' : 's'}` : '';
  }
  /** the section's inner HTML for a store `S`; confirm: the Clear confirmation is open */
  function sectionHTML(S, confirm, note) {
    const n = S.count(), st = S.status(), on = S.enabled();
    const prev = S.last(5).map(e => {
      const did = decisionWords(e);
      const ev = [...new Set((e.events || []).map(x => EVENT_WORDS[x.kind] || x.kind))].join(', ');
      const t = new Date(e.time); const when = isNaN(t) ? '' : t.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `<li><div class="ct">${escH(e.text)}</div>${e.source && e.source.original ? `<div class="co">${escH(e.source.lang || '')}: ${escH(e.source.original)}</div>` : ''}<div class="cm">${escH([when, did, ev].filter(Boolean).join(' · '))}</div></li>`;
    }).join('');
    const where = st.persistent ? `kept in this browser (localStorage), at most the last ${S.cap}` : `kept in this page only: this browser’s storage is not available${st.error ? ` (${escH(st.error)})` : ''}, so they are lost when the page closes`;
    return `<h3 class="sub">Collected requests</h3>
  <label class="collect-switch"><input type="checkbox" data-collect="toggle" ${on ? 'checked' : ''}> <span>Keep every message I send here, with what VSS-BERT did, to improve the test data (on by default)</span></label>
  <p class="note"><b>Nothing leaves your browser unless you download the file.</b> The entries are ${where}${st.dropped ? `; ${st.dropped} older entr${st.dropped === 1 ? 'y was' : 'ies were'} dropped to make room` : ''}. Each entry has the time, your text (and the original words and language when it came through voice or translation), the names on the drawing, the versions of the models (with these, every reader’s reading can be recomputed, so it is not stored), the reply, what VSS-BERT executed or held with its confidence, and what you did next (Do it anyway, Edit, a later command that replaced it, undo).</p>
  <div class="collect-row"><b class="collect-n" data-collect-count>${n}</b> <span>collected request${n === 1 ? '' : 's'}</span>
    <button type="button" class="btn" data-collect="download" ${n ? '' : 'disabled'}>Download as JSONL</button>
    <button type="button" class="btn" data-collect="clear" ${n ? '' : 'disabled'} aria-expanded="${confirm ? 'true' : 'false'}">Clear…</button></div>
  ${confirm ? `<div class="collect-confirm" role="alertdialog" aria-label="Clear the collected requests"><span>Delete all ${n} collected request${n === 1 ? '' : 's'} from this browser? This cannot be undone; download them first if you want to keep them.</span> <button type="button" class="btn danger" data-collect="clear-yes">Delete them</button> <button type="button" class="btn" data-collect="clear-no">Cancel</button></div>` : ''}
  ${note ? `<p class="note" role="status">${escH(note)}</p>` : ''}
  ${n ? `<div class="note">The last ${Math.min(5, n)}, newest first:</div><ul class="collect-prev">${prev}</ul>` : '<p class="note">None yet.</p>'}
  <p class="note">The file has one entry per line (JSON Lines); its format is described in <code>training/sketch/COLLECT_FORMAT.md</code>.</p>`;
  }
  /**
   * The section, bound to a store. ui.js puts settingsHTML() into ⋮ › Settings; the clicks are handled here (one delegated listener on
   * `root`, default the document), so ui.js needs no handler of its own. download(name, text) can be replaced (tests).
   */
  function mountSettings(S, opts) {
    opts = opts || {};
    const doc = opts.document || (typeof document !== 'undefined' ? document : null);
    let confirm = false, note = '';
    const box = () => doc && doc.getElementById('collect-box');
    const render = () => { const b = box(); if (b) b.innerHTML = sectionHTML(S, confirm, note); };
    const download = opts.download || ((name, text) => {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/x-ndjson' }));
      const a = doc.createElement('a'); a.href = url; a.download = name; doc.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    if (doc) {
      const root = opts.root || doc;
      root.addEventListener('click', ev => {
        const b = ev.target.closest && ev.target.closest('[data-collect]'); if (!b || b.tagName === 'INPUT') return;
        const k = b.dataset.collect;
        if (k === 'download') { const name = fileName(); download(name, S.jsonl()); note = `Saved ${S.count()} entr${S.count() === 1 ? 'y' : 'ies'} as ${name}.`; confirm = false; render(); }
        else if (k === 'clear') { confirm = true; note = ''; render(); const y = box() && box().querySelector('[data-collect="clear-yes"]'); if (y) y.focus(); }
        else if (k === 'clear-no') { confirm = false; render(); const c = box() && box().querySelector('[data-collect="clear"]'); if (c) c.focus(); }
        else if (k === 'clear-yes') { const n = S.count(); S.clear(); confirm = false; note = `Deleted ${n} collected request${n === 1 ? '' : 's'}.`; render(); }
      });
      root.addEventListener('change', ev => {
        const t = ev.target; if (!t || !t.dataset || t.dataset.collect !== 'toggle') return;
        S.setEnabled(t.checked); note = t.checked ? 'Collecting again: new messages are kept.' : 'Collection is off: new messages are not kept (the ones already collected stay until you clear them).'; render();
      });
    }
    return {
      settingsHTML: () => { note = ''; confirm = false; return `<div class="help collect" id="collect-box">${sectionHTML(S, false, '')}</div>`; },
      render
    };
  }

  return { FORMAT, KEY, ON_KEY, CAP, REPLY_MAX, createStore, buildEntry, modelVersions, fnv, decisionWords, fileName, isQuota, sectionHTML, mountSettings };
});
