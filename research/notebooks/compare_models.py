"""
Compare MNB and DT development scores on identical folds.
Requires the saved OOF prediction CSVs from each notebook.
"""
import json
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[3]
SUP = ROOT / "data" / "processed" / "supervised" / "v1"
OUT_FIG = ROOT / "website" / "client" / "public" / "research"
OUT_FIG.mkdir(parents=True, exist_ok=True)

# Adjust filenames to match what your notebooks saved.
mnb = pd.read_csv(SUP / "naive_bayes" / "mnb_oof_predictions.csv")
dt = pd.read_csv(SUP / "decision_trees" / "gini_depth3_oof_predictions.csv")

def macro_f1(df, y="y_true", p="y_pred"):
    labels = sorted(df[y].unique())
    scores = []
    for lbl in labels:
        tp = ((df[p] == lbl) & (df[y] == lbl)).sum()
        fp = ((df[p] == lbl) & (df[y] != lbl)).sum()
        fn = ((df[p] != lbl) & (df[y] == lbl)).sum()
        prec = tp / (tp + fp) if tp + fp else 0.0
        rec = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
        scores.append(f1)
    return sum(scores) / len(scores)

def accuracy(df, y="y_true", p="y_pred"):
    return (df[y] == df[p]).mean()

rows = [
    ("Multinomial NB", accuracy(mnb), macro_f1(mnb)),
    ("DT Gini depth 3", accuracy(dt), macro_f1(dt)),
]

fig, ax = plt.subplots(figsize=(7, 4.2), dpi=160)
labels = [r[0] for r in rows]
acc = [r[1] for r in rows]
f1 = [r[2] for r in rows]
x = range(len(rows))
w = 0.36
ax.bar([i - w/2 for i in x], acc, w, label="Accuracy", color="#6ed6d1")
ax.bar([i + w/2 for i in x], f1, w, label="Macro-F1", color="#d8b76a")
for i, (a, f) in enumerate(zip(acc, f1)):
    ax.text(i - w/2, a + 0.01, f"{a:.3f}", ha="center", fontsize=9)
    ax.text(i + w/2, f + 0.01, f"{f:.3f}", ha="center", fontsize=9)
ax.set_xticks(list(x))
ax.set_xticklabels(labels)
ax.set_ylim(0, 0.65)
ax.set_ylabel("Development out-of-fold score")
ax.set_title("Same 184 development recordings, same five folds")
ax.legend(frameon=False, loc="upper right")
ax.spines[["top", "right"]].set_visible(False)
fig.tight_layout()
fig.savefig(OUT_FIG / "model_comparison.png")
print("wrote", OUT_FIG / "model_comparison.png")