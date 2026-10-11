import type { Img, LinkSpec } from "@/components/analysis/Slots";

const GH = "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main";
const FIG = "/figures/story/";

export const pcaContent = {
  overview: {
    paragraphs: [
      "Principal component analysis (PCA) is a way to summarize many related measurements without simply throwing most of them away. It constructs new axes, called principal components, as weighted combinations of the original features. The first component points along the direction of greatest variation in the standardized data; the second captures the greatest remaining variation while being perpendicular to the first; later components continue the same process.",
      "The linear algebra behind PCA is expressed through eigenvectors and eigenvalues. An eigenvector gives the direction of a component in feature space; its loadings show how much each original feature contributes to that direction. The corresponding eigenvalue measures the variance along that direction. Dividing an eigenvalue by the sum of all eigenvalues gives the component's explained-variance ratio.",
      "This is useful for acoustic recordings because fifty features at once are difficult to inspect. PCA makes a high-dimensional matrix easier to visualize and helps reveal correlated measurements, dominant acoustic gradients, and potential outliers. It does not automatically identify species or ecological communities: it is an unsupervised summary of numerical variation, and interpretation still depends on the loadings, preprocessing, metadata, and independent ecological evidence.",
      "High-dimensional data create several challenges. Features may be correlated, measured on very different scales, strongly skewed, noisy, or redundant. In fifty dimensions, distances and visual intuition become less straightforward, and a two-dimensional projection can conceal variation that lies in later components. Standardization and sensitivity checks make the analysis more interpretable, but they do not remove every limitation."
    ],
    images: [
      { src: `${FIG}concept-pca-axes.png`, alt: "Conceptual view of the first two principal component axes across standardized acoustic measurements", caption: "PC1 and PC2 create new axes from combinations of the original standardized features." },
      { src: `${FIG}concept-pca-compress.png`, alt: "Conceptual illustration of fifty measurements summarized by a smaller number of principal components", caption: "Dimensionality reduction keeps the main directions of variation while making the data easier to explore." }
    ] as Img[]
  },
  dataPrep: {
    paragraphs: [
      "The primary PCA matrix contains 275 recordings and 50 numeric mean acoustic features per recording. Species names, state, recording identifiers, and quality annotations are metadata rather than measurements used to define the principal components; they are retained separately so that the resulting structure can be interpreted after the PCA has been fitted.",
      "The validated primary matrix has no missing or non-finite values. Because acoustic features differ in scale and distribution, the workflow compares alternative preprocessing representations. In the distribution-aware example, selected positive features are log-transformed and the NDSI ratio uses log1p; a separate Yeo–Johnson representation is also evaluated. Each selected representation is standardized before PCA so that large numeric units do not dominate merely because of scale.",
      "One row corresponds to one recording, not one short audio window. The broader export has 100 features, while this specific PCA matrix uses 50 primary features. A sample is provided so the reader can see the shape and column structure of the numeric input rather than treating the visualization as a black box."
    ],
    images: [
      { src: `${FIG}data-sample-pca.png`, alt: "Sample rows of the PCA matrix before and after feature transformation", caption: "Example of the numeric PCA input and how selected feature transformations change scale and skew." }
    ] as Img[],
    links: [
      { label: "Download PCA input sample (CSV)", href: "/data/samples/pca_input_sample.csv", note: "275-recording workflow; sample rows and numeric columns" },
      { label: "Recording-level acoustic feature table", href: `${GH}/data/processed/acoustic_features_recording.csv` },
      { label: "PCA representation notebook", href: `${GH}/research/notebooks/6B_PCA_Representations.ipynb` }
    ] as LinkSpec[]
  },
  code: {
    paragraphs: [
      "The analysis selects the primary feature columns, validates row/column alignment and finite values, creates comparable raw and transformed representations, standardizes each matrix, and fits PCA. The notebook also compares alternative representations so that the results are not tied to a single arbitrary preprocessing decision. No species labels are used to calculate the components.",
      "The implementation then exports explained-variance ratios, eigenvalues, feature loadings, and recording coordinates. These outputs power the scree plot, loading heatmap, correlation circle, and interactive recording map below. The notebook links open the reproducible analysis rather than screenshots of source code."
    ],
    links: [
      { label: "PCA representations notebook", href: `${GH}/research/notebooks/6B_PCA_Representations.ipynb` },
      { label: "PCA and clustering analysis notebook", href: `${GH}/research/notebooks/06_PCA_Clustering_Analysis.ipynb` },
      { label: "PCA visualization notebook", href: `${GH}/research/notebooks/06_G_PCA_VISUALIZATIONS.ipynb` }
    ] as LinkSpec[]
  },
  results: {
    paragraphs: [
      "In the baseline representation, PC1 explains about 20.95% of total variance and PC1 plus PC2 explain 33.15%. The first five components explain 51.43%, and the first nine explain 67.76% (approximately 68%). Parallel analysis retains nine components because nine observed eigenvalues exceed the 95th-percentile variance expected from shuffled data. This is a useful reduction, but it also shows why PC1–PC2 alone cannot represent the entire acoustic feature space.",
      "How to read the scree plot: each bar is the variance explained by one component. The dashed curve is cumulative explained variance; the colored bars exceed the 95th-percentile permutation null, and the vertical marker indicates the retained component count. Hover over a bar to see that component's variance, eigenvalue, null threshold, and cumulative share. Eigenvalues express variance in component directions; they are not a measure of ecological importance.",
      "The feature-family chart groups squared loading contributions into acoustic indices, entropy, spectral and temporal measurements, MFCC means, and MFCC dynamics. It helps show whether a component is dominated by one family or blends several. Family shares need context: a family with many columns can contribute more simply because it contains more variables.",
      "The loading heatmap shows the signed relationship between each feature and each principal component. Strong positive and negative loadings indicate features that move in opposite directions along that component; clicking a component header sorts the view to make its strongest relationships easier to inspect. The correlation circle provides another view for PC1 and PC2: longer arrows are better represented by this plane, and arrows pointing together suggest positive correlation while opposing directions suggest negative correlation.",
      "The recording projection shows each recording in the PC space. Color can be switched among clustering assignment, state, or quality flag, and the axes can be changed to inspect additional components. It is a projection, not the full fifty-dimensional space. Recording points that overlap in two dimensions may still differ on later components, and visual separation is not by itself proof of species separation.",
      "Preprocessing sensitivity matters. Across six representations, variance in the first five components ranges from 51.43% in the baseline to 57.20% for Yeo–Johnson; the number of components needed to reach 80% ranges from 12 to 15. Removing NDSI-derived variables changes the distribution again. A larger explained-variance share means the variance is more concentrated in fewer directions; it does not mean the representation is more ecologically valid."
    ],
    figures: [
      { src: "/figures/pca/pca-1-variance.png", alt: "Explained variance across PCA components", caption: "Baseline explained variance. PC1 captures about 20.95%; the first nine components together capture about 67.76%." },
      { src: "/figures/pca/pca-2-pc1-pc2.png", alt: "Recordings projected into the first two principal components and colored by state", caption: "PC1–PC2 projection, colored by state. Geographic colors provide context after fitting; they are not inputs to PCA." },
      { src: "/figures/pca/pca-3-loadings.png", alt: "PCA feature loading plot for selected components", caption: "Feature loadings identify which measurements contribute most to selected component axes; signs indicate direction." },
      { src: "/figures/pca/pca-4-species.png", alt: "Species centroids in principal component space", caption: "Species centroids compare average positions, but centroid separation can hide substantial within-species variability and overlapping recordings." }
    ] as Img[]
  },
  conclusions: {
    paragraphs: [
      "PCA turns fifty related acoustic measurements into a smaller set of directions that can be plotted and inspected. In this dataset, the first two components provide an accessible picture but retain only about one third of the baseline variance; retaining nine components captures about 68% and passes the parallel-analysis threshold. PCA is therefore a map for exploration, not a lossless replacement for the original feature matrix.",
      "The loading views help interpret which kinds of acoustic measurements track the main directions of variation. The representation comparison also shows that preprocessing changes the geometry: the pattern is not produced by the audio alone, but partly by how its features are transformed and scaled. Strong loadings and explained variance describe statistical structure, not necessarily ecological meaning.",
      "The practical lesson is to use PCA to form hypotheses and reveal relationships, then test those hypotheses against metadata and independent observations. A convincing biodiversity interpretation needs evidence beyond a tidy low-dimensional plot, including species-level validation, geographic and seasonal context, and sensitivity to sampling and recording quality."
    ]
  }
};
