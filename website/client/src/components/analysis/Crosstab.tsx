import { useState } from "react";
import { Panel } from "./Slots";
import { ari, crosstab, fmt } from "./utils";
import type { Sweep } from "./types";

export function Crosstab({ kmeans, hier }: { kmeans: Sweep[]; hier: Sweep[] }) {
  const [k, setK] = useState(2);
  const a = kmeans.find((s) => s.k === k)!.labels, b = hier.find((s) => s.k === k)!.labels;
  const { rows, cols, m } = crosstab(a, b);
  const max = Math.max(...m.flat());
  return (
    <Panel title="K-means vs hierarchical — do the two methods agree?" sub="Counts of recordings by assigned cluster. Adjusted Rand Index: 1 = identical partitions, 0 = chance.">
      <div className="an-controls">
        <label className="an-range">k = <b>{k}</b><input type="range" min={2} max={8} value={k} onChange={(e) => setK(Number(e.target.value))} aria-label="k for comparison" /></label>
        <span className="an-pill">ARI <b>{fmt(ari(a, b), 3)}</b></span>
      </div>
      <div className="an-scroll">
        <table className="an-xt">
          <thead><tr><th>k-means ↓ / hclust →</th>{cols.map((c) => <th key={c}>H{c + 1}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={r}><th>K{r + 1}</th>{m[i].map((v, j) => <td key={j} style={{ background: `rgba(110,214,209,${0.08 + 0.7 * (v / max)})` }}>{v}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </Panel>
  );
}
