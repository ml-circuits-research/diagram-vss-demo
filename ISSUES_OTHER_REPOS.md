# Issues observed in the other repositories

This repository copies what it needs from ml-circuits-research/vss-demo (training/vss, docs/js/vss*) and changes its own copies. The
problems below were found while doing so; they are recorded here, not fixed in those repositories. Each says where it is, what happens,
the evidence, and what this repository did.

## vss-demo (9c85649)

### 1. Attribute and determiner thresholds are never fitted for roles present in under half of the sentences
- **Where:** `tool/sop/train.py`, `calibrate()` (around line 507).
- **What:** the calibration read decides each role's presence by its TRAINING RATE (no presence thresholds exist yet at that point). A
  role filled in fewer than half of the sentences (landmark, source, target, edge) is read as absent, so its attribute and determiner
  ratios are never measured, the role gets no `attr_presence` / `det_presence` threshold, and at inference its colour and determiner are
  read only when the role's attribute rate is at least 0.5, i.e. never. "connect the brown circle to Home" reads source = circle.
- **Evidence:** sketch world, same 8000 sentences, same seed: FULL on held-out formulations / held-out sentences / new identities 0.773 /
  0.848 / 0.813 without the fix, 0.894 / 0.902 / 0.907 with it (training/sketch/runs/sketch_n8000_D1024_e2_s0 and ..._calattr). The vss-demo
  `app/model/diagram` config has thresholds for `object` only, so its diagram world is probably affected the same way.
- **Here:** `training/sketch/patches/vss-demo_calibrate_attr_all.patch`, applied in `training/vss/tool/sop/train.py`: the ratios are read
  with `presence="all"` on the calibration rows whose gold fills the role.

### 2. Offers leave roles empty
- **Where:** the reader (`tool/sop/infer.py`, `app/src/vss/reader.js`), `_offer.<role>`.
- **What:** when a role's presence ratio is under its threshold but an unplaced word fits exactly one empty role, the role stays empty
  and the word is offered. In the vss-demo app the person confirms; a program that uses the wires as they are loses the role.
- **Evidence:** first sketch model, generated sets: 83.7 / 78.0 / 92.3% without accepting offers, 97.7 / 93.0 / 96.0% with them.
- **Here:** `docs/js/vss-adapter.js` accepts offers and History lists each accepted one.

### 3. The default star version and binary model files
- `sop train` defaults to `--star_version 1`, whose word identities cannot be reproduced in the browser for words outside the catalog;
  browser models need `--star_version 2` (documented in app/READER.md, easy to miss).
- The exported model is `.bin` files; hosts that serve only standard web types (the claude.ai artifact host) refuse them. Here the
  loader falls back to base64 text parts (`bin-parts.json`), with the manifest's sha256 still checked.

### 4. Route book size grows with the square of the number of kinds
- `bigram`, `A` and `L` are kinds × kinds × D phase tables (here 68 × 68 × 1024 each, 14.2 of the 14.35 MB). Every function word with a
  kind of its own adds a row and a column to all three. Kind pairs that never occur in training keep their seeded initial value, so they
  could be regenerated from the seed instead of stored (not done yet).

## vsa-semantic-space (frozen paper repository)

Nothing changed or copied from it directly (training/vss comes from vss-demo, which imported it at e531283).

### 5. Set roles of entities and the browser reader
- `tool/sop/train.py` `build_schema()`: a set role whose members are entities (`members=$a & $b`, lists of shapes) gets no `head_kinds`,
  because only fillers of shape `entity` are counted; reading the role then fails with `KeyError: 'head_kinds'`. Patched here
  (training/vss/tool/sop/train.py, "diagram-vss-demo patch"): the members of set fillers count as entities.
- `app/src/vss/reader.js` refuses worlds with set roles ("not ported"). Ported here (docs/js/vss/reader.js `readSetRole`, the frame ->
  wires step writes `$a & $b`).

### 6. Set roles ignore their presence threshold; set members lose their order
- `tool/sop/infer.py` `read_set_role` (and the reader): a set role is "present" as soon as one candidate passes the member threshold;
  the role's presence threshold (calibrated on the same ratio) is never applied. Patched here in training/vss and docs/js/vss.
- A set filler is sorted (json order), so the members' order in the sentence is lost; for lists whose order matters (chains) the
  order must come from the text positions (done here in docs/js/vss-adapter.js).
