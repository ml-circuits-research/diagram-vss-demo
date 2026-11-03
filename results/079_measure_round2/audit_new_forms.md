## 1. gold vs gold (every request of the folders)

| folder | messages | requests | of them new forms | canon != canonWant | unpaired | disagree: VSS-BERT / vote canon / vote engine | engine not deterministic |
|---|---|---|---|---|---|---|---|
| llm_bench/short3 | 513 | 644 | 188 | 0 | 0 | 0 / 0 / 0 | 0 |
| llm_train/opus_ext_1 | 500 | 743 | 629 | 0 | 0 | 0 / 0 / 0 | 0 |
| llm_train/synth_rules_ext | 2783 | 3664 | 2808 | 0 | 0 | 0 / 0 / 0 | 0 |
| llm_train/ops_formulations | 700 | 733 | 568 | 0 | 0 | 0 / 0 / 0 | 0 |

## 2. variants of the new forms: verdicts against what logic.js does (two drawings)

| form \| variant | n | engine same | agree (vote engine) | false agree | false disagree | VSS-BERT false agree / disagree | scored right | false right | false wrong |
|---|---|---|---|---|---|---|---|---|---|
| arrow label | from/to swapped | 80 | 8 | 0 |  | 8 |  / 8 | 0 |  | 8 |
| arrow label | label "" -> null | 12 | 0 | 0 |  |  |  /  | 0 |  |  |
| arrow label | quantifier=all dropped | 1 | 0 | 0 |  |  |  /  | 0 |  |  |
| arrow label | target absent -> every name | 81 | 81 | 81 |  |  |  / 1 | 80 |  | 1 |
| arrow label | target absent -> mention(quantifier=all) | 81 | 81 | 81 |  |  |  /  | 81 |  |  |
| arrow label | target absent -> one name (must differ) | 81 | 80 | 80 |  |  |  /  | 80 |  |  |
| arrow property | from/to swapped | 9 | 0 | 0 |  |  |  /  | 0 |  |  |
| arrow property | property changed | 9 | 0 | 0 |  |  |  /  | 0 |  |  |
| arrow restyle | color changed | 42 | 4 | 0 |  | 4 |  / 4 | 0 |  | 4 |
| arrow restyle | from/to swapped | 99 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| arrow restyle | quantifier=all added | 49 | 49 | 49 |  |  |  /  | 49 |  |  |
| arrow restyle | quantifier=all dropped | 25 | 25 | 25 |  |  |  /  | 25 |  |  |
| arrow restyle | size changed | 9 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| arrow restyle | style changed | 36 | 2 | 0 |  | 2 |  / 2 | 0 |  | 2 |
| arrow restyle | target absent -> every name | 151 | 151 | 151 |  |  |  / 44 | 107 |  | 44 |
| arrow restyle | target absent -> mention(quantifier=all) | 151 | 151 | 151 |  |  |  /  | 151 |  |  |
| arrow restyle | target absent -> one name (must differ) | 151 | 107 | 107 |  |  |  /  | 107 |  |  |
| create+ | at dropped | 4 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | color changed | 9 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | count dropped | 17 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | layout changed | 17 | 8 | 0 |  | 8 |  / 8 | 0 |  | 8 |
| create+ | layout dropped | 17 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | outline dropped | 1 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | shape changed | 22 | 0 | 0 |  |  |  /  | 0 |  |  |
| create+ | size changed | 3 | 0 | 0 |  |  |  /  | 0 |  |  |
| free text | color changed | 220 | 0 | 0 |  |  |  /  | 0 |  |  |
| free text | shape changed | 742 | 0 | 0 |  |  |  /  | 0 |  |  |
| free text | size changed | 33 | 0 | 0 |  |  |  /  | 0 |  |  |
| group | target order reversed | 8 | 0 | 0 |  |  |  /  | 0 |  |  |
| help | about added beside a topic | 627 | 627 | 627 |  |  |  /  | 627 |  |  |
| help | about dropped | 152 | 9 | 9 |  |  |  /  | 9 |  |  |
| help | about: undefined | 885 | 742 | 742 |  |  |  /  | 742 |  |  |
| help | aspect absent -> overview | 106 | 106 | 106 |  |  |  /  | 106 |  |  |
| help | aspect changed | 664 | 0 | 0 |  |  |  /  | 0 |  |  |
| help | aspect overview -> absent | 115 | 115 | 115 |  |  |  /  | 115 |  |  |
| help | topic absent -> general | 249 | 249 | 249 |  |  |  /  | 249 |  |  |
| help | topic changed | 636 | 0 | 0 |  |  |  /  | 0 |  |  |
| help | topic dropped | 636 | 0 | 0 |  |  |  /  | 0 |  |  |
| layout op | axis changed | 22 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| layout op | direction changed | 79 | 4 | 0 |  | 4 |  / 4 | 0 |  | 4 |
| layout op | layout changed | 184 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| layout op | layout dropped | 184 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| layout op | property changed | 108 | 12 | 0 |  | 12 |  / 12 | 0 |  | 12 |
| layout op | target absent -> every name | 382 | 381 | 382 | 1 |  |  / 381 | 154 |  | 227 |
| layout op | target absent -> mention(quantifier=all) | 382 | 382 | 382 |  |  |  / 154 | 382 |  |  |
| layout op | target absent -> one name (must differ) | 382 | 34 | 0 |  | 34 |  / 34 | 154 | 154 | 34 |
| layout op | target added (one name) | 233 | 34 | 0 |  | 34 |  / 34 | 19 | 19 | 34 |
| layout op | target all -> absent | 190 | 189 | 190 | 1 |  | 1 / 44 | 146 | 1 | 44 |
| layout op | target all -> every name | 188 | 187 | 188 | 1 |  |  / 187 | 0 |  | 187 |
| layout op | target order reversed | 37 | 37 | 37 |  |  |  / 8 | 29 |  | 8 |
| pairing | pairing all dropped | 4 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| pairing | pairing chain dropped | 23 | 23 | 22 |  | 1 |  / 1 | 22 |  | 1 |
| pairing | pairing next dropped | 5 | 5 | 5 |  |  |  /  | 5 |  |  |
| pairing | style changed | 2 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| template | axis changed | 7 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| template | color changed | 5 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | count dropped | 222 | 52 | 0 |  | 52 |  / 52 | 0 |  | 52 |
| template | items as an array | 1181 | 1181 | 1181 |  |  |  /  | 1181 |  |  |
| template | items dropped | 1182 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | items order reversed | 1181 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | items2 as an array | 12 | 12 | 12 |  |  |  /  | 12 |  |  |
| template | items2 order reversed | 12 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | last item dropped | 1181 | 10 | 0 |  | 10 |  / 10 | 0 |  | 10 |
| template | parents as an array | 4 | 4 | 4 |  |  |  /  | 4 |  |  |
| template | parents order reversed | 4 | 1 | 1 |  |  |  /  | 1 |  |  |
| template | scheme changed | 228 | 20 | 0 |  | 20 |  / 20 | 0 |  | 20 |
| template | size changed | 9 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | target absent -> every name | 1 | 0 | 0 |  |  |  /  | 1 | 1 |  |
| template | target absent -> mention(quantifier=all) | 1 | 0 | 0 |  |  |  /  | 1 | 1 |  |
| template | target absent -> one name (must differ) | 1 | 1 | 0 |  | 1 |  / 1 | 1 |  |  |
| template | target all -> absent | 6 | 0 | 0 |  |  |  /  | 0 |  |  |
| template | target all -> every name | 6 | 6 | 0 |  | 6 |  / 6 | 0 |  | 6 |
| template | target order reversed | 199 | 3 | 0 |  | 3 |  / 3 | 0 |  | 3 |
| template | template changed | 1613 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| template | template dropped | 1613 | 1 | 0 |  | 1 |  / 1 | 0 |  | 1 |
| template | title added | 1134 | 0 | 0 |  |  |  /  | 1134 | 1134 |  |
| template | title dropped | 276 | 2 | 0 |  | 2 |  / 2 | 0 |  | 2 |
| undo count | count dropped | 3 | 0 | 0 |  |  |  /  | 0 |  |  |

