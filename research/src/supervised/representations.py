"""Training-only acoustic representations. Fit inside CV folds."""
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import KBinsDiscretizer

def make_representations(mnb_bins=3):
    def imputer():
        return SimpleImputer(strategy="median", keep_empty_features=True)

    def bins(n, encoding):
        return KBinsDiscretizer(
            n_bins=n, encode=encoding, strategy="quantile",
            quantile_method="averaged_inverted_cdf", subsample=None,
        )

    return {
        "continuous": Pipeline([("impute", imputer())]),
        "multinomial_bins": Pipeline([
            ("impute", imputer()), ("encode", bins(mnb_bins, "onehot"))
        ]),
        "bernoulli_indicators": Pipeline([
            ("impute", imputer()), ("encode", bins(2, "ordinal"))
        ]),
    }
