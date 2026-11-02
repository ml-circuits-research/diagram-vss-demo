/* "Concepts": the ideas behind the three readers, for a visitor who wants to know why the system is built this way (Help overlay,
   docs/js/docs.js, #help/<id>). Every number names the committed result document it comes from (training/sketch/*.md unless said otherwise).
   Sentences in <button class="say" data-quick> are sent to the editor when clicked; they are written for the drawing the page opens with. */
(function (root) {
'use strict';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const say = t => `<span class="hsay"><button type="button" class="say" data-quick="${esc(t)}" title="Send this message">${esc(t)}</button></span>`;
const says = (...ts) => `<div class="says">${ts.map(say).join('')}</div>`;
const AH = '<defs><marker id="ahc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ahead" d="M0,0 L10,5 L0,10 z"/></marker></defs>';
const pages = [];
const page = (id, title, lead, html) => pages.push({ id, title, lead, html });

/* ============================================================ why three */
page('why-three', 'Three readers side by side',
'The same message, read three different ways, on the same cut, with the same scoring: a fair test of hand-written rules, small vector-symbolic models and a fine-tuned transformer.', `
<p>Each reader has its own copy of the engine and its own drawing. When you send a message, all three read it and you see three lines in the
reply and three drawings under the tabs. That makes their differences visible one message at a time, which totals in a table never do.</p>
<p>Try a message with more than one request and some text that is not a request, then open <b>details</b> under the reply:</p>
${says('Hi, I am sketching a workflow. Draw a red circle named Hub in the center and connect Start to it. Thanks!')}

<h2 id="fair">What makes the comparison fair</h2>
<ul>
  <li><b>One language.</b> Every reader writes SOP Lang wires and nothing else, and one engine carries them out. A difference in the drawing is a
  difference in reading, never in drawing code.</li>
  <li><b>One cut.</b> The message is cut into requests once, and all three read the same requests (<a href="#help/cutting">One cut for all readers</a>).
  Before this rule, a reader that cut badly lost requests no matter how well it read them, and the tabs mixed two questions into one.</li>
  <li><b>One legend, one cue list.</b> Rules and VSS use the same legend and the same cue words, and a word added for one is added for both,
  only from training data (AGENTS.md).</li>
  <li><b>One measure.</b> Per requested action: right, wrong (done with the wrong action, shape or value) and not done (not understood, or asked
  back), plus extra actions nobody asked for. Not per message: a message with 12 requests is almost never entirely right, and that says nothing.</li>
</ul>

<h2 id="table">The three, in one table</h2>
<div class="tw"><table>
<thead><tr><th></th><th>Rules</th><th>VSS</th><th>Neural</th></tr></thead>
<tbody>
<tr><th>Learns from</th><td>nothing: written by hand</td><td>our annotated requests only</td><td>English text in general (pretraining), then our annotated requests</td></tr>
<tr><th>Size</th><td>code</td><td>38.0 MB, seven worlds of 1.2–8.1 MB</td><td>68.5 MB, one DistilBERT in 8-bit form</td></tr>
<tr><th>Long messages (sample)</th><td>73.6 / 11.9 / 14.5 (VSS cut)</td><td>77.2 / 11.4 / 11.4 (VSS cut)</td><td>80.8 / 16.5 / 2.8 (its own cut)</td></tr>
<tr><th>Short commands (six sets)</th><td>97.5 / 0.5 / 1.9 (Rules cut)</td><td>61.1 / 11.1 / 27.7</td><td>—</td></tr>
<tr><th>When unsure</th><td>says it did not understand</td><td>says what it did not understand, or asks which shape</td><td>rarely stops (2.8% not done): it reads something</td></tr>
</tbody></table></div>
<p class="note">Right / wrong / not done, % of requested actions. Sources: CUT_SHARED.md (Rules, VSS), commit 1f3c806 (SOP-BERT),
<code>du -sb</code> and <code>versions.json</code> for sizes. The sample is 1000 realistic messages with 4858 requests; the
short sets are the demo’s 1140 one-line commands.</p>
<p>No reader wins everywhere. The rules are nearly perfect on the short commands they were written for and lose on long, natural messages;
VSS is careful on whole messages and weak on very short ones; SOP-BERT gets the most right on whole messages and also the most wrong, because
it almost never stops. That last difference is the subject of <a href="#help/knowing">Knowing what it does not know</a>.</p>
`);

/* ============================================================ rules vs learned */
page('rules-vs-learned', 'What rules do well, and where they fail',
'Hand-written rules are exact where their author looked and blind elsewhere. That is why the other two readers learn from data.', `
<h2 id="good">Where rules are excellent</h2>
<p>On the demo’s short one-line commands the Rules reader gets <b>97.5%</b> of the requests right, 0.5% wrong (CUT_SHARED.md). It is instant and
needs no download. These are the sentences its author had in mind:</p>
${says('Make Done red', 'Connect Start to Done with a dashed arrow', 'How many circles are there?')}
<p class="note">A fair caveat: three of the six short sets are generated from templates written by the same author as the rules, so they favour
the rules. On the 240 requests written by hand the figure is 92.1 / 1.7 / 6.2 (SHORT.md §1).</p>

<h2 id="bad">Where they fail</h2>
<p>Real messages are longer: a greeting, a reason, two or three requests, a correction (“no wait, make it blue”). On the fixed sample of 1000
such messages the same rules, with their own cut, get <b>67.9%</b> right and <b>16.8% wrong</b>, and do <b>821</b> actions nobody asked for
(CUT_SHARED.md). Two causes:</p>
<ul>
  <li><b>The cut.</b> The rules’ segmenter splits sentences and clauses; it cannot tell a request from the text around it. On the sample it made
  6051 units for 4858 requests, 1202 of them extra (CUT_SHARED.md). Each extra unit is a chance to do something nobody asked for.</li>
  <li><b>The words.</b> Cue words are a hand-written list. A verb or a phrasing the author did not think of is not understood, and a familiar
  word in an unfamiliar place is read as if it were a command. The list does not generalise; adding words one by one does not end.</li>
</ul>
<p>Given the VSS reader’s cut, the same rules make a third fewer wrong actions (11.9%) and half the extras (406): much of their trouble was the cut,
not the reading (CUT_SHARED.md).</p>

<h2 id="learned">What learning from data changes</h2>
<p>VSS and SOP-BERT are not given word lists: every mapping from words to the legend (which verb means which action, which phrase means which
value, where a request starts and ends) is learned from realistic messages annotated by hand (AGENTS.md: “No hand-written equivalences”). A
new way of saying something is fixed by adding annotated examples, not by writing a rule, and the old tests are re-run to show nothing was lost.</p>
<p>The price is honesty work: a learned reader is measured on every change, its misses are classified by cause before anything is changed
(<a href="#help/measurement">Measurement</a>), and its rules of thumb must come from data, never from a table that “helps”.</p>
`);

/* ============================================================ VSS worlds */
page('vss-worlds', 'What a VSS world is',
'A small reader for one family of actions that share the same roles, trained on our annotated requests. Seven of them read better than one large model.', `
<h2 id="idea">The idea</h2>
<p>A request names an action and fills its <b>roles</b>: “make the circle red” is the action <i>set</i> with a target (the circle) and a colour
(red). A <b>world</b> is a small model that knows a few actions whose roles are alike, for example the <i>links</i> world: connect and
disconnect, with a start, an end, a style and an arrow head.</p>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 300" role="img" aria-labelledby="cw1">
<title id="cw1">A world reads one request: words, front end, route book, a frame with the event and its roles, the SOP Lang wire</title>
${AH}
<rect class="box" x="70" y="8" width="260" height="36" rx="8"/>
<text class="t" x="200" y="24" text-anchor="middle">“connect Start to Done with a dashed arrow”</text>
<text class="s" x="200" y="38" text-anchor="middle">one request, as cut</text>
<path class="ar" d="M200 44 V60" style="marker-end:url(#ahc)"/>
<rect class="box" x="70" y="62" width="260" height="40" rx="8"/>
<text class="t" x="200" y="79" text-anchor="middle">Front end of the world (learned)</text>
<text class="m" x="200" y="94" text-anchor="middle">connect NAME to NAME with a dashed arrow</text>
<path class="ar" d="M200 102 V118" style="marker-end:url(#ahc)"/>
<rect class="mod" x="40" y="120" width="320" height="58" rx="8"/>
<text class="t" x="200" y="138" text-anchor="middle">Route book (VSA): each word gets a vector</text>
<text x="200" y="154" text-anchor="middle">and an address from its position and its neighbours;</text>
<text x="200" y="169" text-anchor="middle">learned from the annotated requests of this world</text>
<path class="ar" d="M200 178 V194" style="marker-end:url(#ahc)"/>
<rect class="acc" x="40" y="196" width="320" height="50" rx="8"/>
<text class="t" x="200" y="214" text-anchor="middle">Frame: event connect</text>
<text class="m" x="200" y="232" text-anchor="middle">source=Start target=Done style=dashed</text>
<path class="ar" d="M200 246 V262" style="marker-end:url(#ahc)"/>
<rect class="box" x="40" y="264" width="320" height="30" rx="8"/>
<text class="m" x="200" y="283" text-anchor="middle">@s1 command action=connect from=Start to=Done style=dashed</text>
</svg>
</div>
<figcaption>One world reading one request. The words are vectors (vector-symbolic: long lists of numbers that can be added and bound together);
the route book is what training learns. Details: <a href="#help/vss-reader/worlds">The VSS reader</a>.</figcaption>
</figure>
${says('Connect Start to Done with a dashed arrow')}
<p>A world reads only its own actions and says so when it cannot: a word it never saw has kind “unknown”, and with no action word it returns
<code>unknown-event</code> instead of guessing (VSS_READER_SPEC.md). It can still read a value it never saw if the value is in the legend:
a world trained without a single “purple” read 100 of 128 purple requests right (HOLDOUT_PURPLE.md).</p>

<h2 id="why-small">Why several small worlds and not one model</h2>
<p>One model for every action has to keep apart roles that look alike but mean different things: the colour of a new shape, the colour that
changes an old one, the colour asked about in a question. The measured path, all on the same 1000-message sample (right / wrong / not done):</p>
<div class="tw"><table>
<thead><tr><th>Step</th><th class="num">Right / wrong / not done</th><th>Document</th></tr></thead>
<tbody>
<tr><td>One general model, as the fallback of the composer: units of actions no world had</td><td class="num">read 0 of 4643 requests in the 7-world composer</td><td>SHORT2.md §7</td></tr>
<tr><td>16 one-action worlds, shared front end</td><td class="num">67.7 / 12.7 / 19.7</td><td>PLAN_B.md (= PLAN_A variant 2)</td></tr>
<tr><td>16 worlds, each with its own front end</td><td class="num">72.8 / 11.5 / 15.7</td><td>PLAN_A.md</td></tr>
<tr><td>7 worlds grouped by cutter confusion (G7)</td><td class="num">69.6 / 14.3 / 16.1</td><td>PLAN_B.md</td></tr>
<tr><td>G7 + event hint + colour fix + short-command cutter + adapter fix (today)</td><td class="num"><b>77.2 / 11.4 / 11.4</b></td><td>COMBINED.md, SHORT.md, SHORT2.md</td></tr>
</tbody></table></div>
<p>Why 7 and not 16: with 16 worlds the cutter has to pick among 16 labels, and most of its confusions were between worlds (only 20.0% of them fell
inside one world); grouping by those confusions put 64.5% of them inside one world (PLAN_B.md). Fewer worlds also mean fewer worlds reading the
same unit and fewer ties decided by order (308 in G7, 450 with 16 own-front worlds). The first G7 was not better than the 16 worlds in every
column; the fixes below, made on G7, brought it to 77.2. The rule we follow: <b>one world per family of actions that use the same roles,
merged or split by measurement, one step at a time.</b></p>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 196" role="img" aria-labelledby="cw2">
<title id="cw2">The seven worlds and their actions</title>
<rect class="mod" x="8" y="8" width="188" height="52" rx="7"/><text class="t" x="102" y="27" text-anchor="middle">shapes</text><text class="s" x="102" y="45" text-anchor="middle">create set resize fact rule</text>
<rect class="mod" x="204" y="8" width="188" height="52" rx="7"/><text class="t" x="298" y="27" text-anchor="middle">links</text><text class="s" x="298" y="45" text-anchor="middle">connect disconnect</text>
<rect class="mod" x="8" y="68" width="188" height="52" rx="7"/><text class="t" x="102" y="87" text-anchor="middle">position</text><text class="s" x="102" y="105" text-anchor="middle">move swap arrange align …</text>
<rect class="mod" x="204" y="68" width="188" height="52" rx="7"/><text class="t" x="298" y="87" text-anchor="middle">graphq</text><text class="s" x="298" y="105" text-anchor="middle">check connected path cycle …</text>
<rect class="mod" x="8" y="128" width="124" height="60" rx="7"/><text class="t" x="70" y="149" text-anchor="middle">questions</text><text class="s" x="70" y="167" text-anchor="middle">count list extreme …</text>
<rect class="mod" x="138" y="128" width="124" height="60" rx="7"/><text class="t" x="200" y="149" text-anchor="middle">manage</text><text class="s" x="200" y="167" text-anchor="middle">delete copy rename label</text>
<rect class="mod" x="268" y="128" width="124" height="60" rx="7"/><text class="t" x="330" y="149" text-anchor="middle">history</text><text class="s" x="330" y="167" text-anchor="middle">undo redo forget</text>
</svg>
</div>
<figcaption>The seven worlds of <code>training/sketch/worlds_micro/GROUPS_7.json</code>.</figcaption>
</figure>

<h2 id="wrong">What went wrong when grouping, and how it was fixed</h2>
<ul>
  <li><b>The colour of a new shape was in another place than the colour of a change.</b> Once create and set shared the shapes world, “draw a red
  circle” put red where “make it red” puts it differently, and create fell to 28.2% right (PLAN_B.md). Writing a new shape’s colour in the same
  event role as every other colour fixed it: wrong colours in create 507 → 16 (CREATE_COLOR.md).
  ${says('Draw a red circle named Hub in the center', 'Make Done red')}</li>
  <li><b>An action without a verb was lost.</b> Inside a world with several actions, “Hub teal” or “Alpha to Beta” has no verb, so the world
  cannot tell set from create. A second cutter, trained to name the action of each request, gives a hint used only then: right 69.6 → 73.2
  (EVENT_HINT.md).</li>
  <li><b>Thresholds fitted on 400 rows.</b> Whether a role is present is decided by a threshold fitted on a sample of 400 training rows; the second
  anchor of “between A and B” had only 9 rows in it, and was lost. Fitting on all rows (<code>N_CAL</code>) is in round 2 (BETWEEN.md, ROUND2.md).
  ${says('Draw a teal square named Box between Start and Done')}</li>
  <li><b>A fallback world that read nothing.</b> A general model kept “just in case” read 0 of 4643 requests on the sample and 0 of 877 on the short
  sets; removing it changed no number, so it was removed (SHORT2.md §7).</li>
</ul>

<h2 id="watch">What we watch</h2>
<p>Per requested action: right, wrong, not done, and extra. <b>Wrong is worse than not done</b>: a request done with the wrong shape or value is a
silent error, while “I didn’t understand” is honest and costs one more message. But questions back have a cost too, and in drawing a mistake
costs one undo, so the context filler fills a gap whenever one candidate ranks first and <b>asks only when nothing fits</b> (owner, 2026-11-01).</p>
${says('Make the green circle bigger')}
`);

/* ============================================================ BERT */
page('bert', 'What we do with BERT',
'A pretrained transformer already knows English; fine-tuning teaches it our legend. SOP-BERT is one such model with several small heads.', `
<h2 id="what">The model</h2>
<p>BERT-family models are trained on a large amount of English text to predict missing words. In doing so they learn what words mean and how
sentences are built. <b>DistilBERT</b> is a smaller version (6 layers instead of 12). We do not train it from zero: we take the pretrained
<code>distilbert-base-uncased</code> and <b>fine-tune</b> it on the same annotated requests the VSS worlds learn from.</p>
<p><b>SOP-BERT</b> is one DistilBERT with several small heads, each a single layer on top of the shared encoder: one cuts the message into requests,
one reads the action, one per legend key reads its value, one decides who fills each role (a written name, “it”, or a description such as “the red
circle”), and one tags the words that are names, labels and numbers. The wires are then assembled by the legend, without the Rules reader.
<a href="#help/neural-reader/sop-bert">The details and the diagram</a>.</p>

<h2 id="history">How we got here</h2>
<ol>
  <li><b>Zero-shot.</b> The first Neural reader used ready-made models with no training on our data: a natural-language-inference model asked
  whether “The user wants to create a new shape” follows from the message (<code>training/laptop/zs_check.mjs</code>, <code>zs_eval.mjs</code>).
  Such a model is trained to judge statements against statements, not to recognise commands, and it read the kind of request badly; its scores
  are not in a committed result document, only the scripts that produce them are.</li>
  <li><b>Fine-tuned act.</b> A DistilBERT fine-tuned on our requests to name the act: <b>98.7%</b> right on the 4858 requests of the sample it never
  saw, 98.3% on the blind set, 100% on the hand-written one (act-distilbert README). The details were still answered by a ready-made
  question-answering model, and those were mostly wrong: 30.2% of requests right in all (<a href="#help/neural-reader/pair-score">the run</a>).</li>
  <li><b>SOP-BERT.</b> The details read by heads trained on our annotation, references and descriptions included, and the cut too: on the sample
  <b>80.8%</b> right, 16.5% wrong, 2.8% not done, against VSS 77.2 / 11.4 / 11.4 (commit 1f3c806). The demo’s only neural model since 2026-11-02;
  the pair was removed.</li>
</ol>

<h2 id="tradeoff">What a fine-tuned transformer brings, and what it costs</h2>
<div class="tw"><table>
<thead><tr><th>Brings</th><th>Costs</th></tr></thead>
<tbody>
<tr><td>It knows English words that never occur in our data: a synonym it was not shown still has a meaning to it. A VSS world gives such a word the kind “unknown”.</td><td>Size: 68.5 MB for one DistilBERT in 8-bit form, against 1.2–8.1 MB for a VSS world.</td></tr>
<tr><td>One model reads every action; no grouping into worlds. Two calls per message: 22.6 ms per message in its scoring run (commit 1f3c806).</td><td>It almost never says “I don’t know”: what it cannot read, it guesses (<a href="#help/knowing">Knowing what it does not know</a>).</td></tr>
<tr><td>It learns the cut, the action and the details together.</td><td>One model: a fix for one action means retraining the whole model, and it can forget what it knew (see below).</td></tr>
<tr><td>It reads “it” and “the red circle” with its own heads, so it needs no hand-written reader beside it (the pair borrowed both from the Rules reader).</td><td>Less inspectable: a VSS reading shows which word filled which role and with what margin; a transformer’s heads give a score, not a reason.</td></tr>
</tbody></table></div>

<h2 id="future">Forgetting, and adapters</h2>
<p>Fine-tuning a whole model again on new examples can make it worse on what it read well before (catastrophic forgetting). Two experiments are
written down, not run: measuring that forgetting in our readers, and LoRA adapters (small extra weights per family of actions, the encoder
left unchanged), much like VSS worlds per family (<code>future-experiments.md</code>; also ModernBERT as a newer base model).</p>
`);

/* ============================================================ knowing */
page('knowing', 'Knowing what it does not know: VSS vs SOP-BERT',
'SOP-BERT gets more requests right; VSS knows when it does not understand. In a drawing tool, a wrong action is worse than an action not done. This is why both readers are in the demo, and why the VSS reader is a research question worth asking.', `
<h2 id="measured">The measured difference</h2>
<div class="tw"><table>
<thead><tr><th>Fixed 1000-message sample, 4858 requests</th><th class="num">Right</th><th class="num">Wrong</th><th class="num">Not done</th><th class="num">Extra</th></tr></thead>
<tbody>
<tr><th>VSS (7 worlds, VSS cut)</th><td class="num">77.2</td><td class="num"><b>11.4</b></td><td class="num">11.4</td><td class="num">334</td></tr>
<tr><th>SOP-BERT (its own cut)</th><td class="num"><b>80.8</b></td><td class="num">16.5</td><td class="num">2.8</td><td class="num">348</td></tr>
</tbody></table></div>
<p class="note">% of requested actions. Sources: CUT_SHARED.md (VSS), commit 1f3c806 (SOP-BERT).</p>
<p>SOP-BERT does 3.6 more requests in a hundred right, and 5.1 more wrong. It leaves almost nothing undone: when it is unsure, it still reads
<i>something</i>, and that something is executed. VSS leaves 11.4 in a hundred undone, and tells you which part it did not understand.</p>
<p>Which matters more depends on what a mistake costs. A request <b>not done</b> is visible at once (“I didn’t understand …”) and costs one more
message. A request <b>done wrong</b> is silent: the drawing changes in a way you did not ask for, and you have to notice it before you can undo
it. That is why every decision in this project weighs “done wrong” first (AGENTS.md).</p>

<h2 id="vss-knows">How VSS knows that it does not know</h2>
<ul>
  <li><b>Unknown words stay unknown.</b> A word never seen in training gets the kind “unknown”. It is not given a guessed meaning; if it was needed,
  the request is reported: the details say <i>Ignored (not understood): “…”</i>, and the reply says “I didn’t understand …”.</li>
  <li><b>Every reading has a status.</b> <code>ok</code>; <code>abstain</code> (a margin under 0.05: uncertain, still executed today);
  <code>unknown-event</code> (no action word found); <code>no-sense</code> (more than half of the words could not be placed). A reading with an
  unreadable status is not executed.</li>
  <li><b>Every role has a margin and a threshold.</b> Whether a role is present is decided by a threshold fitted on training rows; below it the
  role stays empty. An empty role the action needs goes to the context filler, which fills it only when one candidate ranks first, and otherwise
  <b>asks</b> (“Which circle? Start or Done”).</li>
  <li><b>You can follow it word by word.</b> Under <b>details</b>, each request shows the words as the world normalised them, which words it could not
  place, the margins, the status and the <b>residual</b>: how much of the request the reading does not explain.</li>
</ul>
<p>Try a message with an invented verb, then compare the VSS and Neural lines of the reply, and open <b>details</b>:</p>
${says('Make Done red, then frobnicate Check', 'Snorkle Process')}
<p>Run through the VSS composer in node on the opening drawing (2026-11-02): in the first message VSS makes Done red and reports “then frobnicate
Check” as not understood; the second it does not read at all and says so.</p>
<p class="callout warn"><b>VSS is not immune.</b> The same run read “Frobnicate the green circle” as a resize and “Florp Start next to Done” as a
move: when the rest of a request looks like a known action (a shape and a place), the event hint and the world’s roles supply an action the
verb did not give. Unknown words stay unknown, but a request around them can still be guessed. The experiment below compares how often each
reader is wrong when it is confident.</p>

<h2 id="bert-doesnt">Why a fine-tuned transformer does not know it</h2>
<ul>
  <li><b>No unknown words.</b> Its tokenizer splits any word into word pieces it knows (an invented “zorble” becomes a few such pieces), and
  every piece has a meaning. Nothing is ever “unknown”; an invented verb is read as the nearest thing it resembles.</li>
  <li><b>Over-confident probabilities.</b> After fine-tuning, the scores of its heads are close to 0 or 1 even when it is wrong: a fine-tuned
  classifier can read “draw a red circle” as a change of colour (set) with a probability of 0.999. A high score is not evidence of a right reading.</li>
  <li><b>Explanations are approximate.</b> Attention maps and gradient maps show which words weighed in a decision, roughly; they are not the
  reading itself, as a VSS frame is.</li>
</ul>

<h2 id="bert-can">What can be done for BERT</h2>
<ul>
  <li><b>Calibration and a threshold to ask</b>: temperature scaling fitted on held-out examples makes its probabilities honest on average;
  below a threshold, ask instead of executing.</li>
  <li><b>Distance to the training examples</b> in its internal space (out-of-distribution detection): a request far from everything it was trained
  on is flagged.</li>
  <li><b>Several variants voting</b> (an ensemble, or dropout kept on at reading time): disagreement means uncertainty, at several times the cost.</li>
</ul>
<p>All three are approximations added on top of a model that was not built to abstain. In VSS, “I don’t know” is part of how it reads.</p>

<h2 id="experiment">The experiment: better, or bolder?</h2>
<p>A reader that executes more requests will get more right <i>and</i> more wrong. To compare two readers fairly, let each one sort its own
requests by its own confidence, keep only its most confident share (the <b>coverage</b>), and count the wrong ones in that share (the <b>risk</b>).
A curve of risk against coverage separates a reader that is <b>better</b> (fewer wrong at the same coverage) from one that is only <b>bolder</b>
(it covers more, and pays for it in wrong actions).</p>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 250" role="img" aria-labelledby="rc1">
<title id="rc1">Illustration of a risk-coverage curve: the share of wrong actions grows as a reader executes more of its requests</title>
<path class="tree" d="M50 20 V210 H380"/>
<text class="s" x="215" y="242" text-anchor="middle">coverage: share of requests executed, most confident first →</text>
<text class="s" x="16" y="115" text-anchor="middle" transform="rotate(-90 16 115)">risk: wrong among them →</text>
<text class="s" x="50" y="224" text-anchor="middle">0%</text><text class="s" x="380" y="224" text-anchor="middle">100%</text>
<path d="M50 206 C150 200 250 185 300 160 S350 110 372 80" fill="none" style="stroke:var(--accent);stroke-width:2.2"/>
<path d="M50 200 C130 185 220 150 290 120 S350 70 380 50" fill="none" style="stroke:var(--rf);stroke-width:2.2;stroke-dasharray:6 4"/>
<circle cx="372" cy="80" r="4" style="fill:var(--accent)"/>
<text x="292" y="184" style="fill:var(--accent)">careful reader</text>
<text x="280" y="96" text-anchor="end" style="fill:var(--rf)">bold reader</text>
<rect x="56" y="22" width="150" height="20" rx="4" style="fill:var(--warn-soft);stroke:var(--frame)"/>
<text class="s" x="131" y="36" text-anchor="middle">illustration, not data</text>
</svg>
</div>
<figcaption>The idea only: the shapes of these curves are drawn by hand. A reader that abstains ends its curve before 100% coverage (the dot).</figcaption>
</figure>
<div class="callout warn" id="rc-result">
<!-- COORDINATOR: fill in from training/sketch/RISK_COVERAGE.md when it has a result (numbers, the two curves, which confidence each reader uses). -->
<p><b>Result: not yet available.</b> The experiment is running (<code>training/sketch/RISK_COVERAGE.md</code>). Its numbers will be written here
when the result is committed: for each reader, the share of wrong actions at equal coverage.</p>
</div>

<h2 id="both">Why both readers stay in the demo</h2>
<p><b>SOP-BERT</b> for how much it gets right: it knows English beyond our data and reads the most requests right. <b>VSS</b> for being
explainable and for saying when it does not know: every reading can be followed word by word, and what it cannot read it reports instead of
guessing. Side by side, on the same cut, each reply shows what each approach does with the same words.</p>
`);

/* ============================================================ limits today */
page('limits-today', 'Where it is weak today',
'The known weak spots of the readers, with the numbers. The editor’s own limits (what it cannot draw) are in What it cannot do.', `
<ul class="limits">
  <li><b>VSS on very short commands.</b> 61.1% right on the six short sets, against 77.2% on whole messages (SHORT2.md §6). The VSS cutter makes no
  unit for 96 of 1118 one-line commands (CUT_SHARED.md): a message like “Undo” or “Hub teal” can be missed whole. Round 2 reaches 62.5% (commit
  63274ae), not the default yet.
  ${says('Undo', 'Make Process bigger')}</li>
  <li><b>SOP-BERT guesses.</b> 16.5% of the sample’s requests done wrong against 11.4% for VSS, and only 2.8% left undone (commit 1f3c806).
  Descriptions in roles are its weakest part: 4 of 34 held-out (its README). See <a href="#help/knowing">Knowing what it does not know</a>.</li>
  <li><b>“Them” after a list.</b> After every request, all readers carry one shape forward as “it” (the shared context rule). “Draw A, B and C,
  then make them red” needs three; no reader that uses the rule can get it right. Listed as a task (<a href="#help/planned">In progress</a>).
  ${says('Add three small squares in a row below Process')}</li>
  <li><b>Descriptions in roles.</b> “Put a star next to the orange hexagon”: in the training annotation, descriptions fill the entity roles in only
  0–3.5% of the requests, so the VSS worlds rarely learned to read them there (SHORT2.md §3). More annotated data is the fix, not a rule.</li>
  <li><b>The rules on long messages.</b> 16.8% of requests done wrong with their own cut, 821 extra actions (CUT_SHARED.md); 11.9% and 406 with the
  VSS cut.</li>
  <li><b>Measured on data the worlds were trained on.</b> There is no hidden test set (owner, 2026-11-01): the sample is training data for the worlds,
  and the goal is that they read such data well. The neural models are the exception: they never saw the sample.</li>
</ul>
`);

const DocsConcepts = { pages };
if (typeof module !== 'undefined') module.exports = DocsConcepts; else root.DocsConcepts = DocsConcepts;
})(typeof window !== 'undefined' ? window : this);
