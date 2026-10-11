import { useMemo, useRef, useState } from "react";
import { CLUSTER_COLORS, STATE_COLORS, normState } from "./palette";
import { Panel } from "./Slots";
import { fmt, ticks } from "./utils";
import type { Pt, Sweep } from "./types";

const W = 960, H = 440, PL = 56, PR = 20, PT = 18, PB = 52;

export function Dendrogram({ linkage, leaves, points, hier }: { linkage: number[][]; leaves: number[]; points: Pt[]; hier: Sweep[] }) {
  const n = leaves.length;
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);

  const tree = useMemo(() => {
    const pos = new Map<number, number>();
    leaves.forEach((leaf, i) => pos.set(leaf, i));
    const xs: number[] = new Array(2 * n - 1).fill(0);
    const hs: number[] = new Array(2 * n - 1).fill(0);
    const ch: [number, number][] = [];
    const first: number[] = new Array(2 * n - 1).fill(0);
    for (let i = 0; i < n; i++) { xs[i] = pos.get(i) ?? i; first[i] = i; }
    linkage.forEach((r, i) => {
      const [a, b, h] = r;
      xs[n + i] = (xs[a] + xs[b]) / 2; hs[n + i] = h; ch[n + i] = [a, b]; first[n + i] = first[a];
    });
    return { xs, hs, ch, first, hmax: hs[2 * n - 2] };
  }, [linkage, leaves, n]);

  const { xs, hs, ch, first, hmax } = tree;
  const top = hmax * 1.04;
  const cutForK = (k: number) => (k <= 1 ? top : (linkage[n - 1 - k][2] + linkage[n - k][2]) / 2);
  const [t, setT] = useState(() => cutForK(2));
  const kNow = 1 + linkage.filter((r) => r[2] > t).length;
  const sweep = hier.find((s) => s.k === kNow);

  const colorOfLeaf = (leaf: number) => (sweep ? CLUSTER_COLORS[sweep.labels[leaf] % 8] : "#c4c4b8");
  const X = (i: number) => PL + (i * (W - PL - PR)) / (n - 1);
  const Y = (h: number) => PT + (1 - h / top) * (H - PT - PB);

  const sizes = useMemo(() => {
    if (!sweep) return [];
    const m = new Map<number, number>();
    sweep.labels.forEach((l) => m.set(l, (m.get(l) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [sweep]);

  const setFromPointer = (clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const yv = ((clientY - r.top) * H) / r.height;
    const h = (1 - (yv - PT) / (H - PT - PB)) * top;
    setT(Math.max(0.0001, Math.min(top, h)));
  };

  return (
    <Panel title="Hierarchical clustering — cosine distance, average linkage" sub="Drag the cut line (or pick k) to see how many groups the tree implies. The strips below show state and QC flag per recording.">
      <div className="an-controls">
        {[2, 3, 4, 5, 6, 8].map((k) => <button key={k} className={`an-chip ${kNow === k ? "on" : ""}`} onClick={() => setT(cutForK(k))}>k = {k}</button>)}
        <span className="an-pill">k = <b>{kNow}</b> · cut at cosine distance <b>{fmt(t, 3)}</b>{sweep && <> · silhouette <b>{fmt(sweep.silhouette, 3)}</b></>}</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="an-svg" role="img" aria-label="Dendrogram of recordings with adjustable cut height"
        onPointerMove={(e) => drag.current && setFromPointer(e.clientY)} onPointerUp={() => (drag.current = false)} onPointerLeave={() => (drag.current = false)}>
        {ticks(0, top, 5).map((v, i) => <g key={i}><line x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} className="an-grid" /><text x={PL - 8} y={Y(v) + 3} textAnchor="end" className="an-tick">{fmt(v, 2)}</text></g>)}
        <text transform={`translate(14 ${(H - PB + PT) / 2}) rotate(-90)`} className="an-axis" textAnchor="middle">cosine distance</text>
        {linkage.map((r, i) => {
          const [a, b] = r, node = n + i, h = hs[node];
          const under = h <= t;
          const stroke = under ? colorOfLeaf(first[node]) : "rgba(242,235,221,.38)";
          return <path key={i} d={`M${X(xs[a])} ${Y(hs[a])} L${X(xs[a])} ${Y(h)} L${X(xs[b])} ${Y(h)} L${X(xs[b])} ${Y(hs[b])}`} fill="none" stroke={stroke} strokeWidth={under ? 1.4 : 1} />;
        })}
        {leaves.map((leaf, i) => <rect key={`s${leaf}`} x={X(i) - 1.5} y={H - PB + 6} width={3} height={10} fill={STATE_COLORS[normState(points[leaf].state)] ?? "#888"} />)}
        {leaves.map((leaf, i) => <rect key={`q${leaf}`} x={X(i) - 1.5} y={H - PB + 19} width={3} height={10} fill={points[leaf].flag ? "#e88b72" : "rgba(110,214,209,.35)"} />)}
        <text x={PL - 8} y={H - PB + 15} className="an-tick" textAnchor="end">state</text>
        <text x={PL - 8} y={H - PB + 28} className="an-tick" textAnchor="end">QC</text>
        <g onPointerDown={(e) => { drag.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); setFromPointer(e.clientY); }} style={{ cursor: "ns-resize" }}>
          <line x1={PL} x2={W - PR} y1={Y(t)} y2={Y(t)} stroke="#d8b76a" strokeWidth={2} strokeDasharray="6 5" />
          <rect x={PL} y={Y(t) - 9} width={W - PL - PR} height={18} fill="transparent" />
          <circle cx={W - PR - 10} cy={Y(t)} r={7} fill="#d8b76a" />
        </g>
      </svg>
      <div className="an-legend an-legend--row">
        {sizes.map(([l, c]) => <span key={l}><i style={{ background: CLUSTER_COLORS[l % 8] }} />Cluster {l + 1}<small>{c}</small></span>)}
        <span className="muted">state: <i style={{ background: STATE_COLORS.CA }} />CA <i style={{ background: STATE_COLORS.AZ }} />AZ <i style={{ background: STATE_COLORS.TX }} />TX</span>
      </div>
    </Panel>
  );
}
