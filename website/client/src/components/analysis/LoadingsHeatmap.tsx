import { useMemo, useState } from "react";
import { familyColor } from "./palette";
import { Panel } from "./Slots";
import { fmt } from "./utils";
import type { PcaData } from "./types";

const LW = 196, CWD = 46, RH = 13, HT = 40;

export function LoadingsHeatmap({ pca }: { pca: PcaData }) {
  const m = Math.min(pca.retained, pca.loadings[0]?.length ?? 0);
  const [sortPc, setSortPc] = useState<number | null>(null);
  const [hov, setHov] = useState<{ j: number; k: number } | null>(null);
  const order = useMemo(() => {
    const idx = pca.features.map((_, j) => j);
    if (sortPc !== null) return idx.sort((a, b) => Math.abs(pca.loadings[b][sortPc]) - Math.abs(pca.loadings[a][sortPc]));
    return idx.sort((a, b) => pca.features[a].family.localeCompare(pca.features[b].family) || pca.features[a].name.localeCompare(pca.features[b].name));
  }, [pca, sortPc]);
  const W = LW + m * CWD + 10, H = HT + order.length * RH + 6;
  const cell = (r: number) => {
    const a = Math.min(1, Math.abs(r) / 0.9) ** 0.85;
    return r >= 0 ? `rgba(232,139,114,${a})` : `rgba(110,214,209,${a})`;
  };
  return (
    <Panel title="Loadings heatmap — which variables drive each component?" sub="Cell = correlation between a variable and the component score. Click a PC header to sort by that component; click again to regroup by feature family.">
      <div className="an-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="an-svg an-svg--tall" style={{ minWidth: 560 }} role="img" aria-label="Loadings heatmap" onMouseLeave={() => setHov(null)}>
          {Array.from({ length: m }, (_, k) => (
            <g key={k} style={{ cursor: "pointer" }} onClick={() => setSortPc(sortPc === k ? null : k)}>
              <text x={LW + k * CWD + CWD / 2} y={HT - 12} textAnchor="middle" className={`an-axis ${sortPc === k ? "hl" : ""}`}>PC{k + 1}</text>
              <text x={LW + k * CWD + CWD / 2} y={HT - 1} textAnchor="middle" className="an-tick">{fmt(pca.evr[k] * 100, 0)}%</text>
            </g>
          ))}
          {order.map((j, r) => (
            <g key={j}>
              <rect x={0} y={HT + r * RH + 2} width={4} height={RH - 3} fill={familyColor(pca.features[j].family)} />
              <text x={10} y={HT + r * RH + RH - 3} className={`an-feat ${hov?.j === j ? "hl" : ""}`}>{pca.features[j].name.replace(/_mean$/, "")}</text>
              {Array.from({ length: m }, (_, k) => (
                <rect key={k} x={LW + k * CWD + 1} y={HT + r * RH + 1} width={CWD - 2} height={RH - 1} rx={2} fill={cell(pca.loadings[j][k])}
                  stroke={hov?.j === j && hov.k === k ? "#f2ebdd" : "none"} onMouseEnter={() => setHov({ j, k })} />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <p className="an-readout an-readout--line" aria-live="polite">
        {hov ? <><b>{pca.features[hov.j].name}</b> <span className="muted">({pca.features[hov.j].family})</span> · PC{hov.k + 1}: r = <b>{fmt(pca.loadings[hov.j][hov.k], 3)}</b></> : <span className="muted">Hover a cell. Coral = positive, cyan = negative.</span>}
      </p>
    </Panel>
  );
}
