import "./analysis.css";
import { pca as T } from "@/content/story";
import { ClusterScatter } from "./ClusterScatter";
import { CorrelationCircle } from "./CorrelationCircle";
import { FamilyBars } from "./FamilyBars";
import { LoadingsHeatmap } from "./LoadingsHeatmap";
import { ScreePlot } from "./ScreePlot";
import { SectionNav } from "./SectionNav";
import { Chapter, CodeBlock, DataTable, Fig, FigGrid, Links, Panes, Paras, Stats } from "./StoryKit";
import type { ClusteringData, PcaData } from "./types";
import { useJson } from "./useJson";
import { fmt } from "./utils";

const SECTIONS = [{ id: "pca-overview", label: "Overview" }, { id: "pca-dataprep", label: "Data Prep" }, { id: "pca-code", label: "Code" }, { id: "pca-results", label: "Results" }, { id: "pca-conclusions", label: "Conclusions" }];
const GH = "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/";

export function PCATab() {
  const { data: d } = useJson<PcaData>("/data/pca.json"), { data: cl } = useJson<ClusteringData>("/data/clustering.json");
  const R = T.results, P = T.prep, cum = d ? d.evr.slice(0, d.retained).reduce((a, b) => a + b, 0) : 0;
  const ex = (n: React.ReactNode) => d && <div className="sk-explore">{n}</div>;
  return (
    <div className="an-root">
      <SectionNav sections={SECTIONS} />
      <Chapter id="pca-overview" no="a" kicker="Overview" title="Finding the dimensions of acoustic variation"><Paras text={T.overview} /><FigGrid figs={T.overviewFigs} /></Chapter>
      <Chapter id="pca-dataprep" no="b" kicker="Data prep" title="From recordings to a feature matrix">
        <p>{P.lead}</p><DataTable {...P.dataset} /><Paras text={P.afterDataset} /><Links links={P.tableLinks} />
        <h4>What happens before PCA?</h4><Paras text={P.before} />
        <h4>Before and after: transforming real data</h4><Paras text={P.transform} /><DataTable {...P.beforeAfter} /><Fig {...P.sampleImg} /><Paras text={P.afterTransform} />
        <Links links={[P.sampleLink]} />
      </Chapter>
      <Chapter id="pca-code" no="c" kicker="Code" title="A closer look at the transformation">
        <CodeBlock title="Show the transformation code" code={P.code} href={`${GH}research/notebooks/6B_PCA_Representations.ipynb`} /><p>{P.codeNote}</p><Links links={T.codeLinks} />
      </Chapter>
      <Chapter id="pca-results" no="d" kicker="Results" title="How much does PCA retain?">
        {d && <Stats items={[{ v: `${fmt(d.evr[0] * 100, 1)}%`, l: "variance on PC1" }, { v: `${fmt((d.evr[0] + d.evr[1]) * 100, 1)}%`, l: "variance on PC1 + PC2" }, { v: `${fmt(cum * 100, 1)}%`, l: `variance in the first ${d.retained} components` }, { v: String(d.retained), l: "components kept by parallel analysis" }]} />}
        <Panes label="PCA results" tabs={[
          { id: "var", label: "Variance", body: <><Paras text={R.variance.text} />{ex(<><ScreePlot pca={d!} /><FamilyBars pca={d!} /></>)}<Fig {...R.variance.fig} /></> },
          { id: "load", label: "Loadings", body: <><Paras text={R.loadings.text} />{ex(<><LoadingsHeatmap pca={d!} /><CorrelationCircle pca={d!} /></>)}<Fig {...R.loadings.fig} /></> },
          { id: "rec", label: "Recordings", body: <>{cl && <div className="sk-explore"><ClusterScatter points={cl.points} kmeans={cl.kmeans} hier={cl.hier} initial="state" title="Recordings in PC space" /></div>}<Fig {...R.recordings.fig} /></> },
          { id: "sp", label: "Species", body: <><Paras text={R.species.text} /><Fig {...R.species.fig} /></> },
          { id: "rep", label: "Preprocessing", body: <><Paras text={R.prep.text} /><DataTable {...R.prep.table} /><Links links={[R.prep.link]} /></> },
        ]} />
      </Chapter>
      <Chapter id="pca-conclusions" no="e" kicker="Conclusions" title="What PCA tells us"><Paras text={T.conclusions} /></Chapter>
    </div>
  );
}
