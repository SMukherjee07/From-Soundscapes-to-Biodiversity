import { useMemo, useState } from "react";
import { CLUSTER_COLORS } from "./palette";
import { Panel, Segmented } from "./Slots";
import { fmt } from "./utils";
import type { Sweep } from "./types";

const CW = 440, CH = 280, CP = 44;
const PW = 520, PH = 420;

export function SilhouetteExplorer({ kmeans, hier }: { kmeans: Sweep[]; hier: Sweep[] }) {
  const [method, setMethod] = useState<"km" | "hc">("km");
  const [k, setK] = useState(2);
  const ks = kmeans.map((s) => s.k);
  const all = [...kmeans, ...hier].map((s) => s.silhouette);
  const y1 = Math.max(0.3, ...all) * 1.1, y0 = Math.min(0, ...all);
  const cx = (kv: number) => CP + ((kv - ks[0]) / (ks[ks.length - 1] - ks[0])) * (CW - 2 * CP);
  const cy = (v: number) => CH - CP - ((v - y0) / (y1 - y0)) * (CH - 2 * CP);
  const line = (s: Sweep[]) => s.map((p, i) => `${i ? "L" : "M"}${cx(p.k)} ${cy(p.silhouette)}`).join(" ");

  const sw = (method === "km" ? kmeans : hier).find((s) => s.k === k)!;
  const prof = useMemo(() => {
    const idx = sw.labels.map((_, i) => i).sort((a, b) => sw.labels[a] - sw.labels[b] || sw.sample[b] - sw.sample[a]);
    const lo = Math.min(-0.1, ...sw.sample), hi = Math.max(0.3, ...sw.sample);
    const clusters = Array.from(new Set(sw.labels)).sort((a, b) => a - b).map((l) => {
      const s = sw.sample.filter((_, i) => sw.labels[i] === l);
      return { l, n: s.length, mean: s.reduce((a, b) => a + b, 0) / s.length };
    });
    return { idx, lo, hi, clusters };
  }, [sw]);
  const px = (v: number) => 56 + ((v - prof.lo) / (prof.hi - prof.lo)) * (PW - 76);
  const bh = (PH - 40) / sw.labels.length;
  const gap = 5;
  const negShare = sw.sample.filter((v) => v < 0).length / sw.sample.length;

  return (
    <Panel title="Silhouette analysis — how well does each k fit?" sub="Pick a method and k. Silhouette ≤ 0.25 is conventionally read as no substantial structure.">
      <div className="an-controls">
        <Segmented label="Method" value={method} onChange={setMethod} options={[{ v: "km", label: "K-means (Euclidean)" }, { v: "hc", label: "Hierarchical (cosine)" }]} />
        <label className="an-range">k = <b>{k}</b><input type="range" min={ks[0]} max={ks[ks.length - 1]} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="Number of clusters" /></label>
        <span className="an-pill">mean silhouette <b>{fmt(sw.silhouette, 3)}</b> · {fmt(negShare * 100, 0)}% of recordings below 0</span>
      </div>
      <div className="an-split an-split--even">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="an-svg" role="img" aria-label="Mean silhouette versus k for both methods">
          <line x1={CP} x2={CW - CP} y1={cy(0.25)} y2={cy(0.25)} stroke="#d8b76a" strokeDasharray="5 5" />
          <text x={CW - CP} y={cy(0.25) - 5} textAnchor="end" className="an-tick" fill="#d8b76a">0.25</text>
          <line x1={CP} x2={CW - CP} y1={cy(0)} y2={cy(0)} className="an-grid" />
          {ks.map((kv) => <text key={kv} x={cx(kv)} y={CH - CP + 16} textAnchor="middle" className="an-tick">{kv}</text>)}
          {[0, 0.1, 0.2, 0.3].filter((v) => v <= y1).map((v) => <text key={v} x={CP - 8} y={cy(v) + 3} textAnchor="end" className="an-tick">{v.toFixed(1)}</text>)}
          <text x={CW / 2} y={CH - 6} textAnchor="middle" className="an-axis">number of clusters k</text>
          <path d={line(kmeans)} fill="none" stroke="#6ed6d1" strokeWidth={2} /><path d={line(hier)} fill="none" stroke="#e88b72" strokeWidth={2} />
          {kmeans.map((p) => <circle key={`a${p.k}`} cx={cx(p.k)} cy={cy(p.silhouette)} r={p.k === k && method === "km" ? 8 : 4.5} fill="#6ed6d1" className="an-dot" onClick={() => { setMethod("km"); setK(p.k); }} />)}
          {hier.map((p) => <circle key={`b${p.k}`} cx={cx(p.k)} cy={cy(p.silhouette)} r={p.k === k && method === "hc" ? 8 : 4.5} fill="#e88b72" className="an-dot" onClick={() => { setMethod("hc"); setK(p.k); }} />)}
          <g className="an-tick"><circle cx={CP + 8} cy={14} r={4} fill="#6ed6d1" /><text x={CP + 18} y={18}>K-means</text><circle cx={CP + 92} cy={14} r={4} fill="#e88b72" /><text x={CP + 102} y={18}>Hierarchical</text></g>
        </svg>
        <svg viewBox={`0 0 ${PW} ${PH}`} className="an-svg" role="img" aria-label={`Silhouette profile for ${method === "km" ? "k-means" : "hierarchical"} k=${k}`}>
          <line x1={px(0)} x2={px(0)} y1={8} y2={PH - 26} stroke="rgba(242,235,221,.5)" />
          <line x1={px(sw.silhouette)} x2={px(sw.silhouette)} y1={8} y2={PH - 26} stroke="#d8b76a" strokeDasharray="5 4" />
          <text x={px(sw.silhouette)} y={PH - 8} textAnchor="middle" className="an-tick" fill="#d8b76a">mean {fmt(sw.silhouette, 3)}</text>
          {(() => {
            let y = 10, prev = -1;
            return prof.idx.map((i) => {
              const l = sw.labels[i];
              if (l !== prev) { if (prev !== -1) y += gap; prev = l; }
              const v = sw.sample[i];
              const el = <rect key={i} x={Math.min(px(0), px(v))} y={y} width={Math.abs(px(v) - px(0))} height={Math.max(0.6, bh - 0.2)} fill={CLUSTER_COLORS[l % 8]} opacity={0.9} />;
              y += bh;
              return el;
            });
          })()}
        </svg>
      </div>
      <div className="an-legend an-legend--row">
        {prof.clusters.map((c) => <span key={c.l}><i style={{ background: CLUSTER_COLORS[c.l % 8] }} />Cluster {c.l + 1}<small>n={c.n} · mean {fmt(c.mean, 2)}</small></span>)}
      </div>
    </Panel>
  );
}
