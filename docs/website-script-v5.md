# Website research script — author review

Draft copy separated from design. Original Introduction/questions unchanged. Development results only; final test unevaluated.

## NaiveBayes

### Overview — Combining acoustic evidence.

A transparent probabilistic baseline asks how measurements support each recorded state.

Naïve Bayes combines a class prior with feature likelihoods, assuming conditional independence given the class. Acoustic measurements can be correlated, so this simplifying assumption is an approximation.

Multinomial Naïve Bayes

Each of 50 acoustic features is assigned to a training-derived quantile bin. The selected five-bin representation has 250 possible tokens and 50 active tokens per recording. These tokens describe measurement ranges, not bird counts.

Training counts tokens within each state. Prediction chooses the state with the largest log score: log P(state) + Σ token count × log P(token | state). Summing logarithms avoids multiplying many small numbers.

Why additive smoothing matters

The estimate is θ = (token count + α) / (total class tokens + α × vocabulary size). An unseen token would otherwise have zero likelihood. The selected model uses α = 1. In the worked fit, a rare token has count 2; the zero-count example is explicitly hypothetical.

[Figure: nb_smoothing.png] Additive smoothing: a real rare-token example and a separately labeled hypothetical unseen token.

Bernoulli and Gaussian comparisons

Bernoulli NB uses 50 training-thresholded low/high indicators; both zero and one contribute to its class score. These do not encode bird absence or presence. Gaussian NB instead models continuous feature distributions within each class.

### Data Preparation — Learn the representation inside training.



Only labeled recordings enter supervised learning. The corrected primary cohort contains 236 recordings: CA 85, AZ 79 and TX 72. Geographic decisions preserved the original source data; 38 outside-scope recordings and one unresolved case are not in the modeling cohort.

Fixed partition support

| Recorded state | Development | Held-out test |
| --- | --- | --- |
| CA | 65 | 20 |
| AZ | 66 | 13 |
| TX | 53 | 19 |
| Total | 184 | 52 |

Recordings sharing an exact coordinate group remain together. Five development folds use the same grouping rule. This prevents exact-coordinate overlap, but does not guarantee independence from nearby sites, shared recordists or species. The modeling unit is a recording, not one of its constituent audio windows.

The 50 mean acoustic predictors are complete and finite. Recording IDs, coordinates, species names and state labels are not included as predictors. All fitted transformations use training rows only; validation and test measurements do not set bin boundaries.

[Figure: sample.png] Labeled sample: IDs identify records and model_state supplies the target; three of 50 predictors are shown.

[Figure: training.png] Development training pool: 184 recordings. Each cross-validation model uses only its own training folds.

[Figure: test.png] Held-out test sample: 52 recordings, not used to fit or select these models.

[Labeled sample CSV](/research/labeled_sample.csv)

[Development CSV](/research/development_train.csv)

[Held-out sample/data CSV](/research/heldout_test.csv)

[Split and representation notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/splits_and_representations.ipynb)

Fourteen original features contain valid negative values, including MFCCs and NDSI. They were not clipped to zero. Multinomial NB receives nonnegative one-hot bin indicators; Bernoulli NB receives binary indicators.

[Figure: encoded_training.png] An illustrative three-bin training representation from the preparation audit. The selected MNB model subsequently uses five bins, not three.

### Code — Follow the reproducible trail.



The notebook records the six-setting Multinomial search, Bernoulli and Gaussian comparisons, saved out-of-fold predictions and a manual prediction calculation. The reusable representation module keeps preprocessing inside each training fold.

[Naïve Bayes notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Naive_Bayes.ipynb)

[Reusable representation code](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/src/supervised/representations.py)

[Saved NB results](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/data/processed/supervised/v1/naive_bayes)

**Selection rule**

Choose by mean macro-F1 across the five fixed development folds. Pooled out-of-fold summaries answer a different aggregation question and do not replace that rule.

[Figure: nb_worked_prediction.png] Worked held-out development prediction for recording 1080405. Relative log scores are not calibrated confidence.

### Results — A correct label is only part of the story.



**Development evidence only**

184 development recordings; five fixed exact-coordinate-group folds. The 52-recording final test remains unevaluated. Model configurations were selected on these development folds.

Pooled development out-of-fold scores

| Model | Accuracy | Balanced accuracy | Macro-F1 |
| --- | --- | --- | --- |
| Multinomial NB | 0.462 | 0.459 | 0.459 |
| Bernoulli NB | 0.473 | 0.464 | 0.464 |
| Gaussian NB | 0.440 | 0.439 | 0.438 |

