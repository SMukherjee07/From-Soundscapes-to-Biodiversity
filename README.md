# From Soundscapes to Biodiversity

Can passive acoustic recordings of birdsong serve as a scalable proxy for
avian species richness? This project extracts ecoacoustic indices (ACI, ADI,
NDSI, Bioacoustic Index) from Xeno-canto recordings across California,
Arizona, and Texas, and compares them against eBird checklist-based
richness estimates.

Built for CSCI 5612 (Fall 2026), CU Boulder — designed to extend beyond the
course into a full research pipeline (clustering, classification, regression,
neural networks) across five project modules.

## Repository structure

- `research/` — Python pipeline: acquisition, preprocessing, feature
  extraction, visualization, and Colab notebooks
- `data/` — raw (gitignored, large files), interim, processed, and manifest
  (cleaning log, acquisition log) data
- `audio/` — raw/validated/processed audio (gitignored — see note below)
- `figures/` — EDA and introduction images used on the website
- `website/` — React/Vite site (dark forest theme, real habitat photography,
  interactive tabs matching the assignment's required section names)

## Data sources

- **Xeno-canto API v3** — https://xeno-canto.org/api/3/recordings
- **eBird API 2.0** — https://api.ebird.org/v2/data/obs/{regionCode}/recent

Both require a free API key — see `.env.example`.

## Why raw audio isn't in this repo

Hundreds of audio files don't belong in Git. Raw audio stays local or in
Drive; only code, notebooks, small figures, and processed CSV/JSON outputs
are versioned here.

## Status

Data acquisition and EDA in progress (Module 1). See `data/manifests/` for
the cleaning log once populated.
