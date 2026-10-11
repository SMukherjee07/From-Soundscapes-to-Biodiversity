export const fmt = (x: number, d = 2) => x.toFixed(d);
export const ticks = (min: number, max: number, n = 5) =>
  Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n);
const c2 = (x: number) => (x * (x - 1)) / 2;
export function crosstab(a: number[], b: number[]) {
  const ua = Array.from(new Set(a)).sort((x, y) => x - y);
  const ub = Array.from(new Set(b)).sort((x, y) => x - y);
  const m = ua.map(() => ub.map(() => 0));
  a.forEach((v, i) => { m[ua.indexOf(v)][ub.indexOf(b[i])] += 1; });
  return { rows: ua, cols: ub, m };
}
export function ari(a: number[], b: number[]) {
  const { m } = crosstab(a, b);
  const n = a.length;
  const sumComb = m.flat().reduce((s, v) => s + c2(v), 0);
  const sumA = m.reduce((s, r) => s + c2(r.reduce((x, y) => x + y, 0)), 0);
  const sumB = m[0].map((_, j) => m.reduce((s, r) => s + r[j], 0)).reduce((s, v) => s + c2(v), 0);
  const expected = (sumA * sumB) / c2(n);
  const max = (sumA + sumB) / 2;
  return max === expected ? 0 : (sumComb - expected) / (max - expected);
}
