export type Pt = { id: string; state: string; species: string; flag: boolean; pc: number[] };
export type Sweep = { k: number; silhouette: number; inertia?: number; labels: number[]; sample: number[] };
export type ClusteringData = {
  meta: { n: number; p: number; representation: string; kmeansMetric: string; hierMetric: string; linkage: string };
  points: Pt[];
  kmeans: Sweep[];
  hier: Sweep[];
  linkage: number[][];
  leaves: number[];
  pc1Alignment: { kmeans: number; hier: number };
};
export type PcaData = {
  n: number;
  retained: number;
  evr: number[];
  eigenvalues: number[];
  pa95: number[];
  features: { name: string; family: string }[];
  loadings: number[][]; // [feature][pc] = correlation between variable and PC score
};
