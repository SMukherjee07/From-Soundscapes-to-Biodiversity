"""Freeze, then evaluate the existing regional holdout; never tune on its scores.

Run with project venv: python research/src/supervised/final_holdout.py --freeze
Then: python research/src/supervised/final_holdout.py --evaluate
Existing results are read, never silently overwritten.
"""
from pathlib import Path
import argparse, hashlib, json, sys, platform
from datetime import datetime, timezone
import numpy as np
import pandas as pd
import sklearn
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB, BernoulliNB, GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, confusion_matrix, classification_report, log_loss
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import joblib

ROOT = next(p for p in Path(__file__).resolve().parents if (p/'data/processed/acoustic_features_recording.csv').exists())
sys.path.insert(0, str(ROOT/'research/src'))
from supervised.representations import make_representations
BASE = ROOT/'data/processed/supervised/v1'
OUT = BASE/'final_holdout_v1'
ART = BASE/'assignment_artifacts_20261030T020845905141Z'
SPLIT = BASE/'splits/group_stratified_20261030T012037371263Z/primary_split_manifest.csv'
NB = BASE/'naive_bayes/selected_checkpoint_20261030T023553086818Z/selected_models.json'
DT = BASE/'decision_trees/development_search_20261030T031713485157Z/selected_three_configurations.json'
CLASSES = ['CA','AZ','TX']
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,obj): p.write_text(json.dumps(obj,indent=2),encoding='utf-8')

def inputs():
    return [SPLIT, NB, DT, ART/'development_train.csv', ART/'heldout_test.csv', ART/'artifact_manifest.json', ROOT/'research/src/supervised/representations.py', Path(__file__)]

def freeze():
    OUT.mkdir(exist_ok=True)
    target=OUT/'frozen_protocol.json'
    if target.exists():
        print('Existing freeze retained:',target); return
    nb=read(NB); trees=read(DT)
    assert isinstance(trees,list) and len(trees)==3
    dump(target,dict(frozen_utc=datetime.now(timezone.utc).isoformat(),
        purpose='One-time assignment evaluation of the previously designated 52-recording holdout',
        primary_models=['Multinomial NB','Gini_depth3'], secondary_models=['Bernoulli NB','Gaussian NB','Entropy_depth5','Gini_pruning_0.02'],
        baseline='Training class prior', nb=nb, trees=trees, tree_random_state=42,
        metrics=['accuracy','balanced_accuracy','macro_f1','confusion_matrix','per_class_precision_recall_f1','log_loss','brier_sum'],
        rules=['Fit preprocessing and models on all 184 development recordings only','No new search, threshold tuning, cohort exclusions, or test-based winner selection','Report all frozen models, including failures and poor scores','Future test-informed revisions require new independent evaluation data'],
        versions={'python':platform.python_version(),'numpy':np.__version__,'pandas':pd.__version__,'sklearn':sklearn.__version__},
        inputs={str(p.relative_to(ROOT)):sha(p) for p in inputs()}))
    print('Protocol frozen before evaluation:',target)

