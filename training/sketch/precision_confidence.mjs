// precision_confidence.mjs: the VSS combined confidence computed from precision_thresholds.json alone (no other module of the repository).
// A browser port reproduces this function. Input: the raw stage signals `f` of one produced request (the `f` of vss_confidence.mjs records,
// i.e. what the composer wrapper observes) and the name of the chosen world `w`. Output: the confidence in (0, 1), execute when >= threshold.
// The percentile of a signal = (number of held-out values below + half of those equal) / n, on the held-out values oriented so that higher =
// more confident; a missing signal (null / undefined) counts as 1 ("nothing to doubt"); a binary signal is 0/1.
export function percentile(tab, x) {
  if (x == null) return 1;
  const y = x * tab.sign;
  if (tab.binary) return tab.sign > 0 ? (y > 0 ? 1 : 0) : (y > -0.5 ? 1 : 0);
  const u = tab.values, below = tab.below, n = tab.n;   // u: sorted distinct values; below[i]: held-out values strictly below u[i]; below[u.length] = n
  let lo = 0, hi = u.length; while (lo < hi) { const m = (lo + hi) >> 1; if (u[m] < y) lo = m + 1; else hi = m; }
  const nb = lo < u.length ? below[lo] : n, eq = lo < u.length && u[lo] === y ? (lo + 1 < u.length ? below[lo + 1] : n) - below[lo] : 0;
  return n ? (nb + eq / 2) / n : 0.5;
}
export function vssCombinedConfidence(spec, f, w) {
  let z = spec.intercept;
  for (const s of spec.features) {
    const x = s.name === "world_prior" ? (spec.world_prior[w || "none"] ?? spec.world_prior_default) : (f || {})[s.name];
    z += s.weight * percentile(spec.tables[s.name], x);
  }
  return 1 / (1 + Math.exp(-z));
}
