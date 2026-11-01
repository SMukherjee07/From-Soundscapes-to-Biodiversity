import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useJson } from '../analysis/useJson';
import './research-viz.css';

/* ---------- data ---------- */
type Conf = number[][];
type Final = { model: string; n: number; correct: number; accuracy: number; balanced: number; macroF1: number; logLoss: number; brier: number; confusion: Conf; perClass: Record<string, { precision: number; recall: number; f1: number; support: number }> };
type Viz = {
  states: string[]; final: Final[]; dev: Record<string, { accuracy: number; macroF1: number }>; devConfusion: Record<string, Conf>;
  mnbFolds: { bins: number; alpha: number; folds: number[]; n: number[]; mean: number }[];
  pruning: { alpha: number; f1: number; sd: number; leaves: number; trainF1: number }[];
  rootFeatures: Record<string, Record<string, number>>; treeMeta: Record<string, { f1: number; sd: number; leaves: number; depth: number; trainF1: number }>;
  evidence: { classes: string[]; logPrior: number[]; trainN: number[]; prob: number[]; tokens: string[]; ll: Record<string, number[]> };
  workedSplit: { node: string; n: number; CA: number; AZ: number; TX: number; entropy: number; gini: number }[];
  vocab: number; partition: { dev: Record<string, number>; test: Record<string, number> };
};
const SC: Record<string, string> = { CA: '#b4533a', AZ: '#a77b16', TX: '#1f7a74' };
const INK = '#243728', MUTE = '#6b6a50', PAPER = '#f5ecd5';
const pct = (x: number, d = 1) => (x * 100).toFixed(d) + '%';
const f3 = (x: number) => x.toFixed(3);
const NB = ['Multinomial NB', 'Bernoulli NB', 'Gaussian NB'], DT = ['Gini_depth3', 'Entropy_depth5', 'Gini_pruning_0.02'];
const LABELS: Record<string, string> = { Gini_depth3: 'Gini · depth 3', Entropy_depth5: 'Entropy · depth 5', 'Gini_pruning_0.02': 'Gini · pruned α = 0.02' };
const label = (m: string) => LABELS[m] ?? m;

function Shell({ title, sub, children, id }: { title: string; sub?: string; children: ReactNode; id?: string }) {
  return <figure className="rv" id={id}><figcaption className="rv-head"><b>{title}</b>{sub && <span>{sub}</span>}</figcaption>{children}</figure>;
}
function Load({ children }: { children: (d: Viz) => ReactNode }) {
  const { data, error } = useJson<Viz>('/research/viz-data.json');
  if (error) return <p className="rv-load">Chart data could not be loaded.</p>;
  if (!data) return <p className="rv-load" aria-busy="true">Loading chart…</p>;
  return <>{children(data)}</>;
}
function Seg({ value, options, onChange, label: l }: { value: string; options: [string, string][]; onChange: (v: string) => void; label: string }) {
  return <div className="rv-seg" role="group" aria-label={l}>{options.map(([v, t]) => <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{t}</button>)}</div>;
}

