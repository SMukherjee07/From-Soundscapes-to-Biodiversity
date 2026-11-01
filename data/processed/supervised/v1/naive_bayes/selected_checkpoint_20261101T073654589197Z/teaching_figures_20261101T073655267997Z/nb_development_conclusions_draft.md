# Naive Bayes — provisional development conclusions

Status: development analysis only. Final holdout evaluation is pending.

## Purpose
These classifiers predict verified regional labels from acoustic measurements.
The primary question is original Q7: How consistently do acoustic characteristics
distinguish different groups of recordings?

## Findings
The selected Multinomial NB pipeline uses five quantile bins per feature and
alpha = 1. Its mean-fold macro-F1 is
0.470, compared with
0.143 for the prior baseline.

The selected Bernoulli and Gaussian pipelines achieve mean-fold macro-F1 of
0.457 and
0.418, respectively.

Pooling the selected pipelines' development predictions gives macro-F1
0.459 for Multinomial NB and
0.464 for Bernoulli NB.
The ranking differs because pooled and mean-fold metrics aggregate differently.
Selection remains based on the predefined mean-fold metric.

## Interpretation
Q7 is partially supported: acoustic measurements carry predictive information
relative to the tested baseline, but performance varies substantially between
held-out location groups. The small differences among smoothing/bin settings
do not resolve this variability.

For Q1, classification demonstrates some regional discrimination in this
selected collection; it does not identify a causal geographic mechanism or,
by itself, establish which physical acoustic characteristics explain it.

For Q6 and Q10, uneven species composition, geographic concentration, duration,
and recording conditions limit ecological interpretation. This is a selected
focal-recording collection, not a standardized biodiversity survey.

## Limits
These configurations were selected using the same development folds summarized
here. Their reported scores are selection-conditioned, not independent final
performance estimates. Location grouping does not guarantee separation of
nearby sites or recordists. Pipeline comparisons change both representation
and likelihood assumptions. Model probabilities have not been calibrated.

## Pending before final conclusions
Evaluate frozen configurations on the reserved holdout; report class support,
confusion matrices, accuracy, macro-F1, and uncertainty under the planned
protocol. Complete the predefined quality sensitivity and feature-family
analyses where feasible, without tuning on final-test outcomes.
