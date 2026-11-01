# From Soundscapes to Biodiversity

This project studies when acoustic differences provide useful evidence about birds. It combines regional classification of selected Xeno-canto recordings with an expert-annotated soundscape pilot for audible species composition and richness. State classification is not a biodiversity estimate, and the datasets are analyzed separately.

Built for CSCI 5612 (Fall 2026), CU Boulder â€” designed to extend beyond the
course into a full research pipeline (clustering, classification, regression,
neural networks) across five project modules.

## Repository structure

- `research/` â€” Python pipeline: acquisition, preprocessing, feature
  extraction, visualization, and Colab notebooks
- `data/` â€” raw (gitignored, large files), interim, processed, and manifest
  (cleaning log, acquisition log) data
- `audio/` â€” raw/validated/processed audio (gitignored â€” see note below)
- `figures/` â€” EDA and introduction images used on the website
- `website/` â€” React/Vite site (dark forest theme, real habitat photography,
  interactive tabs matching the assignment's required section names)

## Data sources

- **Xeno-canto API v3** â€” https://xeno-canto.org/api/3/recordings
- **eBird API 2.0** â€” https://api.ebird.org/v2/data/obs/{regionCode}/recent

Both require a free API key â€” see `.env.example`.

## Why raw audio isn't in this repo

Hundreds of audio files don't belong in Git. Raw audio stays local or in
Drive; only code, notebooks, small figures, and processed CSV/JSON outputs
are versioned here.

## Status

PCA and clustering are available. The supervised research now includes geographic corrections, grouped development validation, Naive Bayes, decision trees, calibration and sensitivity analyses. An annotated-soundscape pilot has reached initial BirdNET inference. The regional final test remains unevaluated.

See [the current research checkpoint](docs/research-status.md) for notebook links, exact cohort definitions, performance interpretation, artifact locations and pending work. The website still needs the new research content integrated; its existing forest design is retained.

See [the website content brief](docs/website-content-brief.md) before editing presentation or making scientific claims.
