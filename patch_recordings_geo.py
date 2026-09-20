"""
One-off patch: recordings.json (built in 06_eda.ipynb's website export cells,
or wherever it was generated) is missing latitude/longitude. This script
merges coordinates back in from data/processed/master_metadata.csv, which
does have them from the original Xeno-canto pull.

Run from the repo root: python patch_recordings_geo.py
"""
import json
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent
METADATA_PATH = PROJECT_ROOT / "data" / "processed" / "master_metadata.csv"
RECORDINGS_JSON_PATH = PROJECT_ROOT / "website" / "client" / "public" / "data" / "recordings.json"

meta = pd.read_csv(METADATA_PATH)
print("master_metadata.csv columns:", list(meta.columns))

# Auto-detect the latitude/longitude columns rather than assuming exact names
lat_col = next((c for c in meta.columns if c.lower() in ("lat", "latitude")), None)
lon_col = next((c for c in meta.columns if c.lower() in ("lon", "lng", "longitude")), None)

if lat_col is None or lon_col is None:
    print("\nCould not auto-detect lat/lon columns. Full column list above —")
    print("please share it so the column names can be set explicitly.")
else:
    print(f"\nUsing lat_col='{lat_col}', lon_col='{lon_col}'")

    id_col = next((c for c in meta.columns if c.lower() == "recording_id"), meta.columns[0])
    geo_lookup = meta.set_index(meta[id_col].astype(str))[[lat_col, lon_col]].to_dict("index")

    with open(RECORDINGS_JSON_PATH, encoding="utf-8") as f:
        recordings = json.load(f)

    matched, missing = 0, 0
    for rec in recordings:
        rid = str(rec.get("recording_id"))
        geo = geo_lookup.get(rid)
        if geo:
            rec["latitude"] = geo[lat_col]
            rec["longitude"] = geo[lon_col]
            matched += 1
        else:
            missing += 1

    with open(RECORDINGS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(recordings, f, indent=2)

    print(f"\nPatched {matched} records with coordinates, {missing} unmatched.")
    print(f"Saved: {RECORDINGS_JSON_PATH}")