def evaluate():
    protocol=read(OUT/'frozen_protocol.json')
    for name,digest in protocol['inputs'].items():
        assert sha(ROOT/name)==digest, 'Frozen input changed: '+name
    if (OUT/'metrics.csv').exists():
        print(pd.read_csv(OUT/'metrics.csv').to_string(index=False)); print('Existing results reused; no refit.'); return
    if (OUT/'evaluation_started.json').exists():
        raise RuntimeError('A prior evaluation started. Inspect its artifacts before retrying; no automatic overwrite.')
    train=pd.read_csv(ART/'development_train.csv',dtype={'recording_id':str})
    test=pd.read_csv(ART/'heldout_test.csv',dtype={'recording_id':str})
    split=pd.read_csv(SPLIT,dtype={'recording_id':str}).set_index('recording_id')
    features=protocol['nb']['feature_allowlist']
    assert features==read(ART/'artifact_manifest.json')['feature_allowlist'] and len(features)==50
    assert len(train)==184 and len(test)==52
    for frame,part in [(train,'development'),(test,'test')]:
        assert frame.recording_id.is_unique
        assert set(frame.recording_id)==set(split.index[split.partition.eq(part)])
        assert np.array_equal(split.loc[frame.recording_id,'model_state'].to_numpy(),frame.model_state.to_numpy())
        assert np.array_equal(split.loc[frame.recording_id,'location_group'].to_numpy(),frame.location_group.to_numpy())
        assert np.isfinite(frame[features].to_numpy()).all()
    assert set(train.recording_id).isdisjoint(test.recording_id)
    assert set(train.location_group).isdisjoint(test.location_group)
    nb=protocol['nb']
    def pipe(rep,clf): return Pipeline([('representation',rep),('classifier',clf)])
    reps=make_representations(mnb_bins=nb['MultinomialNB']['bins'])
    models={
        'Prior baseline':DummyClassifier(strategy='prior'),
        'Multinomial NB':pipe(reps['multinomial_bins'],MultinomialNB(alpha=nb['MultinomialNB']['alpha'],fit_prior=nb['MultinomialNB']['fit_prior'])),
        'Bernoulli NB':pipe(reps['bernoulli_indicators'],BernoulliNB(alpha=nb['BernoulliNB']['value'],binarize=None)),
        'Gaussian NB':pipe(reps['continuous'],GaussianNB(var_smoothing=nb['GaussianNB']['value']))}
    for spec in protocol['trees']:
        models[spec['name']]=pipe(make_representations()['continuous'],DecisionTreeClassifier(**{k:spec[k] for k in ['criterion','max_depth','min_samples_leaf','ccp_alpha']},random_state=42))
    dump(OUT/'evaluation_started.json',{'started_utc':datetime.now(timezone.utc).isoformat(),'protocol_sha256':sha(OUT/'frozen_protocol.json')})
    rows=[]; predictions=[]; matrices={}
    for name,model in models.items():
        model.fit(train[features],train.model_state)
        pred=model.predict(test[features]); prob=model.predict_proba(test[features]); labels=list(model.classes_)
        onehot=np.array([[int(v==c) for c in labels] for v in test.model_state])
        rows.append(dict(model=name,n=52,correct=int((pred==test.model_state).sum()),accuracy=accuracy_score(test.model_state,pred),balanced_accuracy=balanced_accuracy_score(test.model_state,pred),macro_f1=f1_score(test.model_state,pred,labels=CLASSES,average='macro',zero_division=0),log_loss=log_loss(test.model_state,prob,labels=labels),brier_sum=float(np.square(prob-onehot).sum(axis=1).mean())))
        cm=confusion_matrix(test.model_state,pred,labels=CLASSES); matrices[name]=cm
        slug=name.replace(' ','_')
        pd.DataFrame(cm,index=CLASSES,columns=CLASSES).to_csv(OUT/(slug+'_confusion.csv'),index_label='actual')
        dump(OUT/(slug+'_classification_report.json'),classification_report(test.model_state,pred,labels=CLASSES,output_dict=True,zero_division=0))
        joblib.dump(model,OUT/(slug+'.joblib'))
        for i,rec in test.reset_index(drop=True).iterrows():
            predictions.append(dict(model=name,recording_id=rec.recording_id,location_group=rec.location_group,actual=rec.model_state,predicted=pred[i],**{'probability_'+c:float(prob[i,j]) for j,c in enumerate(labels)}))
        print('Evaluated:',name,flush=True)
    pd.DataFrame(predictions).to_csv(OUT/'predictions.csv',index=False)
    for family,names in [('nb',['Multinomial NB','Bernoulli NB','Gaussian NB']),('trees',[s['name'] for s in protocol['trees']])]:
        fig,axs=plt.subplots(1,3,figsize=(12,4))
        for ax,name in zip(axs,names):
            cm=matrices[name]; ax.imshow(cm,cmap='Greens',vmin=0,vmax=20)
            for i in range(3):
                for j in range(3):ax.text(j,i,str(cm[i,j]),ha='center',va='center',color='white' if cm[i,j]>11 else '#102e22')
            ax.set(xticks=range(3),xticklabels=CLASSES,yticks=range(3),yticklabels=CLASSES,xlabel='Predicted state',ylabel='Actual state',title=name)
        fig.suptitle('Fixed final test: 52 recordings from held-out coordinate groups')
        fig.tight_layout();fig.savefig(OUT/(family+'_final_confusion.png'),dpi=180);plt.close(fig)
    dump(OUT/'completion.json',{'completed_utc':datetime.now(timezone.utc).isoformat(),'n_train':184,'n_test':52,'test_coordinate_groups':int(test.location_group.nunique()),'recording_overlap':0,'coordinate_group_overlap':0,'protocol_sha256':sha(OUT/'frozen_protocol.json'),'no_test_based_retuning':True})
    pd.DataFrame(rows).to_csv(OUT/'metrics.csv',index=False)
    print(pd.DataFrame(rows).round(4).to_string(index=False))
if __name__=='__main__':
    a=argparse.ArgumentParser();g=a.add_mutually_exclusive_group(required=True);g.add_argument('--freeze',action='store_true');g.add_argument('--evaluate',action='store_true');opts=a.parse_args()
    freeze() if opts.freeze else evaluate()
