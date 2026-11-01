"""
Generate baseline and fold-size tables for the website.
Reads the saved split CSVs; writes JSON to client/public/research/.
Run from the repo root:  python research/src/supervised/reporting.py
"""
import json
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "processed" / "supervised" / "v1"
OUT = ROOT / "website" / "client" / "public" / "research"
OUT.mkdir(parents=True, exist_ok=True)

train = pd.read_csv(DATA / "development_train.csv")
test = pd.read_csv(DATA / "heldout_test.csv")
TARGET = "model_state"

# --- state prior and majority-class baseline ---
prior = train[TARGET].value_counts(normalize=True).to_dict()
counts = train[TARGET].value_counts().to_dict()
majority_class = max(counts, key=counts.get)
majority_baseline = counts[majority_class] / len(train)

# --- fold sizes by state ---
fold_table = (
    train.groupby(["fold", TARGET]).size().unstack(fill_value=0)
    .reset_index().rename(columns={"fold": "fold"})
)
fold_sizes = fold_table.to_dict(orient="records")

baseline = {
    "n_train": int(len(train)),
    "n_test": int(len(test)),
    "prior": {k: round(v, 4) for k, v in prior.items()},
    "counts": {k: int(v) for k, v in counts.items()},
    "majority_class": majority_class,
    "majority_baseline_accuracy": round(majority_baseline, 4),
    "fold_sizes": fold_sizes,
}

(OUT / "baseline_and_folds.json").write_text(json.dumps(baseline, indent=2))
print(json.dumps(baseline, indent=2))