In all: 18716 variants; false agreements 3, false disagreements 211 (vote, engine mode); VSS-BERT: 1 / 1030; scorer: false right 1310, false wrong 721.

## Examples

- false right: layout op | target absent -> one name (must differ):
    s3-0017 "arrange it like an org chart" gold {"action":"arrange","layout":"tree"} variant {"action":"arrange","layout":"tree","target":"start"}
    s3-0040 "radial layout around Check" gold {"action":"arrange","layout":"radial","anchor":"check"} variant {"action":"arrange","layout":"radial","anchor":"check","target":"start"}
    s3-0176 "arrange as a hierarchy with Start at the top" gold {"action":"arrange","layout":"tree","anchor":"start"} variant {"action":"arrange","layout":"tree","anchor":"start","target":"start"}
- false right: template | title added:
    s3-0018 "process steps: Plan, Build, Test, Ship" gold {"action":"create","template":"process","items":"plan,build,test,ship"} variant {"action":"create","template":"process","items":"plan,build,test,ship","title":"extra"}
    s3-0019 "a staircase of 4 steps going up" gold {"action":"create","template":"steps","count":"4"} variant {"action":"create","template":"steps","count":"4","title":"extra"}
    s3-0027 "add 5 milestones as a timeline under the flow" gold {"action":"create","template":"timeline","count":"5","position":"below","anchor":"mention(quantifier=all)"} variant {"action":"create","template":"timeline","count":"5","position":"below","anchor":"mention(quantifier=all)","title":"extra"}
