# Micro-world round 1 (composer: cutter + 16 micro-worlds + fallback kinds_p80_s0)

Scratch folder with all logs: `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/mw` (greedy.txt, comp_*.txt, fit_*.txt, ea_*.txt, STATUS.txt).
All numbers are on the data the worlds are trained on (owner's rule: no hidden test set). Eval sets: review, msg2, long, fresh1 = 1531 messages, 8112 gold wires.

## Coordinator decision after review (2026-11-01): check removed from the registry

Re-run by the coordinator (same 4 sets, 1531 messages): with check, per message 21.0 / 23.6 / 55.3 (wrong 847), per request
63.7 / 21.8 / 14.5, 386 extra. Without check, per message 23.3 / 20.7 / 56.0 (wrong 857), per request 65.3 / 20.2 / 14.5, 417 extra.
Done wrong per request is the same (14.5); the 10 fewer wrong messages come only from 31 fewer extra wires, while 35 messages stop
being right and per-request correct falls 1.6 points. The check world is known to be defective (the shared micro front loses the
`is` -> `is_q` trigger rule, see the diagnosis below; on its own rows it reads 62.1% vs 84.9% for the big model). So check stays with
the fallback until its front end is fixed. Final registry: 15 worlds; the fallback now reads 549 units (the check questions).

Per set, final registry (per message right / honest / wrong; per request correct / not done / done wrong, extra):
review 33.2 / 14.6 / 52.2; 70.6 / 15.3 / 14.1 (36) · msg2 16.3 / 33.0 / 50.6; 56.0 / 34.2 / 9.8 (65) ·
long 0.0 / 2.2 / 97.8; 51.6 / 27.6 / 20.8 (40) · fresh1 23.5 / 20.2 / 56.3; 67.1 / 18.1 / 14.7 (276).
For comparison, the hand-written rules on the same 4 sets: per message 26.0 / 6.7 / 67.3; per request 71.3 / 13.4 / 15.4, 1235 extra.
All worlds are trained on these messages (owner's rule: no hidden test set); this measures how well they read their own data.
The test copy docs/model/micro/cutter_spans.json was removed (not better; reproducible with train_cutter.py plus the two spans folders).

## Worlds: fit on own gold requests (correct / not done / done wrong) vs the big model kinds_p80_s0 on the same rows

| world | events | rows | micro | big model | kept in composer |
|---|---|---|---|---|---|
| history | undo,redo,forget,cycle | | 95.3/4.7/0.0 | 81.7/18.3/0.0 | yes |
| targets | delete,duplicate,toFront,toBack | | 80.2/8.9/10.9 | 67.0/24.3/8.6 | yes (wrong share falls) |
| create | create | | 66.2/19.4/14.5 | 50.5/27.5/22.0 | yes |
| move | move | | 64.0/7.8/28.2 | 45.8/20.8/33.4 | yes |
| resize | resize | | 61.1/18.5/20.4 | 68.7/8.5/22.7 | yes |
| disconnect | disconnect | | 64.0/28.0/8.0 | 51.3/40.0/8.7 | yes (second pass; first pass: neither wrong nor right changed) |
| naming | rename,label | | 81.2/4.4/14.3 | 80.0/6.7/13.3 | yes |
| layout | arrange,align,distribute | | 49.3/8.1/42.6 | 43.3/16.6/40.1 | yes |
| describe | describe,property,neighbors,degree | | 86.5/8.9/4.7 | 66.0/30.7/3.4 | yes |
| facts | fact,rule | | 79.0/17.3/3.7 | 76.4/17.5/6.1 | yes |
| check | check | 875 | 62.1/30.6/7.3 | 84.9/5.0/10.1 | yes, second pass only (see note) |
| graph | path,reachable,connected | | 88.3/7.0/4.7 | 42.7/49.2/8.0 | yes |
| filters | count,exists,list | | 59.2/17.9/22.9 | 50.8/25.6/23.6 | yes |
| superlatives | extreme,nearest | | 96.6/1.3/2.0 | 93.5/4.3/2.2 | yes |
| set | set | 3142 | 66.5/18.6/14.9 | 65.8/20.4/13.7 | yes |
| connect | connect | 2696 | 43.8/9.4/46.8 | 20.3/29.9/49.7 | yes (largest gain) |
| connect_single | connect (one from, one to) | 946 | 64.1/14.3/21.7 | 29.8/33.9/36.3 | no |
| connect_lists | connect (a list on a side) | 809 | 54.9/7.3/37.8 | 2.0/32.6/65.4 | no |
| connect_chain | connect (chains, all to each other) | 941 | 37.6/5.4/57.0 | 27.8/23.6/48.6 | no |

No world reaches the 90% fit of the skill; only history, superlatives, graph (88) and describe (86.5) come close.
`connect` fits under 70%, so the three split worlds were trained (ROW_SHAPE=single|lists|chain). The composer registers two worlds with the same event without error (the key decides, ties go to the earlier one in the registry), but the split worlds did not beat plain connect (below).

## Greedy pass (rule: keep if per-message wrong falls, or stays equal with right rising, and per-request done wrong does not rise)

Order: by how much the world beats the big model on its own rows (done wrong first, then correct). Base: per message 16.1 / 10.8 / 73.1 (wrong 1119), per request 59.2 / 20.5 / 20.3. Full lines in greedy.txt.

| step | world | kept | per message right/honest/wrong (wrong n) | per request correct/not done/done wrong |
|---|---|---|---|---|
| 1 | create | yes | 16.5/11.1/72.4 (1108) | 59.3/20.7/20.0 |
| 2 | move | yes | 16.9/12.2/70.9 (1085) | 60.3/21.1/18.6 |
| 3 | graph | yes | 17.4/14.1/68.5 (1048) | 62.4/19.3/18.2 |
| 4 | check | no | 15.5/16.7/67.8 (1038) | 60.7/21.0/18.3 (done wrong rose) |
| 5 | facts | yes | 17.4/14.6/67.9 (1040) | 62.3/19.6/18.1 |
| 6 | resize | yes | 17.4/14.7/67.9 (1039) | 62.3/19.6/18.1 |
| 7 | disconnect | no | 17.4/14.7/67.9 (1039) | 62.4/19.6/18.0 (nothing changed) |
| 8 | filters | yes | 17.6/15.2/67.2 (1029) | 62.4/19.6/18.0 |
| 9 | superlatives | yes | 17.6/15.3/67.1 (1028) | 62.4/19.6/18.0 |
| 10 | history | yes | 17.7/15.2/67.1 (1028) | 62.7/19.3/18.0 |
| 11 | describe | yes | 17.6/15.6/66.8 (1022) | 62.7/19.3/18.0 |
| 12 | naming | yes | 17.8/15.7/66.6 (1019) | 62.6/19.4/18.0 |
| 13 | targets | yes | 17.8/15.7/66.4 (1017) | 62.6/19.4/17.9 |
| 14 | layout | yes | 17.8/15.9/66.2 (1014) | 62.5/19.6/17.8 |
| 15 | set | yes | 17.8/18.0/64.2 (983) | 62.4/19.8/17.8 |
| 16 | connect | yes | 23.3/20.6/56.0 (858) | 65.3/20.2/14.5 |
| 17 | disconnect (2nd pass) | yes | 23.3/20.7/56.0 (857) | 65.3/20.2/14.5 |
| 18 | check (2nd pass) | yes | 21.0/23.6/55.3 (847) | 63.7/21.8/14.5 |
| 19 | connect_single next to connect | no | 21.0/23.6/55.4 (848) | 63.7/21.8/14.5 |
| 20 | connect replaced by single+lists | no | 19.9/22.5/57.5 (881) | 63.1/21.8/15.1 |
| 21 | connect replaced by single+lists+chain | no | 20.7/23.4/55.8 (855) | 63.6/21.8/14.6 |
| 22 | single+lists+chain in front of connect | no | 20.8/23.4/55.7 (853) | 63.6/21.8/14.6 |

Note on check (step 18): by the rule it is kept (wrong 857 -> 847), but right falls 357 -> 322 and per-request correct falls 65.3 -> 63.7 (answers move from right to "asked"). It is the cost of the micro front issue below. Drop it by hand if "correct" weighs more than "wrong".

## Final composer (registry: the 16 kept worlds, current cutter) vs base (no worlds)

| set | n | base per message R/H/W | final per message R/H/W | base per request C/ND/DW (extra) | final per request C/ND/DW (extra) |
|---|---|---|---|---|---|
| review | 253 | 18.6/7.1/74.3 | 32.0/16.2/51.8 | 64.4/15.4/20.2 (77) | 70.1/15.9/14.0 (36) |
| msg2 | 233 | 13.3/22.7/63.9 | 15.0/37.3/47.6 | 50.7/35.0/14.3 (107) | 54.9/35.3/9.8 (52) |
| long | 45 | 0.0/2.2/97.8 | 0.0/2.2/97.8 | 44.9/26.6/28.5 (65) | 50.5/28.9/20.6 (39) |
| fresh1 | 1000 | 16.9/9.3/73.8 | 20.6/23.3/56.1 | 60.8/18.6/20.6 (540) | 65.1/20.1/14.8 (259) |
| ALL | 1531 | 16.1/10.8/73.1 | 21.0/23.6/55.3 | 59.2/20.5/20.3 (789) | 63.7/21.8/14.5 (386) |

Units read per world (composer units line, 8286 units): move 866, connect 872, set 1421, graph 405, superlatives 490, filters 474, check 348, describe 246, naming 250, targets 239, layout 218, history 187, create 166, facts 426, resize 52, disconnect 31; the fallback kinds_p80_s0 reads only 35. Ignored (no world reads them): 1495 (1000 have no action token); asked: 65. So the fallback is nearly empty; what is left is the "ignored" zone (units that every candidate calls unreadable, up from 1048 with only the fallback).

## Cutter comparison (final registry)

| cutter | per message R/H/W | per request C/ND/DW (extra) |
|---|---|---|
| current (micro/cutter.json) | 21.0/23.6/55.3 (wrong 847) | 63.7/21.8/14.5 (386) |
| candidate (micro/cutter_spans.json, trained with sonnet_spans + haiku_spans) | 21.1/23.3/55.6 (wrong 851) | 63.8/21.6/14.6 (403) |

The candidate is not clearly better (wrong +4, extra +17); the registry keeps the current cutter. With 13 worlds (before connect) the candidate was marginally better (18.2/17.6/64.1 vs 17.8/18.0/64.2). The file docs/model/micro/cutter_spans.json is a test copy.

## Diagnosis: check has 268 of 875 rows with status unknown-event

Cause: the micro front end (front.json, learned from 3640 messages, DATA=everything; every micro world gets the same one), not the legend filter and not the data labels.
- 249 of the 268 units start with a bare `is` (6 `does`, 4 `check`, 3 `tell`, 6 others); in all of them `is` stays `is` instead of `is_q`, so the reader sees no event token (unknown-event).
- The trigger rule (`is`, prev=B, next=NAME) -> `is_q` is missing in the micro front. front.py keeps a rule only if precision >= 0.6: counted over the 3640 messages, `is` at a boundary before a name is the annotated trigger of 145 check spans (137 is_q) but also occurs, with another event's own trigger elsewhere, in 241 connected_q, 152 path_q, 78 extreme_q, 6 neigh_q, 3 degree_q spans ("Is A connected to B"): precision at most 145/(145+481) = 0.23. The big model's front was learned from 947 messages, where the same rule has n=29, precision 0.617, so it survives and the big model reads these units.
- Examples: "Is Rb to the left of Qb already" -> `[is n_rb left_of of n_qb already]`; "Is Start green by any chance" -> `[is n_start green by any chance]`; "Is Floor3 above Floor2" -> `[is n_floor3 above n_floor2]`; (also "Does Shed exist as a hexagon").
- Not a bug in our code: the threshold works as designed and is data-size dependent. In the composer the router uses the fallback's front end for action tokens, but each world reads the unit with its own front (readIn), so check still suffers. Options (not done): a per-world front learned only from the world's events (the fp count then drops), or a context-dependent rule. Worth a separate measured step.

## Problems in skills/vss-microworlds/SKILL.md

1. Step 6 asks for a fit >= 90%: no world reached it (best 96.6 and 95.3; most 50-80); the gate cannot decide anything, and the real decision is the composer step 7. Say so, or define the gate on "better than the big model on the same rows".
2. Step 7 "wrong share falls and correct rises" is ambiguous: per message or per request? correct of which? check and disconnect showed the cases where the criteria disagree (wrong falls, correct falls). Needs an explicit rule (this round: per-message wrong falls, or equal with right rising, and per-request done wrong does not rise).
3. Step 5 names run_curve.sh / `sop train` directly; the real entry is training/sketch/train_micro.sh (not mentioned), with DATA=everything needed to match the eval data; the front.json inside every micro world is shared and learned from all messages (not from the world's events), which is the cause of the check problem; this is not in the skill.
4. No step builds the "gold" rows per world (own requests with spans) or the big-model column; llm_score.mjs SEG=gold / error_analysis.mjs usage and MODEL=micro/<w> are missing.
5. The greedy/ordering method is absent: a world added alone to the composer can look neutral (history alone: wrong equal) but helps in combination (connect+set gave the big gain); order matters, and the registry order decides ties between worlds of the same event.
6. The 6 GB RSS budget: measured peak 1.5-3.2 GB per training; two at once is the practical limit on 8 GB; training takes 1.5-2 h for the big worlds (set, connect), plus up to 1.5 h of post-training evaluation for connect that looks like a hang. Add the expected time.
7. Never use `pgrep -f` here (it matches its own shell); give the `ps -eo rss,args | grep "sop train" | grep -v grep` recipe.
8. Refers to skills `llm-annotated-data` and `agent-experiments` that are not available in this setup; step 2 asks for worlds_micro/PROPOSAL_<date>.md but no template.
9. The composer reports "ignored" units (1495) as the new residue; the skill does not say where those go (glue worlds are step "later") and the report in step 8 should include them.
10. Splitting a world (ROW_SHAPE) is documented only in msg_to_world.py; the skill should say when to split (fit < ~70%) and that a split did not help here (single/lists/chain fit better alone but the composer got worse).

## Files
docs/model/micro/registry.json (16 worlds), docs/model/micro/{set,connect,connect_single,connect_lists,connect_chain}/ (new models), docs/model/micro/cutter_spans.json (test copy), training/sketch/worlds_micro/{set,connect,connect_single,connect_lists,connect_chain}/, training/sketch/runs/micro_{set,connect,connect_single,connect_lists,connect_chain}_* , this file.