/* ---------- 1. Development vs final test (dumbbell) ---------- */
function ScoreboardInner({ d, group }: { d: Viz; group: 'nb' | 'dt' | 'all' }) {
  const [metric, setMetric] = useState<'macroF1' | 'accuracy'>('macroF1');
  const models = group === 'nb' ? NB : group === 'dt' ? DT : [...NB, ...DT];
  const base = d.final.find(f => f.model === 'Prior baseline')!;
  const W = 760, rowH = 54, top = 46, left = 190, right = 40, H = top + models.length * rowH + 34;
  const x = (v: number) => left + (v / 0.7) * (W - left - right);
  const bv = metric === 'macroF1' ? base.macroF1 : base.accuracy;
  return <>
    <Seg label="Metric" value={metric} onChange={v => setMetric(v as 'macroF1')} options={[['macroF1', 'Macro-F1'], ['accuracy', 'Accuracy']]} />
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Development out-of-fold versus final held-out test scores for each model, with a prior-class baseline" className="rv-svg">
      {[0, .1, .2, .3, .4, .5, .6, .7].map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={top - 10} y2={H - 30} stroke="#cdbf98" strokeWidth=".8" /><text x={x(t)} y={H - 12} textAnchor="middle" className="rv-tick">{t.toFixed(1)}</text></g>)}
      <line x1={x(bv)} x2={x(bv)} y1={top - 18} y2={H - 30} stroke="#7a5a27" strokeWidth="1.6" strokeDasharray="5 4" />
      <text x={x(bv) + 6} y={top - 24} className="rv-ann">prior-class baseline {bv.toFixed(2)}</text>
      {models.map((m, i) => {
        const fin = d.final.find(f => f.model === m)!, dv = d.dev[m], a = dv[metric], b = fin[metric], y = top + i * rowH + 22, up = b >= a;
        return <g key={m}>
          <text x={left - 14} y={y + 4} textAnchor="end" className="rv-rowlab">{label(m)}</text>
          <line x1={x(a)} x2={x(b)} y1={y} y2={y} stroke={up ? '#1f7a74' : '#b4533a'} strokeWidth="5" strokeLinecap="round" opacity=".5" />
          <circle cx={x(a)} cy={y} r="8" fill={PAPER} stroke={INK} strokeWidth="2.2"><title>{`${m} development out-of-fold ${metric}: ${f3(a)}`}</title></circle>
          <circle cx={x(b)} cy={y} r="8.5" fill={INK}><title>{`${m} final test ${metric}: ${f3(b)}`}</title></circle>
          <text x={x(Math.max(a, b)) + 16} y={y + 4} className="rv-val">{f3(a)} → {f3(b)}</text>
        </g>;
      })}
    </svg>
    <p className="rv-legend"><span className="rv-dot rv-dot--hollow" /> development, pooled out-of-fold (selection-conditioned) <span className="rv-dot" /> final held-out test, 52 recordings, evaluated once</p>
  </>;
}
export const Scoreboard = ({ group = 'all' }: { group?: 'nb' | 'dt' | 'all' }) =>
  <Shell title="From development to the final test" sub="Each bar connects one model's development score to its score on recordings it never touched"><Load>{d => <ScoreboardInner d={d} group={group} />}</Load></Shell>;

/* ---------- 2. Confusion lab ---------- */
function ConfusionInner({ d, group }: { d: Viz; group: 'nb' | 'dt' }) {
  const models = group === 'nb' ? NB : DT;
  const [m, setM] = useState(models[0]), [src, setSrc] = useState<'final' | 'dev'>('final'), [norm, setNorm] = useState<'count' | 'row'>('count');
  const conf: Conf = src === 'final' ? d.final.find(f => f.model === m)!.confusion : d.devConfusion[m];
  const total = conf.flat().reduce((a, b) => a + b, 0), right = conf.reduce((s, r, i) => s + r[i], 0), S = d.states;
  const cell = 108, ox = 92, oy = 52;
  const rec = conf.map((r, i) => r[i] / r.reduce((a, b) => a + b, 0));
  return <>
    <div className="rv-row"><Seg label="Model" value={m} onChange={setM} options={models.map(x => [x, label(x)] as [string, string])} />
      <Seg label="Data" value={src} onChange={v => setSrc(v as 'final')} options={[['final', 'Final test (n = 52)'], ['dev', 'Development OOF (n = 184)']]} />
      <Seg label="Display" value={norm} onChange={v => setNorm(v as 'count')} options={[['count', 'Counts'], ['row', 'Row %']]} /></div>
    <div className="rv-confwrap">
      <svg viewBox={`0 0 ${ox + cell * 3 + 20} ${oy + cell * 3 + 60}`} role="img" aria-label={`Confusion matrix for ${m}`} className="rv-svg rv-conf">
        <text x={ox + cell * 1.5} y="20" textAnchor="middle" className="rv-axis">PREDICTED STATE</text>
        <text transform={`translate(18 ${oy + cell * 1.5}) rotate(-90)`} textAnchor="middle" className="rv-axis">ACTUAL (RECORDED) STATE</text>
        {S.map((s, j) => <text key={s} x={ox + j * cell + cell / 2} y={oy - 10} textAnchor="middle" className="rv-rowlab" fill={SC[s]}>{s}</text>)}
        {conf.map((row, i) => { const rs = row.reduce((a, b) => a + b, 0); return <g key={i}>
          <text x={ox - 12} y={oy + i * cell + cell / 2 + 5} textAnchor="end" className="rv-rowlab" fill={SC[S[i]]}>{S[i]}</text>
          {row.map((v, j) => { const frac = v / rs, on = i === j;
            return <g key={j}><rect x={ox + j * cell + 3} y={oy + i * cell + 3} width={cell - 6} height={cell - 6} rx="10" fill={on ? '#1f7a74' : '#b4533a'} opacity={0.1 + frac * 0.85}><title>{`actual ${S[i]}, predicted ${S[j]}: ${v} (${pct(frac, 0)} of actual ${S[i]})`}</title></rect>
              <text x={ox + j * cell + cell / 2} y={oy + i * cell + cell / 2 + 8} textAnchor="middle" className="rv-cellnum" fill={frac > .45 ? '#fff' : INK}>{norm === 'count' ? v : pct(frac, 0)}</text></g>; })}
        </g>; })}
        <text x={ox} y={oy + cell * 3 + 30} className="rv-ann">Teal diagonal = correct. Rust = confusions.</text>
      </svg>
      <dl className="rv-stats"><div><dt>Accuracy</dt><dd>{pct(right / total)}</dd></div><div><dt>Correct</dt><dd>{right} / {total}</dd></div>
        {S.map((s, i) => <div key={s}><dt style={{ color: SC[s] }}>{s} recall</dt><dd>{pct(rec[i], 0)}</dd></div>)}</dl>
    </div>
  </>;
}
export const ConfusionLab = ({ group }: { group: 'nb' | 'dt' }) =>
  <Shell title="Confusion matrix explorer" sub="Switch model, data and display. Cell colour scales with the share of each actual state."><Load>{d => <ConfusionInner d={d} group={group} />}</Load></Shell>;