- false disagreement: template | count dropped:
    s3-0019 "a staircase of 4 steps going up" gold {"action":"create","template":"steps","count":"4"} variant {"action":"create","template":"steps"}
    s3-0027 "add 5 milestones as a timeline under the flow" gold {"action":"create","template":"timeline","count":"5","position":"below","anchor":"mention(quantifier=all)"} variant {"action":"create","template":"timeline","position":"below","anchor":"mention(quantifier=all)"}
    s3-0089 "make a funnel with 4 stages" gold {"action":"create","template":"funnel","count":"4"} variant {"action":"create","template":"funnel"}
- false wrong: template | count dropped:
    s3-0019 "a staircase of 4 steps going up" gold {"action":"create","template":"steps","count":"4"} variant {"action":"create","template":"steps"}
    s3-0027 "add 5 milestones as a timeline under the flow" gold {"action":"create","template":"timeline","count":"5","position":"below","anchor":"mention(quantifier=all)"} variant {"action":"create","template":"timeline","position":"below","anchor":"mention(quantifier=all)"}
    s3-0089 "make a funnel with 4 stages" gold {"action":"create","template":"funnel","count":"4"} variant {"action":"create","template":"funnel"}
- false wrong: layout op | target absent -> every name:
    s3-0021 "straighten the lines" gold {"action":"straighten","target":"mention(quantifier=all)"} variant {"action":"straighten","target":"check,done,process,start"}
    s3-0038 "untangle" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"check,done,process,start"}
    s3-0038 "straighten" gold {"action":"straighten","target":"mention(quantifier=all)"} variant {"action":"straighten","target":"check,done,process,start"}
- false disagreement: layout op | target absent -> one name (must differ):
    s3-0038 "untangle" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0210 "less crossing lines" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0467 "untangle the arrows" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
- false wrong: layout op | target absent -> one name (must differ):
    s3-0038 "untangle" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0210 "less crossing lines" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0467 "untangle the arrows" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
- false disagreement: layout op | target added (one name):
    s3-0038 "untangle" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0210 "less crossing lines" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0467 "untangle the arrows" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
- false wrong: layout op | target added (one name):
    s3-0038 "untangle" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0210 "less crossing lines" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
    s3-0467 "untangle the arrows" gold {"action":"untangle","target":"mention(quantifier=all)"} variant {"action":"untangle","target":"start"}
- false wrong: arrow restyle | target absent -> every name:
    s3-0042 "color the arrows red" gold {"action":"set","kind":"edge","color":"red","target":"mention(quantifier=all)"} variant {"action":"set","kind":"edge","color":"red","target":"start,process,check,done"}
    s3-0042 "make them dashed" gold {"action":"set","kind":"edge","style":"dashed","target":"mention(quantifier=all)"} variant {"action":"set","kind":"edge","style":"dashed","target":"start,process,check,done"}
    s3-0090 "make all the arrows dotted" gold {"action":"set","kind":"edge","style":"dotted","target":"mention(quantifier=all)"} variant {"action":"set","kind":"edge","style":"dotted","target":"start,process,check,done"}
- false wrong: layout op | target all -> every name:
    s3-0044 "the diagram looks messy can you fix it" gold {"action":"improve","target":"mention(quantifier=all)"} variant {"action":"improve","target":"check,done,process,start"}
    s3-0045 "less space between shapes" gold {"action":"respace","comparison":"smaller","target":"mention(quantifier=all)"} variant {"action":"respace","comparison":"smaller","target":"check,done,process,start"}
    s3-0045 "center it" gold {"action":"fit","position":"center","target":"mention(quantifier=all)"} variant {"action":"fit","position":"center","target":"check,done,process,start"}
- false disagreement: create+ | layout changed:
    s3-0070 "create two pink stars side by side in the top left" gold {"action":"create","count":"2","shape":"star","color":"pink","layout":"row","position":"topleft"} variant {"action":"create","count":"2","shape":"star","color":"pink","layout":"tree","position":"topleft"}
    s3-0168 "draw 4 green circles in a line along the top" gold {"action":"create","count":"4","shape":"circle","color":"green","layout":"row","position":"top"} variant {"action":"create","count":"4","shape":"circle","color":"green","layout":"tree","position":"top"}
    s3-0242 "add two triangles next to each other below Start" gold {"action":"create","count":"2","shape":"triangle","layout":"row","position":"below","anchor":"start"} variant {"action":"create","count":"2","shape":"triangle","layout":"tree","position":"below","anchor":"start"}
