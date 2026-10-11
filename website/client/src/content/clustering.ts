import type { Img, LinkSpec } from "@/components/analysis/Slots";

const GH = "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main";
const FIG = "/figures/story/";

export const clusteringContent = {
  overview: {
    paragraphs: [
      "PCA summarizes the strongest directions of variation; clustering asks a different question: do recordings form groups that are similar to one another in the multivariate acoustic feature space? Clustering is unsupervised. The algorithm receives numeric features but does not receive species names or state labels, so it discovers groups according to its mathematical definition of similarity rather than attempting to reproduce known categories.",
      "Partitional methods such as K-means directly divide observations into a chosen number of groups. K-means assigns each recording to the nearest centroid and updates the centroids to reduce within-cluster squared Euclidean distance. It is efficient and easy to inspect, but favors compact, roughly spherical groups and requires a choice of k in advance.",
      "Hierarchical clustering builds a nested tree of similarities. In this analysis, average linkage with cosine distance merges recordings or groups according to the average angular dissimilarity between their feature vectors. Cosine distance emphasizes the direction of a feature profile rather than its overall magnitude. The dendrogram lets us inspect multiple possible cuts instead of committing to one k immediately, but the chosen cut still imposes a division.",
      "The study compares K-means and hierarchical clustering alongside DBSCAN, OPTICS, HDBSCAN, Gaussian mixture models, and spectral clustering. Comparing methods helps distinguish a pattern that appears under several assumptions from one created by a particular algorithm. Cluster labels are treated as exploratory acoustic groupings—not as species labels, richness estimates, or confirmed ecological communities."
    ],
    images: [
      { src: `${FIG}concept-kmeans.png`, alt: "Conceptual illustration of a K-means partition and cluster centers", caption: "Partitional clustering: K-means assigns every recording to one of k groups around centroids. The group count is selected before fitting." },
      { src: `${FIG}concept-hierarchical.png`, alt: "Conceptual dendrogram illustrating nested relationships under hierarchical clustering", caption: "Hierarchical clustering: recordings are joined into nested groups. A horizontal cut determines the final assignments; the branches are not ecological labels." }
    ] as Img[]
  },
  dataPrep: {
    paragraphs: [
      "The clustering input is an unlabeled numeric matrix with 275 recordings and 50 acoustic features. Each row is one recording; each feature column describes a numerical property of its sound. The main comparisons use Yeo–Johnson-transformed, z-scored features. Yeo–Johnson reduces the mean absolute skewness across the fifty primary features from about 1.58 to 0.08 before standardization, making extreme skew less dominant in the resulting geometry.",
      "Species, common and scientific names, state, recording identity, date/time, and QC flag are held out of the feature matrix used to fit clustering. They remain available for post-hoc interpretation and diagnostic coloring, so they can help us ask what a cluster corresponds to without leaking the answer into the grouping process. The sample CSV contains only numeric model inputs.",
      "This distinction is crucial: the model does not discover species labels because it never sees them during fitting. If we color a finished scatter plot by state or QC flag, that is a separate overlay for interpretation, not a feature that the clustering algorithm used."
    ],
    images: [
      { src: `${FIG}data-sample-clustering.png`, alt: "A preview of the unlabeled numeric data supplied to clustering", caption: "Sample input: numeric acoustic features only. Species/state metadata and quality labels are kept outside the fitting matrix." }
    ] as Img[],
    links: [
      { label: "Download clustering input sample (CSV)", href: "/data/samples/clustering_input_sample.csv", note: "Numeric features only; no species or state labels" },
      { label: "Full clustering notebook", href: `${GH}/research/notebooks/06_H_Clustering.ipynb`, note: "K-means, hierarchical, density-based, mixture and spectral methods" },
      { label: "Processed clustering results and figures", href: "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/data/processed/clustering" }
    ] as LinkSpec[]
  },
  code: {
    paragraphs: [
      "The notebook builds on the prepared numeric matrix and tests several values of k rather than treating the number of groups as self-evident. For K-means it fits partitions and records within-cluster inertia and silhouette scores. For hierarchical clustering it calculates cosine distances, applies average linkage, examines the resulting dendrogram, and evaluates alternative tree cuts. The exported results also support comparisons across algorithms, robustness checks, and post-hoc comparisons with held-out metadata.",
      "Euclidean distance measures straight-line separation in feature space and underlies the K-means objective after standardization. Cosine distance measures the difference in orientation between feature vectors and is used with average linkage for the hierarchical analysis. These metrics encode different notions of similarity, so different partitions do not necessarily mean one algorithm is broken; they can expose different aspects of the data."
    ],
    links: [
      { label: "06_H_Clustering.ipynb — K-means and hierarchical clustering", href: `${GH}/research/notebooks/06_H_Clustering.ipynb`, note: "Main reproducible notebook" },
      { label: "PCA and clustering analysis notebook", href: `${GH}/research/notebooks/06_PCA_Clustering_Analysis.ipynb` },
      { label: "Yeo–Johnson K-means cluster-count sweep", href: `${GH}/data/processed/clustering/yj_kmeans_k_sweep.csv` },
      { label: "Cross-method agreement matrix", href: `${GH}/data/processed/clustering/clustering_ari_matrix.csv` }
    ] as LinkSpec[]
  },
  results: {
    paragraphs: [
      "The number of clusters was tested across multiple candidate values, rather than selecting two groups by assumption. In the primary Yeo–Johnson analysis, K-means reaches its best silhouette of about 0.133 at k = 2; hierarchical clustering using cosine distance and average linkage reaches about 0.188, also at k = 2. The hierarchical score is higher, but both scores are modest and point to weak separation rather than cleanly distinct groups.",
      "A silhouette score compares how close a recording is to its own cluster with how close it is to the nearest alternative cluster. It ranges from −1 to 1: values near 1 suggest a well-separated assignment, values near 0 indicate a point near a boundary, and negative values suggest it may fit another cluster better. These scores are relative measures of geometric separation; they do not measure biodiversity or ecological quality.",
      "How to read the K-means elbow curve: the vertical axis shows within-cluster sum of squares (inertia) and the horizontal axis shows k. Inertia decreases whenever more centroids are added, so the useful clue is a bend where extra clusters produce smaller improvements. The elbow is a heuristic, not proof of a natural group count. The cluster scatter plot projects assignments into PC space: it makes the partition visible but compresses the full 50-feature space into two displayed axes, so overlap in the projection is possible.",
      "How to read the silhouette curve and profiles: the curve compares average silhouette values across candidate k values and methods; selecting a maximum chooses the best candidate among those tested, not necessarily a strong solution. The individual profile sorts recording-level silhouette values by cluster. Long positive bars indicate better-matched observations; bars near zero or below zero reveal overlap, ambiguous membership, or possible misassignment. A mean can conceal these uneven individual experiences.",
      "The hierarchical dendrogram shows which recordings or subgroups merge and at what cosine-distance height. Cutting the tree at a lower height produces more groups; cutting higher produces fewer. The interactive cut controls allow k = 2, 3, 4, 5, 6, or 8 so readers can see how assignments change. Its tree shape is a record of the chosen distance and linkage rules, not evidence that each branch is a distinct ecological community.",
      "The side-by-side comparison favors hierarchical clustering by average silhouette (about 0.188 versus 0.133 for K-means in the Yeo–Johnson run), but that difference should not be overstated. The K-means two-cluster assignments show a median bootstrap adjusted Rand index around 0.87, indicating good repeatability under the specific resampling procedure. Agreement between the K-means and hierarchical partitions is only around 0.50, however, so stability within one method is not the same as agreement across methods.",
      "Additional algorithms test whether the apparent structure depends on the shape assumptions. DBSCAN, OPTICS, and HDBSCAN did not find a multi-cluster solution covering at least half of recordings under the tested configurations; where groups were found, most points remained noise. Gaussian mixture model selection favored six spherical components by BIC among candidates, but its silhouette was only about 0.071 and one component held a single recording. Spectral clustering's best tested two-cluster setting had a silhouette near 0.150 and very low bootstrap stability. Across these methods there is no strong evidence of widely separated acoustic communities.",
      "The ecological checks make the limitation clearer. Post-hoc comparisons used 172 recordings across 56 species; adjusted mutual information between species and cluster labels was only 0.021 for K-means and 0.025 for hierarchical clustering. The hierarchical species association reached a nominal permutation p-value of 0.0454, but its effect size was small; the K-means relationship and state associations were not significant in the reported analysis. Cluster membership was strongly aligned with PC1 (absolute correlation about 0.80 for K-means and 0.71 for hierarchical clustering), suggesting that the groups may follow one dominant acoustic gradient."
    ],
    figures: [
      { src: "/figures/clustering/18-yj-elbow.png", alt: "Elbow curve for K-means under the Yeo–Johnson representation", caption: "Yeo–Johnson elbow curve: within-cluster inertia falls as k increases. Look for diminishing improvements, not a guaranteed ecological group count." },
      { src: "/figures/clustering/19-yj-silhouette.png", alt: "Silhouette score by candidate cluster count for K-means", caption: "K-means silhouette scores peak at k = 2 (about 0.133). The highest candidate score is still modest, so the two groups are weakly separated." },
      { src: "/figures/clustering/07-kmeans-clusters.png", alt: "K-means cluster assignments in a two-component PCA projection", caption: "K-means cluster assignments projected into PC1–PC2 space. This view is useful for orientation but does not show all 50 dimensions." },
      { src: "/figures/clustering/20-yj-hier-silhouette.png", alt: "Hierarchical clustering silhouette score by candidate cut", caption: "Hierarchical clustering peaks at k = 2 with a silhouette near 0.188, higher than K-means but still weak." },
      { src: "/figures/clustering/21-yj-dendrogram.png", alt: "Hierarchical clustering dendrogram using cosine distance", caption: "The dendrogram records nested merges under cosine distance and average linkage. A cut defines a candidate partition; branches do not establish biological categories." },
      { src: "/figures/clustering/10-kmeans-profile.png", alt: "Per-recording silhouette profile for K-means", caption: "Individual K-means silhouette values show whether the average score hides weakly assigned recordings." },
      { src: "/figures/clustering/11-hier-profile.png", alt: "Per-recording silhouette profile for hierarchical clustering", caption: "Hierarchical silhouette profile: low or negative bars indicate recordings close to another cluster or poorly represented by their assignment." },
      { src: "/figures/clustering/25-yj-crosstab.png", alt: "Cross-tabulation of K-means and hierarchical cluster assignments", caption: "Cross-tabulation compares where the methods agree and disagree. The adjusted Rand index summarizes partition agreement beyond chance." },
      { src: "/figures/clustering/26-bootstrap.png", alt: "Bootstrap clustering stability results", caption: "Bootstrap stability indicates that the K-means split repeats under this resampling procedure; it does not establish ecological validity." },
      { src: "/figures/clustering/14-gmm-bic.png", alt: "Gaussian mixture model BIC comparison", caption: "BIC balances candidate fit against model complexity. The best value among tested candidates does not mean that components correspond to ecosystems." },
      { src: "/figures/clustering/12-dbscan-kdist.png", alt: "DBSCAN k-distance parameter diagnostic", caption: "The k-distance plot helps explore candidate neighborhood radii; a bend can guide tuning but cannot guarantee a useful density solution." },
      { src: "/figures/clustering/13-optics.png", alt: "OPTICS reachability plot", caption: "The reachability plot displays local density relationships along an ordering of observations. Extraction settings determine which valleys become clusters." },
      { src: "/figures/clustering/17-spectral.png", alt: "Spectral clustering silhouette diagnostic", caption: "Spectral clustering builds a graph of local relationships; its tested score and low stability suggest only limited global structure." }
    ] as Img[]
  },
  conclusions: {
    paragraphs: [
      "Clustering gives a useful way to explore acoustic similarity, but this dataset does not yield clearly separated groups. K-means and hierarchical clustering both select k = 2 among the tested Yeo–Johnson candidates, yet their silhouette values (about 0.133 and 0.188) remain low. Hierarchical clustering scores somewhat better by this metric, while the algorithms agree only partially and density-based methods do not find a broad, well-separated grouping under the tested settings.",
      "The results make an important distinction between repeatability and meaning. A clustering solution can remain stable when the sample is resampled and still fail to correspond to a useful ecological category. Here, cluster labels relate weakly to species, while they align strongly with the first principal component. The simplest interpretation is that the algorithms may be splitting recordings along a dominant acoustic gradient, not discovering biological communities.",
      "For soundscape analysis to become a defensible biodiversity measure, the next step is independent validation: compare acoustic patterns with species observations and accepted biodiversity estimates while controlling for season, geography, recording quality, and sampling effort. The groups in this analysis are hypotheses to investigate—not a count of species, a map of ecological communities, or proof that acoustic features can already predict biodiversity."
    ]
  }
};