[Figure: selected_nb_oof_confusion_matrices.png] Selected NB confusion matrices: every prediction excludes that recording’s coordinate group from training.

**High scores did not imply reliability**

MNB assigned scores ≥ 0.90 to 113 recordings; 55 were correct. Their mean probability was about 0.982, but observed accuracy was about 0.487.

[Figure: top_label_reliability.png] Top-label reliability on development predictions. Small bins and shared locations limit precision.

Sigmoid calibration reduced mean-fold log loss from 2.7611 to 1.1083 while macro-F1 decreased from 0.4698 to 0.3930. Inner calibration splits preserve location groups, but the base configuration was selected on the outer development folds.

[Figure: calibration_tradeoff.png] Calibration improves probability scoring while weakening classification in this development experiment.

### Conclusions — Useful evidence, qualified confidence.



The models distinguish some aspects of this sampled regional collection, with substantial variability across held-out coordinate groups. They do not establish geography independently of taxonomy, habitat or recording conditions.

**Connection to Q7 and Q10**

Consistency and uncertainty must be evaluated together. A confident state prediction is not an estimate of biodiversity or evidence of habitat quality.

The next biological test uses expert-annotated soundscapes. Until that evaluation is complete, predictions support acoustic discrimination rather than direct richness claims.

## DecTrees

### Overview — A sequence of acoustic decisions.

Decision trees make a prediction inspectable: follow the measurements from a split to a leaf.

A tree selects feature thresholds that reduce class impurity, recursively dividing training recordings. A new recording follows those rules to a terminal leaf. Depth limits, minimum leaf support and pruning constrain complexity.

Gini, entropy and information gain

Gini impurity is 1 − Σ p². Entropy is −Σ p log₂ p. Both measure class mixing; information gain is parent entropy minus the sample-weighted entropy of the children. A larger reduction is a cleaner split of the training labels.

[Figure: annotated_stump.png] An entropy stump fitted on 150 fold-0 training recordings. Its value arrays follow the displayed class order.

[Figure: split_class_composition.png] The split changes class composition; it does not discover a biological boundary.

Different features, threshold values, branch orders and constraints produce many trees. Unrestricted real-valued thresholds allow infinitely many numerical descriptions, while a fixed finite dataset and bounded tree structure admit finitely many distinct training partitions.

### Worked Split — Measure the goodness of a split.



Spectral centroid ≤ 2,335.9602 Hz

| Node | n | CA | AZ | TX |
| --- | --- | --- | --- | --- |
| Parent | 150 | 52 | 58 | 40 |
| Left | 50 | 31 | 6 | 13 |
| Right | 100 | 21 | 52 | 27 |

Parent entropy is 1.568400 bits. Child entropies are 1.29994 and 1.47342 bits. Weighted child entropy = (50/150 × 1.29994) + (100/150 × 1.47342) = 1.415596 bits. Information gain is therefore 0.152804 bits.

The same split reduces Gini impurity by 0.072933. This calculation evaluates the entropy-selected split; it does not claim that a Gini stump would select the same threshold.

**Physical interpretation**

Spectral centroid describes the center of spectral energy. It is not a direct measurement of bird pitch, species richness or habitat condition.

### Data Preparation — The same grouped comparison.



Only labeled recordings enter supervised learning. The corrected primary cohort contains 236 recordings: CA 85, AZ 79 and TX 72. Geographic decisions preserved the original source data; 38 outside-scope recordings and one unresolved case are not in the modeling cohort.

Fixed partition support

| Recorded state | Development | Held-out test |
| --- | --- | --- |
| CA | 65 | 20 |
| AZ | 66 | 13 |
| TX | 53 | 19 |
| Total | 184 | 52 |

Recordings sharing an exact coordinate group remain together. Five development folds use the same grouping rule. This prevents exact-coordinate overlap, but does not guarantee independence from nearby sites, shared recordists or species. The modeling unit is a recording, not one of its constituent audio windows.

The 50 mean acoustic predictors are complete and finite. Recording IDs, coordinates, species names and state labels are not included as predictors. All fitted transformations use training rows only; validation and test measurements do not set bin boundaries.

[Figure: sample.png] Labeled sample: IDs identify records and model_state supplies the target; three of 50 predictors are shown.

[Figure: training.png] Development training pool: 184 recordings. Each cross-validation model uses only its own training folds.

[Figure: test.png] Held-out test sample: 52 recordings, not used to fit or select these models.

[Labeled sample CSV](/research/labeled_sample.csv)

[Development CSV](/research/development_train.csv)

