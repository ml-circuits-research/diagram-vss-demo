/* "Why VSS-BERT": the story behind the reader that answers in the demo, for a visitor who wants to know why the system is built this way
   (Help overlay, docs/js/docs.js, #help/<id>). The pages follow one line (owner, 2026-11-03 09:30): the goal is a reader that does what it
   is sure of and asks about the rest; SOP-BERT fine-tuned on our data reads well but alone is confidently wrong too often; more and better
   data and a fixed data pipeline raised its reliability; pairing it with VSS (VSS-BERT) gives fewer confident mistakes at the same amount
   done; so it asks where it is not sure; the Rules are there as a comparison; the VSS and SOP-BERT tabs show the two parts alone.
   Numbers are evidence of direction (before -> after, with 95% intervals), not a scoreboard. Every number names the result document it comes
   from (training/sketch/*.md unless said otherwise; results/072_measure/... is on branch gpu-runs).
   Sentences in <button class="say" data-quick> are sent to the editor when clicked; they are written for the drawing the page opens with.
   Old page ids (why-three, knowing, chain-vs-one, fresh-writer, three-readers) are redirected by docs.js (ALIASES). */
(function (root) {
'use strict';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const say = t => `<span class="hsay"><button type="button" class="say" data-quick="${esc(t)}" title="Send this message">${esc(t)}</button></span>`;
const says = (...ts) => `<div class="says">${ts.map(say).join('')}</div>`;
const AH = '<defs><marker id="ahc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="ahead" d="M0,0 L10,5 L0,10 z"/></marker></defs>';
const pages = [];
const page = (id, title, lead, html) => pages.push({ id, title, lead, html });
/* the measurement every page refers to */
const TEST = 'the test part of fresh2 + short3: 745 messages, 1745 requested actions, none of them trained on';

/* ============================================================ 1. the goal */
page('research-question', 'The goal: do what it is sure of, ask about the rest',
'A reader that does only the requests it is sure of, and asks about the rest, saying why. One confident mistake costs as much as 10 right answers.', `
<h2 id="rq-question">The goal</h2>
<p>The editor turns English into commands for a drawing. Many programs can produce a plausible reading of almost any message; a large
language model does that well. The question this project studies is a different one: <b>can a reader tell, request by request, whether it
is sure, do only what it is sure of, and ask about the rest, saying why?</b></p>
<div class="callout" id="rq-owner">
<p>“Better more fearful and with questions than making stupid decisions with confidence that have consequences.”</p>
<p class="note">The owner, 2026-11-02, translated from Romanian (AGENTS.md, “What counts as an error”).</p>
</div>
<p>In a drawing a confident mistake costs one undo, once you have noticed it. Where a wrong action has serious consequences (a dose, a safety
setting, a payment) it is the failure that matters most. The drawing is the test bench: a reader that is good in this sense shows it already
here, by what it chooses to do and by how often that is right.</p>

<h2 id="rq-metric">How it is counted</h2>
<div class="tw"><table>
<thead><tr><th>Number</th><th>What it counts</th></tr></thead>
<tbody>
<tr><td><b>Confidently wrong</b></td><td>Of everything the reader does (requested actions and extras nobody asked for), the share done wrong. The first number of every reader.</td></tr>
<tr><td>Done right</td><td>Of the actions that were requested, the share done and right.</td></tr>
<tr><td>Asked</td><td>Requests the reader held back and asked about. Never an error: the price paid for being careful.</td></tr>
<tr><td><b>Cost score</b></td><td>Requests done right − 10 × (done wrong + extras done), per 100 requested actions. Asking scores 0, so asking about everything scores exactly 0.</td></tr>
</tbody></table></div>
<p>The 10 is the owner’s estimate (2026-11-02): “one confident mistake costs as much as 10 right answers, in reality something like that, if
not worse”. It has a plain consequence: a request is worth doing only when it is right at least about 91% of the time
(<code>COST_SCORE.md</code>).</p>
<p>Every learned reader gives each request a <b>confidence</b> and does it only when the confidence clears a <b>threshold</b>. The threshold
is the one with the best cost score on calibration messages (out of fold), chosen once, never on the messages the result is reported on.</p>

<h2 id="rq-path">The path, page by page</h2>
<ol class="pagelist">
  <li><a href="#help/bert">SOP-BERT reads well, but alone it is too bold</a>: a fine-tuned transformer gets much right and says little about when it is wrong.</li>
  <li><a href="#help/reliability">More and better data, a fixed data pipeline</a>: what raised its reliability.</li>
  <li><a href="#help/two-readers">VSS-BERT: SOP-BERT paired with VSS</a>: a second, different reader on the same requests, and a confidence fitted on their agreement.</li>
  <li><a href="#help/asking">When it is not sure, it asks</a>: what you see, and what you can do.</li>
  <li><a href="#help/rules-vs-learned">The Rules, as a comparison</a>: they read their own phrasings very well, but cannot know when they are wrong.</li>
  <li><a href="#help/parts-alone">The VSS and SOP-BERT tabs</a>: the two parts of VSS-BERT, shown alone.</li>
</ol>

<div class="callout" id="precision-result">
<p><b>Where it stands (2026-11-03).</b> On ${TEST}, each reader at its own threshold:</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">VSS-BERT</th><th class="num">SOP-BERT, its own confidence</th><th class="num">Rules</th></tr></thead>
<tbody>
<tr><td>Confidently wrong, of what it did</td><td class="num"><b>1.8%</b></td><td class="num">3.0%</td><td class="num">37.5%</td></tr>
<tr><td>Done right, of the requested actions</td><td class="num">42.8%</td><td class="num">42.5%</td><td class="num">57.8%</td></tr>
<tr><td>Asked, of the requested actions</td><td class="num">52.6%</td><td class="num">51.2%</td><td class="num">0%</td></tr>
</tbody></table></div>
<p>In plain words: about the same amount done as SOP-BERT alone, with fewer confident mistakes; the Rules do more, and more than a third of what
they do is wrong. VSS-BERT’s confidently-wrong share was 3.8% with the readers of the day before. Where these numbers come from, and how sure
they are: the pages above.</p>
<p class="note">Source: <code>results/072_measure/refit/records/confidence3_report.md</code>. The test part had been read for earlier studies, so
its numbers are exploratory; a set written after these models (fresh3) is planned.</p>
</div>
`);

/* ============================================================ 2. SOP-BERT alone */
page('bert', 'SOP-BERT reads well, but alone it is too bold',
'A pretrained transformer already knows English; fine-tuned on our annotated requests it reads them well. Alone, its confidence lets through too many wrong readings.', `
<h2 id="what">The model</h2>
<p>BERT-family models are trained on a large amount of English text to predict missing words; in doing so they learn what words mean and how
sentences are built. <b>DistilBERT</b> is a smaller version (6 layers). We take the pretrained <code>distilbert-base-uncased</code> and
<b>fine-tune</b> it on our annotated requests.</p>
<p><b>SOP-BERT</b> is one DistilBERT with small heads: one cuts the message into requests, one reads the action, one per legend key reads its
value, one decides who fills each role (a written name, “it”, or a description such as “the red circle”), and one tags the names, labels and
numbers. The wires are then assembled by the legend. <a href="#help/neural-reader/sop-bert">The details and the diagram</a>.</p>

<h2 id="reads-well">It reads well</h2>
<p>It knows English words that never occur in our data, reads every action with one model, and reads “it” and “the red circle” itself. Doing
everything, on 600 messages by a writer whose style it never saw (fresh2), the SOP-BERT of 2026-11-02 did 70.8% of the requested actions right,
more than VSS (58.6%) or the Rules (55.5%) (<code>FRESH2_RESULT.md</code>).</p>

<h2 id="too-bold">Alone, it is too bold</h2>
<p>The same run did 24.2% of the requested actions <b>wrong</b>. A transformer’s tokenizer gives every word a meaning, so nothing is ever
“unknown”: what it cannot read, it reads as the nearest thing it resembles, and a fluent wrong reading looks like a right one.</p>
<p>Its probabilities do rank its readings (right more often when it is surer), so a confidence fitted on them with a threshold helps. But not
enough: with that confidence, at its best threshold, it was still confidently wrong on 7.1% of what it did on the same messages
(<code>results/072_measure/COMPARE.md</code>). With a confident mistake worth 10 right answers, that cancels most of what it gets right: cost
score 14.4 [2.0, 26.7], against 0 for asking about everything.</p>
<p class="callout">The reader is good; its sense of when it is wrong is not good enough on its own. The next two pages are the two things that
changed that: <a href="#help/reliability">better data and a fixed pipeline</a>, and <a href="#help/two-readers">a second reader to agree with</a>.</p>

<h2 id="tradeoff">What a fine-tuned transformer brings, and what it costs</h2>
<div class="tw"><table>
<thead><tr><th>Brings</th><th>Costs</th></tr></thead>
<tbody>
<tr><td>English it already knows: a synonym it was not shown still has a meaning to it.</td><td>Size: 68.7 MB in 8-bit form, against 0.8–5.8 MB for a VSS world.</td></tr>
<tr><td>One model cuts, reads the action and the details together.</td><td>A fix for one action means retraining the whole model, which can forget what it knew (<code>future-experiments.md</code>).</td></tr>
<tr><td>Its scores rank its readings.</td><td>A score, not a reason: it can say that it is unsure, not which step or which word.</td></tr>
</tbody></table></div>
`);

/* ============================================================ 3. reliability */
page('reliability', 'More and better data, a fixed data pipeline',
'What raised SOP-BERT’s reliability: training on all the data, short commands written from the Rules’ grammar, and finding the places where the pipeline silently taught it wrong answers.', `
<h2 id="r-data">More and better data</h2>
<p>On 2026-11-03 SOP-BERT and the VSS worlds were retrained on all the annotated data (arm ALL, <code>TRAIN_PLAN_1103.md</code>): 24,698
messages and 54,584 annotated requests for SOP-BERT. Two kinds of data were new:</p>
<ul>
  <li><b>Short commands from the Rules’ grammar</b> (owner, 2026-11-02 22:04): people with a problem fall back to short, literal commands, so
  every action, question, value and construction the Rules read is in the training data (<code>llm_train/synth_rules</code>,
  <code>synth_rules_ops</code>, <code>synth_rules_ext</code>: 8404 + 1374 + 2783 messages).</li>
  <li><b>Realistic messages with the new forms</b>: templates, free text, help questions, the layout operations, arrow labels
  (<code>opus_ext_1</code>, <code>ops_formulations</code>).</li>
</ul>

<h2 id="r-roundtrip">Fixing the pipeline: the round trips</h2>
<p>A model can only be as reliable as its training labels. A <b>round trip</b> takes the gold of every training request, turns it into the
labels the model is trained on, and decodes those labels back with the demo’s own code, as if the model had predicted them perfectly. Whatever
does not come back is a place where the model is taught something other than the gold.</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">Before the fix</th><th class="num">After</th></tr></thead>
<tbody>
<tr><td>SOP-BERT: training rows that silently teach a wrong label</td><td class="num">2.8%</td><td class="num"><b>0.1%</b></td></tr>
<tr><td>SOP-BERT: requests whose labels decode back to their gold</td><td class="num">92.7%</td><td class="num">95.3%</td></tr>
<tr><td>VSS: generated commands whose world row can reproduce their gold (<code>synth_rules</code>)</td><td class="num">65.9%</td><td class="num">79.3%</td></tr>
<tr><td>VSS: requests turned into “every shape” on the way into the worlds</td><td class="num">up to 4.5%</td><td class="num">0.0%</td></tr>
</tbody></table></div>
<ul>
  <li><b>SOP-BERT</b> (<code>training/neural/ROLES_ROUNDTRIP.md</code>): a gold value “none” (a plain line, no outline) was trained as the
  “no value” class in 1147 rows, so the model could never write a plain line; coordinates, second positions and second descriptions had no
  label; list items and numbers were tagged on the wrong words. Silent wrong labels are the worst kind: the model is trained to be
  confidently wrong there.</li>
  <li><b>VSS</b> (<code>synth/VSS_SYNTH_DIAGNOSIS.md</code>, <code>synth/CONVERT_FIX.md</code>): 31% of the generated commands never reached the
  worlds in a learnable form: “all the circles” became the quantifier <i>all</i>, and keys such as outline or coordinates had no role. That is
  why more data had given VSS no gain the night before.</li>
  <li><b>The scoring and the agreement</b> (<code>confidence3/NEW_FORMS_AUDIT.md</code>): for the new forms, two readings that make the editor
  do the same thing were counted as different (false disagreements 3634 → 211) and some that do different things as the same (205 → 3). A
  confidence fitted on agreement needs agreement measured the way the engine acts.</li>
</ul>
<p>Each training job now stops before it starts when its round trip is below its gate (job 071: at least 95% right and at most 1% silent wrong
labels).</p>

<h2 id="r-result">What it changed</h2>
<p>The same measure before and after, on the new writer’s test messages (fresh2, 405 messages, 1313 requested actions), each model with the
same confidence recipe at its best threshold (<code>results/072_measure/COMPARE.md</code>, 95% interval of 1000 paired resamples):</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">SOP-BERT of 2026-11-02</th><th class="num">SOP-BERT of 2026-11-03</th></tr></thead>
<tbody>
<tr><td>Confidently wrong, of what it did</td><td class="num">7.1%</td><td class="num"><b>3.6%</b></td></tr>
<tr><td>Done right, of the requested actions</td><td class="num">60.1%</td><td class="num">57.3%</td></tr>
<tr><td>Cost score [95% interval]</td><td class="num">14.4 [2.0, 26.7]</td><td class="num">35.9 [27.6, 44.4]</td></tr>
</tbody></table></div>
<p>The difference, +21.6 [9.7, 33.2], is a gain the interval shows: half the confident mistakes at almost the same amount done. On the short
commands of short3 alone the change, +3.9 [−4.8, 13.8], is not shown either way.</p>
<p class="note">With each tab’s own confidence recipe and short3 added to the test, the SOP-BERT tab went from 31.5 to 33.4 (not shown either way) and from 3.2% to 2.5%
confidently wrong (commit 220295a; <code>results/072_measure/refit/records/confidence3_report.md</code>).</p>
`);

/* ============================================================ 4. VSS-BERT */
page('two-readers', 'VSS-BERT: SOP-BERT paired with VSS',
'VSS-BERT is not a new model: SOP-BERT cuts the message, SOP-BERT and VSS both read the same requests, and a confidence fitted on their agreement decides what is done. At the same amount done it makes fewer confident mistakes than SOP-BERT alone.', `
<h2 id="tr-why">Why a second reader</h2>
<p>A single reader’s confidence can only look at its own numbers. A second reader that learned differently can be wrong in different places,
so when two such readers read a request the same way, that is evidence the reading is right; when they do not, it is a reason to ask.
<b>VSS</b> is that second reader: a chain of small vector-symbolic models (<a href="#help/vss-worlds">What a VSS world is</a>), trained on
the same annotated requests but built in a completely different way from a transformer.</p>

<h2 id="tr-what">How it works</h2>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 330" role="img" aria-labelledby="vb1">
<title id="vb1">VSS-BERT: SOP-BERT cuts the message; SOP-BERT and VSS read the same requests; the readings are paired; a confidence fitted on their agreement decides between doing and asking</title>
${AH}
<rect class="box" x="70" y="8" width="260" height="36" rx="8"/>
<text class="t" x="200" y="24" text-anchor="middle">The message</text>
<text class="s" x="200" y="38" text-anchor="middle">“make Check orange and connect it to Done”</text>
<path class="ar" d="M200 44 V60" style="marker-end:url(#ahc)"/>
<rect class="mod" x="70" y="62" width="260" height="36" rx="8"/>
<text class="t" x="200" y="78" text-anchor="middle">1. The SOP-BERT cutter</text>
<text class="s" x="200" y="92" text-anchor="middle">cuts it into requests, once</text>
<path class="ar" d="M200 98 V108 H105 V122" style="marker-end:url(#ahc)"/>
<path class="ar" d="M200 98 V108 H295 V122" style="marker-end:url(#ahc)"/>
<rect class="mod" x="20" y="124" width="170" height="44" rx="8"/>
<text class="t" x="105" y="142" text-anchor="middle">2. SOP-BERT reads</text>
<text class="s" x="105" y="158" text-anchor="middle">each request</text>
<rect class="mod" x="210" y="124" width="170" height="44" rx="8"/>
<text class="t" x="295" y="142" text-anchor="middle">2. VSS reads</text>
<text class="s" x="295" y="158" text-anchor="middle">the same requests</text>
<path class="ar" d="M105 168 V182 H200 V194" style="marker-end:url(#ahc)"/>
<path class="ar" d="M295 168 V182 H200" style="marker-end:url(#ahc)"/>
<rect class="box" x="40" y="196" width="320" height="44" rx="8"/>
<text class="t" x="200" y="214" text-anchor="middle">3. Pair the readings, compare the values</text>
<text class="s" x="200" y="230" text-anchor="middle">same action and every value the same = they agree</text>
<path class="ar" d="M200 240 V254" style="marker-end:url(#ahc)"/>
<rect class="acc" x="40" y="256" width="320" height="64" rx="8"/>
<text class="t" x="200" y="274" text-anchor="middle">4. A confidence fitted on the agreement</text>
<text x="200" y="291" text-anchor="middle">above the threshold: do it</text>
<text x="200" y="308" text-anchor="middle">below: hold it, say why, offer Do it anyway</text>
</svg>
</div>
<figcaption>VSS-BERT for one message (<code>docs/js/combined-confidence.js</code>, model <code>docs/model/confidence/combined.json</code>).</figcaption>
</figure>
<ol>
  <li><b>The SOP-BERT cutter</b> cuts the message into requests. With this cut the pair scored best on the calibration messages
  (<code>combine/COMBINED_READER.md</code>).</li>
  <li><b>Both read the same requests.</b> No request is cut differently for one reader than for the other.</li>
  <li><b>Pairing.</b> Each SOP-BERT request is paired with the VSS request of the same action. They <i>agree</i> when every value is the same
  as the editor would carry it out (an arrange list in any order is the same arrange). When both have the request, SOP-BERT’s reading is the
  one executed; when only one has it, that one.</li>
  <li><b>The confidence</b> of each request is a logistic regression over the executing reader’s own numbers, whether the two agree (fully, or
  on a share of the values) and VSS’s own confidence. Its weights and threshold were fitted on calibration messages, not set by hand.</li>
</ol>
${says('Add a small red square named Gate below Start and connect it to Process', 'Make Check orange')}

<h2 id="tr-agree">What agreement is worth</h2>
<p>Share of the requests whose reading is right, by who reads it the same way (SOP-BERT’s reading unless said; in brackets, how many
requests), on the calibration messages and on ${TEST}:</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">Calibration</th><th class="num">Test part</th></tr></thead>
<tbody>
<tr><td>VSS and SOP-BERT read it the same, and so do the Rules</td><td class="num"><b>96.7%</b> (396)</td><td class="num"><b>95.9%</b> (857)</td></tr>
<tr><td>VSS and SOP-BERT read it the same, the Rules differ</td><td class="num">88.3% (103)</td><td class="num">85.3% (217)</td></tr>
<tr><td>VSS reads it differently, the Rules as SOP-BERT</td><td class="num">70.8% (106)</td><td class="num">70.9% (203)</td></tr>
<tr><td>All three read it differently</td><td class="num">37.2% (121)</td><td class="num">40.9% (301)</td></tr>
<tr><td>Only SOP-BERT found the request</td><td class="num">33.3% (87)</td><td class="num">37.4% (187)</td></tr>
<tr><td>Only VSS found the request (VSS’s reading)</td><td class="num">4.7% (86)</td><td class="num">2.9% (172)</td></tr>
</tbody></table></div>
<p>When VSS and SOP-BERT agree the reading is right about 94–95% of the time, above the 91% a cost of 10 asks for; when they disagree,
or only one found the request, it is right far less often, and VSS-BERT asks. The Rules appear in the rows only for comparison; VSS-BERT does not
use the Rules (<a href="#help/rules-vs-learned/rv-vote">why</a>).</p>

<h2 id="tr-numbers">Fewer confident mistakes at the same amount done</h2>
<p>On ${TEST}, each at the threshold chosen on the calibration messages:</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">VSS-BERT</th><th class="num">SOP-BERT, its own confidence</th></tr></thead>
<tbody>
<tr><td>Done right, of the requested actions</td><td class="num">42.8%</td><td class="num">42.5%</td></tr>
<tr><td>Confidently wrong, of what it did</td><td class="num"><b>1.8%</b></td><td class="num">3.0%</td></tr>
<tr><td>Cost score [95% interval]</td><td class="num">34.8 [29.8, 39.5]</td><td class="num">29.3 [23.8, 35.2]</td></tr>
</tbody></table></div>
<p>And before → after, with the readers of 2026-11-02 and those of 2026-11-03 (commit 220295a): VSS-BERT’s cost score 29.7 → 34.8,
confidently wrong 3.8% → 1.8% (the difference in score is within the intervals: not shown either way). The recipe now used (without the act prior) against the plain recipe on the same readers: +2.2 [−1.3, 6.0], not
shown either way; it was chosen on the calibration messages by the rule written before.</p>
<p class="note">With the readers of 2026-11-02, allowed at most 2% confidently wrong, VSS-BERT did 40.6% of the requests right on the test part
and SOP-BERT alone 31.1% (<code>combine/COMBINED_READER.md</code>).</p>

<h2 id="tr-limits">Limits</h2>
<ul>
  <li><b>Mistakes both readers share stay invisible.</b> They learned from the same annotated data; about 5 to 6 in 100 of the requests they agree on
  are still wrong.</li>
  <li><b>It asks about half of the requests.</b> That is the price of the 1.8%. What it asks, and how you answer: <a href="#help/asking">When it is
  not sure, it asks</a>.</li>
  <li><b>Not confirmed on new text yet.</b> The test part had been read for earlier studies. The clean check is a set of messages written after
  these models (fresh3), read once with everything fixed.</li>
</ul>
<p class="note">Sources: <code>combine/COMBINED_READER.md</code>, <code>combine/COMBINE.md</code>,
<code>results/072_measure/refit/records/confidence3_report.md</code>.</p>
`);

/* ============================================================ 5. asking */
page('asking', 'When it is not sure, it asks',
'The consequence of doing only what it is sure of: VSS-BERT holds back the requests it is not sure of, says why, and lets you rephrase or do it anyway.', `
<h2 id="a-what">What you see</h2>
<p>A message can hold several requests. VSS-BERT does the ones it is sure of, and the reply lists the others: “Not sure about 1 of the 2
requests, so it was not done”, with the words of each request and the reason, for example:</p>
<ul>
  <li><b>the two readers disagree</b> on a value: “the two readers disagree on where the link ends”, “… on the colour”;</li>
  <li><b>only one reader found this request</b>: the other read no request there;</li>
  <li>what the executing reader itself was unsure of: a value, which shape “it” is, where the request starts or ends.</li>
</ul>
<div class="hreply"><div class="rl"><b>VSS-BERT · 152 ms:</b> Drew Gem. Not sure about 1 of the 2 requests, so it was not done: “connect it to Check”: the two readers disagree on where the link ends. <span class="lnk">Do it anyway</span></div></div>
<p>Try a message with a plain request and a vague one:</p>
${says('Make Check orange', 'Draw a red circle named Hub in the center, then make it bigger')}

<h2 id="a-do">What you can do</h2>
<ul>
  <li><b>Say it more plainly.</b> Name the shapes, say the value: “connect Gem to Check” instead of “connect it there”. A request both readers read
  the same way is done.</li>
  <li><b>Do it anyway.</b> The button under a held request does that one reading now, as one step you can undo.</li>
  <li><b>Choose how bold it is.</b> VSS-BERT › Settings offers levels besides the default safety threshold (one confident mistake = 10 right
  answers): bolder ones do more and are wrong more often, more careful ones the reverse, and “execute all” does everything. Every level is a
  threshold chosen the same way on the calibration messages.</li>
</ul>

<h2 id="a-why">Why asking is not counted as an error</h2>
<p>A held request is visible at once and costs one more message. A wrong request is silent: the drawing changes in a way you did not ask for,
and you have to notice it before you can undo it. So “not done / asked” scores 0, and a confident mistake −10
(<a href="#help/research-question/rq-metric">How it is counted</a>).</p>
<p class="note">How the questions themselves can get better (asking about the one value in doubt instead of holding the whole request) is being
studied from VSS-BERT’s failures (<a href="#help/planned">In progress</a>).</p>
`);

/* ============================================================ 6. the Rules */
page('rules-vs-learned', 'The Rules, as a comparison',
'Hand-written rules read the phrasings their author had in mind very well. They have no confidence: they cannot know when they are wrong, and on realistic text they do many wrong things.', `
<h2 id="good">What they are</h2>
<p>The Rules reader (<code>docs/js/logic.js</code>) is hand-written code: regular expressions over the legend’s cue words (“draw”, “red”, “below”)
and their order. It is instant, needs no download, and is exact on the sentences its author had in mind. It is in the demo as a comparison:
what a careful hand-written reader does with the same messages.</p>
${says('Make Done red', 'Connect Start to Done with a dashed arrow', 'How many circles are there?')}

<h2 id="bad">It cannot know when it is wrong</h2>
<p>The Rules have no confidence. They do whatever their cue words match, and stop only where nothing matches. A familiar word in an unfamiliar
place is read as a command; a request split by a greeting or a correction (“no wait, make it blue”) is read piece by piece. Nothing tells
them that a reading is doubtful, so they cannot ask.</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">Rules</th><th class="num">VSS-BERT</th></tr></thead>
<tbody>
<tr><td>Short commands generated from the Rules’ own templates: right / wrong / not done</td><td class="num">98.9% / 0.4% / 0.8%</td><td class="num">—</td></tr>
<tr><td>${TEST}: wrong, of what it did</td><td class="num"><b>37.5%</b></td><td class="num">1.8%</td></tr>
<tr><td>Same messages: done right, of the requested actions</td><td class="num">57.8%</td><td class="num">42.8%</td></tr>
<tr><td>Fixed 1000-message sample: done wrong, and actions nobody asked for</td><td class="num">15.5% + 769 extra</td><td class="num">—</td></tr>
</tbody></table></div>
<p>In plain words: on their own phrasings they are nearly perfect; on realistic messages more than one thing in three that they do is wrong,
and you are not told which. Their cost score on the test part is −288.4: every request they get right is cancelled many times over.</p>
<p class="note">Sources: <code>training/sketch/regress.sh</code> (2026-11-03; the template sets favour the Rules, they are written from their
templates), <code>results/072_measure/refit/records/confidence3_report.md</code>.</p>

<h2 id="rv-vote">The Rules as a third vote: tried and removed</h2>
<p>When all three readers (Rules, VSS, SOP-BERT) read a request the same way, the reading is right 95.9% of the time on the test part. So a
“3 readers” tab was tried (2026-11-03): it acted when all three agreed, or on a confidence fitted on the three votes. It gave no measurable
gain over VSS-BERT: the fitted vote scored 31.8 (2.6% confidently wrong) against VSS-BERT’s 32.6 with the same readers, a difference of −0.8
[−5.1, 3.4]; acting only when all three agree scored 26.8 (4.2% confidently wrong). “Two of three agree” is not safe: right 34–88% of the
time on the calibration messages, depending on which two. The tab was removed; the Rules stay as a comparison.</p>
<p class="note">Source: <code>confidence3/RESULT.md</code>, <code>results/072_measure/refit/records/confidence3_report.md</code>.</p>

<h2 id="learned">What learning from data changes</h2>
<p>VSS and SOP-BERT are given no word lists: every mapping from words to the legend (which verb means which action, which phrase means which
value, where a request starts and ends) is learned from realistic messages annotated by hand (AGENTS.md, “No hand-written equivalences”). A new
way of saying something is fixed by adding annotated examples, not by writing a rule; and a learned reader comes with a confidence that can be
fitted and checked.</p>
`);

/* ============================================================ 7. the two parts alone */
page('parts-alone', 'The VSS and SOP-BERT tabs',
'The two parts of VSS-BERT, each shown alone with its own confidence, so you can see what each one does with a message.', `
<p>In Settings you can let these tabs reply in the chat beside VSS-BERT. Each has its own drawing and does a request only when its own confidence
clears its own threshold; below it, it asks, as VSS-BERT does.</p>
<div class="tw"><table>
<thead><tr><th></th><th>VSS</th><th>SOP-BERT</th></tr></thead>
<tbody>
<tr><th>What it is</th><td>9 small vector-symbolic models, one per family of actions, with two cutters and a context filler (<a href="#help/vss-worlds">What a VSS world is</a>)</td><td>one fine-tuned DistilBERT with small heads (<a href="#help/bert">SOP-BERT</a>)</td></tr>
<tr><th>Size</th><td>31.4 MB</td><td>68.7 MB</td></tr>
<tr><th>Its part in VSS-BERT</th><td>the second reading, to agree or disagree</td><td>the cut, and the reading that is executed</td></tr>
<tr><th>When unsure</th><td colspan="2">does not do the request; says why (which step, which words) and offers Do it anyway</td></tr>
</tbody></table></div>

<h2 id="pa-numbers">Alone, on the same messages</h2>
<p>On ${TEST}, each at its own threshold. The confidence of these two tabs also uses whether the other readers read the request the same way;
VSS-BERT is in the last column for comparison:</p>
<div class="tw"><table>
<thead><tr><th>Situation</th><th class="num">VSS tab</th><th class="num">SOP-BERT tab</th><th class="num">VSS-BERT</th></tr></thead>
<tbody>
<tr><td>Confidently wrong, of what it did</td><td class="num">3.8%</td><td class="num">2.5%</td><td class="num">1.8%</td></tr>
<tr><td>Done right, of the requested actions</td><td class="num">37.8%</td><td class="num">44.8%</td><td class="num">42.8%</td></tr>
<tr><td>Asked, of the requested actions</td><td class="num">39.1%</td><td class="num">49.3%</td><td class="num">52.6%</td></tr>
</tbody></table></div>
<p>Before → after (readers of 2026-11-02 → 2026-11-03, commit 220295a): the VSS tab’s cost score 20.7 → 22.9, the SOP-BERT tab’s 31.5 → 33.4.
Neither difference is shown either way by its interval.</p>
<p class="note">VSS with only its own confidence (while SOP-BERT is still loading) is very careful: it asks about almost everything (5.3% done
right on the test part, cost score 4.8). Its own numbers rank its readings less well (AUROC 0.779) than they do once the other reader’s
agreement is added (0.911).</p>

<h2 id="pa-why-vss">Why VSS, and not a second transformer</h2>
<p>A second reader is useful when it is wrong in other places than the first. VSS reads a message in a chain of named steps (cut, choose a
world, read, fill “it” from the context), and every step leaves a number with a name behind (how sure the cut was, how clearly the world won,
which words it did not know). So when it is unsure it can say where, and when it disagrees with SOP-BERT the disagreement can be named (“the two
readers disagree on the colour”). Alone it gets less right than SOP-BERT; as the second opinion it is what makes VSS-BERT careful.</p>
`);

/* ============================================================ VSS worlds */
page('vss-worlds', 'What a VSS world is',
'A small reader for one family of actions that share the same roles, trained on our annotated requests. VSS is nine of them, with a cutter that sends each request to its candidate worlds.', `
<h2 id="idea">The idea</h2>
<p>A request names an action and fills its <b>roles</b>: “make the circle red” is the action <i>set</i> with a target (the circle) and a colour
(red). A <b>world</b> is a small model that knows a few actions whose roles are alike, for example the <i>links</i> world: connect, disconnect
and reverse, with a start, an end, a style and an arrow head.</p>
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
<code>unknown-event</code> instead of guessing (<code>VSS_READER_SPEC.md</code>). It can still read a value it never saw if the value is in the
legend: a world trained without a single “purple” read 100 of 128 purple requests right (<code>HOLDOUT_PURPLE.md</code>).</p>

<h2 id="learns">What a world learns, in plain words</h2>
<ol>
  <li><b>The front end: two phrase tables</b> (<code>front.json</code>), learned by counting the annotated requests. <b>Value phrases</b>: a phrase
  that in the annotation almost always means one legend value is rewritten to it (“bottom right” → <code>bottom_right</code>). <b>Trigger
  phrases</b>: the words the annotators marked as the action, with the words around them, rewritten to one token of that action. It can only
  rewrite phrases it saw; it is the part of a world that can memorise wording.</li>
  <li><b>The reader</b> (the route book). Every word has a fixed random vector that training never changes; what training learns is how a word’s
  place in the sentence, relative to the kinds of words around it, maps to a role. Those rotations are stored per pair of word <i>kinds</i>, not
  per word and not per sentence: it learns constructions (“an action word, then a name, then a colour”), not answers to sentences.</li>
  <li><b>The thresholds</b>: how strong a role must read to count as present, fitted on the training rows.</li>
</ol>
<p>Around the worlds there are two more learned parts: the <b>cutter</b>, which marks where each request starts and which worlds read it, and
the <b>context filler</b>, below.</p>

<h2 id="filler">The context filler, in plain words</h2>
<p>A request often does not name the shape it acts on: “make <b>it</b> red”, “connect <b>them</b>”, “move <b>the blue one</b>”. The reader leaves
such a role open; the context filler decides who fills it. Its candidates are the shapes this message has created or acted on, the shapes on
the canvas and the names in the text; filters remove the ones that cannot fit (“it” wants one shape, “the blue one” a blue one); a ranking
with learned weights (<code>docs/model/context/weights.json</code>) picks the best, or a “nobody” candidate, and then it asks “which one?”. Whether
a filled request is done is decided by the confidence, not by the ranking alone.</p>
${says('Draw a red circle named Hub in the center, then make it bigger')}

<h2 id="why-small">Why several small worlds and not one model</h2>
<p>One model for every action has to keep apart roles that look alike but mean different things: the colour of a new shape, the colour that
changes an old one, the colour asked about in a question. Grouping actions into worlds by the cutter’s measured confusions, one family of
actions that use the same roles per world, read better than 16 one-action worlds or one general model; the steps and their numbers are in
<a href="#help/history/h-vss">How we got here</a>.</p>
<figure>
<div class="fig">
<svg class="dg" viewBox="0 0 400 256" role="img" aria-labelledby="cw2">
<title id="cw2">The nine worlds and their actions</title>
<rect class="mod" x="8" y="8" width="188" height="52" rx="7"/><text class="t" x="102" y="27" text-anchor="middle">shapes</text><text class="s" x="102" y="45" text-anchor="middle">create set resize fact rule</text>
<rect class="mod" x="204" y="8" width="188" height="52" rx="7"/><text class="t" x="298" y="27" text-anchor="middle">links</text><text class="s" x="298" y="45" text-anchor="middle">connect disconnect reverse</text>
<rect class="mod" x="8" y="68" width="188" height="52" rx="7"/><text class="t" x="102" y="87" text-anchor="middle">position</text><text class="s" x="102" y="105" text-anchor="middle">move swap arrange align …</text>
<rect class="mod" x="204" y="68" width="188" height="52" rx="7"/><text class="t" x="298" y="87" text-anchor="middle">graphq</text><text class="s" x="298" y="105" text-anchor="middle">check connected path cycle …</text>
<rect class="mod" x="8" y="128" width="124" height="60" rx="7"/><text class="t" x="70" y="149" text-anchor="middle">questions</text><text class="s" x="70" y="167" text-anchor="middle">count list extreme …</text>
<rect class="mod" x="138" y="128" width="124" height="60" rx="7"/><text class="t" x="200" y="149" text-anchor="middle">manage</text><text class="s" x="200" y="167" text-anchor="middle">delete copy rename label group</text>
<rect class="mod" x="268" y="128" width="124" height="60" rx="7"/><text class="t" x="330" y="149" text-anchor="middle">history</text><text class="s" x="330" y="167" text-anchor="middle">undo redo forget</text>
<rect class="acc" x="8" y="196" width="188" height="52" rx="7"/><text class="t" x="102" y="215" text-anchor="middle">layout</text><text class="s" x="102" y="233" text-anchor="middle">improve untangle fit sort …</text>
<rect class="acc" x="204" y="196" width="188" height="52" rx="7"/><text class="t" x="298" y="215" text-anchor="middle">help</text><text class="s" x="298" y="233" text-anchor="middle">how do I … · can I … · what kinds of …</text>
</svg>
</div>
<figcaption>The nine worlds of <code>training/sketch/worlds_micro/GROUPS_8ops.json</code> (questions also holds members and groupOf).</figcaption>
</figure>
`);

/* ============================================================ limits today */
page('limits-today', 'Where it is weak today',
'The known weak spots of the readers. The editor’s own limits (what it cannot draw) are in What it cannot do.', `
<p class="note">The readers of 2026-11-03. Numbers at each reader’s threshold are on ${TEST}.</p>
<ul class="limits">
  <li><b>It asks about half of the requests.</b> VSS-BERT holds back 52.6% of the requested actions, and still 1.8% of what it does is wrong.
  How to get a held request done: <a href="#help/asking/a-do">rephrase it, or Do it anyway</a>.</li>
  <li><b>Mistakes both readers share.</b> About 5 to 6 in 100 of the requests VSS and SOP-BERT read the same way are still wrong;
  agreement cannot catch these.</li>
  <li><b>Short commands.</b> On the short commands of short3 alone, SOP-BERT with the earlier confidence recipe scored 4.2 [−1.4, 8.5]: still
  close to asking about everything (<code>results/072_measure/COMPARE.md</code>).</li>
  <li><b>Help questions.</b> VSS’s help world often loses the topic (“what kinds of templates can I use?”) and does not read <code>about</code>;
  SOP-BERT’s topic head knows 109 of the 217 topics. Their confidences hold most of these back, so plain ones (“how do I undo?”) are answered
  and the rest asked.
  ${says('how do I undo?', 'what kinds of templates can I use?')}</li>
  <li><b>New forms with few examples.</b> Templates, titles and arrow labels were learned from little data: “make a timeline of Q1, Q2, Q3” is read
  by VSS as a duplicate, “label the arrow between Process and Check as yes” as a connect; the two readers then disagree, and the request is
  asked, not done (<code>TRAIN_PLAN_1103.md</code> §6).
  ${says('make a timeline of Q1, Q2, Q3', 'label the arrow between Process and Check as yes')}</li>
  <li><b>“Them” after a list.</b> After every request, all readers carry one shape forward as “it” (the shared context rule). “Draw A, B and C,
  then make them red” needs three. Listed as a task (<a href="#help/planned">In progress</a>).</li>
  <li><b>Descriptions in roles.</b> “Put a star next to the orange hexagon”: descriptions fill the entity roles in only 0–3.5% of the annotated
  requests, so the readers rarely learned to read them there (<code>SHORT2.md</code> §3). More annotated data is the fix, not a rule.</li>
  <li><b>The test part had been read before.</b> Both learned readers are tested on fresh2 + short3, which no training read; but that test part
  had been read for earlier studies, so its numbers are exploratory. A set written after these models (fresh3) is planned.</li>
</ul>
`);

/* ============================================================ how we got here */
page('history', 'How we got here',
'The earlier studies that led to VSS-BERT, in short, with the documents that hold their numbers. Each was measured with the readers of its day.', `
<h2 id="h-neural">From a zero-shot model to SOP-BERT</h2>
<ol>
  <li><b>Zero-shot</b>: ready-made models with no training on our data (a natural-language-inference model asked whether “the user wants to
  create a shape” follows from the message). They read the kind of request badly (<code>training/laptop/zs_check.mjs</code>,
  <code>zs_eval.mjs</code>).</li>
  <li><b>A fine-tuned act classifier and a question-answering model</b> (until 2026-11-02): the action right 98.7% of the time on the sample, but
  the details answered by a ready-made SQuAD model were mostly wrong: 30.2% of the requests right, 64.3% wrong, and it never asked back. Both
  models were removed (in git history).</li>
  <li><b>SOP-BERT</b> (2026-11-02): the details read by heads trained on our annotation, the cut too; then retrained on all the data
  (<a href="#help/reliability">More and better data</a>).</li>
</ol>

<h2 id="h-vss">From one VSS model to nine worlds</h2>
<p>On the fixed 1000-message sample, every request done (right / wrong / not done): one general model as a fallback read 0 of 4643 requests and
was removed (<code>SHORT2.md</code> §7); 16 one-action worlds 72.8 / 11.5 / 15.7 (<code>PLAN_A.md</code>); 7 worlds grouped by the cutter’s
confusions 69.6 / 14.3 / 16.1 (<code>PLAN_B.md</code>), then 77.2 / 11.4 / 11.4 after fixes made where the causes were: a new shape’s colour in
the same role as every colour (<code>CREATE_COLOR.md</code>), an event hint for requests without a verb (<code>EVENT_HINT.md</code>), the cutter
retrained with short commands (<code>SHORT.md</code>), an adapter fix (<code>SHORT2.md</code>). The 9 worlds of 2026-11-03 add layout and help
(<code>TRAIN_PLAN_1103.md</code>).</p>
<p>The VSS core is the one of the paper’s repository (<code>training/vss/PROVENANCE.md</code>): fixed word vectors, a learned rotation per pair of
word kinds, roles read back by undoing the rotation. What changed around it: set roles, fewer word kinds (<code>KINDS.md</code>), thresholds
fitted on all rows (<code>BETWEEN.md</code>), the event hint. The large difference from the paper is the chain around the reader: the paper
reads one isolated sentence of a known world.</p>

<h2 id="h-confidence">Which reader knows when it does not know</h2>
<p>The expectation was that VSS would know better when it is unsure. Measured on the sample (AUROC: how well a confidence separates right from
wrong, 0.5 = not at all): the VSS margin 0.59, SOP-BERT’s smallest probability 0.72 (<code>RISK_COVERAGE.md</code>). The margin sees one step of
the VSS chain; a confidence built from every step reached 0.81 (<code>VSS_CONFIDENCE.md</code>), and the precision of each reader at a fixed
threshold was measured in <code>PRECISION.md</code>.</p>

<h2 id="h-fresh">A new writer: the honest test</h2>
<p>The earlier data was written by the same two models that wrote the training data. On 600 messages by a third writer, blind (fresh2), every
reader was worse, and VSS’s confidence did not carry over (confidently wrong 3.4% on the old data, 7.3% on the new writer; SOP-BERT 3.0% and 3.5%;
<code>FRESH2_RESULT.md</code>). Training data written from VSS’s own list of what it lacked made VSS worse, −4.3 [−8.4, −0.4]
(<code>feedback/DATA_NEEDS.md</code>, <code>FEEDBACK_RESULT.md</code>): a negative result, reported as such. More varied writers helped.</p>

<h2 id="h-pair">Two readers, then three</h2>
<p>A request VSS and SOP-BERT read the same way was right 95% of the time (<code>combine/COMBINE.md</code>), the strongest confidence either
had. That became VSS-BERT (<code>combine/COMBINED_READER.md</code>, owner, 2026-11-02 21:57: “a system that errs little and does a lot;
three readers are for evaluation”). Adding the Rules as a third vote was tried and removed (<a href="#help/rules-vs-learned/rv-vote">The Rules
as a third vote</a>; <code>confidence3/RESULT.md</code>). The cost score that every reader is now chosen by is defined in
<code>COST_SCORE.md</code>.</p>
<p class="note">Every document named here is in <code>training/sketch/</code> unless said otherwise; the full list is in the
<a href="#help/repository/result-docs">Repository map</a>.</p>
`);

const DocsConcepts = { pages };
if (typeof module !== 'undefined') module.exports = DocsConcepts; else root.DocsConcepts = DocsConcepts;
})(typeof window !== 'undefined' ? window : this);