- false wrong: create+ | layout changed:
    s3-0070 "create two pink stars side by side in the top left" gold {"action":"create","count":"2","shape":"star","color":"pink","layout":"row","position":"topleft"} variant {"action":"create","count":"2","shape":"star","color":"pink","layout":"tree","position":"topleft"}
    s3-0168 "draw 4 green circles in a line along the top" gold {"action":"create","count":"4","shape":"circle","color":"green","layout":"row","position":"top"} variant {"action":"create","count":"4","shape":"circle","color":"green","layout":"tree","position":"top"}
    s3-0242 "add two triangles next to each other below Start" gold {"action":"create","count":"2","shape":"triangle","layout":"row","position":"below","anchor":"start"} variant {"action":"create","count":"2","shape":"triangle","layout":"tree","position":"below","anchor":"start"}
- false right: template | target absent -> mention(quantifier=all):
    s3-0140 "make the existing flow into process steps with chevrons" gold {"action":"arrange","template":"process"} variant {"action":"arrange","template":"process","target":"mention(quantifier=all)"}
- false right: template | target absent -> every name:
    s3-0140 "make the existing flow into process steps with chevrons" gold {"action":"arrange","template":"process"} variant {"action":"arrange","template":"process","target":"start,process,check,done"}
- false disagreement: template | target absent -> one name (must differ):
    s3-0140 "make the existing flow into process steps with chevrons" gold {"action":"arrange","template":"process"} variant {"action":"arrange","template":"process","target":"start"}
- false disagreement: arrow label | from/to swapped:
    s3-0197 "label that arrow "fast path"" gold {"action":"label","from":"start","to":"done","label":"fast path"} variant {"action":"label","from":"done","to":"start","label":"fast path"}
    s3-0398 "label it "skip"" gold {"action":"label","from":"start","to":"check","label":"skip"} variant {"action":"label","from":"check","to":"start","label":"skip"}
    oe1-0050 "label it "REST"" gold {"action":"label","from":"gateway","to":"orders","label":"rest"} variant {"action":"label","from":"orders","to":"gateway","label":"rest"}
- false wrong: arrow label | from/to swapped:
    s3-0197 "label that arrow "fast path"" gold {"action":"label","from":"start","to":"done","label":"fast path"} variant {"action":"label","from":"done","to":"start","label":"fast path"}
    s3-0398 "label it "skip"" gold {"action":"label","from":"start","to":"check","label":"skip"} variant {"action":"label","from":"check","to":"start","label":"skip"}
    oe1-0050 "label it "REST"" gold {"action":"label","from":"gateway","to":"orders","label":"rest"} variant {"action":"label","from":"orders","to":"gateway","label":"rest"}
