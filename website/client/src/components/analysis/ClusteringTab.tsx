import "./analysis.css";
import { cluster as T } from "@/content/story";
import { ClusterScatter } from "./ClusterScatter";
import { Crosstab } from "./Crosstab";
import { Dendrogram } from "./Dendrogram";
import { SectionNav } from "./SectionNav";
import { SilhouetteExplorer } from "./SilhouetteExplorer";
import { Chapter, Fig, FigGrid, Links, Panes, Paras, Stats } from "./StoryKit";
import type { ClusteringData } from "./types";
import { useJson } from "./useJson";
import { fmt } from "./utils";

const SECTIONS = [{ id: "cl-overview", label: "Overview" }, { id: "cl-dataprep", label: "Data Prep" }, { id: "cl-code", label: "Code" }, { id: "cl-results", label: "Results" }, { id: "cl-conclusions", label: "Conclusions" }];

export function ClusteringTab() {
  const { data } = useJson<ClusteringData>("/data/clustering.json");
  const best = (s: ClusteringData["kmeans"]) => s.reduce((a, b) => (b.silhouette > a.silhouette ? b : a));
  const explore = (f: () => React.ReactNode) => data && <div className="sk-explore">{f()}</div>;
  return (
    <div className="an-root">
      <SectionNav sections={SECTIONS} />
      <Chapter id="cl-overview" no="a" kicker="Overview" title="Do the recordings form distinct groups?">
        <Paras text={T.overview} /><FigGrid figs={T.overviewFigs} />
      </Chapter>
      <Chapter id="cl-dataprep" no="b" kicker="Data prep" title="Unlabeled numeric input">
        <Paras text={T.prep} /><Fig {...T.sampleImg} /><Links links={[T.sampleLink]} />
      </Chapter>
      <Chapter id="cl-code" no="c" kicker="Code" title="K-means and hierarchical clustering"><Links links={T.codeLinks} /></Chapter>
      <Chapter id="cl-results" no="d" kicker="Results" title="Seven methods, one weak structure">
        {data && <Stats items={[{ v: fmt(best(data.kmeans).silhouette, 3), l: `best K-means silhouette, Yeo–Johnson (k = ${best(data.kmeans).k})` }, { v: fmt(best(data.hier).silhouette, 3), l: `best hierarchical silhouette, Yeo–Johnson (k = ${best(data.hier).k})` }, { v: fmt(data.pc1Alignment.kmeans, 2), l: "|r| of K-means k=2 labels with PC1" }, { v: "7", l: "algorithms compared" }]} />}
        <Panes label="Clustering methods" tabs={[
          { id: "km", label: "K-means", body: <><Paras text={T.kmeans.text} />{explore(() => <><ClusterScatter points={data!.points} kmeans={data!.kmeans} hier={data!.hier} /><SilhouetteExplorer kmeans={data!.kmeans} hier={data!.hier} /></>)}<FigGrid figs={T.kmeans.figs} /></> },
          { id: "hc", label: "Hierarchical", body: <><Paras text={T.hier.text} />{explore(() => <><Dendrogram linkage={data!.linkage} leaves={data!.leaves} points={data!.points} hier={data!.hier} /><Crosstab kmeans={data!.kmeans} hier={data!.hier} /></>)}<FigGrid figs={T.hier.figs} /></> },
          { id: "dn", label: "Density", body: <><Paras text={T.density.text} /><FigGrid figs={T.density.figs} /><Links links={T.density.links} /></> },
          { id: "gm", label: "Mixtures", body: <><Paras text={T.gmm.text} /><FigGrid figs={T.gmm.figs} cols={3} /><Links links={T.gmm.links} /></> },
          { id: "sp", label: "Spectral", body: <><Paras text={T.spectral.text} /><FigGrid figs={T.spectral.figs} /><Links links={T.spectral.links} /></> },
          { id: "yj", label: "Yeo–Johnson", body: <><Paras text={T.yj.text} /><FigGrid figs={T.yj.figs} /><Paras text={T.yj.after} /><Links links={T.yj.links} /></> },
          { id: "st", label: "Stability", body: <><Paras text={T.robust.text} /><Fig {...T.robust.fig} /><Links links={T.robust.links} /></> },
          { id: "ec", label: "Species & PC1", body: <><Paras text={T.eco.text} /><Paras text={T.eco.pc1} /><Links links={T.eco.links} /></> },
        ]} />
      </Chapter>
      <Chapter id="cl-conclusions" no="e" kicker="Conclusions" title="What the groups do and do not show"><Paras text={T.conclusions} /></Chapter>
    </div>
  );
}
