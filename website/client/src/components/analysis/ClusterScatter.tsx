import { useMemo, useState } from "react";
import { CLUSTER_COLORS, STATE_COLORS, normState } from "./palette";
import { Panel, Segmented } from "./Slots";
import { fmt, ticks } from "./utils";
import type { Pt, Sweep } from "./types";

export type ColorBy = "km" | "hc" | "state" | "qc";
const W = 760, H = 500, P = 48;

export function ClusterScatter({ points, kmeans, hier, initial = "km", title = "Acoustic space (PCA projection)" }: {
  points: Pt[]; kmeans: Sweep[]; hier: Sweep[]; initial?: ColorBy; title?: string;
}) {
  const [by, setBy] = useState<ColorBy>(initial);
  const [k, setK] = useState(2);
  const [xi, setXi] = useState(0);
  const [yi, setYi] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const nPc = Math.min(4, points[0]?.pc.length ?? 2);

  const group = (i: number): string => {
    if (by === "km") return String(kmeans.find((s) => s.k === k)?.labels[i] ?? 0);
    if (by === "hc") return String(hier.find((s) => s.k === k)?.labels[i] ?? 0);
    if (by === "state") return normState(points[i].state);
    return points[i].flag ? "Flagged" : "Pass QC";
  };
  const colorOf = (g: string) =>
    by === "km" || by === "hc" ? CLUSTER_COLORS[Number(g) % CLUSTER_COLORS.length]
    : by === "state" ? STATE_COLORS[g] ?? "#c4c4b8"
    : g === "Flagged" ? "#e88b72" : "#6ed6d1";

  const { sx, sy, xt, yt } = useMemo(() => {
    const xs = points.map((p) => p.pc[xi]), ys = points.map((p) => p.pc[yi]);
    const pad = (a: number[]) => { const lo = Math.min(...a), hi = Math.max(...a), d = (hi - lo) * 0.06; return [lo - d, hi + d]; };
    const [x0, x1] = pad(xs), [y0, y1] = pad(ys);
    return {
      sx: (v: number) => P + ((v - x0) / (x1 - x0)) * (W - 2 * P),
      sy: (v: number) => H - P - ((v - y0) / (y1 - y0)) * (H - 2 * P),
      xt: ticks(x0, x1, 6), yt: ticks(y0, y1, 5),
    };
  }, [points, xi, yi]);

  const groups = useMemo(() => {
    const m = new Map<string, number>();
    points.forEach((_, i) => { const g = group(i); m.set(g, (m.get(g) ?? 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, by, k, kmeans, hier]);

  const centroids = useMemo(() => {
    if (by !== "km" && by !== "hc") return [];
    return groups.map(([g]) => {
      const idx = points.map((_, i) => i).filter((i) => group(i) === g);
      return { g, x: idx.reduce((s, i) => s + points[i].pc[xi], 0) / idx.length, y: idx.reduce((s, i) => s + points[i].pc[yi], 0) / idx.length };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, xi, yi]);

  const hp = hover !== null ? points[hover] : null;
  const toggle = (g: string) => setHidden((h) => { const n = new Set(h); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const showK = by === "km" || by === "hc";

  return (
    <Panel title={title} sub="Colour by method, state or QC. Hover a recording; recordings of the same species ring together.">
      <div className="an-controls">
        <Segmented label="Colour by" value={by} onChange={setBy}
          options={[{ v: "km", label: "K-means" }, { v: "hc", label: "Hierarchical" }, { v: "state", label: "State" }, { v: "qc", label: "QC flag" }]} />
        {showK && (
          <label className="an-range">k = <b>{k}</b>
            <input type="range" min={2} max={8} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="Number of clusters" />
          </label>
        )}
        <label className="an-select">x
          <select value={xi} onChange={(e) => setXi(Number(e.target.value))}>{Array.from({ length: nPc }, (_, i) => <option key={i} value={i}>PC{i + 1}</option>)}</select>
        </label>
        <label className="an-select">y
          <select value={yi} onChange={(e) => setYi(Number(e.target.value))}>{Array.from({ length: nPc }, (_, i) => <option key={i} value={i}>PC{i + 1}</option>)}</select>
        </label>
      </div>
      <div className="an-split">
        <svg viewBox={`0 0 ${W} ${H}`} className="an-svg" role="img" aria-label={`Scatter of recordings on PC${xi + 1} and PC${yi + 1}`} onMouseLeave={() => setHover(null)}>
          {xt.map((t, i) => <g key={`x${i}`}><line x1={sx(t)} x2={sx(t)} y1={P} y2={H - P} className="an-grid" /><text x={sx(t)} y={H - P + 16} className="an-tick" textAnchor="middle">{fmt(t, 1)}</text></g>)}
          {yt.map((t, i) => <g key={`y${i}`}><line y1={sy(t)} y2={sy(t)} x1={P} x2={W - P} className="an-grid" /><text y={sy(t) + 3} x={P - 8} className="an-tick" textAnchor="end">{fmt(t, 1)}</text></g>)}
          <text x={W / 2} y={H - 8} className="an-axis" textAnchor="middle">PC{xi + 1}</text>
          <text transform={`translate(14 ${H / 2}) rotate(-90)`} className="an-axis" textAnchor="middle">PC{yi + 1}</text>
          {points.map((p, i) => {
            const g = group(i);
            if (hidden.has(g)) return null;
            const same = hp && hp.species === p.species && hover !== i;
            return (
              <circle key={p.id + i} cx={sx(p.pc[xi])} cy={sy(p.pc[yi])} r={hover === i ? 8 : 5.2}
                fill={colorOf(g)} fillOpacity={hover === null || hover === i || same ? 0.85 : 0.3}
                stroke={same || hover === i ? "#f2ebdd" : "rgba(7,17,15,.6)"} strokeWidth={same || hover === i ? 2 : 0.8}
                className="an-dot" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} />
            );
          })}
          {centroids.filter((c) => !hidden.has(c.g)).map((c) => (
            <g key={c.g} pointerEvents="none">
              <circle cx={sx(c.x)} cy={sy(c.y)} r={13} fill="none" stroke={colorOf(c.g)} strokeWidth={2.5} />
              <text x={sx(c.x)} y={sy(c.y) + 4} textAnchor="middle" className="an-centroid">{Number(c.g) + 1}</text>
            </g>
          ))}
        </svg>
        <aside className="an-side" aria-live="polite">
          <div className="an-legend">
            {groups.map(([g, n]) => (
              <button key={g} className={hidden.has(g) ? "off" : ""} onClick={() => toggle(g)}>
                <i style={{ background: colorOf(g) }} />{showK ? `Cluster ${Number(g) + 1}` : g}<small>{n}</small>
              </button>
            ))}
          </div>
          <div className="an-readout">
            {hp ? (
              <>
                <strong>{hp.species}</strong>
                <span>{normState(hp.state)} · {hp.flag ? "QC-flagged" : "passed QC"}</span>
                <span>id {hp.id}</span>
                <span>PC{xi + 1} {fmt(hp.pc[xi])} · PC{yi + 1} {fmt(hp.pc[yi])}</span>
                <span>k-means k={k}: cluster {(kmeans.find((s) => s.k === k)?.labels[hover!] ?? 0) + 1} · hclust: cluster {(hier.find((s) => s.k === k)?.labels[hover!] ?? 0) + 1}</span>
              </>
            ) : <span className="muted">Hover a point to inspect a recording.</span>}
          </div>
        </aside>
      </div>
    </Panel>
  );
}