- false disagreement: template | target all -> every name:
    s3-0214 "make the diagram a pyramid" gold {"action":"arrange","template":"pyramid","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"pyramid","target":"start,process,check,done"}
    s3-0215 "show the four shapes as a timeline" gold {"action":"arrange","template":"timeline","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"timeline","target":"start,process,check,done"}
    s3-0369 "turn the 4 shapes into a cycle" gold {"action":"arrange","template":"cycle","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"cycle","target":"start,process,check,done"}
- false wrong: template | target all -> every name:
    s3-0214 "make the diagram a pyramid" gold {"action":"arrange","template":"pyramid","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"pyramid","target":"start,process,check,done"}
    s3-0215 "show the four shapes as a timeline" gold {"action":"arrange","template":"timeline","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"timeline","target":"start,process,check,done"}
    s3-0369 "turn the 4 shapes into a cycle" gold {"action":"arrange","template":"cycle","target":"mention(quantifier=all)"} variant {"action":"arrange","template":"cycle","target":"start,process,check,done"}
- false disagreement: pairing | pairing chain dropped:
    s3-0351 "connect them in a chain" gold {"action":"connect","from":"$new","pairing":"chain"} variant {"action":"connect","from":"$new"}
- false wrong: pairing | pairing chain dropped:
    s3-0351 "connect them in a chain" gold {"action":"connect","from":"$new","pairing":"chain"} variant {"action":"connect","from":"$new"}
- false wrong: layout op | target all -> absent:
    oe1-0037 "group everything by colour" gold {"action":"groupby","property":"color","target":"mention(quantifier=all)"} variant {"action":"groupby","property":"color"}
    oe1-0075 "Arrange the players top to bottom in layers, Keeper first" gold {"action":"arrange","layout":"layers","direction":"down","anchor":"keeper","target":"mention(quantifier=all)"} variant {"action":"arrange","layout":"layers","direction":"down","anchor":"keeper"}
    oe1-0149 "lay them out as a hub around Lead" gold {"action":"arrange","layout":"radial","anchor":"lead","target":"mention(quantifier=all)"} variant {"action":"arrange","layout":"radial","anchor":"lead"}
- false disagreement: layout op | property changed:
    oe1-0088 "make all the boxes the same width as Dock" gold {"action":"equalize","property":"size","anchor":"dock","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"equalize","property":"color","anchor":"dock","target":"mention(quantifier=all,shape=rectangle)"}
    oe1-0185 "make every box the same size" gold {"action":"equalize","property":"size","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"equalize","property":"color","target":"mention(quantifier=all,shape=rectangle)"}
    ops-0500 "make all the boxes the same size" gold {"action":"equalize","target":"mention(quantifier=all,shape=rectangle)","property":"size"} variant {"action":"equalize","target":"mention(quantifier=all,shape=rectangle)","property":"color"}
- false wrong: layout op | property changed:
    oe1-0088 "make all the boxes the same width as Dock" gold {"action":"equalize","property":"size","anchor":"dock","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"equalize","property":"color","anchor":"dock","target":"mention(quantifier=all,shape=rectangle)"}
    oe1-0185 "make every box the same size" gold {"action":"equalize","property":"size","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"equalize","property":"color","target":"mention(quantifier=all,shape=rectangle)"}
    ops-0500 "make all the boxes the same size" gold {"action":"equalize","target":"mention(quantifier=all,shape=rectangle)","property":"size"} variant {"action":"equalize","target":"mention(quantifier=all,shape=rectangle)","property":"color"}
- false right: layout op | target added (one name):
    oe1-0148 "group by shape" gold {"action":"groupby","property":"shape"} variant {"action":"groupby","property":"shape","target":"paper1"}
    oe1-0260 "Can you group these by color" gold {"action":"groupby","property":"color"} variant {"action":"groupby","property":"color","target":"books"}
    oe1-0370 "group them by size" gold {"action":"groupby","property":"size"} variant {"action":"groupby","property":"size","target":"solar"}
- false wrong: layout op | target order reversed:
    oe1-0153 "Arrange them as a tree going down" gold {"action":"arrange","layout":"tree","direction":"down","target":"cs101,cs201,cs301"} variant {"action":"arrange","layout":"tree","direction":"down","target":"cs301,cs201,cs101"}
    oe1-0406 "Put Ann, Ben and Cid under Boss as a hierarchy" gold {"action":"arrange","layout":"tree","anchor":"boss","target":"ann,ben,cid"} variant {"action":"arrange","layout":"tree","anchor":"boss","target":"cid,ben,ann"}
    ops-0070 "arrange Start, Process and Check as a tree" gold {"action":"arrange","layout":"tree","target":"start,process,check"} variant {"action":"arrange","layout":"tree","target":"check,process,start"}
- false wrong: arrow label | target absent -> every name:
    oe1-0167 "remove all the labels on the arrows" gold {"action":"label","kind":"edge","quantifier":"all","label":"","target":"mention(quantifier=all)"} variant {"action":"label","kind":"edge","quantifier":"all","label":"","target":"vpc,subnet1,subnet2,nat"}
- false disagreement: arrow restyle | color changed:
    oe1-0182 "make the loop arrow from Render back to Input dashed and grey" gold {"action":"set","from":"render","to":"input","style":"dashed","color":"gray"} variant {"action":"set","from":"render","to":"input","style":"dashed","color":"red"}
    oe1-0215 "make it red" gold {"action":"set","from":"outlet","to":"breaker1","color":"red"} variant {"action":"set","from":"outlet","to":"breaker1","color":"blue"}
    oe1-0258 "make it gray" gold {"action":"set","from":"paid","to":"refunded","color":"gray"} variant {"action":"set","from":"paid","to":"refunded","color":"red"}
- false wrong: arrow restyle | color changed:
    oe1-0182 "make the loop arrow from Render back to Input dashed and grey" gold {"action":"set","from":"render","to":"input","style":"dashed","color":"gray"} variant {"action":"set","from":"render","to":"input","style":"dashed","color":"red"}
    oe1-0215 "make it red" gold {"action":"set","from":"outlet","to":"breaker1","color":"red"} variant {"action":"set","from":"outlet","to":"breaker1","color":"blue"}
    oe1-0258 "make it gray" gold {"action":"set","from":"paid","to":"refunded","color":"gray"} variant {"action":"set","from":"paid","to":"refunded","color":"red"}
- false disagreement: arrow restyle | style changed:
    oe1-0182 "make the loop arrow from Render back to Input dashed and grey" gold {"action":"set","from":"render","to":"input","style":"dashed","color":"gray"} variant {"action":"set","from":"render","to":"input","style":"dotted","color":"gray"}
    oe1-0338 "dotted" gold {"action":"set","from":"pause","to":"menu","style":"dotted"} variant {"action":"set","from":"pause","to":"menu","style":"dashed"}
- false wrong: arrow restyle | style changed:
    oe1-0182 "make the loop arrow from Render back to Input dashed and grey" gold {"action":"set","from":"render","to":"input","style":"dashed","color":"gray"} variant {"action":"set","from":"render","to":"input","style":"dotted","color":"gray"}
    oe1-0338 "dotted" gold {"action":"set","from":"pause","to":"menu","style":"dotted"} variant {"action":"set","from":"pause","to":"menu","style":"dashed"}
- false disagreement: arrow restyle | size changed:
    oe1-0238 "make the Gate to Keep line thick" gold {"action":"set","from":"gate","to":"keep","size":"large"} variant {"action":"set","from":"gate","to":"keep","size":"small"}
- false wrong: arrow restyle | size changed:
    oe1-0238 "make the Gate to Keep line thick" gold {"action":"set","from":"gate","to":"keep","size":"large"} variant {"action":"set","from":"gate","to":"keep","size":"small"}
- false disagreement: template | title dropped:
    oe1-0286 "Bus, Museum, Lunch, Park: make it a road with "Home" as the goal" gold {"action":"arrange","template":"road","target":"bus,museum,lunch,park","title":"home"} variant {"action":"arrange","template":"road","target":"bus,museum,lunch,park"}
    oe1-0420 "Turn Kickoff, Design, Build and Launch into a road with "Market" as the goal" gold {"action":"arrange","template":"road","target":"kickoff,design,build,launch","title":"market"} variant {"action":"arrange","template":"road","target":"kickoff,design,build,launch"}
- false wrong: template | title dropped:
    oe1-0286 "Bus, Museum, Lunch, Park: make it a road with "Home" as the goal" gold {"action":"arrange","template":"road","target":"bus,museum,lunch,park","title":"home"} variant {"action":"arrange","template":"road","target":"bus,museum,lunch,park"}
    oe1-0420 "Turn Kickoff, Design, Build and Launch into a road with "Market" as the goal" gold {"action":"arrange","template":"road","target":"kickoff,design,build,launch","title":"market"} variant {"action":"arrange","template":"road","target":"kickoff,design,build,launch"}
- false agreement: layout op | target all -> every name:
    oe1-0336 "lay everything out as a hierarchy again" gold {"action":"arrange","layout":"tree","target":"mention(quantifier=all)"} variant {"action":"arrange","layout":"tree","target":"ceo,cfo,cto,hr"}
- false disagreement: pairing | style changed:
    oe1-0356 "connect Push to Build and Build to Test with dotted arrows" gold {"action":"connect","from":"push,build,test","style":"dotted"} variant {"action":"connect","from":"push,build,test","style":"dashed"}
- false wrong: pairing | style changed:
    oe1-0356 "connect Push to Build and Build to Test with dotted arrows" gold {"action":"connect","from":"push,build,test","style":"dotted"} variant {"action":"connect","from":"push,build,test","style":"dashed"}
- false disagreement: template | scheme changed:
    oe1-0367 "Make a list of Yoga, Hike, Journaling, Campfire titled "Retreat day" in earthy tones. Make it small. Put it in the bottom left" gold {"action":"create","template":"list","items":"yoga,hike,journaling,campfire","title":"retreat day","scheme":"earth","size":"small","position":"bottomleft"} variant {"action":"create","template":"list","items":"yoga,hike,journaling,campfire","title":"retreat day","scheme":"warm","size":"small","position":"bottomleft"}
    se-00207 "create a titled list of Hiring, Summer, Mastery, Interest and Rollout in earth tones colours" gold {"action":"create","template":"list","items":"hiring,summer,mastery,interest,rollout","scheme":"earth"} variant {"action":"create","template":"list","items":"hiring,summer,mastery,interest,rollout","scheme":"warm"}
    se-00672 "Build a bullet list of Finance, Interest, Review and Plan in soothing colours" gold {"action":"create","template":"list","items":"finance,interest,review,plan","scheme":"calm"} variant {"action":"create","template":"list","items":"finance,interest,review,plan","scheme":"warm"}
- false wrong: template | scheme changed:
    oe1-0367 "Make a list of Yoga, Hike, Journaling, Campfire titled "Retreat day" in earthy tones. Make it small. Put it in the bottom left" gold {"action":"create","template":"list","items":"yoga,hike,journaling,campfire","title":"retreat day","scheme":"earth","size":"small","position":"bottomleft"} variant {"action":"create","template":"list","items":"yoga,hike,journaling,campfire","title":"retreat day","scheme":"warm","size":"small","position":"bottomleft"}
    se-00207 "create a titled list of Hiring, Summer, Mastery, Interest and Rollout in earth tones colours" gold {"action":"create","template":"list","items":"hiring,summer,mastery,interest,rollout","scheme":"earth"} variant {"action":"create","template":"list","items":"hiring,summer,mastery,interest,rollout","scheme":"warm"}
    se-00672 "Build a bullet list of Finance, Interest, Review and Plan in soothing colours" gold {"action":"create","template":"list","items":"finance,interest,review,plan","scheme":"calm"} variant {"action":"create","template":"list","items":"finance,interest,review,plan","scheme":"warm"}
- false disagreement: arrow restyle | from/to swapped:
    oe1-0375 "make it dotted" gold {"action":"set","from":"lobby","to":"pool","style":"dotted"} variant {"action":"set","from":"pool","to":"lobby","style":"dotted"}
- false wrong: arrow restyle | from/to swapped:
    oe1-0375 "make it dotted" gold {"action":"set","from":"lobby","to":"pool","style":"dotted"} variant {"action":"set","from":"pool","to":"lobby","style":"dotted"}
- false disagreement: template | axis changed:
    oe1-0381 "Make a road of Welcome, Setup, Training, First task to "Fully onboarded", vertical. hmm actually, horizontal" gold {"action":"create","template":"road","items":"welcome,setup,training,first task","title":"fully onboarded","axis":"horizontal"} variant {"action":"create","template":"road","items":"welcome,setup,training,first task","title":"fully onboarded","axis":"vertical"}
- false wrong: template | axis changed:
    oe1-0381 "Make a road of Welcome, Setup, Training, First task to "Fully onboarded", vertical. hmm actually, horizontal" gold {"action":"create","template":"road","items":"welcome,setup,training,first task","title":"fully onboarded","axis":"horizontal"} variant {"action":"create","template":"road","items":"welcome,setup,training,first task","title":"fully onboarded","axis":"vertical"}
- false disagreement: template | target order reversed:
    se-00280 "organize Wr1, Corner2 and Striker as a 2x2" gold {"action":"arrange","template":"matrix","target":"wr1,corner2,striker"} variant {"action":"arrange","template":"matrix","target":"striker,corner2,wr1"}
    se-01853 "Organize Dungeon, Forest and Tower as a four boxes" gold {"action":"arrange","template":"matrix","target":"dungeon,forest,tower"} variant {"action":"arrange","template":"matrix","target":"tower,forest,dungeon"}
    se-02367 "organize Reject, Process and Begin as a swot" gold {"action":"arrange","template":"matrix","target":"reject,process,begin"} variant {"action":"arrange","template":"matrix","target":"begin,process,reject"}
- false wrong: template | target order reversed:
    se-00280 "organize Wr1, Corner2 and Striker as a 2x2" gold {"action":"arrange","template":"matrix","target":"wr1,corner2,striker"} variant {"action":"arrange","template":"matrix","target":"striker,corner2,wr1"}
    se-01853 "Organize Dungeon, Forest and Tower as a four boxes" gold {"action":"arrange","template":"matrix","target":"dungeon,forest,tower"} variant {"action":"arrange","template":"matrix","target":"tower,forest,dungeon"}
    se-02367 "organize Reject, Process and Begin as a swot" gold {"action":"arrange","template":"matrix","target":"reject,process,begin"} variant {"action":"arrange","template":"matrix","target":"begin,process,reject"}
- false disagreement: template | last item dropped:
    se-00662 "build an intersection of Training, Mastery, Idea, Product and Sales" gold {"action":"create","template":"venn","items":"training,mastery,idea,product,sales"} variant {"action":"create","template":"venn","items":"training,mastery,idea,product"}
    se-00929 "Draw an overlap titled "Plan B" of Publish, Action, Autumn, Edit and Decision" gold {"action":"create","template":"venn","items":"publish,action,autumn,edit,decision","title":"plan b"} variant {"action":"create","template":"venn","items":"publish,action,autumn,edit","title":"plan b"}
    se-00931 "Sketch a venn at the top of Feedback, Rollout, Review, Training and Morning" gold {"action":"create","template":"venn","items":"feedback,rollout,review,training,morning","position":"top"} variant {"action":"create","template":"venn","items":"feedback,rollout,review,training","position":"top"}
- false wrong: template | last item dropped:
    se-00662 "build an intersection of Training, Mastery, Idea, Product and Sales" gold {"action":"create","template":"venn","items":"training,mastery,idea,product,sales"} variant {"action":"create","template":"venn","items":"training,mastery,idea,product"}
    se-00929 "Draw an overlap titled "Plan B" of Publish, Action, Autumn, Edit and Decision" gold {"action":"create","template":"venn","items":"publish,action,autumn,edit,decision","title":"plan b"} variant {"action":"create","template":"venn","items":"publish,action,autumn,edit","title":"plan b"}
    se-00931 "Sketch a venn at the top of Feedback, Rollout, Review, Training and Morning" gold {"action":"create","template":"venn","items":"feedback,rollout,review,training,morning","position":"top"} variant {"action":"create","template":"venn","items":"feedback,rollout,review,training","position":"top"}
- false disagreement: pairing | pairing all dropped:
    se-01815 "hook Toolbar, Banner and Logo all to each other" gold {"action":"connect","from":"toolbar,banner,logo","pairing":"all"} variant {"action":"connect","from":"toolbar,banner,logo"}
- false wrong: pairing | pairing all dropped:
    se-01815 "hook Toolbar, Banner and Logo all to each other" gold {"action":"connect","from":"toolbar,banner,logo","pairing":"all"} variant {"action":"connect","from":"toolbar,banner,logo"}
- false disagreement: template | template changed:
    se-02057 "Lay out Moon, Comet and Neptune as a rings" gold {"action":"arrange","template":"target","target":"moon,comet,neptune"} variant {"action":"arrange","template":"timeline","target":"moon,comet,neptune"}
- false wrong: template | template changed:
    se-02057 "Lay out Moon, Comet and Neptune as a rings" gold {"action":"arrange","template":"target","target":"moon,comet,neptune"} variant {"action":"arrange","template":"timeline","target":"moon,comet,neptune"}
- false disagreement: template | template dropped:
    se-02057 "Lay out Moon, Comet and Neptune as a rings" gold {"action":"arrange","template":"target","target":"moon,comet,neptune"} variant {"action":"arrange","target":"moon,comet,neptune"}
- false wrong: template | template dropped:
    se-02057 "Lay out Moon, Comet and Neptune as a rings" gold {"action":"arrange","template":"target","target":"moon,comet,neptune"} variant {"action":"arrange","target":"moon,comet,neptune"}
- false agreement: layout op | target all -> absent:
    se-02442 "tidy up the diagram" gold {"action":"improve","target":"mention(quantifier=all)"} variant {"action":"improve","target":"mention(quantifier=all)"}
- false right: layout op | target all -> absent:
    se-02442 "tidy up the diagram" gold {"action":"improve","target":"mention(quantifier=all)"} variant {"action":"improve","target":"mention(quantifier=all)"}
- false disagreement: layout op | layout changed:
    ops-0096 "organise the boxes as a tree" gold {"action":"arrange","layout":"tree","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"arrange","layout":"grid","target":"mention(quantifier=all,shape=rectangle)"}
- false wrong: layout op | layout changed:
    ops-0096 "organise the boxes as a tree" gold {"action":"arrange","layout":"tree","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"arrange","layout":"grid","target":"mention(quantifier=all,shape=rectangle)"}
- false disagreement: layout op | layout dropped:
    ops-0096 "organise the boxes as a tree" gold {"action":"arrange","layout":"tree","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"arrange","target":"mention(quantifier=all,shape=rectangle)"}
- false wrong: layout op | layout dropped:
    ops-0096 "organise the boxes as a tree" gold {"action":"arrange","layout":"tree","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"arrange","target":"mention(quantifier=all,shape=rectangle)"}
- false disagreement: layout op | direction changed:
    ops-0329 "right align the boxes" gold {"action":"align","direction":"right","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"align","direction":"left","target":"mention(quantifier=all,shape=rectangle)"}
    ops-0337 "bottom align the circles" gold {"action":"align","direction":"down","target":"mention(quantifier=all,shape=circle)"} variant {"action":"align","direction":"left","target":"mention(quantifier=all,shape=circle)"}
    ops-0344 "align the stars to the left" gold {"action":"align","direction":"left","target":"mention(quantifier=all,shape=star)"} variant {"action":"align","direction":"right","target":"mention(quantifier=all,shape=star)"}
- false wrong: layout op | direction changed:
    ops-0329 "right align the boxes" gold {"action":"align","direction":"right","target":"mention(quantifier=all,shape=rectangle)"} variant {"action":"align","direction":"left","target":"mention(quantifier=all,shape=rectangle)"}
    ops-0337 "bottom align the circles" gold {"action":"align","direction":"down","target":"mention(quantifier=all,shape=circle)"} variant {"action":"align","direction":"left","target":"mention(quantifier=all,shape=circle)"}
    ops-0344 "align the stars to the left" gold {"action":"align","direction":"left","target":"mention(quantifier=all,shape=star)"} variant {"action":"align","direction":"right","target":"mention(quantifier=all,shape=star)"}
- false disagreement: layout op | axis changed:
    ops-0567 "flip the boxes vertically" gold {"action":"flip","target":"mention(quantifier=all,shape=rectangle)","axis":"vertical"} variant {"action":"flip","target":"mention(quantifier=all,shape=rectangle)","axis":"horizontal"}
- false wrong: layout op | axis changed:
    ops-0567 "flip the boxes vertically" gold {"action":"flip","target":"mention(quantifier=all,shape=rectangle)","axis":"vertical"} variant {"action":"flip","target":"mention(quantifier=all,shape=rectangle)","axis":"horizontal"}
- false agreement: layout op | target absent -> every name:
    ops-0717 "tidy up" gold {"action":"improve","target":"mention(quantifier=all)"} variant {"action":"improve","target":"cache,cart,home,login"}