[Held-out sample/data CSV](/research/heldout_test.csv)

[Split and representation notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/splits_and_representations.ipynb)

Trees use continuous numeric predictors. Scaling is not required for threshold splits. The preprocessing pipeline remains training-fitted, and species labels are excluded from the predictors.

### Code — Rules you can inspect and reproduce.



[Decision Trees notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Decision_trees.ipynb)

[Saved configurations and rules](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/data/processed/supervised/v1/decision_trees)

The search compares Gini depth 3, entropy depth 5 and a predefined cost-complexity pruning grid. All use a minimum of five samples per leaf and the same validation folds. The three diagrams below are full-development presentation fits, not the models used to calculate each held-out prediction.

[Figure: Gini_depth3.svg] Gini depth 3: eight leaves in the full-development presentation fit.

[Figure: Entropy_depth5.svg] Entropy depth 5: eighteen leaves in the full-development presentation fit.

[Figure: Gini_pruning_0.02.svg] Pruned Gini, α = 0.02: nine leaves in the full-development presentation fit.

### Results — More branches do not guarantee transfer.



**Development evidence only**

184 development recordings; five fixed exact-coordinate-group folds. The 52-recording final test remains unevaluated. Model configurations were selected on these development folds.

Pooled development out-of-fold scores

| Configuration | Accuracy | Macro-F1 |
| --- | --- | --- |
| Gini depth 3 | 0.489 | 0.482 |
| Entropy depth 5 | 0.413 | 0.401 |
| Gini pruning α = 0.02 | 0.408 | 0.402 |

[Figure: three_tree_oof_confusion_matrices.png] Counts and per-state recall for three configurations on the same development recordings.

[Figure: pruning_tradeoff.png] Pruning trades training fit against rule complexity; excessive pruning reduced validation performance.

The Gini depth-3 configuration led the tested trees by mean-fold macro-F1. Its comparison with entropy depth 5 changes both criterion and depth, so the difference cannot be attributed to criterion alone.

### Conclusions — Readable rules can still be wrong.



For held-out development recording 1080405, the tree predicted TX although the recorded state was AZ. Its path used spectral centroid, biophony and MFCC 3. The reached leaf contained 14 TX recordings out of 17 training examples.

**Training composition is not calibrated confidence**

A leaf fraction of 14/17 describes the training examples reaching that leaf. It does not establish an 82.4% chance that this new recording is from Texas.

Root features changed among spectral centroid, RMS and zero-crossing rate across folds. Interpretability exposes decisions, but unstable rules should not be presented as universal ecological thresholds.

## Generalization

### Feature Families — Which measurements carry the distinction?



The same fixed depth-3 Gini tree was compared across registered feature families. Five temporal/amplitude features reached mean-fold macro-F1 0.4628 versus 0.4517 for all 50 features. This small average advantage concealed substantial fold variation.

[Figure: feature_family_paired_changes.png] Paired changes against the all-feature tree. Individual fold points are not confidence intervals.

**An acoustic result, not a biodiversity ranking**

A feature family that distinguishes states poorly may still be biologically informative. Gain, distance and background noise can also affect amplitude measurements. Family size and correlation limit interpretation.

### Quality & Regularization — Test the assumptions behind the score.



Using the same eligible validation recordings, restricting training by the predefined short-duration/bandwidth policy changed mean macro-F1 from 0.4505 to 0.4183. One fold drove much of the decrease. This does not prove that flagged recordings are beneficial.

Logistic regression tested continuous standardized features and the same five-bin representation used for MNB. Weaker regularization worsened log loss and Brier score in every fold for both representations; classification changes were less consistent.

[Figure: regularization_tradeoff.png] Classification and probability quality respond differently to regularization. Grey lines connect the same fold.

### Next Tests — Independent locations, unfamiliar taxa.



**Registered, not yet reported**

Nested location-group learning subsets are saved. No fitted learning-curve results are claimed in this checkpoint.

Species familiarity and species-disjoint evaluation require a support audit. A change in performance under species holdout would reveal sensitivity to a changed evaluation population, not establish taxonomy as the sole explanation.

[Generalization notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Generalization_and_feature_families.ipynb)

[Research status and limitations](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/docs/research-status.md)

## Biodiversity

### Biological Reference — What was audibly present?

An annotated species set is a more direct biological reference than a state label.

The Sapsucker Woods collection contains 285 hour-long New York soundscapes with expert time–frequency annotations. Its 53,503 boxes include 2,743 unidentified-call boxes; the lookup contains 81 named species and one unknown category.

One-minute biological reference

