# Verbless requests: how well can the legend pick the action from gold roles

Status (2026-10-31): threshold MISSED. Rule fixed before running: inherit the previous request's action when its legend frame holds
all the keys, else the unique frame that holds them, else ask. Threshold fixed before running: >= 90% right and <= 3% wrong.
Result on 209 truly verbless requests of the fit split: 88.0% right, 0.5% wrong, 11.5% ask (inheritance gives 181 of the 184 right).
One correction during the run, reported by the agent: the first parse of the frames dropped move's "(+ anchor)" and "(+ distance)";
the parser was fixed, not the rule (before the fix: 77.0 / 0.5 / 22.5). Measured on gold roles, no reader: an upper bound for the
reasoning step. The owner decides whether to build it. Scripts here; paths inside them point to the coordinator's scratch folder.

Front end: docs/model/fix_p80_s0/front.json + docs/js/front.js normalize(); event tokens = all verbs of the legend events in docs/model/fix_p80_s0/model.json. Data: FIT split only (split_of(m, 0.8)), sonnet_msg + haiku_msg: 947 messages. Script: /tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/verbless/verbless.mjs (classes.json = my reading of the triggers, written by mkclasses.mjs; this file by mkreport.mjs). No repository file edited; test sets not opened.

## Counts
- Gold requests whose span has no event token after normalize(): 328
- (i) truly verbless (trigger is a name, value, position phrase, superlative or noun phrase): 209
- (ii) a verb or question phrase is in the text but the front end has no event token for it: 119. Examples: "every circle should be blue" (trigger "every circle should be"); "align them vertically" (trigger "align"); "what stars do we have" (trigger "what stars"); "Any lime things on the map yet" (trigger "Any"); "Login goes to Signup with a dashed arrow" (trigger "goes to"); "Remove the connection between Login and Help" (trigger "Remove the connection"); "paint Scene3 black" (trigger "paint"); "Lb sends traffic to App1 and App2" (trigger "sends traffic to"); "both write to Store" (trigger "write to"); "bigger please" (trigger "bigger").

## Frames used
Source: the legend text of training/sketch/llm_train/TRAIN_MSG_SPEC.md ("Commands, by action", "Questions, by ask", Facts, Rules), parsed by code, because docs/js/logic.js lists legend questions and values, not keys per action. A question is written "?ask". Printed:
```
create         anchor, color, count, label, name, position, shape, size
delete         target
move           anchor, direction, distance, position, target
set            color, shape, size, target
resize         target
rename         name, target
label          label, target
duplicate      count, target
swap           target
connect        arrow, color, from, label, pairing, style, to
disconnect     from, to
align          axis, target
arrange        layout, target
distribute     axis, target
toFront        target
toBack         target
undo           
redo           
forget         
?count         anchor, color, kind, notColor, position, shape
?exists        anchor, color, kind, notColor, position, shape
?list          anchor, color, kind, notColor, position, shape
?property      color, label, position, property, shape, size, target
?describe      target
?neighbors     target
?connected     anchor, target
?degree        target
?path          from, to
?reachable     from
?cycle         
?rules         
?check         anchor, color, comparison, notColor, position, shape, size, target
?extreme       superlative
?nearest       anchor, color, shape, superlative
fact           anchor, color, position, shape, size, target
rule           color, shape, size
```
Parser note: my first parse dropped the keys written as "(+ anchor)" and "(+ distance in pixels)" (move had no anchor or distance). I saw it in the printed frames, fixed the parser (not the rule) and re-ran. Before the fix: with inheritance right 161 (77.0%), wrong 1, ask 47 (22.5%). Only the numbers below are final.

## Result on (i), n=209
| | right | wrong | ask |
|---|---|---|---|
| with inheritance (a, b, c) | 184 (88.0%) | 1 (0.5%) | 24 (11.5%) |
| without inheritance (b, c) | 30 (14.4%) | 0 (0.0%) | 179 (85.6%) |

Inheritance gives 181 of the 184 right answers; the unique-frame step alone settles 30 (12 connect "X to Y", 15 create noun phrases, 3 move). Of the 24 asks, 17 have no previous request in the message; the asks are mostly "Name + place" (move, 15) and "Name + colour/size" (set 6 and fact 1), where 3-4 frames fit.

## Wrong cases (all)
- span: "push it to the very front of the stack"; previous: "Tint the Oven red [set]"; gold: toFront; rule answered: set (inherit). This span has a verb ("push"), so by reading it belongs in (ii); I classified by the trigger word "front" before running and keep it in (i). Without it: 184 right, 0 wrong, 24 ask of 208.

