import { useState } from "react";
import { familyColor, FAMILY_COLORS } from "./palette";
import { Panel } from "./Slots";
import { fmt } from "./utils";
import type { PcaData } from "./types";

const S = 520, R = 215, C = S / 2;

export function CorrelationCircle({ pca }: { pca: PcaData }) {
  const m = Math.min(4, pca.loadings[0]?.length ?? 2);
  const [xi, setXi] = useState(0), [yi, setYi] = useState(1);
  const [hov, setHov] = useState<number | null>(null);
  const fams = Array.from(new Set(pca.features.map((f) => f.family)));
  return (
    <Panel title="Correlation circle — variables in the PC plane" sub="Arrow length = how well two components describe a variable. Arrows that point together are positively correlated; opposite arrows are negatively correlated.">
      <div className="an-controls">
        <label className="an-select">x<select value={xi} onChange={(e) => setXi(Number(e.target.value))}>{Array.from({ length: m }, (_, i) => <option key={i} value={i}>PC{i + 1}</option>)}</select></label>
        <label className="an-select">y<select value={yi} onChange={(e) => setYi(Number(e.target.value))}>{Array.from({ length: m }, (_, i) => <option key={i} value={i}>PC{i + 1}</option>)}</select></label>
      </div>
      <div className="an-split an-split--even">
        <svg viewBox={`0 0 ${S} ${S}`} className="an-svg" role="img" aria-label="Correlation circle" onMouseLeave={() => setHov(null)}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(242,235,221,.25)" /><circle cx={C} cy={C} r={R / 2} fill="none" stroke="rgba(242,235,221,.1)" />
          <line x1={C - R} x2={C + R} y1={C} y2={C} className="an-grid" /><line y1={C - R} y2={C + R} x1={C} x2={C} className="an-grid" />
          <text x={C + R} y={C + 16} textAnchor="end" className="an-axis">PC{xi + 1} ({fmt(pca.evr[xi] * 100, 1)}%)</text>
          <text x={C + 6} y={C - R + 14} className="an-axis">PC{yi + 1} ({fmt(pca.evr[yi] * 100, 1)}%)</text>
          {pca.features.map((f, j) => {
            const x = C + pca.loadings[j][xi] * R, y = C - pca.loadings[j][yi] * R;
            const len = Math.hypot(pca.loadings[j][xi], pca.loadings[j][yi]);
            const on = hov === j;
            return (
              <g key={j} onMouseEnter={() => setHov(j)} opacity={hov === null || on ? 1 : 0.3}>
                <line x1={C} y1={C} x2={x} y2={y} stroke={familyColor(f.family)} strokeWidth={on ? 3 : 1.4} />
                <circle cx={x} cy={y} r={on ? 5 : 3} fill={familyColor(f.family)} />
                {(on || len > 0.8) && <text x={x + (x > C ? 6 : -6)} y={y + 3} textAnchor={x > C ? "start" : "end"} className="an-feat">{f.name.replace(/_mean$/, "")}</text>}
              </g>
            );
          })}
        </svg>
        <aside className="an-side">
          <div className="an-legend">{fams.map((f) => <span key={f}><i style={{ background: FAMILY_COLORS[f] ?? "#c4c4b8" }} />{f}</span>)}</div>
          <div className="an-readout" aria-live="polite">
            {hov !== null ? <><strong>{pca.features[hov].name}</strong><span>{pca.features[hov].family}</span><span>r with PC{xi + 1}: {fmt(pca.loadings[hov][xi], 3)}</span><span>r with PC{yi + 1}: {fmt(pca.loadings[hov][yi], 3)}</span></> : <span className="muted">Hover an arrow. Labels show variables that are well represented (length &gt; 0.8).</span>}
          </div>
        </aside>
      </div>
    </Panel>
  );
}
