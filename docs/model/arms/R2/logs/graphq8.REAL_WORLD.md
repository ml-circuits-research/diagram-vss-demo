# World `real`: built from 22267 training messages (52029 requests with a span)

WORLD_EVENTS=check,connected,cycle,exists,path,reachable: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 4778 requests of this world's events.

Front end learned from the same messages: 119 value n-grams, 724 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 4704. Dropped (cannot be trained): 74 {'no event token and no role (zero target)': 74}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 680 words (legend value tokens 389, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 190 {"COLOR": 8, "KIND": 3, "NOTCOLOR": 80, "POS": 65, "RECENT": 5, "SHAPE": 9, "SIZE": 20}; event token not found 302; references 130

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| event token not found | 302 |
| name | 64 |
| head | 62 |
| not_blue | 13 |
| not_red | 11 |
| right_side | 11 |
| left_side | 11 |
| not_black | 8 |
| not_white | 8 |
| next_to | 8 |
| bottom_left | 8 |
| not_green | 7 |
| not_yellow | 7 |
| huge | 7 |
| not_pink | 6 |
| center | 6 |
| top_left | 6 |
| medium | 6 |
| shape | 5 |
| bottom_right | 5 |
| bigger | 5 |
| not_orange | 5 |
| $new | 4 |
| not_lime | 4 |
| not_magenta | 4 |
| not_navy | 3 |
| right_of | 3 |
| oldest | 3 |
| top_right | 3 |
| kind_group | 3 |
| between | 2 |
| not_brown | 2 |
| black | 2 |
| newest | 2 |
| gold | 2 |
| rectangle | 2 |
| tiny | 2 |
| left_of | 1 |
| top | 1 |
| circle | 1 |

| event | rows |
|---|---|
| check | 1835 |
| path | 830 |
| connected | 816 |
| exists | 633 |
| cycle | 314 |
| reachable | 276 |
