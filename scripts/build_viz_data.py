"""Build website/client/public/research/viz-data.json from saved supervised-learning artifacts.
Run from repo root: python scripts/build_viz_data.py   (reads CSVs only; no model is refit)."""
import json, glob, pandas as pd
V = 'data/processed/supervised/v1/'
ST = ['CA', 'AZ', 'TX']
def latest(pat): return sorted(glob.glob(V + pat))[-1]
def conf_csv(path):
    d = pd.read_csv(path, index_col=0); return d.loc[ST, ST].astype(int).values.tolist()
fin = V + 'final_holdout_v1/'
metrics = pd.read_csv(fin + 'metrics.csv')
names = {'Prior baseline': 'Prior_baseline', 'Multinomial NB': 'Multinomial_NB', 'Bernoulli NB': 'Bernoulli_NB', 'Gaussian NB': 'Gaussian_NB',
         'Gini_depth3': 'Gini_depth3', 'Entropy_depth5': 'Entropy_depth5', 'Gini_pruning_0.02': 'Gini_pruning_0.02'}
final = []
for _, r in metrics.iterrows():
    rep = json.load(open(fin + names[r.model] + '_classification_report.json'))
    final.append(dict(model=r.model, n=int(r.n), correct=int(r.correct), accuracy=r.accuracy, balanced=r.balanced_accuracy, macroF1=r.macro_f1,
                      logLoss=r.log_loss, brier=r.brier_sum, confusion=conf_csv(fin + names[r.model] + '_confusion.csv'),
                      perClass={s: dict(precision=rep[s]['precision'], recall=rep[s]['recall'], f1=rep[s]['f1-score'], support=int(rep[s]['support'])) for s in ST}))
# development pooled out-of-fold
nbo = latest('naive_bayes/selected_checkpoint_*/selected_oof_summary.csv')
dev = {r.model: dict(accuracy=r.pooled_oof_accuracy, macroF1=r.pooled_oof_macro_f1) for r in pd.read_csv(nbo).itertuples()}
tp = latest('decision_trees/development_search_20261030T031713485157Z/selected_tree_presentations_*/selected_tree_oof_summary.csv')
for r in pd.read_csv(tp).itertuples(): dev[r.configuration] = dict(accuracy=r.pooled_oof_accuracy, macroF1=r.pooled_oof_macro_f1)
# development out-of-fold confusion (NB from predictions; trees from saved counts)
pr = pd.read_csv(nbo.replace('selected_oof_summary', 'selected_oof_predictions'))
devconf = {}
for m, g in pr.groupby('model'):
    devconf[m] = pd.crosstab(g.actual, g.predicted).reindex(index=ST, columns=ST, fill_value=0).values.tolist()
for c in ['Gini_depth3', 'Entropy_depth5', 'Gini_pruning_0.02']:
    devconf[c] = conf_csv(glob.glob(V + 'decision_trees/development_search_20261030T031713485157Z/selected_tree_presentations_*/%s_oof_confusion_counts.csv' % c)[0])
# MNB search by fold
nbs = latest('naive_bayes/mnb_search_*/fold_metrics.csv')
fm = pd.read_csv(nbs)
mnb = [dict(bins=int(b), alpha=float(a), folds=g.sort_values('fold').macro_f1.round(4).tolist(), n=g.sort_values('fold').validation_n.tolist(), mean=float(g.macro_f1.mean()))
       for (b, a), g in fm.groupby(['bins', 'alpha'])]
# trees: search + pruning curve + root features
ts = pd.read_csv(V + 'decision_trees/development_search_20261030T031713485157Z/search_summary.csv')
prune = [dict(alpha=r.alpha, f1=r.mean_macro_f1, sd=r.sd_macro_f1, leaves=r.mean_leaves, trainF1=r.mean_train_macro_f1) for r in ts[ts.family.str.startswith('pruning')].itertuples()]
roots = pd.read_csv(glob.glob(V + 'decision_trees/development_search_20261030T031713485157Z/selected_tree_presentations_*/root_feature_frequency.csv')[0]).set_index('configuration').to_dict('index')
tree_meta = {r.configuration: dict(f1=r.mean_macro_f1, sd=r.sd_macro_f1, leaves=r.mean_leaves, depth=r.mean_depth, trainF1=r.mean_train_macro_f1) for r in ts.itertuples()}
# worked prediction evidence race
w = latest('naive_bayes/selected_checkpoint_*/worked_example_*/')
cs = pd.read_csv(w + 'class_score_calculation.csv'); tk = pd.read_csv(w + 'active_token_contributions.csv')
evidence = dict(classes=cs['class'].tolist(), logPrior=cs.log_prior.tolist(), trainN=cs.training_recordings.tolist(), prob=cs.model_probability.tolist(),
                tokens=tk.token.tolist(), ll={c: tk['log_likelihood_' + c].round(4).tolist() for c in cs['class']})
ws = pd.read_csv(V + 'decision_trees/worked_split_20261030T031446273967Z/split_calculation.csv')
split = [dict(node=r.node, n=int(r.n), CA=int(r.CA), AZ=int(r.AZ), TX=int(r.TX), entropy=r.entropy_bits, gini=r.gini) for r in ws.itertuples()]
out = dict(states=ST, final=final, dev=dev, devConfusion=devconf, mnbFolds=mnb, pruning=prune, rootFeatures=roots, treeMeta=tree_meta,
           evidence=evidence, workedSplit=split, vocab=250, partition=dict(dev=dict(CA=65, AZ=66, TX=53), test=dict(CA=20, AZ=13, TX=19)))
json.dump(out, open('website/client/public/research/viz-data.json', 'w'), separators=(',', ':'))
print('ok', len(json.dumps(out)), 'bytes')
