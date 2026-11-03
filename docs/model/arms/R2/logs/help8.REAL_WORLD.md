# World `real`: built from 22267 training messages (52029 requests with a span)

WORLD_EVENTS=help: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 804 requests of this world's events.

Front end learned from the same messages: 98 value n-grams, 234 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 793. Dropped (cannot be trained): 11 {'no event token and no role (zero target)': 11}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 680 words (legend value tokens 389, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 293 {"ASPECT": 125, "TOPIC": 168}; event token not found 14; references 114

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| about | 114 |
| asp_can | 90 |
| asp_values | 16 |
| asp_overview | 16 |
| event token not found | 14 |
| tp_connections | 13 |
| tp_text | 12 |
| tp_template | 11 |
| tp_move | 7 |
| tp_delete | 6 |
| tp_create | 6 |
| tp_layer | 5 |
| tp_resize | 5 |
| tp_hexagon | 5 |
| tp_redo | 5 |
| tp_align | 4 |
| tp_label | 4 |
| tp_equalize | 4 |
| tp_wave | 4 |
| tp_fit | 4 |
| tp_gray | 4 |
| tp_fill | 4 |
| tp_ellipse | 4 |
| tp_groups | 4 |
| tp_respace | 4 |
| tp_flip | 3 |
| tp_purple | 3 |
| tp_blue | 3 |
| tp_teal | 3 |
| tp_yellow | 3 |
| tp_magenta | 3 |
| tp_connect | 2 |
| asp_how | 2 |
| tp_queries | 2 |
| tp_outline | 2 |
| tp_reachable | 2 |
| tp_hierarchy | 2 |
| tp_to_front | 2 |
| tp_matrix | 2 |
| tp_shape | 2 |

| event | rows |
|---|---|
| help | 793 |
