"""
Fetch bird recording metadata + audio subset from Xeno-canto API v3
Scope: California, Arizona, Texas — quality C or better
A1 target: ~275 total audio files (100 CA / 75 AZ / 100 TX), expandable
to the full ~550 target in Module 2+ once the pipeline is proven.
"""
import requests
import json
import time
from pathlib import Path

API_KEY = "YOUR_KEY_HERE"  # register at xeno-canto.org
BASE_URL = "https://xeno-canto.org/api/3/recordings"
RAW_DIR = Path("../data/raw")

# Approximate state bounding boxes (min_lat,min_lon,max_lat,max_lon)
STATE_BOXES = {
    "CA": "32.5,-124.5,42.0,-114.1",
    "AZ": "31.3,-114.9,37.0,-109.0",
    "TX": "25.8,-106.7,36.5,-93.5",
}
A1_TARGETS = {"CA": 100, "AZ": 75, "TX": 100}


def fetch_metadata(state, max_pages=3, per_page=100):
    """Pull metadata for one state's bounding box, quality C or better, birds only."""
    query = f'grp:birds box:{STATE_BOXES[state]} q:">C"'
    all_recordings = []
    page = 1
    while True:
        resp = requests.get(
            BASE_URL,
            params={"query": query, "key": API_KEY, "page": page, "per_page": per_page}
        )
        resp.raise_for_status()
        data = resp.json()
        if "error" in data:
            raise RuntimeError(f"Xeno-canto API error ({state}): {data['error']}")
        all_recordings.extend(data["recordings"])
        print(f"[{state}] Page {page}/{data['numPages']} — {len(data['recordings'])} recordings "
              f"({data['numSpecies']} species total)")
        if page >= data["numPages"] or (max_pages and page >= max_pages):
            break
        page += 1
        time.sleep(1)  # be polite to the API
    return all_recordings


def save_raw_metadata(recordings, state, path=None):
    path = path or RAW_DIR / f"xc_metadata_raw_{state}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(recordings, f, indent=2)
    print(f"Saved {len(recordings)} records to {path}")


def download_audio_sample(recordings, n, state, out_dir=RAW_DIR / "audio"):
    """
    Download a manageable per-state subset of actual audio files (metadata
    covers the rest). Skips restricted species, which have redacted 'file'
    fields per API docs — document this exclusion as a cleaning decision.
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    downloaded, skipped_restricted = 0, 0
    for rec in recordings:
        if downloaded >= n:
            break
        if rec.get("_meta", {}).get("redacted_fields", {}).get("file"):
            skipped_restricted += 1
            continue
        url = rec["file"]  # already a full https URL in API v3
        fname = out_dir / f"{state}_{rec['id']}.mp3"
        if not fname.exists():
            r = requests.get(url)
            fname.write_bytes(r.content)
            downloaded += 1
        time.sleep(0.5)
    print(f"[{state}] Downloaded {downloaded} files, skipped {skipped_restricted} restricted-species records")


if __name__ == "__main__":
    for state, target in A1_TARGETS.items():
        recs = fetch_metadata(state)
        save_raw_metadata(recs, state)
        download_audio_sample(recs, n=target, state=state)
