import { useState } from "react";
import { Panel } from "./Slots";
import { fmt, ticks } from "./utils";
import type { PcaData } from "./types";

const W = 760, H = 360, PL = 52, PR = 20, PT = 24, PB = 44;

export function ScreePlot({ pca, show = 15 }: { pca: PcaData; show?: number }) {
  const m = Math.min(show, pca.evr.length);
  const [h, setH] = useState<number | null>(null);
  const cum = pca.evr.slice(0, m).reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], []);
  const ymax = Math.max(...pca.evr.slice(0, m), ...pca.pa95.slice(0, m)) * 1.15;
  const bw = (W - PL - PR) / m;
  const X = (i: number) => PL + i * bw + bw / 2;
  const Y = (v: number) => PT + (1 - v / ymax) * (H - PT - PB);
  const Yc = (v: number) => PT + (1 - v) * (H - PT - PB); // cumulative on 0–1 axis
  const above = (i: number) => pca.evr[i] > pca.pa95[i];
  const nAbove = pca.evr.slice(0, m).filter((_, i) => above(i)).length;
  return (
    <Panel title="Scree plot — variance explained per component" sub={`Bars above the permutation null (95th percentile of shuffled data) are highlighted: ${nAbove} components exceed chance. Dashed line = cumulative variance.`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="an-svg" role="img" aria-label="Scree plot with parallel-analysis null" onMouseLeave={() => setH(null)}>
        {ticks(0, ymax, 4).map((v, i) => <g key={i}><line x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} className="an-grid" /><text x={PL - 8} y={Y(v) + 3} textAnchor="end" className="an-tick">{fmt(v * 100, 0)}%</text></g>)}
        {pca.evr.slice(0, m).map((v, i) => (
          <g key={i} onMouseEnter={() => setH(i)}>
            <rect x={X(i) - bw * 0.36} y={Y(v)} width={bw * 0.72} height={H - PB - Y(v)} rx={3} fill={above(i) ? "#6ed6d1" : "rgba(242,235,221,.22)"} opacity={h === null || h === i ? 1 : 0.55} />
            <text x={X(i)} y={H - PB + 16} textAnchor="middle" className="an-tick">{i + 1}</text>
            <line x1={X(i) - bw * 0.42} x2={X(i) + bw * 0.42} y1={Y(pca.pa95[i])} y2={Y(pca.pa95[i])} stroke="#e88b72" strokeWidth={2.5} />
          </g>
        ))}
        <path d={cum.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Yc(v)}`).join(" ")} fill="none" stroke="#d8b76a" strokeWidth={2} strokeDasharray="6 5" />
        {cum.map((v, i) => <circle key={i} cx={X(i)} cy={Yc(v)} r={3.5} fill="#d8b76a" />)}
        <line x1={PL + pca.retained * bw} x2={PL + pca.retained * bw} y1={PT} y2={H - PB} stroke="#a99bd6" strokeDasharray="3 4" />
        <text x={PL + pca.retained * bw + 6} y={PT + 10} className="an-tick" fill="#a99bd6">retained: {pca.retained}</text>
        <text x={W / 2} y={H - 6} textAnchor="middle" className="an-axis">principal component</text>
        <g className="an-tick"><rect x={W - 250} y={4} width={10} height={10} fill="#6ed6d1" /><text x={W - 236} y={13}>above null</text><line x1={W - 160} x2={W - 144} y1={9} y2={9} stroke="#e88b72" strokeWidth={2.5} /><text x={W - 138} y={13}>null 95th pct</text></g>
      </svg>
      <p className="an-readout an-readout--line" aria-live="polite">
        {h === null ? <span className="muted">Hover a bar.</span> : <>PC{h + 1}: <b>{fmt(pca.evr[h] * 100, 1)}%</b> of variance (eigenvalue {fmt(pca.eigenvalues[h], 2)}) · null 95th {fmt(pca.pa95[h] * 100, 1)}% · cumulative <b>{fmt(cum[h] * 100, 1)}%</b></>}
      </p>
    </Panel>
  );
}