## 10 ask cases (span | gold keys | previous request [its action] | gold | why asked)
- "Ingress to Pod1 and Pod2" | from,to | (none) | connect | ask (3 frames fit)
- "Pods teal, both" | target,color | Ingress to Pod1 and Pod2 [connect] | set | ask (4 frames fit)
- "who sits at the far right" | superlative | Arrange all four in a grid [arrange] | ?extreme | ask (2 frames fit)
- "Vocals at the front" | target,position | (none) | move | ask (4 frames fit)
- "tiny and pink" | target,size,color | Carousel goes bottom left [move] | set | ask (4 frames fit)
- "Ward in the top left" | target,position | (none) | move | ask (4 frames fit)
- "Laptop blue" | target,color | Laptop, Account and Badge should be chained in that order [connect] | set | ask (4 frames fit)
- "Laser to the top left" | target,position | (none) | move | ask (4 frames fit)
- "Court1 left of Court2" | target,position,anchor | (none) | move | ask (3 frames fit)
- "both small" | target,size | the Window at the top [move] | set | ask (4 frames fit)

## Classification (trigger lists, decided by reading)
(i): Orders and Items | Signup to Help | above | to the bottom left | a blue one | front | to the bottom right | Bank to Fraud | Hub to both | last one | the Hero a | under | Yellow a | Black a | Ingress to | teal | Post | Delete red | Paris to | Cat to Dan | far right | Core to | at the front | 70 pixels down | Share | Member to | Ship to | Parent2 a | Frame a | the Chain a | tiny | Detail a | Closed | near the bottom | OnPrem a | near the bottom left | between | Agent to Manager | in the top left | the Lab | every rectangle | the Drone | the Tower | Lead a | Dispatch to both | the Crater | the Ash | the Savings | Laptop | Account | Badge | to the top left | to the top right | 100 pixels to the left | on her left | on her right | the Outfall | Costs red | dotted | Peppers | Herbs | the Peppers | the Hearing | Jazz blue | Pop pink | Villain a | the Leader a | left of | small | Silver gray | Gold gold | Final to | a small gold star | a diamond | below | to the right of | a cyan star | Heart and Body | Page2 to | Plant to | the Pears | Plums purple | to the left of | the Plant | Ambulance white | an indigo hexagon | Lemons yellow | Sugar white | Editor to both | the Lily | right of | the Plate | the Lead | the Bin2 | the Berry | the Blender | a pink circle | Linear to | Sandbox yellow | Slide red | Swing blue | Invoice a | the Base | the Body | the Head | Mentor2 to | a teal square | Basses navy | Pens left | Glue right | the Extinguisher | Reds red | and so on | Bronze brown | Billing to | an orange triangle | Canal to | Destroyer a | Planet a | a medium lime hexagon | the Lookout | at the far left | at the far right | the Red a | Venus yellow | Earth blue | Zone2 yellow | Zone3 red | Zone3 left | Keynote navy | the Amp a | the Cafe | an orange square | the Caboose | the Cards | most | Aunt to | Shelf2 gray | Sous to both | both trucks to | a lime star | a gold star | Paint a | Park left | Mall right | the Clinic a | R4 to | top left | Tile2 and Tile3 | middle | bottom | Belt to | a gray circle | bottom right | Orc left | Elf right | Dwarf bottom | River to | Branch to | the Doll a | the Ball a | Spot1 left | Spot2 center | Spot3 right | Stay yellow | Come red | an ellipse | Isle1 to | Saw top left | Drill top right | Lathe bottom left | Bench bottom right | the Lathe | an orange circle | a teal circle | Blue to | all to each other | Milk white | Honey gold | in between | Ridge to | Jet3 tiny | Mito | Cake | Pie | Stacks top left | Desk bottom left | Study top right | Cafe bottom right | Pawn tiny | Dad to | Scarf red | Boots brown | Cabin1 top left | Cabin2 top right | Lake bottom

(ii): every circle should be | align | what stars | Any | goes to | Remove the connection | paint | sends traffic to | write to | bigger | make | whole picture | feeds | reached from | every triangle must be | sit between | Do we have | triggers | Does | Show me | turns | Wire | Mark | Name | all new ellipses should be | talks to | fans out to | should be | Place | goes near | leads to | links to | circles should be | goes | path | Does any | What do we have | Plant | pointing to the next | connected | What are | connected to each other | Remove the line | all new stars are | every new circle should be | description | position | all hexagons are | Switch places | sends samples to | squares are | each go to the next | Where | exists | Check | any | distributed | Remove | each pointing to the next | name | stars are | show me | new circles are | Align | all new circles are | each leading to the next | put under | all circles are | all connected to each other | What circles | follow | get anywhere from | Are any | back to | look like | Make | Find a route | Show every shape | What's touching | What can be reached | Tell me what | Stack | Make all the boxes | tell me the shapes | Give | What shapes are not blue

Label noise seen: "Paint a red circle", "Delete red", "Stay yellow", "Come red", "Black a black circle" are annotated with the first word as a shape name (set on target Paint / Delete / Stay / Come / Black). I followed the annotation and kept them in (i).

## Verdict
The rule does not pass the threshold: wrong is 0.5% (<= 3%, fine) but right is 88.0% (< 90%), with 11.5% ask; almost all of the right answers come from inheritance (without it only 14.4% right).
