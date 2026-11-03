# World `real`: built from 21698 training messages (51584 requests with a span)

WORLD_EVENTS=delete,duplicate,group,label,rename,ungroup: only the rows of these events; the legend lists only these events.

FRONT_ROWS=world: the front end below is learned only from the 3909 requests of this world's events.

Front end learned from the same messages: 127 value n-grams, 487 trigger rules, 0 segmenter weights; params {"seg_epochs": 8, "val_min_count": 5, "val_min_prec": 0.8, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}.

Rows: 3909. Dropped (cannot be trained): 0 {}. Negative examples (text outside the spans with an action token): 0.

Kinds: 64; lexicon 680 words (legend value tokens 389, event tokens 60, other words from the kind map KINDMAP=diagnosis_kinds/kinds_comb1.json (sha256:fb77122986c8dfe24bc3301b85ae13cba5b1fb701e3aa848b7e1cea10d4201bd): 231 words).

Own-kind tokens: a, and, are, called, directly, it, labeled, lines, named, of, the, to, with

Shared kinds (kind: words): c10_three: cars copies counter desks exits four other platforms tables three; c11_what: course give list put remaining show stack tell what whether; c12_that: anywhere everything her him my that that's those whatever; c13_one: dish one part player ride switch table there these; c14_uh: mean must no section shop tall uh um wait; c15_on: against along around behind evenly into on side; c16_new: new nodes second team things two; c17_be: be can get reachable reached still stops; c18_does: devices does every how if push; c19_goes: go goes should simple sit; c1_have: aren't at board chart do exist front have isn't larger like long not once plan relative very we; c20_arrow: arrow arrows axis together; c21_arrowheads: arrowheads; c22_from: from starting; c23_in: in; c24_line: line; c25_pixels: pixels; c26_shape: shape; c27_them: them; c2_now: altogether animal before besides bit canvas chalet change defaults diagram here now set style thing total undid; c3_rules: about active again boards connections default earlier last mugs old ones previous rules shrink this whole; c4_then: already boxes connected connection cycle each link linked or pointing position remove size then yet; c5_me: actually any check create fixtures floors its just me name place point sits you; c6_both: back both feeds leads links out picture please reviewers sends through trucks ways; c7_i: box corner far for i map more page route screen shapes so stage; c8_what's: could count find has node piece stop there's what's who who's; c9_an: an as but by close know loop thick too well

Values left out per legend question kind (value tokens not in the normalized span; rows kept): values 89 {"COLOR": 27, "KIND": 1, "NOLABEL": 40, "NOTCOLOR": 7, "NUM": 2, "RECENT": 12}; event token not found 99; references 368

Roles left out because their words are not in the normalized span (rows kept):

| what | n |
|---|---|
| head | 182 |
| event token not found | 99 |
| name | 62 |
| no_label | 40 |
| description | 31 |
| $new | 15 |
| newest | 8 |
| several | 5 |
| blue | 5 |
| purple | 4 |
| oldest | 4 |
| t_beta | 4 |
| t_start | 4 |
| t_payment | 3 |
| indigo | 3 |
| pink | 3 |
| t_upload | 3 |
| t_one_half | 2 |
| white | 2 |
| cyan | 2 |
| navy | 2 |
| brown | 2 |
| teal | 2 |
| t_pass | 2 |
| not_white | 2 |
| t_3_14 | 1 |
| t_2_71 | 1 |
| n_museum_piece | 1 |
| t_in_progress | 1 |
| t_validated | 1 |
| t_stripe | 1 |
| t_keyboards | 1 |
| t_room_204 | 1 |
| t_dna_container | 1 |
| t_year_end | 1 |
| t_pending | 1 |
| t_eye_wash | 1 |
| t_draft | 1 |
| t_park_entrance | 1 |
| t_1 | 1 |

| event | rows |
|---|---|
| delete | 1133 |
| label | 1036 |
| duplicate | 767 |
| rename | 742 |
| group | 173 |
| ungroup | 58 |