| Measure | Support |
| --- | --- |
| Recording files | 285 |
| Provisional UTC sampling sessions | 21 |
| One-minute intervals | 17,100 |
| Intervals with zero named species annotated | 8,255 |
| Intervals without positive-duration annotations | 7,970 |

**No annotation is not confirmed absence**

Count distinct named species with positive time overlap. Track unknown calls separately; never count “unknown” as one species. Source selection and annotation limitations prevent treating this as total site biodiversity.

Nine zero-duration boxes remain in the audit and flag affected intervals. They do not contribute to primary overlap counts. UTC dates are provisional temporal groups, not independent recorder locations.

[Source dataset and annotation protocol](https://zenodo.org/records/7079380)

### Pilot & Detector — Establish the measurement before the claim.



Seven recordings were selected using metadata and a fixed seed, one per sampled month, without using species outcomes. Their sessions are development-reserved. All seven files passed ZIP CRC verification and are exactly one hour of 32 kHz mono audio.

BirdNET-Analyzer 2.4.0 uses the V2.4 FP32 acoustic model in an isolated environment. The first fixed pilot recording was analyzed without location/date filtering or an annotation-derived species list, using nonoverlapping three-second windows.

**10,655 candidate rows are not bird counts**

An output floor of 0.01 retains candidates for later scoring. Candidate labels, taxonomy and biological errors still require validation. No detector-derived richness result is reported here.

Model and label hashes, run settings and source-audio fingerprints are saved. Potential overlap with pretrained-model development data remains unresolved; this is not yet established as independent external validation.

### Research Bridge — From signals to biological evidence.



Study A asks whether acoustic features distinguish regional recording groups. Study B asks whether the same measurements relate to annotated audible species composition and richness. The datasets remain separate; New York results cannot establish CA/AZ/TX biodiversity differences.

Planned paired signal experiments examine bandwidth and background-noise sensitivity. Evaluate species precision/recall alongside richness error: predicting two incorrect species can still produce the correct count of two.

[Annotated soundscape notebook](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/annotated_soundscapes_biodiversity.ipynb)

[Pilot and reference artifacts](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/data/processed/biodiversity)

## Conclusions

### Findings — Distinguishing sound is the starting point.



Geographic review corrected the foundation of the supervised analysis. Grouped development evaluation reveals some regional acoustic discrimination, substantial variation across locations, and a separation between classification accuracy and probability quality.

**The central distinction**

A successful state prediction is not a measurement of species richness, habitat quality or conservation value. The annotated-soundscape pilot introduces a biological reference for testing that next step.

The goal is to support ecological interpretation with reproducible evidence. Acoustic models complement field knowledge and conservation practice; they do not replace them.

### Limitations & Next Steps — Keep uncertainty visible.



Species composition, sampling design and recording conditions remain potential explanations for regional differences. Exact-coordinate grouping addresses one dependence mechanism. Selected-pipeline development scores are not independent final-test estimates.

Complete taxonomy alignment and the biodiversity pilot evaluation, finish registered robustness work, and freeze the evaluation protocol before using the regional holdout. Publication claims require appropriate biological validation and investigation of pretrained-model data overlap.

[Current research status](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/docs/research-status.md)

## Sources

### Code & Data — Follow every result to its source.



[Geographic and eligibility audit](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Supervised_data_audit.ipynb)

[Splits and representations](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/splits_and_representations.ipynb)

[Naïve Bayes](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Naive_Bayes.ipynb)

[Decision Trees](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Decision_trees.ipynb)

[Generalization](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/Generalization_and_feature_families.ipynb)

[Biodiversity pilot](https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/forest-experience-integration/research/notebooks/annotated_soundscapes_biodiversity.ipynb)

[Website asset provenance](/research/provenance.json)

Figures and sample CSVs are copied from the saved research artifacts. The provenance manifest records source paths and SHA-256 fingerprints. Research downloads and model weights are not bundled with the website.

### Credits & Scope — Acknowledge the observations.



[Xeno-canto recording archive](https://xeno-canto.org/)

[Sapsucker Woods — Kahl, Charif and Klinck](https://doi.org/10.5281/zenodo.7079380)

[BirdNET: avian diversity monitoring](https://doi.org/10.1016/j.ecoinf.2021.101236)

[Expedition recording credits](/audio/expedition/CREDITS.md)

Expedition recordings retain their individual source licenses and attribution. Scenery and animated habitat elements are illustrative. The expedition is an educational experience, not a live ecological survey.

**Author review in progress**

This structure contains factual working copy. Final prose and interpretation will be reviewed by the author against the assignment guidelines before submission.
