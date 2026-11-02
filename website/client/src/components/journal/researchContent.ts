type Block =
  | { kind: 'paragraph' | 'heading'; text: string }
  | { kind: 'note'; title: string; text: string }
  | { kind: 'figure'; file: string; caption: string; collapsed?: boolean }
  | { kind: 'table'; caption: string; head: string[]; rows: string[][] }
  | { kind: 'links'; links: { label: string; href: string }[] }
  | { kind: 'viz'; name: string };
type Page = { label: string; title: string; lead?: string; blocks: Block[] };
type ResearchChapter = { stage: string; pages: Page[] };
export const researchChapters: Record<string, ResearchChapter> = {
  "NaiveBayes": {
    "stage": "Study A · supervised learning · development + final test",
    "pages": [
      {
        "label": "Overview",
        "title": "Predicting recording state with Naïve Bayes",
        "lead": "Naïve Bayes uses the acoustic measurements to compare the evidence for California, Arizona and Texas.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Naïve Bayes combines a class prior with feature likelihoods, assuming conditional independence given the class. Acoustic measurements can be correlated, so this simplifying assumption is an approximation."
          },
          {
            "kind": "paragraph",
            "text": "A class prior is the frequency of a state in the training data, before considering a new recording. A likelihood describes how common an observed feature value is within a state. The model combines these quantities and predicts the state with the highest score. Its independence assumption treats measurements as independent once the state is known, even though acoustic features may remain correlated."
          },
          {
            "kind": "paragraph",
            "text": "For Multinomial NB, a token identifies a feature and its bin, such as a spectral-centroid measurement falling in the lowest training-derived range. Each recording activates one bin for each feature. Training counts these tokens separately within each state; a new recording is encoded with the same training-derived boundaries."
          },
          {
            "kind": "heading",
            "text": "Multinomial Naïve Bayes"
          },
          {
            "kind": "paragraph",
            "text": "Each of 50 acoustic features is assigned to a training-derived quantile bin. The selected five-bin representation has 250 possible tokens and 50 active tokens per recording. These tokens describe measurement ranges, not bird counts."
          },
          {
            "kind": "paragraph",
            "text": "Training counts tokens within each state. Prediction chooses the state with the largest log score: log P(state) + Σ token count × log P(token | state). Summing logarithms avoids multiplying many small numbers."
          },
          {
            "kind": "heading",
            "text": "Why additive smoothing matters"
          },
          {
            "kind": "paragraph",
            "text": "The estimate is θ = (token count + α) / (total class tokens + α × vocabulary size). An unseen token would otherwise have zero likelihood. The selected model uses α = 1. In the worked fit, a rare token has count 2; the zero-count example is explicitly hypothetical. Here, θ is the estimated probability of a token within a state; α is the smoothing amount. Without smoothing, a token absent from that state in training gives a zero likelihood and can eliminate the state from consideration. Adding α to every token count prevents this zero-frequency problem."
          },
          {
            "kind": "figure",
            "file": "nb_smoothing.png",
            "caption": "Additive smoothing: a real rare-token example and a separately labeled hypothetical unseen token.",
            "collapsed": false
          },
          {
            "kind": "viz",
            "name": "smoothing"
          },
          {
            "kind": "heading",
            "text": "Bernoulli and Gaussian comparisons"
          },
          {
            "kind": "paragraph",
            "text": "Bernoulli NB models binary features. Training estimates the probability of each indicator being one within each state, with additive smoothing to avoid zero probabilities. Prediction combines the state prior with the probabilities of both observed ones and observed zeros, then chooses the largest score. Here it uses 50 indicators thresholded at training medians; a one denotes the upper bin and a zero the lower bin. Values exactly on an internal boundary enter the upper bin. These do not encode bird absence or presence. Gaussian NB instead models continuous feature distributions within each class."
          }
        ]
      },
      {
        "label": "Data Preparation",
        "title": "Preparing labeled acoustic measurements",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Only labeled recordings enter supervised learning. The corrected primary cohort contains 236 recordings: CA 85, AZ 79 and TX 72. Geographic decisions preserved the original source data; 38 outside-scope recordings and one unresolved case are not in the modeling cohort."
          },
          {
            "kind": "paragraph",
            "text": "The target label is the recorded state: California (CA), Arizona (AZ) or Texas (TX). The 50 acoustic measurements are the inputs used to predict that label. The original collection contained 275 recordings; geographic review retained 236 eligible recordings for this task."
          },
          {
            "kind": "paragraph",
            "text": "The split used StratifiedGroupKFold with five folds, shuffle=True and random_state=42. The first fold was reserved in advance as the test set; folds and seeds were not searched for a favorable result. This produced 184 development and 52 test recordings. Grouping keeps recordings at identical coordinates together, while stratification attempts to preserve the state proportions. Five grouped folds within the development set were then used for model selection. The final models were fitted on all 184 development recordings before scoring the 52 test recordings."
          },
          {
            "kind": "viz",
            "name": "partition"
          },
          {
            "kind": "table",
            "caption": "Fixed partition support",
            "head": [
              "Recorded state",
              "Development",
              "Held-out test"
            ],
            "rows": [
              [
                "CA",
                "65",
                "20"
              ],
              [
                "AZ",
                "66",
                "13"
              ],
              [
                "TX",
                "53",
                "19"
              ],
              [
                "Total",
                "184",
                "52"
              ]
            ]
          },
          {
            "kind": "paragraph",
            "text": "Training and test sets must be disjoint: no recording, audio window derived from it, or exact-coordinate group may occur in both. Overlap would leak familiar examples into evaluation and inflate apparent generalization. The fixed partition was created before model selection; transformations and model settings were learned using development data only."
          },
          {
            "kind": "paragraph",
            "text": "Recordings sharing an exact coordinate group remain together. Five development folds use the same grouping rule. This prevents exact-coordinate overlap, but does not guarantee independence from nearby sites, shared recordists or species. The modeling unit is a recording, not one of its constituent audio windows."
          },
          {
            "kind": "paragraph",
            "text": "The 50 mean acoustic predictors are complete and finite. Recording IDs, coordinates, species names and state labels are not included as predictors. All fitted transformations use training rows only; validation and test measurements do not set bin boundaries."
          },
          {
            "kind": "figure",
            "file": "sample.png",
            "caption": "Labeled sample: IDs identify records and model_state supplies the target; three of 50 predictors are shown.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "training.png",
            "caption": "Development training pool: 184 recordings. Each cross-validation model uses only its own training folds.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "test.png",
            "caption": "Held-out test sample: 52 recordings, not used to fit or select these models.",
            "collapsed": false
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Labeled sample CSV",
                "href": "/research/labeled_sample.csv"
              },
              {
                "label": "Development CSV",
                "href": "/research/development_train.csv"
              },
              {
                "label": "Held-out sample/data CSV",
                "href": "/research/heldout_test.csv"
              },
              {
                "label": "Split and representation notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/splits_and_representations.ipynb"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "Fourteen original features contain valid negative values, including MFCCs and NDSI. They were not clipped to zero. Multinomial NB receives nonnegative one-hot bin indicators; Bernoulli NB receives binary indicators."
          },
          {
            "kind": "figure",
            "file": "encoded_training.png",
            "caption": "An illustrative three-bin training representation from the preparation audit. The selected MNB model subsequently uses five bins, not three.",
            "collapsed": false
          }
        ]
      },
      {
        "label": "Code",
        "title": "Naïve Bayes code and saved results",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "The notebook records the six-setting Multinomial search, Bernoulli and Gaussian comparisons, saved out-of-fold predictions and a manual prediction calculation. The reusable representation module keeps preprocessing inside each training fold."
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Naïve Bayes notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Naive_Bayes.ipynb"
              },
              {
                "label": "Reusable representation code",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/src/supervised/representations.py"
              },
              {
                "label": "Saved NB results",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/data/processed/supervised/v1/naive_bayes"
              }
            ]
          },
          {
            "kind": "note",
            "title": "Selection rule",
            "text": "Choose by mean macro-F1 across the five fixed development folds. Pooled out-of-fold summaries answer a different aggregation question and do not replace that rule."
          },
          {
            "kind": "figure",
            "file": "nb_worked_prediction.png",
            "caption": "Worked held-out development prediction for recording 1080405. Relative log scores are not calibrated confidence.",
            "collapsed": false
          },
          {
            "kind": "viz",
            "name": "evidence"
          }
        ]
      },
      {
        "label": "Results",
        "title": "Naïve Bayes development results",
        "blocks": [
          {
            "kind": "note",
            "title": "Development evidence only",
            "text": "184 development recordings; five fixed exact-coordinate-group folds. Model configurations were selected on these folds, so these scores are selection-conditioned. The 52-recording held-out test was evaluated once, after the protocol was frozen: see the Final Test page."
          },
          {
            "kind": "paragraph",
            "text": "Accuracy is the fraction of correct state predictions. Balanced accuracy averages recall across the three states. Macro-F1 averages their F1 scores, giving each state equal weight. An out-of-fold prediction comes from a model trained without that recording or its coordinate group. The table pools these predictions across development folds; model selection instead used the mean of the five fold-level macro-F1 scores."
          },
          {
            "kind": "table",
            "caption": "Pooled development out-of-fold scores",
            "head": [
              "Model",
              "Accuracy",
              "Balanced accuracy",
              "Macro-F1"
            ],
            "rows": [
              [
                "Multinomial NB",
                "0.462",
                "0.459",
                "0.459"
              ],
              [
                "Bernoulli NB",
                "0.473",
                "0.464",
                "0.464"
              ],
              [
                "Gaussian NB",
                "0.440",
                "0.439",
                "0.438"
              ]
            ]
          },
          {
            "kind": "figure",
            "file": "selected_nb_oof_confusion_matrices.png",
            "caption": "Selected NB confusion matrices: every prediction excludes that recording’s coordinate group from training.",
            "collapsed": false
          },
          {
            "kind": "viz",
            "name": "folds"
          },
          {
            "kind": "note",
            "title": "High scores did not imply reliability",
            "text": "MNB assigned scores ≥ 0.90 to 113 recordings; 55 were correct. Their mean probability was about 0.982, but observed accuracy was about 0.487."
          },
          {
            "kind": "figure",
            "file": "top_label_reliability.png",
            "caption": "Top-label reliability on development predictions. Small bins and shared locations limit precision.",
            "collapsed": true
          },
          {
            "kind": "paragraph",
            "text": "Sigmoid calibration reduced mean-fold log loss from 2.7611 to 1.1083 while macro-F1 decreased from 0.4698 to 0.3930. Inner calibration splits preserve location groups, but the base configuration was selected on the outer development folds."
          },
          {
            "kind": "figure",
            "file": "calibration_tradeoff.png",
            "caption": "Calibration improves probability scoring while weakening classification in this development experiment.",
            "collapsed": true
          }
        ]
      },
      {
        "label": "Final Test",
        "title": "Fifty-two recordings the models never saw.",
        "lead": "One evaluation, after the protocol was frozen.",
        "blocks": [
          {
            "kind": "note",
            "title": "How to read this page",
            "text": "The held-out set (CA 20, AZ 13, TX 19) shares no exact-coordinate group with the development recordings. Configurations, bins and α were fixed before scoring. The prior-class baseline predicts the most common training state for everyone."
          },
          {
            "kind": "viz",
            "name": "scoreboardNB"
          },
          {
            "kind": "viz",
            "name": "confusionNB"
          },
          {
            "kind": "table",
            "caption": "Final held-out test: Naïve Bayes",
            "head": [
              "Model",
              "Correct",
              "Accuracy",
              "Macro-F1"
            ],
            "rows": [
              [
                "Prior baseline",
                "13 / 52",
                "0.250",
                "0.133"
              ],
              [
                "Multinomial NB",
                "27 / 52",
                "0.519",
                "0.513"
              ],
              [
                "Bernoulli NB",
                "26 / 52",
                "0.500",
                "0.504"
              ],
              [
                "Gaussian NB",
                "22 / 52",
                "0.423",
                "0.421"
              ]
            ]
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Final-test notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Final_holdout_evaluation.ipynb"
              },
              {
                "label": "Reproducible final evaluation code",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/src/supervised/final_holdout.py"
              },
              {
                "label": "Frozen protocol",
                "href": "/research/frozen_protocol.json"
              },
              {
                "label": "Final predictions CSV",
                "href": "/research/final_predictions.csv"
              },
              {
                "label": "Final metrics CSV",
                "href": "/research/final_metrics.csv"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "Multinomial NB correctly classified 27 recordings and misclassified 25. Its accuracy was 26.9 percentage points above the prior baseline. Bernoulli NB was one correct prediction behind it. With only 52 recordings, one changed prediction moves accuracy by about 1.9 percentage points, so this small difference does not establish a reliable advantage."
          }
        ]
      },
      {
        "label": "Conclusions",
        "title": "What the Naïve Bayes results show",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "On the final test, Multinomial NB correctly classified 27 of 52 recordings (51.9%), exceeding the prior baseline of 25.0%, but still misclassifying nearly half. Acoustic measurements contain some regional information in this sample; they do not establish species richness or habitat quality. Species mix, recording conditions and uneven sampling remain plausible influences."
          },
          {
            "kind": "paragraph",
            "text": "The models distinguish some aspects of this sampled regional collection, with substantial variability across held-out coordinate groups. They do not establish geography independently of taxonomy, habitat or recording conditions."
          },
          {
            "kind": "note",
            "title": "Connection to Q7 and Q10",
            "text": "Consistency and uncertainty must be evaluated together. A confident state prediction is not an estimate of biodiversity or evidence of habitat quality."
          },
          {
            "kind": "paragraph",
            "text": "The next biological test uses expert-annotated soundscapes. Until that evaluation is complete, predictions support acoustic discrimination rather than direct richness claims."
          }
        ]
      }
    ]
  },
  "DecTrees": {
    "stage": "Study A · supervised learning · development + final test",
    "pages": [
      {
        "label": "Overview",
        "title": "How a decision tree predicts recording state",
        "lead": "Decision trees make a prediction inspectable: follow the measurements from a split to a leaf.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "A tree selects feature thresholds that reduce class impurity, recursively dividing training recordings. A new recording follows those rules to a terminal leaf. Depth limits, minimum leaf support and pruning constrain complexity."
          },
          {
            "kind": "paragraph",
            "text": "At each node, the training algorithm compares candidate feature thresholds and selects a split with the largest weighted reduction in impurity. It repeats this process within each child node until a stopping rule applies. To classify a new recording, the model follows the threshold tests from the root to a leaf and predicts the most frequent training state at that leaf. A greedy choice at one node does not guarantee the best complete tree."
          },
          {
            "kind": "paragraph",
            "text": "For Gini and entropy, p is the fraction of training examples belonging to a state at the node. A pure node contains only one state and has impurity zero. Mixing states increases impurity. Child impurities are weighted by their sample counts so that small branches do not receive the same influence as large ones. Information gain uses entropy reduction; Gini-based trees use the corresponding reduction in Gini impurity."
          },
          {
            "kind": "heading",
            "text": "Gini, entropy and information gain"
          },
          {
            "kind": "paragraph",
            "text": "Gini impurity is 1 − Σ p². Entropy is −Σ p log₂ p. Both measure class mixing; information gain is parent entropy minus the sample-weighted entropy of the children. A larger reduction is a cleaner split of the training labels."
          },
          {
            "kind": "figure",
            "file": "annotated_stump.png",
            "caption": "An entropy stump fitted on 150 fold-0 training recordings. Its value arrays follow the displayed class order.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "split_class_composition.png",
            "caption": "The split changes class composition; it does not discover a biological boundary.",
            "collapsed": false
          },
          {
            "kind": "paragraph",
            "text": "Different features, threshold values, branch orders and constraints produce many trees. Unrestricted real-valued thresholds allow infinitely many numerical descriptions, while a fixed finite dataset and bounded tree structure admit finitely many distinct training partitions."
          }
        ]
      },
      {
        "label": "Worked Split",
        "title": "Measure the goodness of a split.",
        "blocks": [
          {
            "kind": "table",
            "caption": "Spectral centroid ≤ 2,335.9602 Hz",
            "head": [
              "Node",
              "n",
              "CA",
              "AZ",
              "TX"
            ],
            "rows": [
              [
                "Parent",
                "150",
                "52",
                "58",
                "40"
              ],
              [
                "Left",
                "50",
                "31",
                "6",
                "13"
              ],
              [
                "Right",
                "100",
                "21",
                "52",
                "27"
              ]
            ]
          },
          {
            "kind": "paragraph",
            "text": "Parent entropy is 1.568400 bits. Child entropies are 1.29994 and 1.47342 bits. Weighted child entropy = (50/150 × 1.29994) + (100/150 × 1.47342) = 1.415596 bits. Information gain is therefore 0.152804 bits."
          },
          {
            "kind": "paragraph",
            "text": "The same split reduces Gini impurity by 0.072933. This calculation evaluates the entropy-selected split; it does not claim that a Gini stump would select the same threshold."
          },
          {
            "kind": "viz",
            "name": "impurity"
          },
          {
            "kind": "note",
            "title": "Physical interpretation",
            "text": "Spectral centroid describes the center of spectral energy. It is not a direct measurement of bird pitch, species richness or habitat condition."
          }
        ]
      },
      {
        "label": "Data Preparation",
        "title": "The same grouped comparison.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Only labeled recordings enter supervised learning. The corrected primary cohort contains 236 recordings: CA 85, AZ 79 and TX 72. Geographic decisions preserved the original source data; 38 outside-scope recordings and one unresolved case are not in the modeling cohort."
          },
          {
            "kind": "paragraph",
            "text": "The target label is the recorded state: California (CA), Arizona (AZ) or Texas (TX). The 50 acoustic measurements are the inputs used to predict that label. The original collection contained 275 recordings; geographic review retained 236 eligible recordings for this task."
          },
          {
            "kind": "paragraph",
            "text": "The split used StratifiedGroupKFold with five folds, shuffle=True and random_state=42. The first fold was reserved in advance as the test set; folds and seeds were not searched for a favorable result. This produced 184 development and 52 test recordings. Grouping keeps recordings at identical coordinates together, while stratification attempts to preserve the state proportions. Five grouped folds within the development set were then used for model selection. The final models were fitted on all 184 development recordings before scoring the 52 test recordings."
          },
          {
            "kind": "viz",
            "name": "partition"
          },
          {
            "kind": "table",
            "caption": "Fixed partition support",
            "head": [
              "Recorded state",
              "Development",
              "Held-out test"
            ],
            "rows": [
              [
                "CA",
                "65",
                "20"
              ],
              [
                "AZ",
                "66",
                "13"
              ],
              [
                "TX",
                "53",
                "19"
              ],
              [
                "Total",
                "184",
                "52"
              ]
            ]
          },
          {
            "kind": "paragraph",
            "text": "Training and test sets must be disjoint: no recording, audio window derived from it, or exact-coordinate group may occur in both. Overlap would leak familiar examples into evaluation and inflate apparent generalization. The fixed partition was created before model selection; transformations and model settings were learned using development data only."
          },
          {
            "kind": "paragraph",
            "text": "Recordings sharing an exact coordinate group remain together. Five development folds use the same grouping rule. This prevents exact-coordinate overlap, but does not guarantee independence from nearby sites, shared recordists or species. The modeling unit is a recording, not one of its constituent audio windows."
          },
          {
            "kind": "paragraph",
            "text": "The 50 mean acoustic predictors are complete and finite. Recording IDs, coordinates, species names and state labels are not included as predictors. All fitted transformations use training rows only; validation and test measurements do not set bin boundaries."
          },
          {
            "kind": "figure",
            "file": "sample.png",
            "caption": "Labeled sample: IDs identify records and model_state supplies the target; three of 50 predictors are shown.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "training.png",
            "caption": "Development training pool: 184 recordings. Each cross-validation model uses only its own training folds.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "test.png",
            "caption": "Held-out test sample: 52 recordings, not used to fit or select these models.",
            "collapsed": false
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Labeled sample CSV",
                "href": "/research/labeled_sample.csv"
              },
              {
                "label": "Development CSV",
                "href": "/research/development_train.csv"
              },
              {
                "label": "Held-out sample/data CSV",
                "href": "/research/heldout_test.csv"
              },
              {
                "label": "Split and representation notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/splits_and_representations.ipynb"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "Trees use continuous numeric predictors. Scaling is not required for threshold splits. The preprocessing pipeline remains training-fitted, and species labels are excluded from the predictors."
          }
        ]
      },
      {
        "label": "Code",
        "title": "Decision-tree code and settings",
        "blocks": [
          {
            "kind": "links",
            "links": [
              {
                "label": "Decision Trees notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Decision_trees.ipynb"
              },
              {
                "label": "Saved configurations and rules",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/data/processed/supervised/v1/decision_trees"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "The search compares Gini depth 3, entropy depth 5 and a predefined cost-complexity pruning grid. All use a minimum of five samples per leaf and the same validation folds. The three diagrams in Results are full-development presentation fits, not the fold-specific models used for development predictions."
          }
        ]
      },
      {
        "label": "Results",
        "title": "Decision-tree development results",
        "blocks": [
          {
            "kind": "note",
            "title": "Development evidence only",
            "text": "184 development recordings; five fixed exact-coordinate-group folds. Model configurations were selected on these folds, so these scores are selection-conditioned. The 52-recording held-out test was evaluated once, after the protocol was frozen: see the Final Test page."
          },
          {
            "kind": "paragraph",
            "text": "Accuracy is the fraction of correct state predictions. Balanced accuracy averages recall across the three states. Macro-F1 averages their F1 scores, giving each state equal weight. An out-of-fold prediction comes from a model trained without that recording or its coordinate group. The table pools these predictions across development folds; model selection instead used the mean of the five fold-level macro-F1 scores."
          },
          {
            "kind": "figure",
            "file": "Gini_depth3.svg",
            "caption": "Selected Gini tree, maximum depth 3, fitted on the full development set.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "Entropy_depth5.svg",
            "caption": "Entropy comparator, maximum depth 5, fitted on the full development set.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "Gini_pruning_0.02.svg",
            "caption": "Pruned Gini comparator, cost-complexity α = 0.02, fitted on the full development set.",
            "collapsed": false
          },
          {
            "kind": "table",
            "caption": "Pooled development out-of-fold scores",
            "head": [
              "Configuration",
              "Accuracy",
              "Macro-F1"
            ],
            "rows": [
              [
                "Gini depth 3",
                "0.489",
                "0.482"
              ],
              [
                "Entropy depth 5",
                "0.413",
                "0.401"
              ],
              [
                "Gini pruning α = 0.02",
                "0.408",
                "0.402"
              ]
            ]
          },
          {
            "kind": "viz",
            "name": "pruning"
          },
          {
            "kind": "figure",
            "file": "three_tree_oof_confusion_matrices.png",
            "caption": "Counts and per-state recall for three configurations on the same development recordings.",
            "collapsed": false
          },
          {
            "kind": "figure",
            "file": "pruning_tradeoff.png",
            "caption": "Pruning trades training fit against rule complexity; excessive pruning reduced validation performance.",
            "collapsed": true
          },
          {
            "kind": "paragraph",
            "text": "The Gini depth-3 configuration led the tested trees by mean-fold macro-F1. Its comparison with entropy depth 5 changes both criterion and depth, so the difference cannot be attributed to criterion alone."
          }
        ]
      },
      {
        "label": "Final Test",
        "title": "Do the rules transfer?",
        "lead": "The same three trees, scored once on the held-out recordings.",
        "blocks": [
          {
            "kind": "viz",
            "name": "scoreboardDT"
          },
          {
            "kind": "viz",
            "name": "confusionDT"
          },
          {
            "kind": "note",
            "title": "Keep the selected model fixed",
            "text": "The Gini depth-3 tree remains the selected model despite higher comparator test scores. Replacing it or tuning against these 52 recordings would turn the test into development data."
          },
          {
            "kind": "table",
            "caption": "Final held-out test: decision trees",
            "head": [
              "Configuration",
              "Correct",
              "Accuracy",
              "Macro-F1"
            ],
            "rows": [
              [
                "Prior baseline",
                "13 / 52",
                "0.250",
                "0.133"
              ],
              [
                "Gini depth 3",
                "17 / 52",
                "0.327",
                "0.326"
              ],
              [
                "Entropy depth 5",
                "23 / 52",
                "0.442",
                "0.441"
              ],
              [
                "Gini pruning α = 0.02",
                "20 / 52",
                "0.385",
                "0.372"
              ]
            ]
          },
          {
            "kind": "viz",
            "name": "finalTable"
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Final-test notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Final_holdout_evaluation.ipynb"
              },
              {
                "label": "Final predictions CSV",
                "href": "/research/final_predictions.csv"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "The selected Gini tree scored 32.7% on the final test, compared with 48.9% pooled development accuracy. The entropy comparator scored 44.2%, reversing their development ordering. This is consistent with unstable performance on a small sample; it does not identify a single cause. The test results are reported for all frozen configurations, without using them to select a replacement."
          }
        ]
      },
      {
        "label": "Conclusions",
        "title": "What the tree results show",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "The selected tree correctly predicted 17 of 52 test states (32.7%), compared with 13 of 52 for the prior baseline (25.0%). Its poorer final performance than development suggests that the learned regional rules transfer weakly. The comparator reversal does not justify selecting a replacement on this test. These rules predict recording region, not biodiversity."
          },
          {
            "kind": "paragraph",
            "text": "For held-out development recording 1080405, the tree predicted TX although the recorded state was AZ. Its path used spectral centroid, biophony and MFCC 3. The reached leaf contained 14 TX recordings out of 17 training examples."
          },
          {
            "kind": "note",
            "title": "Training composition is not calibrated confidence",
            "text": "A leaf fraction of 14/17 describes the training examples reaching that leaf. It does not establish an 82.4% chance that this new recording is from Texas."
          },
          {
            "kind": "paragraph",
            "text": "Root features changed among spectral centroid, RMS and zero-crossing rate across folds. Interpretability exposes decisions, but unstable rules should not be presented as universal ecological thresholds."
          }
        ]
      }
    ]
  },
  "Generalization": {
    "stage": "Study A · robustness and representation",
    "pages": [
      {
        "label": "Feature Families",
        "title": "Which measurements carry the distinction?",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "The same fixed depth-3 Gini tree was compared across registered feature families. Five temporal/amplitude features reached mean-fold macro-F1 0.4628 versus 0.4517 for all 50 features. This small average advantage concealed substantial fold variation."
          },
          {
            "kind": "figure",
            "file": "feature_family_paired_changes.png",
            "caption": "Paired changes against the all-feature tree. Individual fold points are not confidence intervals.",
            "collapsed": false
          },
          {
            "kind": "note",
            "title": "An acoustic result, not a biodiversity ranking",
            "text": "A feature family that distinguishes states poorly may still be biologically informative. Gain, distance and background noise can also affect amplitude measurements. Family size and correlation limit interpretation."
          }
        ]
      },
      {
        "label": "Quality & Regularization",
        "title": "Test the assumptions behind the score.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Using the same eligible validation recordings, restricting training by the predefined short-duration/bandwidth policy changed mean macro-F1 from 0.4505 to 0.4183. One fold drove much of the decrease. This does not prove that flagged recordings are beneficial."
          },
          {
            "kind": "paragraph",
            "text": "Logistic regression tested continuous standardized features and the same five-bin representation used for MNB. Weaker regularization worsened log loss and Brier score in every fold for both representations; classification changes were less consistent."
          },
          {
            "kind": "figure",
            "file": "regularization_tradeoff.png",
            "caption": "Classification and probability quality respond differently to regularization. Grey lines connect the same fold.",
            "collapsed": false
          }
        ]
      },
      {
        "label": "Next Tests",
        "title": "Independent locations, unfamiliar taxa.",
        "blocks": [
          {
            "kind": "note",
            "title": "Registered, not yet reported",
            "text": "Nested location-group learning subsets are saved. No fitted learning-curve results are claimed in this checkpoint."
          },
          {
            "kind": "paragraph",
            "text": "Species familiarity and species-disjoint evaluation require a support audit. A change in performance under species holdout would reveal sensitivity to a changed evaluation population, not establish taxonomy as the sole explanation."
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Generalization notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Generalization_and_feature_families.ipynb"
              },
              {
                "label": "Research status and limitations",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/docs/research-status.md"
              }
            ]
          }
        ]
      },
      {
        "label": "Development Extension",
        "title": "Do broader model comparisons help?",
        "blocks": [
          {
            "kind": "note",
            "title": "Exploratory development results",
            "text": "These experiments were designed after viewing the original final test. Only the 184 development recordings enter this comparison; the original 52-recording evaluation remains unchanged. A new independent test is required for further generalization claims."
          },
          {
            "kind": "paragraph",
            "text": "Five outer exact-coordinate-group folds evaluate tuning procedures. Three inner grouped folds select settings by macro-F1. Preprocessing is fitted within training folds. Exact-coordinate grouping does not guarantee independence of nearby sites, recordists or species."
          },
          {
            "kind": "table",
            "caption": "Nested development comparison",
            "head": [
              "Model",
              "Mean outer macro-F1",
              "Fold SD",
              "Pooled accuracy",
              "Pooled macro-F1"
            ],
            "rows": [
              [
                "Random forest",
                "0.504",
                "0.056",
                "52.2%",
                "0.509"
              ],
              [
                "Decision tree",
                "0.491",
                "0.133",
                "51.6%",
                "0.510"
              ],
              [
                "Bernoulli NB",
                "0.487",
                "0.050",
                "50.0%",
                "0.490"
              ],
              [
                "Multinomial NB",
                "0.477",
                "0.069",
                "48.4%",
                "0.477"
              ],
              [
                "Logistic regression",
                "0.451",
                "0.060",
                "45.1%",
                "0.452"
              ],
              [
                "Gaussian NB",
                "0.370",
                "0.096",
                "38.6%",
                "0.379"
              ],
              [
                "Prior",
                "0.170",
                "0.005",
                "34.2%",
                "0.241"
              ]
            ]
          },
          {
            "kind": "paragraph",
            "text": "Exploratory nested cross-validation found modest regional discrimination. Random forest achieved the highest mean outer-fold macro-F1 (0.504), followed by decision trees (0.491) and Bernoulli Naïve Bayes (0.487). Random forest correctly classified 96 of 184 out-of-fold recordings, only one more than the tree. Tree performance varied substantially across folds. Random forest identified 18 of 53 Texas recordings (34.0%), compared with 41 of 65 California recordings (63.1%). These post-test development experiments do not establish improved independent-test performance or measure biodiversity."
          },
          {
            "kind": "note",
            "title": "How to compare the scores",
            "text": "Mean outer-fold macro-F1 is the predefined comparison metric. Pooled macro-F1 aggregates all out-of-fold predictions and can rank models differently. Fold SD describes variability, not confidence intervals or proof of superiority."
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/development_comparison.png",
            "caption": "development comparison — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Bernoulli_NB_development_confusion.png",
            "caption": "Bernoulli NB development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Decision_tree_development_confusion.png",
            "caption": "Decision tree development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Gaussian_NB_development_confusion.png",
            "caption": "Gaussian NB development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Logistic_regression_development_confusion.png",
            "caption": "Logistic regression development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Multinomial_NB_development_confusion.png",
            "caption": "Multinomial NB development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Prior_development_confusion.png",
            "caption": "Prior development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "figure",
            "file": "development_extension_v2/Random_forest_development_confusion.png",
            "caption": "Random forest development confusion — development only; 184 recordings, class order AZ, CA, TX for matrices.",
            "collapsed": true
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Development summary CSV",
                "href": "/research/development_extension_v2/development_summary.csv"
              },
              {
                "label": "Out-of-fold predictions",
                "href": "/research/development_extension_v2/nested_oof_predictions.csv"
              },
              {
                "label": "Protocol",
                "href": "/research/development_extension_v2/protocol.json"
              }
            ]
          }
        ]
      }
    ]
  },
  "Biodiversity": {
    "stage": "Study B · engineering pilot · biological scoring pending",
    "pages": [
      {
        "label": "Biological Reference",
        "title": "What was audibly present?",
        "lead": "An annotated species set is a more direct biological reference than a state label.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "The Sapsucker Woods collection contains 285 hour-long New York soundscapes with expert time–frequency annotations. Its 53,503 boxes include 2,743 unidentified-call boxes; the lookup contains 81 named species and one unknown category."
          },
          {
            "kind": "table",
            "caption": "One-minute biological reference",
            "head": [
              "Measure",
              "Support"
            ],
            "rows": [
              [
                "Recording files",
                "285"
              ],
              [
                "Provisional UTC sampling sessions",
                "21"
              ],
              [
                "One-minute intervals",
                "17,100"
              ],
              [
                "Intervals with zero named species annotated",
                "8,255"
              ],
              [
                "Intervals without positive-duration annotations",
                "7,970"
              ]
            ]
          },
          {
            "kind": "note",
            "title": "No annotation is not confirmed absence",
            "text": "Count distinct named species with positive time overlap. Track unknown calls separately; never count “unknown” as one species. Source selection and annotation limitations prevent treating this as total site biodiversity."
          },
          {
            "kind": "paragraph",
            "text": "Nine zero-duration boxes remain in the audit and flag affected intervals. They do not contribute to primary overlap counts. UTC dates are provisional temporal groups, not independent recorder locations."
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Source dataset and annotation protocol",
                "href": "https://zenodo.org/records/7079380"
              }
            ]
          }
        ]
      },
      {
        "label": "Pilot & Detector",
        "title": "Establish the measurement before the claim.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Seven recordings were selected using metadata and a fixed seed, one per sampled month, without using species outcomes. Their sessions are development-reserved. All seven files passed ZIP CRC verification and are exactly one hour of 32 kHz mono audio."
          },
          {
            "kind": "paragraph",
            "text": "BirdNET-Analyzer 2.4.0 uses the V2.4 FP32 acoustic model in an isolated environment. The first fixed pilot recording was analyzed without location/date filtering or an annotation-derived species list, using nonoverlapping three-second windows."
          },
          {
            "kind": "note",
            "title": "10,655 candidate rows are not bird counts",
            "text": "An output floor of 0.01 retains candidates for later scoring. Candidate labels, taxonomy and biological errors still require validation. No detector-derived richness result is reported here."
          },
          {
            "kind": "paragraph",
            "text": "Model and label hashes, run settings and source-audio fingerprints are saved. Potential overlap with pretrained-model development data remains unresolved; this is not yet established as independent external validation."
          }
        ]
      },
      {
        "label": "Research Bridge",
        "title": "From signals to biological evidence.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Study A asks whether acoustic features distinguish regional recording groups. Study B asks whether the same measurements relate to annotated audible species composition and richness. The datasets remain separate; New York results cannot establish CA/AZ/TX biodiversity differences."
          },
          {
            "kind": "paragraph",
            "text": "Planned paired signal experiments examine bandwidth and background-noise sensitivity. Evaluate species precision/recall alongside richness error: predicting two incorrect species can still produce the correct count of two."
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Annotated soundscape notebook",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/annotated_soundscapes_biodiversity.ipynb"
              },
              {
                "label": "Pilot and reference artifacts",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/data/processed/biodiversity"
              }
            ]
          }
        ]
      }
    ]
  },
  "Conclusions": {
    "stage": "Synthesis · evidence before inference",
    "pages": [
      {
        "label": "Findings",
        "title": "Distinguishing sound is the starting point.",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Geographic review corrected the foundation of the supervised analysis. Grouped development evaluation reveals some regional acoustic discrimination, substantial variation across locations, and a separation between classification accuracy and probability quality."
          },
          {
            "kind": "note",
            "title": "The central distinction",
            "text": "A successful state prediction is not a measurement of species richness, habitat quality or conservation value. The annotated-soundscape pilot introduces a biological reference for testing that next step."
          },
          {
            "kind": "paragraph",
            "text": "The goal is to support ecological interpretation with reproducible evidence. Acoustic models complement field knowledge and conservation practice; they do not replace them."
          }
        ]
      },
      {
        "label": "Limitations & Next Steps",
        "title": "Limitations and next steps",
        "blocks": [
          {
            "kind": "paragraph",
            "text": "Species composition, sampling design and recording conditions remain potential explanations for regional differences. Exact-coordinate grouping addresses one dependence mechanism. Development scores are selection-conditioned; the single held-out evaluation (52 recordings) is a small sample."
          },
          {
            "kind": "paragraph",
            "text": "Next steps are to align detector labels with the biological reference, evaluate the biodiversity pilot and complete the planned robustness analyses. The regional holdout has already been evaluated; further model revisions require a new independent test. Biological interpretation also requires investigation of possible overlap between the reference recordings and pretrained-model development data."
          },
          {
            "kind": "links",
            "links": [
              {
                "label": "Current research status",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/docs/research-status.md"
              }
            ]
          }
        ]
      }
    ]
  },
  "Sources": {
    "stage": "Open field record · provenance and reproducibility",
    "pages": [
      {
        "label": "Code & Data",
        "title": "Code, data and provenance",
        "blocks": [
          {
            "kind": "links",
            "links": [
              {
                "label": "Geographic and eligibility audit",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Supervised_data_audit.ipynb"
              },
              {
                "label": "Splits and representations",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/splits_and_representations.ipynb"
              },
              {
                "label": "Naïve Bayes",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Naive_Bayes.ipynb"
              },
              {
                "label": "Decision Trees",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Decision_trees.ipynb"
              },
              {
                "label": "Generalization",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Generalization_and_feature_families.ipynb"
              },
              {
                "label": "Biodiversity pilot",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/annotated_soundscapes_biodiversity.ipynb"
              },
              {
                "label": "Final held-out evaluation",
                "href": "https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/blob/main/research/notebooks/Final_holdout_evaluation.ipynb"
              },
              {
                "label": "Chart data (built by scripts/build_viz_data.py)",
                "href": "/research/viz-data.json"
              },
              {
                "label": "Website asset provenance",
                "href": "/research/provenance.json"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "Figures and sample CSVs are copied from the saved research artifacts. The provenance manifest records source paths and SHA-256 fingerprints. Research downloads and model weights are not bundled with the website."
          }
        ]
      },
      {
        "label": "Assignment Map",
        "title": "Where each requirement lives.",
        "blocks": [
          {
            "kind": "table",
            "caption": "Module 3 · Part 3 checklist",
            "head": [
              "Requirement",
              "Where on this site",
              "Evidence"
            ],
            "rows": [
              [
                "Introduction ≥ 4 paragraphs, 2 images",
                "Introduction",
                "Six field-note paragraphs · hero photo + spectrogram"
              ],
              [
                "NB overview incl. Bernoulli and smoothing",
                "Naive Bayes › Overview",
                "Smoothing lab · Bernoulli/Gaussian comparison"
              ],
              [
                "Sample, training and test data (image + link)",
                "Naive Bayes › Data Preparation",
                "sample / training / test images · 3 CSVs"
              ],
              [
                "Cleaned (encoded) data image",
                "Naive Bayes › Data Preparation",
                "encoded_training.png"
              ],
              [
                "Disjoint split explained",
                "Data Preparation (both tabs)",
                "Partition chart · location-group folds"
              ],
              [
                "NB code link",
                "Naive Bayes › Code",
                "Naive_Bayes.ipynb · representations.py"
              ],
              [
                "NB results: confusion matrix + accuracy",
                "Naive Bayes › Results and Final Test",
                "Confusion explorer · final table"
              ],
              [
                "DT overview: Gini, entropy, information gain, worked example, ≥ 2 images",
                "Decision Trees › Overview and Worked Split",
                "Impurity lab · annotated stump"
              ],
              [
                "Why infinitely many trees",
                "Decision Trees › Overview",
                "Feature and threshold choices, depth and stopping rules"
              ],
              [
                "≥ 3 trees",
                "Decision Trees › Results",
                "Three visible diagrams: Gini depth 3, entropy depth 5 and pruned Gini"
              ],
              [
                "DT results: confusion matrix + accuracy",
                "Decision Trees › Results and Final Test",
                "Confusion explorer · pruning curve · final table"
              ],
              [
                "What was learned about the topic",
                "Conclusions on each tab",
                "Regional prediction findings, errors and ecological limitations"
              ]
            ]
          }
        ]
      },
      {
        "label": "Credits & Scope",
        "title": "Acknowledge the observations.",
        "blocks": [
          {
            "kind": "links",
            "links": [
              {
                "label": "Xeno-canto recording archive",
                "href": "https://xeno-canto.org/"
              },
              {
                "label": "Sapsucker Woods — Kahl, Charif and Klinck",
                "href": "https://doi.org/10.5281/zenodo.7079380"
              },
              {
                "label": "BirdNET: avian diversity monitoring",
                "href": "https://doi.org/10.1016/j.ecoinf.2021.101236"
              },
              {
                "label": "Expedition recording credits",
                "href": "/audio/expedition/CREDITS.md"
              }
            ]
          },
          {
            "kind": "paragraph",
            "text": "Expedition recordings retain their individual source licenses and attribution. Scenery and animated habitat elements are illustrative. The expedition is an educational experience, not a live ecological survey."
          }
        ]
      }
    ]
  }
};
