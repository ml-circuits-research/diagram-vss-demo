# World `real`: built from 22267 training messages (52029 requests with a span)

WORLD_EVENTS=connect,disconnect,reverse: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 6507 requests of this world's events.

Front end learned from the same messages: 106 value n-grams, 912 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 6506. Dropped (cannot be trained): 1 {'no event token and no role (zero target)': 1}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 680 words (legend value tokens 389, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 865 {"ARROW": 18, "COLOR": 6, "PAIR": 809, "QUANT": 3, "RECENT": 8, "STYLE": 21}; event token not found 310; references 1091

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| chain | 806 |
| name | 765 |
| event token not found | 310 |
| edge | 110 |
| head | 51 |
| $new | 42 |
| two_way | 18 |
| description | 14 |
| dotted | 11 |
| dashed | 10 |
| newest | 6 |
| t_start | 3 |
| all | 3 |
| t_ok | 2 |
| t_timer | 2 |
| t_result | 2 |
| t_sync | 2 |
| t_orbit | 2 |
| next | 2 |
| cyan | 2 |
| oldest | 2 |
| t_crash | 1 |
| t_reads | 1 |
| t_fail | 1 |
| t_batch | 1 |
| t_42 | 1 |
| t_paid | 1 |
| t_batched | 1 |
| t_light | 1 |
| t_assign | 1 |
| t_over | 1 |
| t_write | 1 |
| t_ten_minutes | 1 |
| t_card | 1 |
| t_arrive | 1 |
| t_ignore | 1 |
| t_red | 1 |
| t_cold | 1 |
| t_warm | 1 |
| t_subtract | 1 |

| event | rows |
|---|---|
| connect | 5945 |
| disconnect | 503 |
| reverse | 58 |
