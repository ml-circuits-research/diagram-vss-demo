# World `real`: built from 22631 training messages (52539 requests with a span)

WORLD_EVENTS=create,fact,resize,rule,set: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 16420 requests of this world's events.

Front end learned from the same messages: 504 value n-grams, 1683 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 16389. Dropped (cannot be trained): 31 {'no event token and no role (zero target)': 31}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 711 words (legend value tokens 420, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 1215 {"ARROW": 6, "COLOR": 107, "FILL": 15, "KIND": 22, "LAYOUT": 13, "NOTCOLOR": 4, "NUM": 178, "POS": 314, "RECENT": 7, "SCHEME": 32, "SHAPE": 318, "SIZE": 159, "STYLE": 2, "TEMPLATE": 38}; event token not found 1668; references 1142

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| event token not found | 1668 |
| name | 651 |
| head | 225 |
| shape | 173 |
| small | 129 |
| items | 100 |
| right_of | 90 |
| 3 | 67 |
| 2 | 64 |
| left_of | 60 |
| next_to | 59 |
| $new | 51 |
| circle | 49 |
| rectangle | 31 |
| description | 29 |
| bottom_left | 28 |
| 4 | 27 |
| kind_edge | 22 |
| square | 21 |
| left_side | 19 |
| top_left | 16 |
| top_right | 15 |
| red | 14 |
| right_side | 14 |
| hexagon | 13 |
| tpl_matrix | 13 |
| sch_mono | 13 |
| green | 12 |
| gold | 12 |
| several | 12 |
| tpl_hierarchy | 12 |
| fill_light | 12 |
| large | 11 |
| diamond | 11 |
| items2 | 10 |
| yellow | 9 |
| tiny | 9 |
| ring | 9 |
| star | 8 |
| 6 | 8 |

| event | rows |
|---|---|
| set | 7480 |
| create | 6069 |
| fact | 1452 |
| resize | 881 |
| rule | 507 |
