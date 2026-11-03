/* "How it works inside": the architecture pages of the Help overlay (docs/js/docs.js, #help/<id>) and of the standalone page
   docs/architecture.html, which renders these same pages one after another. This file is the only copy of the text: change a page here and
   both places change. Links between pages are written as href="#help/<id>" (or "#help/<id>/<anchor>"); architecture.html rewrites them to
   its own anchors. Every number names the document or the command that produced it. State described: the models of arm ALL, 2026-11-03 (TRAIN_PLAN_1103.md). */
(function (root) {
'use strict';
const AS_OF = '2026-11-03 (the readers of arm ALL, TRAIN_PLAN_1103.md)';
const AH = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ahead" d="M0,0 L10,5 L0,10 z"/></marker></defs>';

const pages = [];
const page = (id, title, html, lead) => pages.push({ id, title, lead, html });

/* ============================================================ overview */
page('architecture', 'Overview', `
<p>A person types a message in English. A spell checker corrects near-miss words. <b>VSS-BERT</b>, the reader that answers, then works in
three steps: the SOP-BERT cutter cuts the message into requests; <b>SOP-BERT</b> and <b>VSS</b> each read every request into the same small
language, <b>SOP Lang</b> (one line per request, called a <i>wire</i>); and a confidence fitted on whether the two readings agree decides, request
by request, whether the wire is carried out or held back with a reason (<a href="#help/two-readers">VSS-BERT</a>). The engine carries out the
wires through plugins; graph and logic questions are answered by a small Datalog evaluator inside the engine. The <b>Rules</b>, a hand-written
reader, read the same messages as a comparison. Everything runs in the browser: nothing is sent to a server.</p>

<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 600" role="img" aria-labelledby="d1t">
<title id="d1t">Overall flow: message, spell checker, the SOP-BERT cutter, SOP-BERT and VSS read the same requests, pairing and confidence, do or ask, SOP Lang wires, engine with Datalog, the drawing; the Rules read the same messages as a comparison</title>
${AH}
<rect class="box" x="80" y="8" width="240" height="40" rx="8"/>
<text class="t" x="200" y="25" text-anchor="middle">A message in English</text>
<text class="s" x="200" y="40" text-anchor="middle">“draw a red circle and link it to Start”</text>
<path class="ar" d="M200 48 V66"/>
<rect class="box" x="90" y="68" width="220" height="40" rx="8"/>
<text class="t" x="200" y="85" text-anchor="middle">Spell checker (VSA)</text>
<text class="m" x="200" y="100" text-anchor="middle">docs/js/spell.js</text>
<path class="ar" d="M200 108 V126"/>
<rect class="mod" x="60" y="128" width="280" height="44" rx="8"/>
<text class="t" x="200" y="146" text-anchor="middle">The SOP-BERT cutter: cut once</text>
<text class="s" x="200" y="162" text-anchor="middle">both readers read the same requests</text>
<path class="ar" d="M200 172 V184 H120 V198"/>
<path class="ar" d="M200 172 V184 H280 V198"/>
<rect class="mod" x="40" y="200" width="160" height="72" rx="8"/>
<text class="t" x="120" y="219" text-anchor="middle">SOP-BERT</text>
<text class="m" x="120" y="234" text-anchor="middle">neural.js</text>
<text x="120" y="251" text-anchor="middle">one DistilBERT</text>
<text x="120" y="266" text-anchor="middle">with small heads</text>
<rect class="mod" x="210" y="200" width="160" height="72" rx="8"/>
<text class="t" x="290" y="219" text-anchor="middle">VSS</text>
<text class="m" x="290" y="234" text-anchor="middle">vss-composer.js</text>
<text x="290" y="251" text-anchor="middle">9 micro-worlds,</text>
<text x="290" y="266" text-anchor="middle">context filler</text>
<path class="ar" d="M120 272 V286 H200 V300"/>
<path class="ar" d="M290 272 V286 H200"/>
<rect class="acc" x="40" y="302" width="330" height="62" rx="8"/>
<text class="t" x="205" y="320" text-anchor="middle">VSS-BERT: pair the readings, confidence</text>
<text class="m" x="205" y="336" text-anchor="middle">combined-confidence.js · confidence/combined.json</text>
<text x="205" y="354" text-anchor="middle">sure: do it · not sure: hold it, say why</text>
<path class="ar" d="M205 364 V382"/>
<rect class="box" x="40" y="384" width="330" height="48" rx="8"/>
<text class="t" x="205" y="402" text-anchor="middle">SOP Lang wires of the requests it is sure of</text>
<text class="m" x="205" y="420" text-anchor="middle">@s1 command action=create shape=circle color=red</text>
<path class="ar" d="M205 432 V450"/>
<rect class="box" x="40" y="452" width="330" height="62" rx="8"/>
<text class="t" x="205" y="470" text-anchor="middle">Engine + plugins (logic.js)</text>
<text x="205" y="487" text-anchor="middle">the legend: the hand-written spec of the language</text>
<text x="205" y="503" text-anchor="middle">mentions resolved on the canvas · Datalog</text>
<path class="ar" d="M205 514 V532"/>
<rect class="box" x="110" y="534" width="190" height="40" rx="8"/>
<text class="t" x="205" y="551" text-anchor="middle">The drawing</text>
<text class="s" x="205" y="566" text-anchor="middle">undo, redo</text>
<rect class="grp" x="4" y="200" width="30" height="232" rx="6"/>
<text class="s" x="19" y="316" text-anchor="middle" transform="rotate(-90 19 316)">tabs Rules · VSS · SOP-BERT: each alone</text>
</svg>
</div>
<figcaption>Figure 1. VSS-BERT in the browser (<code>docs/js/ui.js</code>, <code>READERS</code>, each tab with its own <code>K.createSystem()</code>).
The tabs Rules, VSS and SOP-BERT show each reader alone, with its own drawing; they read the cut chosen in Settings
(<a href="#help/cutting">One cut for all readers</a>).</figcaption>
</figure>

<h2 id="judged">How the readers are judged</h2>
<p>The first number of every reader is how often it is <b>confidently wrong</b>: of everything it does, the share done wrong. Each learned reader
does a request only when its own confidence clears a threshold, the one with the best cost score on calibration messages (one confident mistake
costs as much as 10 right answers), and asks below it, saying why. The Rules have no confidence and do everything
(<a href="#help/research-question">The goal</a>, <a href="#help/measurement">Measurement</a>).</p>

<h2 id="parts">The parts, their code and their models</h2>
<div class="tw"><table>
<thead><tr><th>Part</th><th>Code</th><th>Models it loads</th><th class="num">Size</th></tr></thead>
<tbody>
<tr><td>Page, tabs, chat, canvas, help</td><td><code>docs/index.html</code>, <code>docs/js/ui.js</code>, <code>docs/js/help.js</code>, <code>docs/js/docs.js</code>, <code>docs/js/docs-concepts.js</code>, <code>docs/js/docs-arch.js</code>, <code>docs/js/scenarios.js</code></td><td>none</td><td class="num">—</td></tr>
<tr><td>Spell checker</td><td><code>docs/js/spell.js</code></td><td><code>docs/model/spell/vocab.json</code></td><td class="num">28.0 KB</td></tr>
<tr><td>VSS-BERT: pairing and confidence</td><td><code>docs/js/combined-confidence.js</code></td><td><code>docs/model/confidence/combined.json</code></td><td class="num">(below)</td></tr>
<tr><td>SOP-BERT reader (and the SOP-BERT cutter)</td><td><code>docs/js/neural.js</code> (transformers.js 3.8.1 from jsDelivr)</td><td><code>docs/model/neural/sop-bert/</code> (one DistilBERT, 8-bit)</td><td class="num">68.7 MB</td></tr>
<tr><td>VSS reader (composer)</td><td><code>docs/js/vss-formalizer.js</code>, <code>docs/js/vss-composer.js</code>, <code>docs/js/front.js</code>, <code>docs/js/vss.js</code> + <code>docs/js/vss/</code>, <code>docs/js/vss-context.js</code>, <code>docs/js/vss-adapter.js</code></td><td><code>docs/model/micro/registry.json</code> and what it names: 2 cutters, 9 worlds, <code>docs/model/context/weights.json</code></td><td class="num">31.4 MB</td></tr>
<tr><td>Rules reader, SOP Lang, engine, plugins, Datalog</td><td><code>docs/js/logic.js</code></td><td>none</td><td class="num">—</td></tr>
<tr><td>The cut of the other tabs</td><td><code>docs/js/vss-composer.js</code> (<code>cutUnits</code>, <code>CUT_STRATEGIES</code>, <code>DEFAULT_CUT</code>), <code>docs/js/vss-formalizer.js</code> (<code>cut</code>)</td><td>the cutter of the strategy chosen</td><td class="num">—</td></tr>
<tr><td>Confidences of the VSS and SOP-BERT tabs</td><td><code>docs/js/vss-confidence.js</code>, <code>neural-confidence.js</code>, <code>vote-confidence.js</code></td><td><code>docs/model/confidence/</code>: <code>vss.json</code>, <code>sop-bert.json</code>, <code>vote3.json</code> (with <code>combined.json</code>)</td><td class="num">0.72 MB</td></tr>
<tr><td>Benchmark (scoring)</td><td><code>docs/js/bench-canon.js</code></td><td><code>docs/bench/</code> (6 sets)</td><td class="num">—</td></tr>
</tbody></table></div>
<p class="note">Sizes: what the page downloads, measured with <code>du -b</code> on 2026-11-03, MB = 10<sup>6</sup> bytes. VSS: the 9 world folders
(26.8 MB, <code>BUILD.json</code> left out: not loaded), the two cutters the registry names (4.6 MB), the context weights and the registry.
SOP-BERT: <code>config.json</code>, the two tokenizer files and <code>onnx/model_quantized.onnx</code>.</p>

<h2 id="inside-pages">The pages of this part</h2>
<ul class="pagelist">
<li><a href="#help/neural-reader">The SOP-BERT reader</a>: one fine-tuned DistilBERT with small heads; it cuts and reads.</li>
<li><a href="#help/vss-reader">The VSS reader</a>: the composer, its cutters, the 9 worlds, the context filler, the adapter.</li>
<li><a href="#help/engine">The engine and the legend</a>: wires, the legend, the plugins, Datalog.</li>
<li><a href="#help/rules-reader">The Rules reader</a>: hand-written, the comparison.</li>
<li><a href="#help/cutting">One cut for all readers</a>: the three cutters and what they cost each reader.</li>
<li><a href="#help/spelling">The spell checker</a>, <a href="#help/models">Models and versions</a>, <a href="#help/data">Data</a>,
<a href="#help/training">Training and the GPU runner</a>, <a href="#help/measurement">Measurement</a>,
<a href="#help/repository">Repository map</a>, <a href="#help/planned">In progress</a>.</li>
</ul>
<p class="note">Described: the system as committed on ${AS_OF}. Names in <code>code</code> are file, function and field names you can search for.
Plans are only in <a href="#help/planned">In progress</a>, and are labelled there. The same pages as one long page: <a href="architecture.html">architecture.html</a>.</p>
`, 'How the editor turns a message into a drawing: VSS-BERT and its two readers, the engine, where the code and models are, how they are trained and measured.');

/* ============================================================ engine */
page('engine', 'The engine and the legend', `
<p><b>A wire</b> is one line: <code>@id type key=value key=value …</code>. Wires are single-assignment: a wire is defined once and a later
wire refers to it as <code>$id</code> (the parser rejects a reference to a wire not yet defined). A value can be a list
(<code>from=A,B</code>) or a quoted string. Parser and serializer: <code>parse</code> and <code>serialize</code> in <code>docs/js/logic.js</code>
(section 1 of that file). The user’s view of the language: <a href="#help/sop-lang">SOP Lang</a>.</p>
<p>The Rules reader turns <i>“Draw a red circle named Hub below Start and connect Start to it. How many circles are there?”</i> into:</p>
<pre><code>@s1 command action=create shape=circle color=red name=Hub position=below anchor=Start
@s2 command action=connect from=Start to=$s1
@s3 question ask=count shape=circle</code></pre>

<h2 id="wire-types">Wire types (5)</h2>
<div class="tw"><table>
<thead><tr><th>Type</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td><code>command</code></td><td>Something the user wants done (key <code>action</code>: 21 values).</td></tr>
<tr><td><code>question</code></td><td>Something the user wants to know (key <code>ask</code>: 17 values). Never changes the drawing.</td></tr>
<tr><td><code>fact</code></td><td>A statement that should hold in the world (“Start is red”).</td></tr>
<tr><td><code>rule</code></td><td>A default that applies to future shapes (“from now on circles are orange”).</td></tr>
<tr><td><code>mention</code></td><td>A description that must resolve to existing shapes (“the red circle”, “all stars that are not blue”). The engine resolves it against the canvas when it executes; no reader needs the drawing.</td></tr>
</tbody></table></div>

<h2 id="legend">The legend: the single hand-written spec</h2>
<p>The <b>legend</b> is the set of <i>questions</i> a wire can answer (its keys) and, for each, its allowed <i>values</i>. Plugins declare
it with <code>legend.define(plugin, key, spec)</code> (class <code>Legend</code> in <code>docs/js/logic.js</code>): <code>ask</code> (the
question in words), <code>kind</code> (<code>enum</code>, <code>number</code>, <code>text</code>, …) and, for enums, each value with its cue
words (<code>SHAPE_VALUES</code>, <code>COLOR_VALUES</code>, …). <code>action</code> has 21 values (create, delete, move, set, resize, rename,
label, duplicate, swap, group, ungroup, connect, disconnect, align, arrange, distribute, toFront, toBack, undo, redo, forget); <code>ask</code>
has 17 (count, list, exists, property, check, describe, neighbors, connected, degree, nearest, extreme, path, reachable, cycle, members,
groupOf, rules). Counted in node from <code>createSystem()</code> on 2026-11-02.</p>
<p class="callout">AGENTS.md: the legend is the only hand-written input of a learned reader. The VSS worlds and SOP-BERT learn every mapping
from words to the legend (verbs, values, how to cut) from the annotated data; hand-written word tables are allowed only in the Rules reader.</p>
<p>The help pages <a href="#help/sop-lang">SOP Lang</a> and <a href="#help/capabilities">Capabilities</a> (<code>docs/js/help.js</code>) are
generated at run time from this legend and the plugin list, so they cannot drift from the engine.</p>

<h2 id="plugins">Plugins = capabilities (11)</h2>
<p>The <code>Engine</code> holds a list of plugins. Each plugin adds wire types, legend keys and <i>handlers</i>; a wire is executed by the
enabled handler whose type and <code>when</code> pattern match its arguments (higher <code>priority</code> first, then the more specific
pattern). A message’s wires run in order as one undo step (<code>Engine.run</code>); each wire is applied whole or not at all, a wire that
fails is reported and the wires that depend on it are skipped, the others still run. A plugin can be switched off (Settings › Capabilities);
the switch applies to every reader, and a wire that needs that plugin then fails with a message naming it.</p>
<div class="tw"><table>
<thead><tr><th>Plugin (<code>name</code>)</th><th>What it does</th></tr></thead>
<tbody>
<tr><td><code>core</code> (locked)</td><td>The wire types; the shared keys (target, quantifier, count, name, notColor, recency); the mention resolver that turns “the red circle” into named shapes.</td></tr>
<tr><td><code>history</code></td><td>undo, redo (they step over the last executed action, including one of the same message); the key <code>action</code>.</td></tr>
<tr><td><code>shapes</code></td><td>create, delete, move, set, resize, rename, label, duplicate, swap; shape, colour, outline, size, label, position, anchor, direction, distance.</td></tr>
<tr><td><code>groups</code></td><td>group, ungroup; questions members, groupOf (and list / count / exists of groups); a group moves, copies, aligns and is deleted as one.</td></tr>
<tr><td><code>connections</code></td><td>connect, disconnect; keys from, to, style, arrow, pairing (one-to-many, chain).</td></tr>
<tr><td><code>layout</code></td><td>align, distribute, arrange, toFront, toBack; keys axis, layout.</td></tr>
<tr><td><code>queries</code></td><td>Question handlers in JavaScript: count, list, exists, property, check, describe, neighbors, connected, degree, nearest, extreme.</td></tr>
<tr><td><code>reasoning</code> “Graph reasoning (Datalog)”</td><td>Lowers the connection graph to Datalog facts plus recursive rules: path, reachable, cycle.</td></tr>
<tr><td><code>logic</code> “Logic reasoner (Datalog)”, priority 10</td><td>Lowers the whole drawing to Datalog facts and compiles a question wire (count, list, exists, check, neighbors, connected, path, reachable, cycle) into a query from its legend answers. Switched off, the <code>queries</code> and <code>reasoning</code> handlers answer instead.</td></tr>
<tr><td><code>rules</code> “Default rules”</td><td>rule wires (“from now on circles are orange” fills answers left out at create), forget, and the question <code>ask=rules</code>.</td></tr>
<tr><td><code>facts</code> “Facts as constraints”</td><td>fact wires: already true means no change; otherwise the world is adjusted until the statement holds.</td></tr>
</tbody></table></div>
<p class="note">Datalog: <code>datalog(facts, rules)</code>, a naive fixpoint evaluator, and <code>lowerDatalog</code> (shows the lowering in a
reply’s details), both in <code>docs/js/logic.js</code>.</p>
`, 'SOP Lang wires, the legend that defines them, and the plugins that carry them out.');

/* ============================================================ rules */
page('rules-reader', 'The Rules reader', `
<p>Code: <code>makeFormalizer(engine)</code> in <code>docs/js/logic.js</code> (section 6 of that file). Hand-written, deterministic, instant.</p>
<ol>
  <li><b>Spelling:</b> a word close (OSA edit distance 1, or 2 for words of 7+ letters) to a legend cue word or a canvas name is replaced; names
  introduced by “named / called” and quoted text are left alone. (This runs in addition to the VSA <a href="#help/spelling">spell checker</a>.)</li>
  <li><b>Cut:</b> when the Rules segmenter is the chosen cut: sentences are split at <code>. ! ? ;</code>; a sentence is split again at a comma or
  an “and” that stands right before a verb cue (<code>SPLIT_VERB</code>), coordinated names, one clause per created object. With another cut,
  the Rules reader reads the units it is given (<code>formalize(text, ctx, {units})</code>). See <a href="#help/cutting">One cut for all readers</a>.</li>
  <li><b>Reading:</b> regular expressions over the legend’s cue words (shapes, colours, sizes, actions, positions) and their order. The cue
  words are the hand-written cues of the legend’s values (<code>SHAPE_VALUES</code>, <code>COLOR_VALUES</code>, … in <code>docs/js/logic.js</code>).</li>
</ol>
<p><b>Fair comparison</b> (AGENTS.md): the Rules and the learned readers read the same legend. The Rules’ cue words are their own (the
hand-written cues of the legend’s values in <code>docs/js/logic.js</code>); the learned readers use no cue list, every word they know comes
from the annotated data, and nothing learned is merged into the Rules.</p>

<h2 id="rules-measured">What it is good and bad at (measured)</h2>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">Rules</th><th>Source</th></tr></thead>
<tbody>
<tr><td>Short template sets (1140 requests, written from the Rules’ own templates): right / wrong / not done</td><td class="num">98.9% / 0.4% / 0.8%</td><td><code>regress.sh</code>, 2026-11-03</td></tr>
<tr><td>llm_short (3000 realistic one-line commands)</td><td class="num">72.4% / 5.6% / 22.0%</td><td>same</td></tr>
<tr><td>Fixed 1000-message sample (long messages, 4858 requests), its own cut</td><td class="num">69.1% / 15.5% / 15.4%, 769 extra</td><td>same</td></tr>
<tr><td>Test part of fresh2 + short3: wrong, of what it did</td><td class="num">37.5%</td><td><code>confidence3_report.md</code> (job 072)</td></tr>
</tbody></table></div>
<p>Good at: short commands that use its words. Bad at: long, natural messages, and it cannot tell which of its readings are doubtful: it has no
confidence, so it cannot ask. Its segmenter also cuts text that is not a request into units (1202 extra units on the sample,
<code>CUT_SHARED.md</code>). It is in the demo as a comparison: <a href="#help/rules-vs-learned">The Rules, as a comparison</a>.</p>
`, 'Hand-written code over the legend’s cue words: instant, exact on its own phrasings, weak on long natural messages, and without a confidence. The comparison.');

/* ============================================================ VSS */
page('vss-reader', 'The VSS reader', `
<p>VSS = vector-symbolic. The VSS reader is not one model: it is a <b>composer</b> of small models, built in
<code>docs/js/vss-composer.js</code> (class <code>Composer</code>, <code>loadComposer</code>) from <code>docs/model/micro/registry.json</code>,
and loaded when the page opens by <code>docs/js/vss-formalizer.js</code> (<code>loadComposerAt</code>, versioned URLs). It has <b>two
cutters</b>: the world cutter cuts and names candidate worlds; the event cutter only gives a hint. The idea behind it, and why it is built
this way: <a href="#help/vss-worlds">What a VSS world is</a>.</p>

<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 676" role="img" aria-labelledby="d2t">
<title id="d2t">The VSS composer: tokenize, world cutter and event cutter, three candidate worlds per unit, H1 re-read, choice by fewest words not understood, context filler, adapter to SOP Lang wires</title>
${AH}
<rect class="box" x="90" y="8" width="220" height="38" rx="8"/>
<text class="t" x="200" y="24" text-anchor="middle">Message + names on the canvas</text>
<text class="m" x="200" y="39" text-anchor="middle">formalize(text, {names, last})</text>
<path class="ar" d="M200 46 V62"/>
<rect class="box" x="90" y="64" width="220" height="38" rx="8"/>
<text class="t" x="200" y="80" text-anchor="middle">Tokenize (mechanical)</text>
<text class="m" x="200" y="95" text-anchor="middle">front.js tokenize</text>
<path class="ar" d="M200 102 V114 H102 V128"/>
<path class="ar" d="M200 102 V114 H298 V128"/>
<rect class="mod" x="8" y="130" width="188" height="104" rx="8"/>
<text class="t" x="102" y="148" text-anchor="middle">(a) World cutter</text>
<text class="m" x="102" y="163" text-anchor="middle">cutter_worlds8s.json</text>
<text x="102" y="181" text-anchor="middle">BIO tagger per token:</text>
<text x="102" y="196" text-anchor="middle">B-&lt;world&gt; (9) · I · O</text>
<text x="102" y="213" text-anchor="middle">→ the units, and each</text>
<text x="102" y="227" text-anchor="middle">unit's top 3 worlds</text>
<rect class="mod" x="204" y="130" width="188" height="104" rx="8"/>
<text class="t" x="298" y="148" text-anchor="middle">(c) Event cutter</text>
<text class="m" x="298" y="163" text-anchor="middle">cutter_events8.json</text>
<text x="298" y="181" text-anchor="middle">same tagger, labels</text>
<text x="298" y="196" text-anchor="middle">B-&lt;event&gt; (51) · I · O</text>
<text x="298" y="213" text-anchor="middle">→ hint: the best event</text>
<text x="298" y="227" text-anchor="middle">at the unit's 1st token</text>
<path class="ar" d="M102 234 V256"/>
<path class="ar2" d="M298 234 V256"/>
<rect class="grp" x="8" y="258" width="384" height="148" rx="10"/>
<text class="t" x="200" y="277" text-anchor="middle">(b) Each unit: its 3 candidate worlds read it</text>
<rect class="mod" x="18" y="288" width="114" height="62" rx="7"/>
<text x="75" y="305" text-anchor="middle">own front.json</text>
<text x="75" y="320" text-anchor="middle">→ VSS reader</text>
<text class="s" x="75" y="337" text-anchor="middle">reading + status</text>
<rect class="mod" x="143" y="288" width="114" height="62" rx="7"/>
<text x="200" y="305" text-anchor="middle">own front.json</text>
<text x="200" y="320" text-anchor="middle">→ VSS reader</text>
<text class="s" x="200" y="337" text-anchor="middle">reading + status</text>
<rect class="mod" x="268" y="288" width="114" height="62" rx="7"/>
<text x="325" y="305" text-anchor="middle">own front.json</text>
<text x="325" y="320" text-anchor="middle">→ VSS reader</text>
<text class="s" x="325" y="337" text-anchor="middle">reading + status</text>
<text x="200" y="374" text-anchor="middle">H1: status unknown-event and the hint is one of</text>
<text x="200" y="391" text-anchor="middle">this world's events → read again with that event</text>
<path class="ar" d="M200 406 V424"/>
<rect class="box" x="30" y="426" width="340" height="72" rx="8"/>
<text class="t" x="200" y="444" text-anchor="middle">Choose one reading per unit</text>
<text x="200" y="461" text-anchor="middle">fewest words not understood wins</text>
<text x="200" y="476" text-anchor="middle">tie → the context filler's choice, then cutter order</text>
<text x="200" y="491" text-anchor="middle">no reading → unit ignored (“not understood”)</text>
<path class="ar" d="M200 498 V516"/>
<rect class="mod" x="30" y="518" width="340" height="72" rx="8"/>
<text class="t" x="200" y="536" text-anchor="middle">(d) Context filler</text>
<text class="m" x="200" y="551" text-anchor="middle">vss-context.js + context/weights.json</text>
<text x="200" y="568" text-anchor="middle">fills it / them / “the new one” / empty needed roles</text>
<text x="200" y="583" text-anchor="middle">margin 0: fill if a shape ranks first, else ask</text>
<path class="ar" d="M200 590 V608"/>
<rect class="acc" x="30" y="610" width="340" height="56" rx="8"/>
<text class="t" x="200" y="628" text-anchor="middle">(e) Adapter → SOP Lang wires</text>
<text class="m" x="200" y="643" text-anchor="middle">vss-adapter.js readingFromWires, toNodes</text>
<text class="s" x="200" y="658" text-anchor="middle">command / question / fact / rule (+ mention wires)</text>
</svg>
</div>
<figcaption>Figure 2. The composer for one message, with its own cut (the VSS cutter, the default). Yellow boxes load a model file. The dashed
arrow is the hint: it never cuts and never overrides a readable reading (H1 only).</figcaption>
</figure>

<h2 id="vss-cutter">(a) The world cutter</h2>
<p><code>docs/model/micro/cutter_worlds8s.json</code> (2.03 MB). A token tagger: a greedy averaged-perceptron BIO tagger (the segmenter of
<code>training/sketch/front.py</code>, <code>train_segmenter</code>; JS twin <code>segmentWorlds</code> in <code>docs/js/front.js</code>). Each token gets
<code>B-&lt;world&gt;</code> (the first token of a request, labelled with the world that holds its action), <code>I</code> (inside the request)
or <code>O</code> (outside every request). 11 labels: 9 worlds, I, O. A unit runs from a B to the last I after it.</p>
<p>The unit’s <b>candidates</b> are the 3 worlds with the highest <code>B-&lt;world&gt;</code> score at its first token
(<code>ROUTER_K = 3</code>: the smallest k whose recall of the gold world is at least 97%, measured 97.9% by
<code>training/sketch/cutter_worlds_probe.py</code>).</p>
<p><b>When another cutter cut the message</b> (<a href="#help/cutting">the shared cut</a>), the world cutter still runs once over the message,
and only names worlds: a unit’s candidates are the 3 worlds with the highest summed <code>B-&lt;world&gt;</code> score inside the unit; a unit
with no world signal is read by all 9 worlds, and the fewest words not understood decides (<code>CUT_SHARED.md</code>). With its own cut the
outputs are identical to the cutter path (<code>training/sketch/cut_bench.mjs</code>, line “identical”).</p>
<p>Trained by <code>training/sketch/train_cutter.py --worlds</code> on the annotation spans (the span of each gold request gives its B and I
tokens), <code>seg_epochs</code> 8, grouping <code>training/sketch/worlds_micro/GROUPS_8ops.json</code>, on 23,698 messages / 463,240 tokens:
every annotated message with spans of the world data (below, <a href="#help/data">Data</a>) plus the 3000 short one-request commands (switch
<code>SHORT=1</code>; the “s” in the name, SHORT.md). Requests per world in its data: shapes 15,286, position 9861, questions 7320, links 6163,
graphq 5038, manage 4051, history 1069, help 857, layout 564. Trained on the GPU machine’s CPU in job 070.</p>

<h2 id="worlds">(b) The 9 micro-worlds</h2>
<p>A <b>world</b> is one VSS model for a few actions (its <i>events</i>). Its legend lists only its own events. The model is a route book over
<i>stars</i>: every word identity is a vector of D = 1024 unit-modulus complex numbers derived from a hash of its name (portable
<code>star_version</code> 2, <code>docs/js/vss/stars.js</code>); the learned route book (<code>docs/js/vss/routebook.js</code>) gives each token
an address from its path, bigram and position, and the reader (<code>docs/js/vss/reader.js</code>) decodes the frame: the predicate (which
event, from the world’s verb lemmas) and the role fillers (target, colour, landmark, …). The reader returns a status:
<code>ok</code>, <code>abstain</code> (margin under 0.05: uncertain), <code>unknown-event</code> (no action word found) or
<code>no-sense</code> (more than half of the tokens could not be placed). The status is one input of the confidence; whether a reading is done is
decided by the confidence against a threshold. In VSS-BERT that confidence is the combined one (<a href="#help/two-readers">VSS-BERT</a>); the
VSS tab alone uses a confidence from every step of the chain plus whether SOP-BERT and the Rules read the request the same way
(<a href="#help/parts-alone">The VSS and SOP-BERT tabs</a>). The margin behind <code>abstain</code> alone is a poor confidence (AUROC 0.59 on the
sample, <code>RISK_COVERAGE.md</code>).</p>
<p>Before the model, the world’s own <b>front end</b> <code>front.json</code> normalizes the tokens: learned value n-grams (“bottom right” →
<code>bottom_right</code>) and trigger rules, learned from the annotated rows of that world’s events only (<code>FRONT_ROWS=world</code>;
thresholds <code>val_min_count</code> 5, <code>val_min_prec</code> 0.8, <code>trig_min_count</code> 2, <code>trig_share</code> 0.75, <code>trig_min_prec</code> 0.6).
Names are never in the lexicon: an unknown word becomes a name token, quoted text a text token.</p>
<div class="tw"><table>
<thead><tr><th>World</th><th>Events (actions and questions)</th><th>Folder</th><th class="num">Size</th><th class="num">Training rows</th><th class="num">Front: values / triggers</th><th class="num">Right when it reads (calibration)</th></tr></thead>
<tbody>
<tr><td>shapes</td><td>create, set, resize, fact, rule</td><td><code>micro/shapes8/</code></td><td class="num">5.8 MB</td><td class="num">15,919</td><td class="num">490 / 1574</td><td class="num">63.6%</td></tr>
<tr><td>links</td><td>connect, disconnect, reverse</td><td><code>micro/links8/</code></td><td class="num">4.4 MB</td><td class="num">6680</td><td class="num">107 / 909</td><td class="num">55.4%</td></tr>
<tr><td>position</td><td>move, swap, arrange, align, distribute, toFront, toBack</td><td><code>micro/position8/</code></td><td class="num">4.2 MB</td><td class="num">10,143</td><td class="num">240 / 1335</td><td class="num">67.4%</td></tr>
<tr><td>layout (new)</td><td>improve, respace, snap, fit, flip, sort, groupBy, equalize, straighten, untangle</td><td><code>micro/layout8/</code></td><td class="num">1.2 MB</td><td class="num">501</td><td class="num">45 / 224</td><td class="num">49.0%</td></tr>
<tr><td>graphq</td><td>check, connected, path, reachable, cycle, exists</td><td><code>micro/graphq8/</code></td><td class="num">2.9 MB</td><td class="num">4905</td><td class="num">120 / 722</td><td class="num">81.4%</td></tr>
<tr><td>questions</td><td>count, list, extreme, nearest, describe, neighbors, degree, property, members, groupOf</td><td><code>micro/questions8/</code></td><td class="num">3.4 MB</td><td class="num">7511</td><td class="num">150 / 1308</td><td class="num">87.9%</td></tr>
<tr><td>manage</td><td>delete, duplicate, rename, label, group, ungroup</td><td><code>micro/manage8/</code></td><td class="num">2.4 MB</td><td class="num">3909</td><td class="num">127 / 487</td><td class="num">57.0%</td></tr>
<tr><td>history</td><td>undo, redo, forget</td><td><code>micro/history8/</code></td><td class="num">0.8 MB</td><td class="num">901</td><td class="num">0 / 123</td><td class="num">78.7%</td></tr>
<tr><td>help (new)</td><td>help (a question about the editor: <code>question ask=help topic=… aspect=…</code>)</td><td><code>micro/help8/</code></td><td class="num">1.7 MB</td><td class="num">847</td><td class="num">98 / 234</td><td class="num">52.7%</td></tr>
</tbody></table></div>
<p class="note">Folders under <code>docs/model/</code>. Size: the files the page loads (<code>BUILD.json</code> left out). Rows from each folder’s
<code>BUILD.json</code>; values / triggers counted in its <code>front.json</code>. Right when it reads: the world prior of
<code>docs/model/confidence/vss.json</code>, the share of the requests read in that world that were right on the calibration messages (fresh2 +
short3, 368 messages; shrunk toward the mean). All nine: arm VSS-ALL of <code>training/sketch/TRAIN_PLAN_1103.md</code>, D 1024, 10 epochs,
seed 0, <code>DATA=spans</code> plus every folder of <code>EXTRA_DIRS</code> (<a href="#help/data">Data</a>), with the switches
<code>LEGEND_EXT=1</code> (the forms of 2026-11-02: templates, free text, panels, help questions, the layout operations, arrow labels),
<code>VAL_PICK=specific</code> (a value phrase stands for its most specific value, “circles” → circles, not “all”) and <code>DIAGRAM_OPS=1</code>
(groups and double positions), <code>CREATE_COLOR=role</code>, <code>FAST=1</code>; trained on the GPU machine (job 070). Each folder holds
<code>model.json</code>, <code>routebook.bin</code>, <code>stars.json</code> (the word vectors are generated in the browser, SHRINK.md),
<code>manifest.json</code> (sha256 of each file, format <code>vss-web-3</code>, 8-bit phases, sparse route book), <code>front.json</code> and
<code>BUILD.json</code> (not loaded). The grouping of events into these 9 worlds is <code>training/sketch/worlds_micro/GROUPS_8ops.json</code>:
the 7 earlier worlds (chosen by measured cutter confusion, PLAN_B.md) with reverse in links, group / ungroup in manage, members / groupOf in
questions, and two new worlds. <b>layout</b> holds the whole-diagram operations (“tidy up”, “untangle the arrows”, “make them the same
size”): they are confused with set / resize and among themselves more than with the position events (TRAIN_PLAN_1103.md §1). <b>help</b>
answers instead of drawing: “how do I …”, “can I …”, “what kinds of …” are told apart from every other world by the question form; the
engine’s help plugin writes the answer from the legend, as for the Rules’ help wire.</p>
<p class="note">Known gaps of these worlds (TRAIN_PLAN_1103.md §6): the <code>about</code> of a help question (“can I add <i>images</i>?”) is not
read by VSS (its words are outside the legend; SOP-BERT reads it); a help question’s topic is sometimes lost to the aspect words; most
<code>arrange template=</code> values are too rare for the value thresholds (144 of 200 lost), so an arrange with a template is read without it;
an item of several words (“Build MVP”) has no single VSS token, so a template’s item list can come out short. The confidence is meant to hold
such readings back.</p>

<h2 id="event-hint">(c) The event cutter and the event hint H1</h2>
<p><code>docs/model/micro/cutter_events8.json</code> (2.58 MB): the same tagger and trainer, with one label per legend event
(<code>B-&lt;event&gt;</code>, 51 events, plus I and O; grouping <code>training/sketch/worlds_micro/GROUPS_EVENTS_8ops.json</code>), trained on
20,698 messages / 445,956 tokens: the world data without the short commands. It is decoded once over the whole message; it does not cut. A unit’s <b>hint</b> is the
<code>B-&lt;event&gt;</code> label with the largest score at the unit’s first token.</p>
<p>Why: inside a world with several events the reader decides the event only from a verb lemma; a request with no verb (“Post blue”,
“Alpha to Beta”) gets <code>unknown-event</code>. <b>H1</b> (registry <code>"event_hint": "H1"</code>): only when a candidate world’s reading
has status <code>unknown-event</code> and the hint is one of that world’s events, the world reads the unit again with that event given
(<code>opts.event</code> in <code>reader.js</code>). Measured gain on the sample: right 69.6 → 73.2 (EVENT_HINT.md). H2 (overriding readable
readings too) was measured and rejected (both with the previous worlds).</p>

<h2 id="context">(d) The context filler</h2>
<p><code>docs/js/vss-context.js</code> with <code>docs/model/context/weights.json</code> (21.1 KB, retrained in job 070 on the same data as the worlds). It runs after VSS on the chosen reading and
handles reference <b>gaps</b> in the entity roles (target, from, to, anchor): <code>pron</code> (“it”, “them”), <code>vague</code> (“the new
one”), <code>desc</code> (“the blue one”: filled only by a context shape whose known attributes confirm it, otherwise left to the engine as a
mention) and <code>empty</code> (a role the action needs but the reading left empty; the needs are learned from the gold args). Candidates are
a closed set (shapes created or named earlier in the message, shapes on the canvas, names in the text, recent groups); hard filters (one vs
several, description constraints, recency); a linear ranker with 165 features and a learned “nobody” candidate, trained by
<code>training/sketch/train_context.mjs</code> on the gold args of an 80% split. Decision today: fill with the best candidate when it beats the
runner-up by the <code>margin</code>; the margin is <b>0</b>, so it asks only when “nobody” ranks first. A request with a gap it cannot fill
becomes a question to the user, not an execution.</p>
<p class="callout">The filler fills at margin 0 (the rule of 2026-11-01, “ask as little as possible”), but it no longer decides alone whether
its filling is done: the confidence does (it includes the filler’s own margin, <code>ctx_margin</code>), against a threshold chosen on held-out
data (AGENTS.md, 2026-11-02: do only what you are sure of, ask about the rest).</p>

<h2 id="adapter">(e) The adapter to SOP Lang wires</h2>
<p><code>docs/js/vss-adapter.js</code>: <code>readingFromWires</code> turns the reader’s wires into an event with roles; <code>toNodes</code> maps the
roles to SOP Lang keys and values (a description in a role becomes a <code>mention</code> wire). Position values are placed by what they are: a
relation (left_of, below, between, …) is a relation and a region (top_left, center, …) is a region, whichever of <code>relation</code>,
<code>region</code>, <code>relation2</code> holds it (fix 1 of SHORT2.md, 2026-11-02: before, such a value was dropped silently). The forms of
2026-11-02 (TRAIN_PLAN_1103.md §1): the help event becomes <code>question ask=help</code> with <code>topic</code> and <code>aspect</code>; the
layout operations and reverse become commands with their target, axis, property, anchor; template, scheme, fill, layer, topic, aspect,
property and kind are written in a world as prefixed value tokens (<code>tpl_timeline</code>, <code>asp_how</code>) that <code>extValue</code>
decodes; items, items2 and parents are set roles joined with “,” in text order; <code>no_label</code> is <code>label=""</code>; a create that
read a template, items or a title gets no default shape.</p>

<h2 id="decide">How a unit is decided, and ties</h2>
<ol>
  <li>Every candidate world reads the unit with its own front end (after H1 where it applies).</li>
  <li>The reading that leaves the <b>fewest words not understood</b> wins: the unit’s surface words, punctuation excluded, that are not behind
  a role filler, an accepted offer or the action token (the count of <code>training/sketch/words_not_understood.mjs</code>). An unreadable
  status (<code>unknown-event</code>, <code>no-sense</code>) understands no word; a reading that understands no word is not a reading.</li>
  <li>A <b>tie</b> goes to the context layer (<code>chooseReading</code> in <code>vss-context.js</code>: the reading the message context can
  complete); if still tied, the cutter’s order (the higher <code>B-&lt;world&gt;</code> score).</li>
  <li>No reading: the unit is ignored and the reply says what was not understood.</li>
  <li>The context filler then fills or asks (today: fills whenever a candidate ranks first); the adapter writes the wires; the references (names created, <code>last</code>) carry to the next
  unit (<code>nextContext</code>).</li>
</ol>
<p class="callout"><b>No fallback world, no single model.</b> The general fallback model <code>kinds_p80_s0</code> was removed from the composer and
the registry on 2026-11-02: it read 0 of 4643 requests on the sample and 0 of 877 on the short sets, and the numbers were identical without it
(SHORT2.md §7). A unit no candidate world reads is reported as not understood. The single-model VSS path (<code>?vss=single</code>) and the older
token router were removed the same day (the composer accepts only <code>"router": "cutter"</code>). The model folders are in git history (commit a76b4e3).</p>
<p class="note">Also in the code, off by default: <code>need_read</code> (re-read an empty needed role with presence “all”; tested, not adopted,
SHORT2.md §6).</p>
`, 'A composer of nine small vector-symbolic models, two cutters, a context filler and an adapter to SOP Lang.');

/* ============================================================ neural */
page('neural-reader', 'The SOP-BERT reader', `
<p>Code: <code>docs/js/neural.js</code> (<code>NeuralKit</code>, strategy <code>finetuned</code>), run by transformers.js 3.8.1 (loaded from
jsDelivr) on the CPU through WebAssembly, with 8-bit files (<code>q8</code>, <code>onnx/model_quantized.onnx</code>). The models are served
from this site and load by themselves when the page opens (from the browser cache after the first time). The demo has <b>one neural model</b>,
SOP-BERT, in <code>docs/model/neural/sop-bert/</code>. It is the cutter and the executed reading of VSS-BERT
(<a href="#help/two-readers">VSS-BERT</a>). Why fine-tune a transformer, and why it is not enough alone:
<a href="#help/bert">SOP-BERT reads well, but alone it is too bold</a>.</p>

<h2 id="sop-bert">SOP-BERT: one model that cuts and reads</h2>
<p>One DistilBERT encoder (<code>distilbert-base-uncased</code>) fine-tuned on our annotated requests, with small heads on top
(<code>training/neural/finetune_roles.py --name sop-bert</code>, data from <code>training/neural/make_roles.py</code>):</p>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 300" role="img" aria-labelledby="dbt">
<title id="dbt">SOP-BERT: one DistilBERT encoder with a cut head over the whole message and, per request, an act head, class heads, fill and description heads and a word-tag head</title>
${AH}
<rect class="box" x="60" y="8" width="280" height="36" rx="8"/>
<text class="t" x="200" y="24" text-anchor="middle">Words of the message / of each request</text>
<text class="s" x="200" y="38" text-anchor="middle">word pieces of the DistilBERT tokenizer</text>
<path class="ar" d="M200 44 V60"/>
<rect class="mod" x="60" y="62" width="280" height="44" rx="8"/>
<text class="t" x="200" y="80" text-anchor="middle">DistilBERT encoder (6 layers)</text>
<text class="s" x="200" y="96" text-anchor="middle">pretrained on English, fine-tuned on our requests</text>
<path class="ar" d="M90 106 V128"/><path class="ar" d="M165 106 V128"/><path class="ar" d="M240 106 V128"/><path class="ar" d="M315 106 V128"/>
<rect class="acc" x="8" y="130" width="92" height="84" rx="7"/>
<text class="t" x="54" y="148" text-anchor="middle">cut</text>
<text x="54" y="166" text-anchor="middle">O / B / I</text>
<text x="54" y="181" text-anchor="middle">per word of</text>
<text x="54" y="196" text-anchor="middle">the message</text>
<rect class="acc" x="108" y="130" width="92" height="84" rx="7"/>
<text class="t" x="154" y="148" text-anchor="middle">act</text>
<text x="154" y="166" text-anchor="middle">action, ask,</text>
<text x="154" y="181" text-anchor="middle">fact, rule</text>
<text x="154" y="196" text-anchor="middle">or none</text>
<rect class="acc" x="208" y="130" width="92" height="84" rx="7"/>
<text class="t" x="254" y="148" text-anchor="middle">classes</text>
<text x="254" y="166" text-anchor="middle">a value per key</text>
<text x="254" y="181" text-anchor="middle">fill:&lt;role&gt;</text>
<text x="254" y="196" text-anchor="middle">desc:&lt;key&gt;</text>
<rect class="acc" x="308" y="130" width="84" height="84" rx="7"/>
<text class="t" x="350" y="148" text-anchor="middle">tags</text>
<text x="350" y="166" text-anchor="middle">B / I / O</text>
<text x="350" y="181" text-anchor="middle">names, label,</text>
<text x="350" y="196" text-anchor="middle">numbers</text>
<path class="ar" d="M154 214 V238 H200 V250"/><path class="ar" d="M254 214 V238 H200"/><path class="ar" d="M350 214 V238 H200"/>
<rect class="box" x="60" y="252" width="280" height="40" rx="8"/>
<text class="t" x="200" y="269" text-anchor="middle">Assembled by the legend (no model)</text>
<text class="m" x="200" y="284" text-anchor="middle">@s1 command action=set target=$m1 color=red</text>
</svg>
</div>
<figcaption>Figure 3. SOP-BERT. Two calls per message: the cut head reads the whole message (up to 512 word pieces; the BERT cutter), then the
other heads read all its requests in one batched call.</figcaption>
</figure>
<ul>
  <li><b>cut</b>: O / B / I per word over the whole message (read on each word’s first word piece). It is the <b>BERT cutter</b> of the shared cut.</li>
  <li><b>act</b> (on the [CLS] vector, 52 classes): the action of a command (including the layout operations improve … untangle, reverse,
  group, ungroup), the ask of a question (including members, groupOf and help), <code>fact</code>, <code>rule</code>, or <code>none</code> (the unit
  is not a request, “Thanks”: no wire, listed as “Ignored (not a request)”).</li>
  <li><b>25 class heads, one per legend key with values</b> (arrow, aspect, axis, color, comparison, direction, fill, kind, layer, layout,
  notColor, outline, pairing, position, position2, property, quantifier, region, scheme, shape, size, style, superlative, template, topic):
  <code>none</code> or one of the values the key takes in the training gold. A help question’s topic is one of the 109 topics seen in training
  (the legend has 217).</li>
  <li><b>who fills each name-role</b> (<code>fill:&lt;key&gt;</code> for anchor, anchor2, from, linked, target, to): none / written / context /
  description; the <b>description’s own keys</b> (<code>desc:&lt;key&gt;</code>: quantifier, color, notColor, shape, recency), and for a second
  described role in the same request its own heads (<code>desc2:&lt;key&gt;</code>). So it reads “the red square” and “it” itself.</li>
  <li><b>word tags</b> B / I / O for the keys whose answer is written in the request (about, anchor, anchor2, at, count, distance, from, items,
  items2, label, linked, name, parents, scale, target, title, to). The items of a template are one span each, joined with “,” in text order;
  <code>about</code> is the part of a help question the legend does not know (“can I add <i>images</i>?”).</li>
</ul>
<p><b>Assembling the wires</b> is deterministic, by the legend: the wire type follows from the act; the keys read for an act are the keys its
requests have in the training gold (<code>reader.act_keys</code>); a role read as “written” takes the tagged words (a name created earlier in
the message becomes a reference to that wire), “description” becomes a <code>mention</code> wire with the <code>desc:</code> values (resolved by
the engine, as the Rules and VSS mentions), and “context” takes the context rule every reader shares after each request (a copy of
<code>nextContext</code> in <code>vss-composer.js</code>: “it” is the last shape created or named). <b>It never calls the Rules reader</b>
(owner, 2026-11-02).</p>
<p><b>Training</b> (arm BERT-ALL of <code>training/sketch/TRAIN_PLAN_1103.md</code>, GPU job 071): <code>make_data.py --all</code> /
<code>make_roles.py --all</code> on every span-annotated message the VSS worlds train on (<a href="#help/data">Data</a>): 24,698 messages,
54,584 request spans, nothing held out (training/neural/ALL_DATA.md), so no early stop: 8 epochs, the last kept, lr 6e-5, batch 32, fp16 on
cuda, seed 0. Loss: the act plus the mean of the class heads plus the word tags (and the cut tags); AdamW. Export: ONNX with dynamic 8-bit
quantization; <code>config.json</code> carries the head layout (<code>"reader"</code>); <code>training/neural/check_roles_node.mjs</code> reads 50
training requests through the demo’s decoding code and compares them with torch (ids, act, classes, tags 50/50, cut 19/20). It is tested only
on messages it was not trained on: fresh2 and short3 (below).</p>
<h2 id="sop-bert-measured">Measured</h2>
<p>Before → after the retraining on all the data, on the new writer’s test messages (fresh2: 405 messages, 1313 requested actions), each model
with the same confidence recipe at its best threshold (<code>results/072_measure/COMPARE.md</code>; 95% interval of 1000 paired resamples):</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">SOP-BERT of 2026-11-02</th><th class="num">SOP-BERT of 2026-11-03</th></tr></thead>
<tbody>
<tr><td>fresh2: confidently wrong, of what it did</td><td class="num">7.1%</td><td class="num"><b>3.6%</b></td></tr>
<tr><td>fresh2: cost score [95% interval]</td><td class="num">14.4 [2.0, 26.7]</td><td class="num">35.9 [27.6, 44.4]</td></tr>
<tr><td>short3: cost score [95% interval]</td><td class="num">0.2 [−10.5, 10.3]</td><td class="num">4.2 [−1.4, 8.5]</td></tr>
</tbody></table></div>
<p>On fresh2 the difference, +21.6 [9.7, 33.2], is a gain the interval shows; on short3, +3.9 [−4.8, 13.8], it is not shown either way. What
raised it: <a href="#help/reliability">More and better data, a fixed data pipeline</a>. On its own training data (a fit, not a test) it reads
the act of 99.98% of the sample’s requests right.</p>
<p>Alone, with its own confidence (24 numbers of its own heads, a logistic regression, <code>docs/model/confidence/sop-bert.json</code>), on the
test part of fresh2 + short3 it is confidently wrong on 3.0% of what it does; paired with VSS in VSS-BERT, 1.8% at the same amount done
(<a href="#help/two-readers/tr-numbers">VSS-BERT</a>). Where it is weak: help questions (the topic head knows 109 of the 217 topics),
descriptions in roles, and the layout acts (arrange 55% right on the calibration messages).</p>
<p class="note">Size of <code>onnx/model_quantized.onnx</code> (q8): 68.0 MB. The time of each message in the demo is in its reply. The neural
models before SOP-BERT (an act classifier and a ready-made question-answering model, removed 2026-11-02) are in
<a href="#help/history/h-neural">How we got here</a>.</p>
`, 'SOP-BERT: one fine-tuned DistilBERT that cuts a message and reads every request itself.');

/* ============================================================ cutting */
page('cutting', 'One cut for all readers', `
<p><b>Owner’s decision, 2026-11-02.</b> The readers read the <b>same units</b> of a message, so they differ only in how each reads a request,
never in how the message was split. VSS-BERT always reads the requests of the <b>BERT cutter</b> (the cut its confidence was fitted on; when the
message was already cut by it, the readings of the VSS and SOP-BERT tabs are reused). The tabs Rules, VSS and SOP-BERT read the cut chosen in
Settings › Cutting into requests.
<b>details</b> under a reply lists the units and how long the cut took.</p>
<div class="tw"><table>
<thead><tr><th>Cutter</th><th>What it is</th><th>Code / model</th></tr></thead>
<tbody>
<tr><td><b>Rules segmenter</b></td><td>Hand-written: sentences, then a comma or “and” before a verb, coordinated names, one clause per created object.</td><td><code>docs/js/logic.js</code> (<code>rulesCut</code>)</td></tr>
<tr><td><b>VSS cutter</b> (default)</td><td>A learned token tagger <code>B-&lt;world&gt;</code> / I / O trained on the annotated request spans; it also names each unit’s candidate worlds.</td><td><code>docs/model/micro/cutter_worlds8s.json</code></td></tr>
<tr><td><b>BERT cutter</b></td><td>The cut head of SOP-BERT: B / I / O per word over the whole message. Available once SOP-BERT has loaded.</td><td><code>NeuralKit.cut</code>, <code>training/neural/finetune_roles.py</code></td></tr>
</tbody></table></div>
<p><b>How.</b> <code>VSSFormalizer.cut(text, ctx, strategy, env)</code> returns <code>[{c0, c1, src}]</code> (character offsets); every reader
reads exactly those units (<code>rules.formalize(t, ctx, {units})</code>, <code>VSSFormalizer.formalize(t, ctx, _, {units})</code>,
<code>neural.formalize(t, ctx, {units})</code>). A cutter that is not available yet (VSS or SOP-BERT still loading) is replaced by the
Rules segmenter for that message, and the details say so. The default is <code>DEFAULT_CUT</code> in <code>docs/js/vss-composer.js</code>.</p>

<h2 id="cut-measured">What each cut costs each reader</h2>
<p>Per gold request, right / wrong / not done (%) and extra, every request executed; <code>node training/sketch/cut_bench.mjs</code>,
<code>PAIR=value</code>, with the 9 worlds of 2026-11-03 (method: <code>training/sketch/CUT_SHARED.md</code>).</p>
<div class="tw"><table>
<thead><tr><th>Set, reader</th><th class="num">Rules cut</th><th class="num">VSS cut</th></tr></thead>
<tbody>
<tr><td>Sample (4858), Rules</td><td class="num">69.1 / 15.5 / 15.4 +769</td><td class="num">74.5 / 11.8 / 13.7 +450</td></tr>
<tr><td>Sample, VSS</td><td class="num">69.8 / 14.3 / 15.9 +1023</td><td class="num"><b>76.9 / 10.1 / 12.9 +471</b></td></tr>
<tr><td>Short sets (1140), Rules</td><td class="num"><b>98.9 / 0.4 / 0.8 +4</b></td><td class="num">97.2 / 1.8 / 1.0 +5</td></tr>
<tr><td>Short sets, VSS</td><td class="num">70.6 / 11.7 / 17.7 +93</td><td class="num">78.0 / 8.2 / 13.9 +69</td></tr>
</tbody></table></div>
<p>The cut against the gold spans:</p>
<div class="tw"><table>
<thead><tr><th>Set, cut</th><th class="num">Units / gold</th><th class="num">Lost / merged / split / extra units</th><th class="num">ms per message</th></tr></thead>
<tbody>
<tr><td>Sample, Rules</td><td class="num">6059 / 4858</td><td class="num">1 / 180 / 180 / 1202</td><td class="num">10.9</td></tr>
<tr><td>Sample, VSS</td><td class="num">4934 / 4858</td><td class="num">147 / 48 / 87 / 180</td><td class="num">3.5</td></tr>
<tr><td>Short, Rules</td><td class="num">1118 / 1118</td><td class="num">0 / 0 / 0 / 0</td><td class="num">2.1</td></tr>
<tr><td>Short, VSS</td><td class="num">1122 / 1118</td><td class="num">4 / 0 / 8 / 0</td><td class="num">0.5</td></tr>
</tbody></table></div>
<p><b>Reading.</b> On whole messages the VSS cut is better for both readers (wrong 11.8 vs 15.5 for Rules, extras down from 769 to 450): the
Rules segmenter cuts text that is not a request into units (1202 extra units). On short one-line commands the new world cutter loses only 4 of
1118 commands (the previous one lost 96), so the Rules lose little with it (97.2 against 98.9 right) and VSS gains with it (78.0 against 70.6).
The default is the VSS cutter because real messages are whole messages. The BERT cut is not in this script; VSS-BERT reads it, and its numbers
are in <a href="#help/measurement/confidence-now">Measurement</a>.</p>
<p class="note">The cutter is judged by the errors it causes in the readers (requested actions done wrong or not done, and extras), not by
span-match scores (AGENTS.md).</p>
`, 'Every message is cut into requests once, and the readers read the same requests: VSS-BERT the BERT cutter’s, the other tabs the cut chosen in Settings.');

/* ============================================================ spelling */
page('spelling', 'The spell checker', `
<p><code>docs/js/spell.js</code> (<code>SpellKit</code>) runs on the message before the cut and before any reader; every reader reads the
corrected text. It can be switched off in Settings. It is built with VSA, not a dictionary algorithm: every word is a hypervector, the bundle
(sum) of random bipolar vectors of its character n-grams with <code>^</code> and <code>$</code> marking start and end; the cosine of two word
vectors estimates how many n-grams they share. A word that is neither known nor kept is replaced by the nearest known word when the cosine is
at least <code>threshold</code> and at least <code>margin</code> above the second-best.</p>
<dl class="kv">
  <dt>Vocabulary (targets)</dt><dd>477 words in <code>docs/model/spell/vocab.json</code> (the VSS worlds’ lexicon, catalog, value and trigger phrases,
  built by <code>training/sketch/spell/build_spell.mjs</code>), plus at run time the legend’s values and cue words and the names on the active
  reader’s canvas.</dd>
  <dt>Kept words</dt><dd>2384 words that occur in 2+ training messages (“wants”, “flow”, “because”): never corrected and never a target.</dd>
  <dt>Parameters</dt><dd>D 1024, n-grams of 2 and 3 letters, <code>threshold</code> 0.40, <code>margin</code> 0.08, chosen once by the protocol in
  <code>build_spell.mjs</code>: one random typo per message of the 1128 benchmark messages (seed 1), objective right − 3·wrong − 3·false
  corrections; result 560 right, 54 wrong, 457 left, 4 false corrections (the <code>selection</code> field of <code>vocab.json</code>). Stored in <code>vocab.json</code>.</dd>
  <dt>Left alone</dt><dd>Known words, words of 1–2 letters, numbers and words with digits or apostrophes, quoted text, the word after
  named / called / titled / labeled, and capitalised words inside a sentence (names: corrected only toward a name on the canvas, “Strat” → “Start”).</dd>
</dl>
<p class="note"><code>vocab.json</code> names its sources: the 7 worlds of the previous registry (arm VSS-G: lexicon, catalog, value and trigger
phrases). It was rebuilt once from the 9 worlds of 2026-11-03 and set aside: those worlds were trained on data with misspelled commands, and
some misspellings became words of their lexicons (at least 33: “cerate”, “conected”, “biger”, “yelow”, …), so the checker took them as known
words and corrected typos into them (“conenct” → “conect”); its selection run was also worse (492 right, 49 wrong, 498 left against 560, 54,
457). The new words (“untangle”, “straighten”, “title”) are targets through the legend’s cue words that the page adds at run time.</p>
`, 'A VSA spell checker over character n-grams corrects near misses before any reader sees the message.');

/* ============================================================ models */
page('models', 'Models and versions', `
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 560" role="img" aria-labelledby="d4t">
<title id="d4t">The docs/model folder: versions.json; micro with the registry, two cutters and the nine worlds; context; confidence; spell; neural with sop-bert</title>
<rect class="chipv" x="10" y="8" width="10" height="10" rx="2"/><text class="s" x="25" y="17">VSS loads</text>
<rect class="chipn" x="98" y="8" width="10" height="10" rx="2"/><text class="s" x="113" y="17">SOP-BERT loads</text>
<rect class="chipo" x="196" y="8" width="10" height="10" rx="2"/><text class="s" x="211" y="17">spell, versions</text>
<rect class="chipx" x="300" y="8" width="10" height="10" rx="2"/><text class="s" x="315" y="17">not loaded</text>
<text class="m" x="10" y="46" style="font-weight:600">docs/model/</text><text class="m" x="392" y="46" text-anchor="end">100.9 MB</text>
<path class="tree" d="M16 52 V402 M16 66 H30 M16 88 H30 M16 340 H30 M16 360 H30 M16 380 H30 M16 402 H30"/>
<rect class="chipo" x="34" y="58" width="9" height="9" rx="2"/><text class="m" x="48" y="66">versions.json</text><text class="m" x="392" y="66" text-anchor="end">1.1 KB</text>
<text class="m" x="34" y="92" style="font-weight:600">micro/</text><text class="m" x="392" y="92" text-anchor="end">31.4 MB</text>
<path class="tree" d="M40 98 V246 M40 114 H54 M40 136 H54 M40 158 H54 M40 180 H54"/>
<rect class="chipv" x="58" y="106" width="9" height="9" rx="2"/><text class="m" x="72" y="114">registry.json (the default)</text><text class="m" x="392" y="114" text-anchor="end">3.3 KB</text>
<rect class="chipv" x="58" y="128" width="9" height="9" rx="2"/><text class="m" x="72" y="136">cutter_worlds8s.json</text><text class="m" x="392" y="136" text-anchor="end">2.03 MB</text>
<rect class="chipv" x="58" y="150" width="9" height="9" rx="2"/><text class="m" x="72" y="158">cutter_events8.json</text><text class="m" x="392" y="158" text-anchor="end">2.58 MB</text>
<rect class="chipv" x="58" y="172" width="9" height="9" rx="2"/><text class="m" x="72" y="180">shapes8/ links8/ position8/ layout8/</text><text class="m" x="392" y="180" text-anchor="end">26.8 MB</text>
<text class="m" x="72" y="196">graphq8/ questions8/ manage8/ history8/</text>
<text class="m" x="72" y="212">help8/</text>
<text class="s" x="72" y="232">each world: model.json routebook.bin stars.json manifest.json front.json</text>
<text class="s" x="72" y="246">(+ BUILD.json, not loaded)</text>
<rect class="chipv" x="34" y="332" width="9" height="9" rx="2"/><text class="m" x="48" y="340">context/weights.json</text><text class="m" x="392" y="340" text-anchor="end">21.1 KB</text>
<rect class="chipv" x="34" y="352" width="9" height="9" rx="2"/><text class="m" x="48" y="360">confidence/ vss sop-bert combined vote3 .json</text><text class="m" x="392" y="360" text-anchor="end">0.72 MB</text>
<rect class="chipo" x="34" y="372" width="9" height="9" rx="2"/><text class="m" x="48" y="380">spell/vocab.json</text><text class="m" x="392" y="380" text-anchor="end">26.8 KB</text>
<text class="m" x="34" y="406" style="font-weight:600">neural/</text><text class="m" x="392" y="406" text-anchor="end">68.7 MB</text>
<path class="tree" d="M40 412 V428 M40 428 H54"/>
<rect class="chipn" x="58" y="420" width="9" height="9" rx="2"/><text class="m" x="72" y="428">sop-bert/</text><text class="s" x="392" y="428" text-anchor="end">one DistilBERT, 8-bit</text>
<text class="s" x="72" y="448">config.json (with the head layout "reader")</text>
<text class="s" x="72" y="464">tokenizer.json tokenizer_config.json</text>
<text class="s" x="72" y="480">onnx/model_quantized.onnx (q8)</text>
<rect class="box" x="8" y="502" width="384" height="52" rx="8"/>
<text class="s" x="18" y="519">versions.json: "micro/links8": "a06e092204" → the loader asks for</text>
<text class="m" x="18" y="534">micro/links8/routebook.bin?v=a06e092204</text>
<text class="s" x="18" y="548">new content = new hash = new URL; unchanged = stays cached</text>
</svg>
</div>
<figcaption>Figure 4. The model folder the page loads from (<code>du -sb</code>, 2026-11-03). VSS loads only what <code>registry.json</code> names;
SOP-BERT loads <code>sop-bert/</code>; the size of each of its files is also in <code>versions.json</code> (“sizes”) and in SOP-BERT › Settings.</figcaption>
</figure>

<h2 id="versions">Versions: the browser never uses a stale model</h2>
<p><code>training/sketch/stamp_models.py</code> computes a content version for every model: the first 10 hex digits of a sha256 over the model’s
files (relative path + content, sorted; <code>BUILD.json</code> left out). Folder models are the VSS folders (with <code>manifest.json</code>) and the
transformers.js folders under <code>neural/</code>; file models are the cutters, <code>context/*.json</code>, <code>spell/*.json</code> and
<code>confidence/*.json</code>; <code>docs/model/arms/</code> (arms trained on the GPU machine, waiting for a decision) is skipped. It writes
<code>docs/model/versions.json</code> (one entry per model; plus the file sizes of the neural folder, shown before download) and the same versions into
the registries (<code>version</code> per world, <code>cutter_version</code>, <code>event_cutter_version</code>, <code>context_version</code>).
It is idempotent and is run before every commit that changes a model.</p>
<p>The loader (<code>versioned()</code> in <code>docs/js/vss-formalizer.js</code>) appends <code>?v=&lt;version&gt;</code> of the longest matching folder
or file to every model URL. <code>versions.json</code> and <code>registry.json</code> are fetched with <code>cache: "no-cache"</code> (always
revalidated). The neural files are requested from transformers.js as a Hugging Face URL whose revision is our version, and a custom cache maps
that key to our versioned file; the Hugging Face models (only used by the headless comparisons) are pinned to a commit.</p>
<p class="note">Hosts that cannot serve binary files: the loader can fall back to base64 parts listed in a <code>bin-parts.json</code> inside the model folder
(the manifest’s sha256 still checks them). GitHub Pages serves the <code>.bin</code> files directly.</p>
`, 'What is in docs/model, what each reader loads, and how content versions keep the browser from using an old model.');

/* ============================================================ data */
page('data', 'Data', `
<p>All training data are realistic messages written by LLM agents (Sonnet, Haiku) in the style of real use: whole messages of 1 to 20
sentences, with text that is not a request, self-corrections, typos, many domains and personas, and the requests annotated as spans
(<code>{id, names, text, wires: [{span, trigger, type, args}]}</code>). Specifications: <code>training/sketch/llm_train/TRAIN_MSG_SPEC.md</code>,
<code>training/sketch/llm_bench/SPEC.md</code>, <code>training/sketch/LABEL_CONVENTIONS.md</code>; the writing and checking procedure is the skill
<code>skills/llm-annotated-data/SKILL.md</code>.</p>
<div class="callout"><b>Rules (AGENTS.md).</b> A data writer saves its texts <i>before</i> annotating (one file per batch, ids and texts only);
the coordinator checks that the annotated texts are byte-identical to the saved ones; a text is never edited to fit an annotation (2026-10-31: two
writers did). Realistic examples are never dropped because the pipeline cannot read them. Template sentences (<code>training/sketch/generate.py</code>)
are at most a secondary, labelled variant. <b>There is no hidden test set</b> (owner, 2026-11-01): every annotated message is data and may be
read, analysed and trained on; worlds are measured on the data they are trained on and on similar data.</div>

<div class="tw"><table>
<thead><tr><th>Folder (under <code>training/sketch/</code>)</th><th>What</th><th class="num">Messages</th><th>Used by</th></tr></thead>
<tbody>
<tr><td><code>llm_train/sonnet_msg</code>, <code>haiku_msg</code>, <code>sonnet_msg2</code>, <code>haiku_msg2</code></td><td>long messages with spans</td><td class="num">4 × 600</td><td>worlds, both cutters, context, neural</td></tr>
<tr><td><code>llm_train/sonnet_long</code></td><td>long messages with spans</td><td class="num">240</td><td>same</td></tr>
<tr><td><code>llm_bench/fresh1/sonnet</code>, <code>llm_bench/fresh1/haiku</code></td><td>written 2026-10-31 as a fresh test set, now data</td><td class="num">2 × 500</td><td>same</td></tr>
<tr><td><code>llm_bench/sonnet_spans</code>, <code>llm_bench/haiku_spans</code></td><td>the first bench sets, re-annotated with spans</td><td class="num">2 × 500</td><td>worlds (not the cutters)</td></tr>
<tr><td><code>llm_bench/sonnet</code>, <code>llm_bench/haiku</code></td><td>the same bench texts without spans</td><td class="num">2 × 500</td><td>not read by training</td></tr>
<tr><td><code>llm_train/sonnet</code>, <code>llm_train/haiku</code></td><td>short commands, one request per line (field <code>wire</code>, no span)</td><td class="num">2 × 1500</td><td>source of the next row</td></tr>
<tr><td><code>llm_train/sonnet_short</code>, <code>llm_train/haiku_short</code></td><td>the same 3000 short commands with spans (texts byte-identical)</td><td class="num">2 × 1500</td><td>world cutter (<code>SHORT=1</code>); round 2</td></tr>
<tr><td><code>llm_train/opus_train_a</code> … <code>opus_train_d</code>, <code>opus_gen_1</code>, <code>opus_gen_2</code></td><td>long messages by Opus (base and general), with spans</td><td class="num">6 × 300</td><td>the default worlds, cutters, context and SOP-BERT (since arms G)</td></tr>
<tr><td><code>llm_train/synth_rules</code>, <code>synth_rules_ops</code>, <code>synth_rules_ext</code></td><td>short commands generated from the Rules’ grammar and cue words (every action, question, value and construction the Rules read; owner, 2026-11-02 22:04), the layout operations, the forms of 2026-11-02</td><td class="num">8404 + 1374 + 2783</td><td>the default worlds, cutters, context and SOP-BERT (arm ALL)</td></tr>
<tr><td><code>llm_train/ops_formulations</code>, <code>opus_ext_1</code></td><td>realistic messages with the layout operations and with the new forms (templates, free text, help questions, arrow labels)</td><td class="num">700 + 500</td><td>same</td></tr>
<tr><td><code>llm_train/synth_combo</code></td><td>several generated commands in one message</td><td class="num">1497</td><td>same</td></tr>
<tr><td><code>llm_train/ops_groups</code></td><td>new operations: group, ungroup, members, groupOf (1693 requests)</td><td class="num">480</td><td>round 2 (<code>OPS=1</code>)</td></tr>
<tr><td><code>llm_train/ops_positions</code></td><td>double positions: two relations, region + relation (1022 requests)</td><td class="num">464</td><td>round 2 (<code>OPS=1</code>)</td></tr>
</tbody></table></div>
<p class="note">Totals for the default models (arm ALL, TRAIN_PLAN_1103.md): the world data are the 9 <code>DATA=spans</code> folders (4640 messages,
22,702 requests) plus the 12 folders of <code>EXTRA_DIRS</code> above (17,058 messages): 21,698 messages, 51,584 requests with a span; the event
cutter reads 20,698 messages, the world cutter adds the 3000 short commands (23,698). SOP-BERT reads the same messages plus the 3000 short commands
with spans (<code>make_data.py --all</code>, <code>make_roles.py --all</code>): 24,698 messages, 54,584 request rows, nothing held out. Message counts
are lines of the <code>msg_*</code> / <code>batch_*</code> files. <code>ops_groups</code> and <code>ops_positions</code> served the round-2 worlds
(no longer shipped).</p>

<h2 id="sets">The sets used for measurement</h2>
<dl class="kv">
  <dt>The fixed 1000-message sample</dt><dd>1000 messages, 4858 gold requests, drawn from the 9 world-data folders (ids:
  <code>training/neural/sample1000_ids.txt</code>; the folder copy that <code>llm_score.mjs</code> reads is <code>data/sampleF/</code> on branch
  <code>gpu-runs</code>). Every composer number since PLAN_A uses it, so they are comparable. It is training data for the worlds (no hidden test
  set), and since arm ALL also for SOP-BERT (<code>--all</code>): numbers on it are a fit, not a test.</dd>
  <dt>fresh2 and short3: the test of the learned readers</dt><dd><code>training/sketch/llm_bench/fresh2</code> (600 messages by a writer
  not in the training data, 1909 requests) and <code>training/sketch/llm_bench/short3</code> (530 short commands, 513 used, 644 requests), read
  by no training. One third of each (by <code>sha256(id) % 3 == 0</code>: 368 messages) fits each reader’s confidence and threshold; the other
  745 messages (1745 requested actions) are the test part every number of the readers is reported on.</dd>
  <dt>The demo’s short sets</dt><dd><code>docs/bench/*.json</code> (index <code>docs/bench/index.json</code>): hand 40, blind 60, broad 128 rows
  (140 requests), and three sets generated from templates, seen, new_identities and heldout_formulations, 300 each: 1128 rows, 1140 requests,
  median 6 words. Built by <code>training/sketch/make_bench.mjs</code>. The Benchmark in Settings and <code>training/sketch/short_bench/</code> score them.</dd>
  <dt>Per-event gold</dt><dd>One gold file per event (requests read from their annotated span, no cut), used with <code>SEG=gold</code> to measure
  one world alone (PLAN_B.md). These folders are in the coordinator’s scratch, not in the repository.</dd>
</dl>
`, 'Realistic messages written by LLM agents, with every request annotated as a span; the sets every number is measured on.');

/* ============================================================ training */
page('training', 'Training and the GPU runner', `
<div class="tw"><table>
<thead><tr><th>What</th><th>Script</th><th>Where</th><th>Time measured</th></tr></thead>
<tbody>
<tr><td>One VSS world</td><td><code>training/sketch/train_micro.sh &lt;world&gt; &lt;events&gt;</code> → <code>msg_to_world.py</code>, <code>sop check</code>, <code>sop train</code>, <code>sop export-web --bits 8 --sparse</code></td><td>CPU here, or GPU (<code>DEVICE=cuda</code>)</td><td>the 9 worlds of the default registry, the two cutters (CPU, in parallel) and the context filler: 3273 s in all on the GPU machine (job 070, <code>FAST=1</code>, two worlds at once)</td></tr>
<tr><td>A cutter</td><td><code>training/sketch/train_cutter.py --worlds &lt;grouping&gt;</code></td><td>CPU</td><td>in job 070, beside the worlds</td></tr>
<tr><td>Context filler weights</td><td><code>training/sketch/train_context.mjs</code></td><td>CPU (node)</td><td>—</td></tr>
<tr><td>Round trips: does the training gold come back?</td><td><code>training/sketch/convert_check.py</code> / <code>.mjs</code> (VSS), <code>training/neural/roles_roundtrip.py</code> / <code>.mjs</code> (SOP-BERT)</td><td>CPU</td><td>a gate at the start of jobs 070 and 071 (<a href="#help/reliability/r-roundtrip">why</a>)</td></tr>
<tr><td>SOP-BERT</td><td><code>training/neural/make_roles.py</code>, <code>training/neural/finetune_roles.py --name sop-bert</code>, <code>check_roles_node.mjs</code>, <code>cut_node.mjs</code></td><td>GPU (the owner’s machine)</td><td>1209 s for 8 epochs on 54,584 request rows (job 071)</td></tr>
<tr><td>Spell vocabulary</td><td><code>training/sketch/spell/build_spell.mjs</code></td><td>CPU (node)</td><td>—</td></tr>
<tr><td>Versions</td><td><code>training/sketch/stamp_models.py</code></td><td>CPU</td><td>seconds</td></tr>
</tbody></table></div>
<p class="note">Times: the logs of jobs 070 and 071 on branch <code>gpu-runs</code> (<code>results/070_vss_all.log</code>, <code>071_bert_all.log</code>),
an RTX 3050 Ti with 4 GB. “—”: no time in a committed document.</p>

<h2 id="switches">The switches of <code>train_micro.sh</code></h2>
<p>Every switch is off by default and the default reproduces the old build byte for byte; every switch is recorded in the world’s
<code>BUILD.json</code>, so a model says how it was built.</p>
<div class="tw"><table>
<thead><tr><th>Switch</th><th>Effect</th><th>Why (document)</th></tr></thead>
<tbody>
<tr><td><code>CREATE_COLOR=role</code></td><td>The colour of a new shape fills the event role <code>color</code>, as for every other colour (<code>llm_to_world.py</code>).</td><td>CREATE_COLOR.md; in every world of the default registry</td></tr>
<tr><td><code>N_CAL=&lt;n&gt;</code></td><td>Training rows sampled to fit the presence thresholds (<code>sop train --n_cal</code>, default 400; 100000 = all rows).</td><td>BETWEEN.md</td></tr>
<tr><td><code>VAL_PREC=event</code></td><td>A value n-gram’s precision counted only over requests of events that carry its kind (“three” → 3 instead of “add three” → 3).</td><td>ROUND2.md fix 4</td></tr>
<tr><td><code>VAL_SUB=value</code></td><td>A longer value n-gram is blocked only by a sub-n-gram that explains it (“bottom left” kept although “left” is kept).</td><td>ROUND2.md fix 3</td></tr>
<tr><td><code>SHORT=1</code></td><td>Also read <code>llm_train/{sonnet,haiku}_short</code>.</td><td>SHORT.md</td></tr>
<tr><td><code>OPS=1</code></td><td>Also read <code>llm_train/ops_groups</code>, <code>ops_positions</code>.</td><td>DIAGRAM_OPS.md §7</td></tr>
<tr><td><code>DIAGRAM_OPS=1</code></td><td>Groups and double positions in the conversion and the legend (events group, ungroup, members, groupOf; roles relation2, landmark3).</td><td>DIAGRAM_OPS.md §4–6</td></tr>
<tr><td><code>LEGEND_EXT=1</code></td><td>The forms of 2026-11-02 (templates, free text, panels, help questions, the layout operations, arrow labels): events, roles and value tables of the extended legend; a description is never written broader than its gold.</td><td>TRAIN_PLAN_1103.md §0–1, LEGEND_EXT.md; in the default registry</td></tr>
<tr><td><code>VAL_PICK=specific</code></td><td>A value n-gram stands for the most specific value that passes the bars, not the most frequent one (“circles” → circles, not the quantifier all).</td><td>synth/CONVERT_FIX.md; in the default registry</td></tr>
<tr><td><code>FAST=1</code></td><td>The trainer’s memory-bounded steps on the GPU (<code>FAST_MEM_MB</code>).</td><td>job 070</td></tr>
<tr><td><code>DRY=1</code></td><td>Build the world’s data and stop: no training, <code>docs/model</code> untouched.</td><td>ROUND2.md §3</td></tr>
</tbody></table></div>
<p class="note">Other settings: <code>DATA</code> (<code>spans</code> for every world in use), <code>FRONT_ROWS=world</code>, <code>D</code> 1024,
<code>EPOCHS</code> 10, <code>SEED</code>, <code>DEVICE</code>, <code>N_EVAL</code> / <code>EVAL_MODES</code> (the trainer’s own evaluation, does not change
the model), <code>HOLDOUT</code> (experiments), <code>KINDMAP</code>, <code>VSA_MAX_HOURS</code> (watchdog). <code>train_cutter.py</code> has its own
<code>SHORT</code>, <code>OPS</code>, <code>DIAGRAM_OPS</code>. The trainer itself is <code>training/vss/tool/sop/</code>, copied from
ml-circuits-research/vss-demo at commit 9c85649 (<code>training/vss/PROVENANCE.md</code>).</p>

<h2 id="runner">Where it runs: here, or the owner’s GPU through git</h2>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 500" role="img" aria-labelledby="d3t">
<title id="d3t">The training loop: the coordinator pushes a job to branch gpu-runs, runner.sh on the GPU machine runs it and pushes results, the coordinator scores, stamps and commits to main, GitHub Pages serves it</title>
${AH}
<rect class="box" x="50" y="8" width="342" height="62" rx="8"/>
<text class="t" x="221" y="26" text-anchor="middle">Coordinator session (this repo, CPU)</text>
<text x="221" y="43" text-anchor="middle">data, pre-registration, job script</text>
<text class="s" x="221" y="60" text-anchor="middle">CPU work here: cutters, context, scoring</text>
<path class="ar" d="M100 70 V106"/>
<text class="m" x="110" y="85">git push jobs/&lt;id&gt;.sh</text>
<text class="m" x="110" y="99">→ branch gpu-runs</text>
<rect class="mod" x="50" y="108" width="342" height="78" rx="8"/>
<text class="t" x="221" y="126" text-anchor="middle">runner.sh on the owner's GPU machine</text>
<text x="221" y="143" text-anchor="middle">Fedora, 4 GB NVIDIA card, own account, no Docker</text>
<text x="221" y="159" text-anchor="middle">pulls every 120 s · at most 2 jobs at once</text>
<text class="s" x="221" y="176" text-anchor="middle">train_micro.sh DEVICE=cuda · finetune*.py</text>
<path class="ar" d="M100 186 V222"/>
<text class="m" x="110" y="201">git push results/&lt;id&gt;.log, .exit</text>
<text class="m" x="110" y="215">+ the files on its # PATHS line</text>
<rect class="box" x="50" y="224" width="342" height="62" rx="8"/>
<text class="t" x="221" y="242" text-anchor="middle">Coordinator: fetch, score, decide</text>
<text x="221" y="259" text-anchor="middle">llm_score.mjs · short_bench · error_analysis.mjs</text>
<text class="s" x="221" y="276" text-anchor="middle">against the threshold written before the run</text>
<path class="ar" d="M100 286 V318"/>
<text class="s" x="110" y="306">adopted</text>
<rect class="box" x="50" y="320" width="342" height="56" rx="8"/>
<text class="t" x="221" y="338" text-anchor="middle">stamp_models.py, commit to main</text>
<text class="s" x="221" y="355" text-anchor="middle">versions.json + registry versions;</text>
<text class="s" x="221" y="369" text-anchor="middle">only the coordinator commits</text>
<path class="ar" d="M100 376 V408"/>
<text class="s" x="110" y="396">git push main</text>
<rect class="acc" x="50" y="410" width="342" height="54" rx="8"/>
<text class="t" x="221" y="428" text-anchor="middle">GitHub Pages serves docs/</text>
<text class="s" x="221" y="446" text-anchor="middle">the browser loads each model with ?v=&lt;hash&gt;</text>
<path class="ar2" d="M50 437 H24 V39 H48"/>
<text class="s" x="18" y="480">next round: errors → data or fix → new job</text>
</svg>
</div>
<figcaption>Figure 5. The git runner (<code>training/laptop/runner.sh</code>, <code>training/laptop/README.md</code> “Without a link”). Nothing from
<code>gpu-runs</code> reaches <code>main</code> without the coordinator’s check. A job script may name <code># PATHS:</code> (files to push back when
it ends) and <code># AFTER:</code> (jobs to wait for); CPU threads per job = cores / jobs at once.</figcaption>
</figure>
<p class="note">For a machine that the Claude desktop app can link (Ubuntu/Debian), <code>training/laptop/README.md</code> also describes a Docker
“box” (<code>training/laptop/Dockerfile</code>). Agents do not commit or push (AGENTS.md): they leave changes in the working tree and the coordinator
reviews and commits.</p>
`, 'The scripts that build every model, their switches, and the git runner on the owner’s GPU machine.');

/* ============================================================ measurement */
page('measurement', 'Measurement', `
<h2 id="metric">The main metric (owner, 2026-11-02)</h2>
<p><b>Do only what you are sure of, ask about the rest.</b> The first number of every reader is how often it is <b>confidently wrong</b>; the
readers are chosen and compared by the <b>cost score</b>, in which one confident mistake costs as much as 10 right answers
(<a href="#help/research-question">The goal</a>; AGENTS.md, “What counts as an error”).</p>
<div class="tw"><table>
<thead><tr><th>Number</th><th>Definition</th></tr></thead>
<tbody>
<tr><td><b>Confidently wrong</b></td><td>(executed wrong + extras executed) / everything executed = 1 − the precision of execution</td></tr>
<tr><td>Done right</td><td>right / requested actions</td></tr>
<tr><td>Asked</td><td>requested actions read but held back / requested actions; never an error</td></tr>
<tr><td><b>Cost score</b></td><td>(right − 10 × (executed wrong + extras executed)) per 100 requested actions; asking scores 0 (<code>COST_SCORE.md</code>)</td></tr>
<tr><td>AUROC</td><td>how well a confidence separates its right from its not-right requests (0.5 = not at all, 1 = perfectly)</td></tr>
</tbody></table></div>
<p>Each learned reader’s threshold is the one with the best cost score on the calibration part, from out-of-fold confidences; the confidence
recipe of each reader was chosen there too, among 16–22 variants, by a rule written before (<code>confidence3/PLAN.md</code>). Results are
reported on the test part, with 95% intervals from 1000 paired resamples of the test messages. A difference whose interval lies above 0 is a
gain shown; otherwise it is “not shown either way”.</p>
<h3 id="metric-requests">Under it: per requested action (owner, 2026-11-01)</h3>
<p>Per <b>requested action</b>, never per message: of the gold requests, the share done <b>right</b>, done <b>wrong</b> (executed with the wrong
action, shape or value), and <b>not done</b> (not understood, or asked); plus <b>extra</b>: the count of requests nobody asked for. A reference
the reader leaves for the context (“it”, a name from an earlier sentence) is not an error.</p>

<h2 id="sets-used">The data it is measured on</h2>
<p>The <b>test part of fresh2 + short3</b>: 745 messages, 1745 requested actions, by writers and in forms no training read; the other third
(368 messages, chosen by <code>sha256(id) % 3 == 0</code>) is the calibration part (<a href="#help/data/sets">the sets</a>). The test part had
been read for earlier studies, so its numbers are exploratory; a set written after these models (fresh3) is planned.</p>

<h2 id="confidence-now">Current numbers: direction, before → after</h2>
<p>Each reader at its own threshold on the test part (<code>results/072_measure/refit/records/confidence3_report.md</code>, branch
<code>gpu-runs</code>; the readers of 2026-11-02 from commit 220295a):</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">VSS-BERT</th><th class="num">SOP-BERT tab</th><th class="num">VSS tab</th><th class="num">Rules</th></tr></thead>
<tbody>
<tr><td>Confidently wrong, readers of 2026-11-02</td><td class="num">3.8%</td><td class="num">3.2%</td><td class="num">—</td><td class="num">—</td></tr>
<tr><td>Confidently wrong, readers of 2026-11-03</td><td class="num"><b>1.8%</b></td><td class="num">2.5%</td><td class="num">3.8%</td><td class="num">37.5%</td></tr>
<tr><td>Done right, of the requested actions</td><td class="num">42.8%</td><td class="num">44.8%</td><td class="num">37.8%</td><td class="num">57.8%</td></tr>
<tr><td>Asked, of the requested actions</td><td class="num">52.6%</td><td class="num">49.3%</td><td class="num">39.1%</td><td class="num">0%</td></tr>
<tr><td>Cost score, readers of 2026-11-02</td><td class="num">29.7</td><td class="num">31.5</td><td class="num">20.7</td><td class="num">—</td></tr>
<tr><td>Cost score, readers of 2026-11-03 [95% interval]</td><td class="num">34.8 [29.8, 39.5]</td><td class="num">33.4 [27.2, 39.0]</td><td class="num">22.9 [16.6, 29.5]</td><td class="num">−288.4</td></tr>
<tr><td>AUROC of the confidence (calibration, out of fold)</td><td class="num">0.919</td><td class="num">0.912</td><td class="num">0.911</td><td class="num">—</td></tr>
</tbody></table></div>
<p>Read as direction: every learned reader makes fewer confident mistakes than the day before, VSS-BERT fewest. The score differences between the
two days are within their intervals (commit 220295a: none shown either way); the gain the intervals do show is SOP-BERT’s on fresh2 with one
fixed confidence recipe, 14.4 → 35.9, +21.6 [9.7, 33.2] (<code>results/072_measure/COMPARE.md</code>,
<a href="#help/reliability/r-result">More and better data</a>).</p>
<p class="note">The SOP-BERT and VSS tabs’ confidences also use whether the other readers read the request the same way (<code>vote3.json</code>);
SOP-BERT with only its own numbers scores 29.3 [23.8, 35.2], 3.0% confidently wrong; VSS with only its own numbers 4.8, asking about almost
everything. VSS-BERT uses <code>combined.json</code>, the variant without the act prior (against the plain recipe +2.2 [−1.3, 6.0], not shown
either way). The 3-readers vote (31.8, 2.6% confidently wrong; against VSS-BERT −0.8 [−5.1, 3.4]) was removed
(<a href="#help/rules-vs-learned/rv-vote">why</a>).</p>

<h2 id="now">Every request executed: the regression sets (<code>training/sketch/regress.sh</code>)</h2>
<p>Per gold request: right / wrong / not done (%) + extra, every request executed (no confidence), each reader with its own cut; 2026-11-03.
The sample and llm_short are training data of both learned readers; the templates are written from the Rules’ own templates. These are the
regression checks run before every commit that touches a reader, not a test of the confidence.</p>
<div class="tw"><table>
<thead><tr><th>Set</th><th class="num">Rules</th><th class="num">VSS, 7 worlds of 2026-11-02</th><th class="num">VSS, 9 worlds of 2026-11-03</th></tr></thead>
<tbody>
<tr><td>Fixed sample (1000 messages, 4858 requests)</td><td class="num">69.1 / 15.5 / 15.4 +769</td><td class="num">77.8 / 10.0 / 12.2 +309</td><td class="num">76.9 / 10.1 / 12.9 +471</td></tr>
<tr><td>Short: templates (1140)</td><td class="num">98.9 / 0.4 / 0.8 +4</td><td class="num">59.5 / 11.8 / 28.7 +76</td><td class="num">78.0 / 8.2 / 13.9 +69</td></tr>
<tr><td>Short: llm_short (3000)</td><td class="num">72.4 / 5.6 / 22.0 +375</td><td class="num">67.0 / 9.3 / 23.7 +400</td><td class="num">70.8 / 8.9 / 20.3 +442</td></tr>
</tbody></table></div>

<h2 id="scripts">The scripts</h2>
<dl class="kv">
  <dt><code>training/sketch/confidence3/fit3.mjs</code>, <code>refit.sh</code></dt><dd>Fit every confidence file (<code>vss.json</code>,
  <code>sop-bert.json</code>, <code>combined.json</code>, <code>vote3.json</code>) on the calibration part, choose each recipe and threshold, and
  report the test part with intervals; run again after every retraining.</dd>
  <dt><code>training/sketch/combine/combined_report.mjs</code></dt><dd>VSS-BERT: pairing, agreement and its confidence (<code>COMBINED_READER.md</code>).</dd>
  <dt><code>training/sketch/llm_score.mjs</code></dt><dd>Scores a reader on folders of annotated messages (<code>SEG=composer</code> whole messages,
  <code>SEG=gold</code> one world on gold spans; <code>PAIR=value</code> pairs produced and gold requests by their values). Also scores the Rules.</dd>
  <dt><code>training/sketch/cut_bench.mjs</code></dt><dd>Every cut with every reader on the same gold (<a href="#help/cutting">One cut for all readers</a>).</dd>
  <dt><code>training/sketch/short_bench/</code>, <code>error_analysis.mjs</code></dt><dd>The demo’s short sets, and the root cause of each miss
  (no unit, wrong world, unknown event, role values, …).</dd>
  <dt><code>training/sketch/confidence3/audit_new_forms.mjs</code></dt><dd>Checks that two readings counted as the same make the engine do the same
  thing (<code>NEW_FORMS_AUDIT.md</code>).</dd>
</dl>
<div class="callout"><b>Discipline (AGENTS.md “Experiments”).</b> Before a run: the hypothesis, the measure and the threshold for “it worked”,
written down and shown. No knobs turned on the fly; one change at a time; a miss is reported, not patched. After every evaluation: a
root-cause analysis of the misses, each classified by the first cause that explains it and <i>where</i> it sits (data, front end, our code,
calibration, model); fixes go where the cause is.</div>
`, 'The main metric (how often a reader is confidently wrong, and the cost score), the data it is measured on, the current numbers as before → after, and the scripts.');

/* ============================================================ repository */
page('repository', 'Repository map', `
<div class="tw"><table>
<thead><tr><th>Folder</th><th>What it holds</th></tr></thead>
<tbody>
<tr><td><code>docs/</code></td><td>The site published by GitHub Pages: <code>docs/index.html</code> (the demo), <code>docs/architecture.html</code> (these pages as one page).</td></tr>
<tr><td><code>docs/js/</code></td><td>All the page’s code: engine and Rules (<code>logic.js</code>), VSS composer and its parts, SOP-BERT (<code>neural.js</code>), the reader that answers, VSS-BERT (<code>combined-confidence.js</code>), the other readers’ votes used by the VSS and SOP-BERT tabs (<code>vote-confidence.js</code>), spell checker, UI, help (<code>help.js</code>, <code>docs.js</code>, <code>docs-concepts.js</code>, <code>docs-arch.js</code>).</td></tr>
<tr><td><code>docs/js/vss/</code></td><td>The VSS reader in the browser: <code>loader.js</code>, <code>stars.js</code>, <code>routebook.js</code>, <code>reader.js</code>, <code>soplang.js</code>.</td></tr>
<tr><td><code>docs/model/</code></td><td>Every model the page loads, with <code>versions.json</code> (<a href="#help/models">Models and versions</a>).</td></tr>
<tr><td><code>docs/bench/</code></td><td>The six short benchmark sets.</td></tr>
<tr><td><code>training/sketch/</code></td><td>Data (<code>llm_train/</code>, <code>llm_bench/</code>), world building (<code>train_micro.sh</code>, <code>msg_to_world.py</code>, <code>llm_to_world.py</code>, <code>front.py</code>), cutters, context, scoring (<code>llm_score.mjs</code>, <code>cut_bench.mjs</code>), result documents, run logs (<code>runs/</code>), groupings (<code>worlds_micro/GROUPS_*.json</code>).</td></tr>
<tr><td><code>training/neural/</code></td><td>The neural models: <code>make_data.py</code>, <code>finetune.py</code>, <code>check_node.mjs</code> (the earlier act classifier); <code>make_roles.py</code>, <code>finetune_roles.py</code>, <code>check_roles_node.mjs</code>, <code>cut_node.mjs</code> (SOP-BERT); the sample ids.</td></tr>
<tr><td><code>training/laptop/</code></td><td>The GPU machine: <code>runner.sh</code> (git runner), <code>README.md</code>, <code>Dockerfile</code>, <code>neural_score.mjs</code>, zero-shot checks (<code>zs_check.mjs</code>, <code>zs_eval.mjs</code>).</td></tr>
<tr><td><code>training/vss/tool/sop/</code></td><td>The VSS trainer and exporter (<code>sop train</code>, <code>sop check</code>, <code>sop export-web</code>), copied from vss-demo.</td></tr>
<tr><td><code>skills/</code></td><td>Agent skills: <code>vss-microworlds</code>, <code>vss-world-design</code>, <code>llm-annotated-data</code>, <code>agent-experiments</code>.</td></tr>
<tr><td><code>research/</code>, <code>reports/</code></td><td>Earlier research notes (<code>research/hier/</code>, <code>research/attention/</code>) and a dated report.</td></tr>
<tr><td>root</td><td><code>AGENTS.md</code> (rules: read first), <code>README.md</code>, <code>DECISIONS.md</code>, <code>future-experiments.md</code>, <code>ISSUES_OTHER_REPOS.md</code>.</td></tr>
</tbody></table></div>

<h2 id="result-docs">Result documents (<code>training/sketch/</code> unless said otherwise)</h2>
<div class="tw"><table>
<thead><tr><th>Document</th><th>One line</th></tr></thead>
<tbody>
<tr><td><code>confidence3/RESULT.md</code>, <code>confidence3/PLAN.md</code></td><td>Each reader’s confidence with the other readers’ votes as inputs; the 3-readers vote (tried, then removed); the selection rule of the recipes. Refitted for the readers of 2026-11-03 in job 072 (<code>results/072_measure/refit/records/confidence3_report.md</code> on <code>gpu-runs</code>).</td></tr>
<tr><td><code>combine/COMBINED_READER.md</code>, <code>combine/COMBINE.md</code></td><td>VSS-BERT: one cut, two readings, pairing, the confidence fitted on agreement; a request both read the same is right about 95% of the time.</td></tr>
<tr><td><code>COST_SCORE.md</code></td><td>The cost score (one confident mistake = 10 right answers) and how each threshold is chosen.</td></tr>
<tr><td><code>TRAIN_PLAN_1103.md</code></td><td>2026-11-03: the GPU jobs 070 (VSS), 071 (SOP-BERT), 072 (measure) that trained both learned readers on all the data; their models are the demo’s.</td></tr>
<tr><td><code>training/neural/ROLES_ROUNDTRIP.md</code></td><td>SOP-BERT’s training labels decoded back through the demo’s code: silent wrong labels 2.8% → 0.1%, round trip 92.7% → 95.3%.</td></tr>
<tr><td><code>synth/VSS_SYNTH_DIAGNOSIS.md</code>, <code>synth/CONVERT_FIX.md</code></td><td>Why the generated commands gave VSS no gain (31% never reached the worlds in a learnable form) and the fix (synth_rules round trip 65.9% → 79.3%).</td></tr>
<tr><td><code>confidence3/NEW_FORMS_AUDIT.md</code></td><td>Agreement and scoring checked against what the engine does: false disagreements 3634 → 211, false agreements 205 → 3.</td></tr>
<tr><td><code>results/072_measure/COMPARE.md</code> (<code>gpu-runs</code>)</td><td>The readers of 2026-11-02 against those of 2026-11-03 with one fixed confidence recipe: SOP-BERT on fresh2 +21.6 [9.7, 33.2].</td></tr>
<tr><td><code>FRESH2_RESULT.md</code>, <code>FEEDBACK_RESULT.md</code>, <code>feedback/DATA_NEEDS.md</code></td><td>The new writer (fresh2): every reader worse on it; data written from VSS’s own needs made VSS worse.</td></tr>
<tr><td><code>RISK_COVERAGE.md</code>, <code>VSS_CONFIDENCE.md</code>, <code>PRECISION.md</code></td><td>The first confidence studies (2026-11-02): VSS margin AUROC 0.59, SOP-BERT 0.72, VSS from every step of its chain 0.81.</td></tr>
<tr><td><code>CUT_SHARED.md</code></td><td>One cut for all readers: the VSS cut is better on whole messages, the Rules segmenter on one-line commands.</td></tr>
<tr><td><code>PLAN_A.md</code>, <code>PLAN_B.md</code>, <code>EVENT_HINT.md</code>, <code>CREATE_COLOR.md</code>, <code>SHORT.md</code>, <code>SHORT2.md</code>, <code>BETWEEN.md</code>, <code>HOLDOUT_PURPLE.md</code></td><td>How the VSS worlds were grouped and fixed (<a href="#help/history/h-vss">How we got here</a>).</td></tr>
<tr><td><code>DIAGRAM_OPS.md</code>, <code>legend_ext/LEGEND_EXT.md</code></td><td>Groups, double positions and the forms of 2026-11-02 (templates, free text, help questions, layout operations, arrow labels).</td></tr>
</tbody></table></div>
<p class="note">Older documents in the same folder: <code>VSS_READER_SPEC.md</code> (what is given and learned), <code>ROUTER_V2.md</code>,
<code>CUTTER.md</code>, <code>LABEL_CONVENTIONS.md</code>, <code>ERROR_ANALYSIS.md</code>, <code>COMPOSER_ERRORS.md</code>, <code>ROUND2.md</code>,
<code>MICRO_ROUND1.md</code>, <code>MICRO_ROUND2.md</code>, <code>RESULTS.md</code>. Several name model folders removed since; each says from which
commit to restore them.</p>
`, 'Where everything is in the repository, and the result documents behind the numbers.');

/* ============================================================ planned */
page('planned', 'In progress', `
<p class="callout warn">Everything on this page is work in progress or a plan. None of it is used by the published demo today.</p>
<ul>
  <li><b>Better questions back.</b> VSS-BERT holds a whole request when it is unsure of one value; a question about that one value (“which
  colour: orange or red?”) would let you answer in one word. Its failures and the clarification dialogue are being studied.</li>
  <li><b>A fresh test set</b> (fresh3, planned): the test part of fresh2 + short3 had been read for earlier studies, so the numbers of 2026-11-03
  are exploratory; the clean confirmation of VSS-BERT and its confidence needs messages written after the models.</li>
  <li><b>Short commands</b>: every learned reader is still close to asking about everything on short3 alone (SOP-BERT 4.2 [−1.4, 8.5]).</li>
  <li><b>The VSS help world</b>: the topic of a help question is often lost to the aspect words, and <code>about</code> is not read
  (<code>TRAIN_PLAN_1103.md</code> §6); data or a front-end fix where the cause is.</li>
  <li><b>Data for descriptions in roles</b> (<code>SHORT2.md</code> §3): annotated messages where descriptions (“the red circle”, “every gray
  square”) fill the entity roles, which today they almost never do (0–3.5% per role).</li>
  <li><b>The shared context rule holds one shape</b>: “them” after a list of names cannot be filled by any reader that uses it.</li>
  <li><b><code>future-experiments.md</code></b>: catastrophic forgetting in the fine-tuned SOP-BERT, and LoRA adapters per family of actions;
  ModernBERT as its base; the VSS reader deciding the action from the construction, not only from a verb (needs the owner’s approval); the same
  readers on a legend where a wrong action is costly, as the real test of the main metric.</li>
</ul>
`, 'Work that is not in the demo yet.');

const DocsArch = { pages, AS_OF };
if (typeof module !== 'undefined') module.exports = DocsArch; else root.DocsArch = DocsArch;
})(typeof window !== 'undefined' ? window : this);
