# Research checkpoint — 1 November 2026

## Scope and evidence status
Study A tests regional acoustic discrimination in selected focal-bird recordings. Study B evaluates acoustic evidence against expert-annotated soundscapes. Do not pool their labels or interpret state accuracy as biodiversity. The website now separates historical development cross-validation from the frozen 52-recording final evaluation. See final_holdout_v1 and Final_holdout_evaluation.ipynb.

## Notebooks
- `research/notebooks/Supervised_data_audit.ipynb`: identity, label, geographic and eligibility audits.
- `research/notebooks/splits_and_representations.ipynb`: fixed grouped partitions and fold-fitted representations.
- `research/notebooks/Naive_Bayes.ipynb`: Multinomial, Bernoulli and Gaussian NB; smoothing, probability diagnostics and sigmoid calibration.
- `research/notebooks/Decision_trees.ipynb`: worked impurity example, three trees, pruning and held-out development decision path.
- `research/notebooks/Generalization_and_feature_families.ipynb`: feature families, matched quality sensitivity, logistic comparisons and registered learning-curve subsets.
- `research/notebooks/annotated_soundscapes_biodiversity.ipynb`: soundscape references, pilot selection, verified audio acquisition and initial BirdNET inference.

## Study A
Original cohort: 275 recordings. Geographic decisions: 230 retain, six corrected labels, 38 outside-scope exclusions and one unresolved hold. Primary cohort: 236 (AZ 79, CA 85, TX 72). Sensitivity cohort: 230, excluding predefined short-duration/bandwidth cases. Original datasets are unchanged.

Development: 184 recordings (AZ 66, CA 65, TX 53); held-out test: 52 (AZ 13, CA 20, TX 19). Exact-coordinate groups do not cross partitions or development folds. These are location proxies, not proof of independence from nearby sites or recordists. Use the group_stratified_20261030T012037371263Z manifest; the earlier primary manifest was superseded before scoring.

Selected NB pooled OOF accuracy / macro-F1:
- Multinomial NB: 0.462 / 0.459 (five bins, alpha 1).
- Bernoulli NB: 0.473 / 0.464 (alpha 1).
- Gaussian NB: 0.440 / 0.438 (var_smoothing 1e-11).

Tree pooled OOF accuracy / macro-F1:
- Gini depth 3: 0.489 / 0.482.
- Entropy depth 5: 0.413 / 0.401.
- Gini pruning alpha 0.02: 0.408 / 0.402.

Selection uses mean fold macro-F1, not pooled metrics. Selected-pipeline OOF results are selection-conditioned. Full-development tree drawings are not validation predictions.

MNB sigmoid calibration changed mean-fold log loss from 2.7611 to 1.1083 and macro-F1 from 0.4698 to 0.3930. Better probability scoring did not imply better classification. Feature-family results and quality sensitivity are exploratory and specific to the fixed reference tree. Registered location learning curves have no fitted results at this checkpoint.

## Study B
Source: https://doi.org/10.5281/zenodo.7079380 (Sapsucker Woods; Kahl, Charif and Klinck). Expert annotations include 81 named species and an unknown category. 53,503 boxes include 2,743 unknown boxes. The reference has 17,100 one-minute intervals from 285 hour-long files and 21 provisional UTC sampling sessions. Zero named annotations do not prove bird absence. Nine zero-duration boxes are excluded from positive-overlap calculations but preserved and flagged; frequency defects are tracked separately.

Seven recordings, one per sampled month, were selected without using biological outcomes. Their sessions are development-reserved; 14 sessions remain unassigned. Each pilot file passed ZIP CRC verification, has recorded SHA-256, and is 3600 seconds, 32 kHz mono PCM16. Downloaded audio and listening excerpts stay local. Notebook audio displays can be regenerated; their embedded payloads are omitted from Git.

BirdNET-Analyzer package 2.4.0; acoustic model V2.4 FP32. Separate environment: .venv-birdnet. TensorFlow 2.21.0, NumPy 2.4.6. Use MPLBACKEND=Agg for subprocesses launched from the notebook. Model hashes and resolved dependencies are in birdnet_setup. Models are downloaded using the upstream downloader, not committed here.

First fixed recording: SSW_002_20170225_020001Z.flac. Unfiltered acoustic inference, nonoverlapping three-second windows, sensitivity 1, no merging, output floor 0.01. 10,655 candidate rows were saved. These are not bird counts, validated occurrences or richness. Taxonomy alignment, biological scoring and pretrained-model training overlap assessment remain pending. Do not describe this as independent external validation until provenance supports that claim.

## Versioned artifacts and exclusions
Processed CSV/JSON, figures, small fitted trees, audit evidence, external annotation metadata and code are versioned. Virtual environments, original research audio, model weights, generated WAV excerpts, temporary ZIP tails, install logs and credentials remain local. Paths inside historical manifests record the original execution machine; notebooks require the documented project layout and may contain sequential execution dependencies.

## Remaining work
1. Finalize website copy and integrate actual artifacts with clear development/pilot labels.
2. Complete Study B label audit, taxonomy mapping and reference-based evaluation.
3. Complete registered generalization analyses and freeze final evaluation protocol.
4. Completed: regional holdout evaluated after saved model/protocol freeze. Do not retune on its results.
5. Complete source attribution, data/code links and assignment checklist.

## Frozen final evaluation

Primary MNB: 27/52 correct, accuracy 0.5192, macro-F1 0.5126. Primary Gini depth 3: 17/52, accuracy 0.3269, macro-F1 0.3256. All prespecified comparisons are in final_holdout_v1/metrics.csv. Test results do not replace development selection.
