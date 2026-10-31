# Proposal: centre attention for VSS (one page)

Status: measured on synthetic worlds by two independent implementations (A, B), 31 October 2026. Not yet tried on real messages.
Nothing here is in the real tool yet; the learned parts need the owner's approval.

## The idea, in plain words

Every action word of a text is the centre of its own VSS constellation. Every other word joins at most the nearest centre on each
side, with a learned weight, and is written at a position counted FROM ITS CENTRE (not from the start of the text). A word that
belongs to no centre is handed back as a zone "I did not understand this", for another world to try. One pass over the text,
one fixed-size vector per centre: the cost grows linearly with the length.

## What the two implementations found (test, 2 seeds each)

| | A | B | agree? |
|---|---|---|---|
| perfect cut + standard reader (reference) | 99.4% | 100% | yes |
| no cut, one state for the whole message | 32.9% | 27.5% | yes: one constellation per message does not work |
| today's hard centres | 89.3% | 84.9% | yes |
| centre-relative positions, gold attachment | 100% | 99.3% (100% with phases keyed by the centre's kind) | yes |
| learned attachment (no rejection of false centres) | 99.8%, 9.3 extra requests per 100 | 98.2%, 3.7-4.0 per 100 | yes on accuracy; both fail on extras |
| + learned "null" probability per word (B, E3b) | - | 98.1%, 0.1-0.2 per 100 | extras solved |
| + attachment also trained on the annotated spans (B, E3c/E3d) | - | 98.5-99.6%, zones F1 0.91 | zones solved |
| confidence threshold instead of null (B, E3a) | - | 96.3%, fails | null is the better way |
| train on 1-2 requests, test on 3-4 | 99.7%, no drop | at most -0.5 points | yes |
| two worlds: B recovers its requests from A's zones | - | 92.5% of its gold-cut level (threshold 80%); 99.8% when A is trained with B's requests as "not mine" | - |
| cost, 1 000 -> 100 000 tokens | linear (time x104) | linear up to 1M tokens (33-47 microseconds per token) | yes |

What the learned weights found by themselves (A): "." and "then" separate requests; "," and "and" do not (they also occur inside
requests).

## Proposed architecture (to port to the real VSS)

1. Centres: the action words (the learned triggers) - each one a constellation.
2. Attachment: every word to at most the nearest centre on each side; weight = learned function of (word kind, centre kind, side,
   distance, a learned cost of each word in between). Linear.
3. Addresses relative to the centre (generalising the existing beacon-relative emitters), phases keyed by the centre's kind.
4. A learned null probability per word: false centres (action words inside chatter) and chatter get no state.
5. Training targets: one per annotated request (the same frames as today), plus the annotated spans as a target for the attachment.
6. Output: the formalizations AND the zones no centre explains; zones go to the other worlds through the existing dispatcher;
   each world trained with other worlds' requests as negatives ("not mine": the existing R81 mechanism).

New learned components needing approval: the attachment weights (2), the null probability (4), the span loss (5).

## Cost of the port

About 400-700 lines in Python (trainer, reader) and in the browser reader, plus retraining (C_existing_mechanisms.md section 4);
chainL must be rewritten to be linear (derivation in section 5 there, untested).

## Risks and what is not shown

- The synthetic worlds are easy: the perfect cut reads 99-100% there and 52% on real messages. What carries over is the mechanism and
  its failure modes, not the numbers. The real test: the same held-out training messages as before (50.4% with the tagger cut, 52.2%
  with the perfect cut, 41.7% with hard centres).
- B changed its world once (chatter may mention a value word) after the first baseline; numbers are from the second version.
- B's E3d (phases keyed by the centre's kind) was designed after an error analysis of E3c, on dev/test of the synthetic world.
- Memory: A's implementation needs ~8.5 KB per token (8.5 GB for 1M tokens); B's streaming version 1.8 KB per token.

## Suggested next step

Port 1-6 to the real VSS world `real` and measure on the held-out training messages against 50.4% (tagger cut) and 52.2% (perfect cut),
thresholds fixed beforehand. This also tests whether VSS reading itself improves, which is the larger gap to the rules (69.7%).
