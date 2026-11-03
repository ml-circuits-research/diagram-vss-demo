# World `real`: built from 21698 training messages (51584 requests with a span)

WORLD_EVENTS=align,arrange,distribute,move,swap,toBack,toFront: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 10170 requests of this world's events.

Front end learned from the same messages: 240 value n-grams, 1335 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 10143. Dropped (cannot be trained): 27 {'no event token and no role (zero target)': 27}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 680 words (legend value tokens 389, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 960 {"AXIS": 254, "COLOR": 35, "DIR": 38, "LAYOUT": 87, "NOTCOLOR": 10, "NUM": 3, "POS": 375, "RECENT": 14, "TEMPLATE": 144}; event token not found 500; references 1624

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| name | 1120 |
| event token not found | 500 |
| head | 371 |
| horizontally | 139 |
| vertically | 115 |
| left_side | 102 |
| right_side | 99 |
| $new | 73 |
| next_to | 48 |
| right_of | 41 |
| description | 37 |
| column | 34 |
| row | 30 |
| left_of | 23 |
| swap | 22 |
| down | 18 |
| bottom_right | 15 |
| right | 12 |
| tpl_spiral | 11 |
| tpl_matrix | 11 |
| tpl_target | 11 |
| radial | 10 |
| tpl_process | 10 |
| newest | 10 |
| top_left | 9 |
| tpl_timeline | 9 |
| tpl_sunrise | 9 |
| tpl_cycle | 8 |
| tpl_steps | 8 |
| tpl_pillars | 8 |
| tpl_hourglass | 8 |
| tpl_wave | 8 |
| tpl_burst | 8 |
| center | 7 |
| between | 7 |
| up | 7 |
| tpl_mountain | 7 |
| below | 6 |
| organic | 6 |
| tpl_pyramid | 6 |

| event | rows |
|---|---|
| move | 5770 |
| arrange | 1577 |
| align | 708 |
| distribute | 630 |
| toFront | 540 |
| swap | 461 |
| toBack | 457 |
