# Website update brief — draft for author review

Preserve the forest expedition and field-journal visual identity. This document records the agreed direction, not an assertion that the new design or copy is implemented. Preserve original research questions and existing PCA/clustering information; flag the cohort version used by older analyses.

## Navigation and accessibility
Provide direct chapter links: Introduction, Data, PCA, Clustering, Naive Bayes, Decision Trees, Biodiversity, Conclusions, Sources & Code. Provide visible chapter index, previous/next pages and shareable subsection URLs. Prefer discrete journal pages to a single long research scroll. Optional page-turn animation must respect reduced motion; keyboard navigation, visible focus, sufficient contrast and responsive spacing are required. No gradient text, white-on-white text or essential paragraphs baked into images. Generous spacing and selective bold emphasis should support reading.

Offer both an optional immersive expedition and direct research-journal entry. Decorative realistic bird animation must not obstruct content or imply live observation. Audio requires user interaction with persistent mute/volume controls. Keep animations restrained during research reading.

## Scientific narrative
Sound -> measurement -> acoustic representation -> statistical decision -> biological interpretation -> limitations. Study A measures regional discrimination, not biodiversity. Study B uses expert annotations for audible species sets and richness; automated detections are predictions, not ground truth. Treat all current model scores as development or pilot results. Clearly state the regional final test is unevaluated. Use docs/research-status.md and saved result tables as factual sources.

## Assignment checklist
Introduction: at least four author-reviewed paragraphs, at least two relevant images, original ten research questions retained. If authorship rules require the student's prose, the student must write/revise it.

Naive Bayes has independently navigable Overview, Data Preparation, Code, Results and Conclusions subsections. Explain Multinomial training/prediction, conditional independence, bin-token representation, additive smoothing and Bernoulli indicators; Gaussian is a supplementary comparison. Show linked labeled/train/test sample CSVs and images, explain group-disjoint splitting and training-only transformations. Link executable notebook and reusable representations module. Include accuracy, confusion matrices and topic-specific conclusions. Add meaningful smoothing, worked-prediction and probability-reliability figures. Distinguish mean-fold selection from pooled OOF reporting.

Decision Trees has Overview, Data Preparation, Code, Results and Conclusions subsections. Explain training/prediction, Gini, entropy and information gain; use the real worked split. Include at least two explanatory images. Explain the many possible tree constructions without claiming infinitely many distinct partitions of a fixed finite dataset. Show linked labeled/train/test samples and split code. Include at least three complete trees, accuracy, confusion matrices and conclusions. Full-development diagrams must not be represented as held-out performance. Provide zoomable SVGs and accessible text rules.

## Page content and useful visuals
- Landing: title, research question, expedition/journal choices and honest stage indicators.
- Data: original 275 recordings -> corrected 236; grouped 184/52 split; downloadable decisions and manifests.
- NB: selected model comparison, confusion matrices, smoothing example and calibration trade-off. Model scores are not calibrated ecological certainty.
- Trees: worked split, three diagrams, pruning plot, decision-path example and stability limitations.
- Generalization: feature-family, matched quality and logistic regularization comparisons. Mark learning curves as pending until fitted outputs exist.
- Biodiversity: reference annotation design, unknown-label policy, seven-file pilot, annotated spectrogram/audio and initial BirdNET stage. Do not report candidate rows as species richness.
- Conclusions: what is supported, what remains confounded, and the next validated biological question.
- Sources & Code: real download links, notebook/module links, recording/dataset/model attribution and applicable licenses.

Original introduction/classification sample images are available in data/processed/supervised/v1/assignment_artifacts_20261030T020845905141Z. NB and tree plots are in their timestamped analysis folders. Biodiversity annotation overlays are in the pilot annotation_alignment_review folder. Original audio and generated playback WAVs are local; do not create broken public audio links or redistribute recordings without checking source terms.

## Publication safeguards
Do not infer state biodiversity differences from focal-species sample counts. Do not infer abundance from annotation boxes, bird presence from Bernoulli feature indicators, or calibrated confidence from tree leaf composition. Report pretrained-model training overlap as unresolved. New York soundscapes are a complementary measurement study, not extra CA/AZ/TX examples. Preserve metadata provenance, unknown annotations, fixed splits and superseded-manifest history.
