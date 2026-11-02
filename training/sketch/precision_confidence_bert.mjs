// precision_confidence_bert.mjs: the SOP-BERT fitted confidence computed from precision_thresholds_bert.json alone (no other module).
// A browser port reproduces these functions. Execute a request when confidence >= spec.threshold.
//
// Input of bertConfidence(spec, f, act): the signals `f` of one produced request (an object name -> number | null; the extraction from the
// model outputs is in precision_bert_collect.mjs, function `features`) and the name of the act the request was read as.
//   z = intercept + sum(weight_i * percentile_i);  confidence = 1 / (1 + exp(-z))
//   percentile_i: x = the signal (act_prior: spec.act_prior[act], else spec.act_prior_default); null / undefined -> 1 ("nothing to doubt");
//   y = x * sign; binary table (values in {0, 1}) -> (sign > 0 ? y > 0 : y > -0.5) ? 1 : 0; else (count of fitting values < y + half of
//   those equal) / n, on the fitting split's oriented values (tables[name]: n, sign, binary, values = sorted distinct oriented values,
//   below = number of fitting values strictly below each distinct value).
// Input of bertTemperatureConfidence(spec, heads): heads = [[family, logits, index]], the heads that enter SOP-BERT's minimum
//   (act, value, fill, tag, desc); confidence = min over heads of softmax(logits / T[family])[index].
export function percentile(tab, x) {
  if (x == null) return 1;
  const y = x * tab.sign;
  if (tab.binary) return tab.sign > 0 ? (y > 0 ? 1 : 0) : (y > -0.5 ? 1 : 0);
  const u = tab.values, below = tab.below, n = tab.n;
  let lo = 0, hi = u.length; while (lo < hi) { const m = (lo + hi) >> 1; if (u[m] < y) lo = m + 1; else hi = m; }
  const nb = lo < u.length ? below[lo] : n, eq = lo < u.length && u[lo] === y ? (lo + 1 < u.length ? below[lo + 1] : n) - below[lo] : 0;
  return n ? (nb + eq / 2) / n : 0.5;
}
export function bertConfidence(spec, f, act) {
  let z = spec.intercept;
  for (const s of spec.features) {
    const x = s.name === "act_prior" ? (spec.act_prior[act] ?? spec.act_prior_default) : (f || {})[s.name];
    z += s.weight * percentile(spec.tables[s.name], x);
  }
  return 1 / (1 + Math.exp(-z));
}
export function bertTemperatureConfidence(spec, heads) {
  let c = 1;
  for (const [fam, l, i] of heads) {
    const T = spec.T[fam] ?? spec.T.all, mx = Math.max(...l);
    let z = 0; for (const v of l) z += Math.exp((v - mx) / T);
    c = Math.min(c, Math.exp((l[i] - mx) / T) / z);
  }
  return c;
}