/* ---------- 3. Evidence race (worked NB prediction) ---------- */
function EvidenceInner({ d }: { d: Viz }) {
  const e = d.evidence, T = e.tokens.length, [k, setK] = useState(T);
  const raw = useMemo(() => e.classes.map((c, ci) => { let s = e.logPrior[ci]; const out = [s]; e.ll[c].forEach(v => { s += v; out.push(s); }); return out; }), [e]);
  const series = useMemo(() => raw.map(r => r.map((v, i) => v - raw.reduce((a, q) => a + q[i], 0) / raw.length)), [raw]);
  const W = 760, H = 330, L = 64, R = 24, Tp = 20, B = 44;
  const all = series.flat(), lo = Math.min(...all) - 4, hi = Math.max(...all) + 4;
  const x = (i: number) => L + (i / T) * (W - L - R), y = (v: number) => Tp + (1 - (v - lo) / (hi - lo)) * (H - Tp - B);
  const now = raw.map(s => s[k]), mx = Math.max(...now), ex = now.map(v => Math.exp(v - mx)), z = ex.reduce((a, b) => a + b, 0), prob = ex.map(v => v / z);
  return <>
    <svg viewBox={`0 0 ${W} ${H}`} className="rv-svg" role="img" aria-label="Cumulative log score for each state as acoustic tokens are added">
      {[0, 10, 20, 30, 40, 50].map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={Tp} y2={H - B} stroke="#d6c9a3" strokeWidth=".7" /><text x={x(t)} y={H - 22} textAnchor="middle" className="rv-tick">{t}</text></g>)}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="rv-axis">ACOUSTIC TOKENS ADDED (of 50 active)</text>
      <text transform={`translate(14 ${(Tp + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="rv-axis">SCORE VS. 3-STATE AVERAGE</text>
      {series.map((s, ci) => <g key={ci}><polyline fill="none" stroke={SC[e.classes[ci]]} strokeWidth="2.8" strokeLinejoin="round" points={s.map((v, i) => `${x(i)},${y(v)}`).join(' ')} opacity=".95" />
        <circle cx={x(k)} cy={y(s[k])} r="6" fill={SC[e.classes[ci]]} stroke={PAPER} strokeWidth="2" /><text x={x(T) - 8} y={y(s[T]) + [-10, 17, 31][[...series].sort((p, q) => q[T] - p[T]).indexOf(s)]} textAnchor="end" className="rv-rowlab" fill={SC[e.classes[ci]]}>{e.classes[ci]}</text></g>)}
      <line x1={x(k)} x2={x(k)} y1={Tp} y2={H - B} stroke={INK} strokeDasharray="3 3" />
    </svg>
    <label className="rv-slider">Tokens counted: <b>{k}</b><input type="range" min={0} max={T} value={k} onChange={ev => setK(+ev.target.value)} aria-label="Number of tokens added" /></label>
    <div className="rv-bars">{e.classes.map((c, i) => <div key={c}><span style={{ color: SC[c] }}>{c}</span><i><u style={{ width: pct(prob[i], 1), ['--c' as string]: SC[c] } as CSSProperties} /></i><b>{pct(prob[i], 1)}</b></div>)}</div>
    <p className="rv-legend">Recording 1080405 (recorded in AZ), scored by a model fitted on 150 fold-0 training recordings: {e.classes.map((c, i) => `${c} ${e.trainN[i]}`).join(', ')}. Each line starts at the state's log prior and gains one smoothed log-likelihood per token; the chart shows each state's running score minus the three-state average so the gaps are visible. Probabilities are the softmax of the running scores, shown at the slider position. They are model scores, not calibrated confidence.</p>
  </>;
}
export const EvidenceRace = () => <Shell title="Watch Naïve Bayes make a decision" sub="Drag the slider: each acoustic token nudges the three state scores"><Load>{d => <EvidenceInner d={d} />}</Load></Shell>;

/* ---------- 4. Smoothing lab ---------- */
function SmoothingInner({ d }: { d: Viz }) {
  const [alpha, setAlpha] = useState(1), [c, setC] = useState(0), [ci, setCi] = useState(0);
  const N = d.evidence.trainN[ci] * 50, V = d.vocab, mle = c / N, sm = (c + alpha) / (N + alpha * V), cls = d.evidence.classes[ci];
  const mx = Math.max(mle, sm, 0.0005);
  return <>
    <div className="rv-row"><Seg label="State" value={String(ci)} onChange={v => setCi(+v)} options={d.evidence.classes.map((s, i) => [String(i), s] as [string, string])} /></div>
    <div className="rv-grid2">
      <label className="rv-slider">Times this token appeared in {cls} training recordings (count): <b>{c}</b><input type="range" min={0} max={20} value={c} onChange={e => setC(+e.target.value)} /></label>
      <label className="rv-slider">Smoothing α: <b>{alpha.toFixed(2)}</b><input type="range" min={0} max={5} step={0.05} value={alpha} onChange={e => setAlpha(+e.target.value)} /></label>
    </div>
    <div className="rv-bars rv-bars--two">
      <div><span>no smoothing (α = 0)</span><i><u style={{ width: pct(mle / mx), ['--c' as string]: '#b4533a' } as CSSProperties} /></i><b>{mle === 0 ? '0 → log(0) = −∞' : mle.toFixed(5)}</b></div>
      <div><span>with α = {alpha.toFixed(2)}</span><i><u style={{ width: pct(sm / mx), ['--c' as string]: '#1f7a74' } as CSSProperties} /></i><b>{sm.toFixed(5)}</b></div>
    </div>
    <p className="rv-formula">θ = (count + α) / (total {cls} tokens + α × vocabulary) = ({c} + {alpha.toFixed(2)}) / ({N.toLocaleString()} + {alpha.toFixed(2)} × {V}) = <b>{sm.toFixed(5)}</b></p>
    <p className="rv-legend">Totals use the fold-0 worked example: each recording contributes 50 active tokens (one per acoustic feature), vocabulary = 250 (50 features × 5 bins). A count of 0 is hypothetical. With α = 0, a single unseen token would erase a state entirely.</p>
  </>;
}
export const SmoothingLab = () => <Shell title="Why smoothing is required" sub="Set a token's count to 0 and α to 0 to see the zero-probability problem"><Load>{d => <SmoothingInner d={d} />}</Load></Shell>;

/* ---------- 5. Impurity lab ---------- */
const gini = (c: number[]) => { const n = c.reduce((a, b) => a + b, 0); return n ? 1 - c.reduce((s, v) => s + (v / n) ** 2, 0) : 0; };
const ent = (c: number[]) => { const n = c.reduce((a, b) => a + b, 0); return n ? -c.reduce((s, v) => s + (v ? (v / n) * Math.log2(v / n) : 0), 0) : 0; };
function ImpurityInner({ d }: { d: Viz }) {
  const par = d.workedSplit[0], P = [par.CA, par.AZ, par.TX], S = d.states, L0 = d.workedSplit[1];
  const [L, setL] = useState([L0.CA, L0.AZ, L0.TX]);
  const R = P.map((v, i) => v - L[i]), nL = L.reduce((a, b) => a + b, 0), nR = R.reduce((a, b) => a + b, 0), n = nL + nR;
  const ig = ent(P) - (nL / n) * ent(L) - (nR / n) * ent(R), dg = gini(P) - (nL / n) * gini(L) - (nR / n) * gini(R);
  const best = 0.5;
  const col = (c: number[], t: string) => <div className="rv-node"><b>{t}</b><span>n = {c.reduce((a, b) => a + b, 0)}</span>
    <div className="rv-stack">{c.map((v, i) => <u key={i} style={{ flex: v, ['--c' as string]: SC[S[i]] } as CSSProperties} title={`${S[i]} ${v}`}>{v > 0 && v}</u>)}</div>
    <small>Gini {gini(c).toFixed(3)} · entropy {ent(c).toFixed(3)} bits</small></div>;
  return <>
    <div className="rv-tree">{col(P, 'Parent (150 training recordings)')}<div className="rv-split">spectral centroid ≤ 2,335.96 Hz</div><div className="rv-kids">{col(L, 'Left (≤ threshold)')}{col(R, 'Right (> threshold)')}</div></div>
    <div className="rv-grid3">{S.map((s, i) => <label key={s} className="rv-slider"><span style={{ color: SC[s] }}>{s} recordings sent left:</span> <b>{L[i]}</b> / {P[i]}<input type="range" min={0} max={P[i]} value={L[i]} onChange={e => setL(L.map((v, j) => j === i ? +e.target.value : v))} /></label>)}</div>
    <dl className="rv-stats"><div><dt>Information gain</dt><dd>{ig.toFixed(4)} bits</dd></div><div><dt>Gini decrease</dt><dd>{dg.toFixed(4)}</dd></div><div><dt>Parent entropy</dt><dd>{ent(P).toFixed(4)}</dd></div><div><dt>Weighted child entropy</dt><dd>{((nL / n) * ent(L) + (nR / n) * ent(R)).toFixed(4)}</dd></div></dl>
    <div className="rv-gainbar" aria-hidden="true"><i style={{ width: pct(Math.min(1, ig / best)) }} /></div>
    <p className="rv-legend"><button className="rv-reset" onClick={() => setL([L0.CA, L0.AZ, L0.TX])}>Reset to the real split</button> The defaults are the saved fold-0 entropy split (information gain 0.1528 bits). Push each state's slider to the extremes to see what a perfectly clean split would do: gain approaches the parent's entropy, 1.568 bits.</p>
  </>;
}
export const ImpurityLab = () => <Shell title="Measure the goodness of a split" sub="Move recordings between the two branches and watch Gini, entropy and information gain respond"><Load>{d => <ImpurityInner d={d} />}</Load></Shell>;

/* ---------- 6. Fold strip for MNB search ---------- */
function FoldInner({ d }: { d: Viz }) {
  const rows = [...d.mnbFolds].sort((a, b) => a.bins - b.bins || a.alpha - b.alpha), W = 760, left = 170, rowH = 44, top = 30, H = top + rows.length * rowH + 30;
  const x = (v: number) => left + (v / 0.8) * (W - left - 30);
  const best = Math.max(...rows.map(r => r.mean));
  return <svg viewBox={`0 0 ${W} ${H}`} className="rv-svg" role="img" aria-label="Fold-level macro-F1 for six Multinomial Naive Bayes settings">
    {[0, .2, .4, .6, .8].map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={top - 8} y2={H - 28} stroke="#cdbf98" strokeWidth=".8" /><text x={x(t)} y={H - 10} textAnchor="middle" className="rv-tick">{t.toFixed(1)}</text></g>)}
    {rows.map((r, i) => { const y = top + i * rowH + 18, sel = r.mean === best; return <g key={i}>
      <text x={left - 14} y={y + 4} textAnchor="end" className={sel ? 'rv-rowlab rv-sel' : 'rv-rowlab'}>{r.bins} bins · α = {r.alpha}{sel ? ' ★' : ''}</text>
      <line x1={Math.min(...r.folds.map(x))} x2={Math.max(...r.folds.map(x))} y1={y} y2={y} stroke="#a0916e" strokeWidth="2" />
      {r.folds.map((v, k) => <circle key={k} cx={x(v)} cy={y} r={4 + r.n[k] / 14} fill="#1f7a74" opacity=".55" stroke="#fff" strokeWidth="1"><title>{`fold ${k}: macro-F1 ${f3(v)}, validation n = ${r.n[k]}`}</title></circle>)}
      <path d={`M${x(r.mean)} ${y - 15}l6 -9h-12z`} fill={INK} /><text x={x(r.mean) + 10} y={y - 14} className="rv-val">{f3(r.mean)}</text></g>; })}
  </svg>;
}
export const FoldStrip = () => <Shell title="One score hides five" sub="Each dot is a validation fold (bigger dot = more recordings). The triangle is the mean used for selection ★"><Load>{d => <FoldInner d={d} />}</Load><p className="rv-legend">The six Multinomial settings sit within about 0.015 of one another in mean macro-F1, while single folds range from roughly 0.3 to 0.7. Differences between settings are small next to fold-to-fold variation.</p></Shell>;

/* ---------- 7. Pruning curve ---------- */
function PruneInner({ d }: { d: Viz }) {
  const pts = d.pruning, W = 760, H = 320, L = 64, R = 64, T = 24, B = 54;
  const xi = (i: number) => L + (i / (pts.length - 1)) * (W - L - R), y = (v: number) => T + (1 - v / 0.9) * (H - T - B), yl = (v: number) => T + (1 - v / 20) * (H - T - B);
  const line = (f: (p: typeof pts[0]) => number, yy: (v: number) => number) => pts.map((p, i) => `${xi(i)},${yy(f(p))}`).join(' ');
  return <svg viewBox={`0 0 ${W} ${H}`} className="rv-svg" role="img" aria-label="Pruning strength versus training and validation macro-F1 and number of leaves">
    {[0, .3, .6, .9].map(t => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#d6c9a3" strokeWidth=".7" /><text x={L - 8} y={y(t) + 4} textAnchor="end" className="rv-tick">{t.toFixed(1)}</text></g>)}
    <polygon fill="#1f7a74" opacity=".16" points={pts.map((p, i) => `${xi(i)},${y(p.f1 + p.sd)}`).join(' ') + ' ' + [...pts].reverse().map((p, i) => `${xi(pts.length - 1 - i)},${y(Math.max(0, p.f1 - p.sd))}`).join(' ')} />
    <polyline points={line(p => p.trainF1, y)} fill="none" stroke="#b4533a" strokeWidth="2.6" strokeDasharray="6 4" />
    <polyline points={line(p => p.f1, y)} fill="none" stroke="#1f7a74" strokeWidth="3" />
    <polyline points={line(p => p.leaves, yl)} fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="1 5" strokeLinecap="round" />
    {pts.map((p, i) => <g key={i}><circle cx={xi(i)} cy={y(p.f1)} r="5" fill="#1f7a74" /><text x={xi(i)} y={H - 28} textAnchor="middle" className="rv-tick">{p.alpha}</text><text x={xi(i)} y={yl(p.leaves) + 17} textAnchor="middle" className="rv-val">{p.leaves.toFixed(1)}</text></g>)}
    {[0, 10, 20].map(t => <text key={t} x={W - R + 8} y={yl(t) + 4} className="rv-tick">{t}</text>)}
    <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="rv-axis">PRUNING STRENGTH α (cost-complexity)</text>
    <text x={xi(2)} y={y(0.87)} textAnchor="middle" className="rv-ann" fill="#b4533a">training macro-F1 (dashed)</text><text x={xi(2)} y={y(0.17)} textAnchor="middle" className="rv-ann" fill="#1f7a74">validation macro-F1 ± 1 SD</text><text x={W - R - 4} y={T + 8} textAnchor="end" className="rv-ann">mean leaves (right axis, dotted)</text>
  </svg>;
}
export const PruningCurve = () => <Shell title="Pruning: complexity versus transfer" sub="A deeper tree memorises its training recordings; the validation curve is the honest one"><Load>{d => <PruneInner d={d} />}</Load></Shell>;

/* ---------- 8. Tree gallery ---------- */
const TREES: [string, string, string, number][] = [['Gini_depth3', 'Gini · depth 3', 'Gini_depth3.svg', 8], ['Entropy_depth5', 'Entropy · depth 5', 'Entropy_depth5.svg', 18], ['Gini_pruning_0.02', 'Gini · pruned α = 0.02', 'Gini_pruning_0.02.svg', 9]];
function TreeInner({ d }: { d: Viz }) {
  const [t, setT] = useState(TREES[0][0]); const cur = TREES.find(x => x[0] === t)!, fin = d.final.find(f => f.model === t)!, roots = d.rootFeatures[t] || {};
  return <>
    <Seg label="Tree" value={t} onChange={setT} options={TREES.map(x => [x[0], x[1]] as [string, string])} />
    <dl className="rv-stats"><div><dt>Leaves (drawn)</dt><dd>{cur[3]}</dd></div><div><dt>Dev macro-F1</dt><dd>{f3(d.dev[t].macroF1)}</dd></div><div><dt>Final test accuracy</dt><dd>{pct(fin.accuracy)}</dd></div><div><dt>Final test macro-F1</dt><dd>{f3(fin.macroF1)}</dd></div></dl>
    <a className="rv-treewrap" href={'/research/' + cur[2]} target="_blank" rel="noreferrer" aria-label={`Open ${cur[1]} tree full size`}><img src={'/research/' + cur[2]} alt={`Decision tree: ${cur[1]}. Open for full size.`} loading="lazy" /></a>
    <p className="rv-legend">Root feature across the five development folds: {Object.entries(roots).map(([k, v]) => `${k.replace(/_mean_mean$/, '').replace(/_/g, ' ')} ×${v}`).join(' · ')}. Drawn trees are full-development presentation fits (click to open full size); the scores above come from separate models.</p>
  </>;
}
export const TreeGallery = () => <Shell title="Three trees, side by side" sub="Pick a tree to see its structure beside its development and final-test results"><Load>{d => <TreeInner d={d} />}</Load></Shell>;

/* ---------- 9. Partition bars ---------- */
function PartitionInner({ d }: { d: Viz }) {
  const rows: [string, Record<string, number>][] = [['Development (184)', d.partition.dev], ['Held-out test (52)', d.partition.test]];
  return <div className="rv-part">{rows.map(([t, c]) => { const n = Object.values(c).reduce((a, b) => a + b, 0); return <div key={t}><b>{t}</b><div className="rv-stack">{d.states.map(s => <u key={s} style={{ flex: c[s], ['--c' as string]: SC[s] } as CSSProperties}>{s} {c[s]} · {pct(c[s] / n, 0)}</u>)}</div></div>; })}
    <p className="rv-legend">Recordings sharing an exact coordinate group never straddle the two partitions, so the held-out score is never measured on a location the model saw during training.</p></div>;
}
export const PartitionBars = () => <Shell title="The train / test partition, to scale" sub="The two sets are disjoint by location group"><Load>{d => <PartitionInner d={d} />}</Load></Shell>;

/* ---------- 10. Final leaderboard table with per-class recall ---------- */
function FinalInner({ d }: { d: Viz }) {
  return <div className="rv-tablewrap"><table className="rv-table"><thead><tr><th>Model</th><th>Accuracy</th><th>Balanced</th><th>Macro-F1</th><th>CA recall</th><th>AZ recall</th><th>TX recall</th><th>Log loss</th></tr></thead>
    <tbody>{d.final.map(f => <tr key={f.model} className={f.model === 'Prior baseline' ? 'rv-base' : ''}><th scope="row">{label(f.model)}</th><td>{f.correct}/{f.n} · {pct(f.accuracy)}</td><td>{f3(f.balanced)}</td><td>{f3(f.macroF1)}</td>{d.states.map(s => <td key={s}>{pct(f.perClass[s].recall, 0)}</td>)}<td>{f.logLoss.toFixed(2)}</td></tr>)}</tbody></table></div>;
}
export const FinalTable = () => <Shell title="Final held-out test, all models" sub="52 recordings · CA 20 · AZ 13 · TX 19 · one evaluation"><Load>{d => <FinalInner d={d} />}</Load></Shell>;

export const VIZ: Record<string, () => ReactNode> = {
  scoreboard: () => <Scoreboard />, scoreboardNB: () => <Scoreboard group="nb" />, scoreboardDT: () => <Scoreboard group="dt" />,
  confusionNB: () => <ConfusionLab group="nb" />, confusionDT: () => <ConfusionLab group="dt" />, evidence: () => <EvidenceRace />, smoothing: () => <SmoothingLab />,
  impurity: () => <ImpurityLab />, folds: () => <FoldStrip />, pruning: () => <PruningCurve />, trees: () => <TreeGallery />, partition: () => <PartitionBars />, finalTable: () => <FinalTable />,
};
/** Visible only in `npm run dev`: reminds the author which passages must be written in her own words. */
export function AuthorPrompt({ title, text }: { title: string; text: string }) {
  if (!import.meta.env.DEV) return null;
  return <aside className="rv-author"><b>✎ Your words — {title}</b><p>{text}</p><small>Shown only in development. Not included in the production build.</small></aside>;
}
