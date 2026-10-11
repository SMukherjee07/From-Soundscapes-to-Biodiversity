import { FAMILY_COLORS, familyColor } from "./palette";
import { Panel } from "./Slots";
import { fmt } from "./utils";
import type { PcaData } from "./types";

export function FamilyBars({ pca, show = 6 }: { pca: PcaData; show?: number }) {
  const m = Math.min(show, pca.loadings[0]?.length ?? 0);
  const fams = Array.from(new Set(pca.features.map((f) => f.family)));
  const rows = Array.from({ length: m }, (_, k) => {
    const sq = pca.loadings.map((l) => l[k] ** 2), tot = sq.reduce((a, b) => a + b, 0);
    return fams.map((f) => ({ f, v: sq.reduce((s, x, j) => (pca.features[j].family === f ? s + x : s), 0) / tot }));
  });
  return (
    <Panel title="Which feature families build each component?" sub="Share of each component's squared loadings by family. Large families can dominate simply by having more variables.">
      <div className="an-fam">
        {rows.map((r, k) => (
          <div key={k} className="an-fam__row">
            <span>PC{k + 1}</span>
            <div>{r.map((c) => <i key={c.f} title={`${c.f}: ${fmt(c.v * 100, 0)}%`} style={{ width: `${c.v * 100}%`, background: familyColor(c.f) }}>{c.v > 0.12 ? `${fmt(c.v * 100, 0)}%` : ""}</i>)}</div>
          </div>
        ))}
      </div>
      <div className="an-legend an-legend--row">{fams.map((f) => <span key={f}><i style={{ background: FAMILY_COLORS[f] ?? "#c4c4b8" }} />{f}</span>)}</div>
    </Panel>
  );
}
