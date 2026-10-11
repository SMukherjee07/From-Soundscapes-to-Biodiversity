"""Export clustering + PCA results as JSON for the website's interactive charts.

Usage (last cell of 06_H_Clustering.ipynb, after X_YJ etc. are loaded):

    from export_site_data import export_site_data   # or paste the function into the cell
    export_site_data(X_YJ, feature_names_YJ, pca_scores_YJ, metadata_YJ,
                     out_dir=PROJECT_ROOT / "website" / "client" / "public" / "data")

Everything is recomputed from X (so the site is self-consistent); results are checked
against your notebook's stored scores/labels and a warning is printed if they differ.
"""
import json
import re
from pathlib import Path

import numpy as np
from scipy.cluster.hierarchy import dendrogram, fcluster, linkage
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score, silhouette_samples


def _family(name: str) -> str:
    if name.startswith("mfcc") and "within_std" in name:
        return "MFCC dynamics"
    if name.startswith("mfcc"):
        return "MFCC mean"
    if re.match(r"(aci|adi|bioacoustic|ndsi|biophony|anthro)", name):
        return "Acoustic indices"
    if "entropy" in name:
        return "Entropy"
    return "Spectral & temporal"


def _col(df, names, default=""):
    for c in names:
        if c in df.columns:
            return df[c].astype(str).values
    return np.array([default] * len(df))


def export_site_data(X, feature_names, scores, metadata, out_dir, ks=range(2, 9),
                     retained=9, seed=42, n_perm=200, kmeans_labels_k2=None):
    X = np.asarray(X, float)
    n, p = X.shape
    assert len(metadata) == n and len(feature_names) == p, "row/column mismatch"
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    r = lambda a, d=5: np.round(np.asarray(a, float), d).tolist()

    # ---- PCA (recomputed; signs aligned to the notebook's scores) -----------------
    pca = PCA(random_state=seed).fit(X)
    S = pca.transform(X)
    m_al = min(retained, scores.shape[1])
    for j in range(m_al):
        c = np.corrcoef(S[:, j], scores[:, j])[0, 1]
        if c < 0:
            S[:, j] *= -1
        if abs(c) < 0.98 and j < 3:
            print(f"WARNING: recomputed PC{j+1} differs from notebook scores (|r|={abs(c):.3f})")
    rng = np.random.default_rng(seed)
    null = np.array([PCA().fit(np.column_stack([rng.permutation(c) for c in X.T])).explained_variance_ratio_
                     for _ in range(n_perm)])
    pa95 = np.percentile(null, 95, axis=0)
    m = min(10, p)
    Xz = (X - X.mean(0)) / X.std(0)
    Sz = (S[:, :m] - S[:, :m].mean(0)) / S[:, :m].std(0)
    loadings = (Xz.T @ Sz) / n  # variable–PC correlations
    pca_json = dict(n=n, retained=retained, evr=r(pca.explained_variance_ratio_),
                    eigenvalues=r(pca.explained_variance_), pa95=r(pa95),
                    features=[dict(name=f, family=_family(f)) for f in feature_names],
                    loadings=r(loadings))
    print(f"PCA: PC1-3 = {np.round(pca.explained_variance_ratio_[:3] * 100, 1)}%  |  PCs above null: "
          f"{int((pca.explained_variance_ratio_[:20] > pa95[:20]).sum())}")

    # ---- Clustering sweeps --------------------------------------------------------
    km = []
    for k in ks:
        km_fit = KMeans(n_clusters=k, n_init=100, random_state=seed).fit(X)
        lab = km_fit.labels_
        s = silhouette_samples(X, lab)
        km.append(dict(k=k, inertia=float(km_fit.inertia_), silhouette=float(s.mean()), labels=lab.tolist(), sample=r(s)))
    Z = linkage(X, method="average", metric="cosine")
    hc = []
    for k in ks:
        lab = fcluster(Z, k, "maxclust") - 1
        s = silhouette_samples(X, lab, metric="cosine")
        hc.append(dict(k=k, silhouette=float(s.mean()), labels=lab.tolist(), sample=r(s)))
    if kmeans_labels_k2 is not None:
        print("ARI vs notebook k-means k=2:", round(adjusted_rand_score(kmeans_labels_k2, km[0]["labels"]), 4))
    print("K-means silhouettes:", {d["k"]: round(d["silhouette"], 4) for d in km})
    print("Hier (cosine) silhouettes:", {d["k"]: round(d["silhouette"], 4) for d in hc})

    ids = _col(metadata, ["recording_id", "id"])
    state = _col(metadata, ["state"])
    species = _col(metadata, ["common_name", "scientific_name", "species_id"])
    flag = metadata["flag_any"].astype(bool).values if "flag_any" in metadata.columns else np.zeros(n, bool)
    points = [dict(id=ids[i], state=state[i], species=species[i], flag=bool(flag[i]), pc=r(S[i, :4], 4)) for i in range(n)]
    align = lambda lab: float(abs(np.corrcoef(lab, S[:, 0])[0, 1]))
    cl_json = dict(
        meta=dict(n=n, p=p, representation="Yeo–Johnson transformed, z-scored acoustic features",
                  kmeansMetric="Euclidean", hierMetric="cosine", linkage="average"),
        points=points, kmeans=km, hier=hc, linkage=r(Z, 6),
        leaves=[int(x) for x in dendrogram(Z, no_plot=True)["leaves"]],
        pc1Alignment=dict(kmeans=align(km[0]["labels"]), hier=align(hc[0]["labels"])),
    )
    (out / "clustering.json").write_text(json.dumps(cl_json))
    (out / "pca.json").write_text(json.dumps(pca_json))
    print(f"Wrote {out/'clustering.json'} ({(out/'clustering.json').stat().st_size/1e3:.0f} kB) and pca.json")
