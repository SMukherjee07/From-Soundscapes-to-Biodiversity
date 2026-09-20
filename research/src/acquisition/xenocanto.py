"""
Xeno-canto API v3 acquisition utilities.

Scope:
    California, Arizona, Texas
    Bird recordings
    Quality C or better query

A1 target:
    100 California
    75 Arizona
    100 Texas

This module provides reusable acquisition functions.
The actual A1 sample selection and acquisition workflow
is documented in 02_data_acquisition.ipynb.
"""

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


# ---------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

RAW_XC_DIR = PROJECT_ROOT / "data" / "raw" / "xenocanto"
RAW_AUDIO_DIR = PROJECT_ROOT / "audio" / "raw"

RAW_XC_DIR.mkdir(parents=True, exist_ok=True)
RAW_AUDIO_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------
# API configuration
# ---------------------------------------------------------------------

load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("XENO_CANTO_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "XENO_CANTO_API_KEY not found. "
        "Check that your .env file is in the project root."
    )

BASE_URL = "https://xeno-canto.org/api/3/recordings"


# ---------------------------------------------------------------------
# Study regions
# ---------------------------------------------------------------------

STATE_BOXES = {
    "CA": "32.5,-124.5,42.0,-114.1",
    "AZ": "31.3,-114.9,37.0,-109.0",
    "TX": "25.8,-106.7,36.5,-93.5",
}

A1_TARGETS = {
    "CA": 100,
    "AZ": 75,
    "TX": 100,
}


# ---------------------------------------------------------------------
# Metadata acquisition
# ---------------------------------------------------------------------

def fetch_metadata(state, max_pages=3):
    """
    Fetch Xeno-canto metadata for one study region.

    Parameters
    ----------
    state : str
        One of CA, AZ, or TX.

    max_pages : int or None
        Maximum number of API pages to retrieve.
        None retrieves all available pages.

    Returns
    -------
    list
        Raw Xeno-canto recording metadata.
    """

    if state not in STATE_BOXES:
        raise ValueError(
            f"Unknown state '{state}'. "
            f"Expected one of {list(STATE_BOXES)}."
        )

    query = (
        f'grp:birds '
        f'box:{STATE_BOXES[state]} '
        f'q:">C"'
    )

    all_recordings = []
    page = 1

    while True:

        params = {
            "query": query,
            "key": API_KEY,
            "page": page,
        }

        response = requests.get(
            BASE_URL,
            params=params,
            timeout=30,
        )

        response.raise_for_status()

        data = response.json()

        if "error" in data:
            raise RuntimeError(
                f"Xeno-canto API error ({state}): "
                f"{data['error']}"
            )

        page_recordings = data.get("recordings", [])

        all_recordings.extend(page_recordings)

        print(
            f"[{state}] "
            f"Page {page}/{data['numPages']} — "
            f"{len(page_recordings)} recordings "
            f"({data['numSpecies']} species total)"
        )

        if page >= data["numPages"]:
            break

        if max_pages is not None and page >= max_pages:
            break

        page += 1

        # Respect the API with a small pause between requests.
        time.sleep(1)

    return all_recordings


# ---------------------------------------------------------------------
# Raw metadata storage
# ---------------------------------------------------------------------

def save_raw_metadata(recordings, state, path=None):
    """
    Save raw Xeno-canto metadata without modifying the records.
    """

    if path is None:
        path = RAW_XC_DIR / f"xc_metadata_raw_{state}.json"

    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(recordings, f, indent=2, ensure_ascii=False)

    print(
        f"[{state}] Saved {len(recordings)} raw records to:\n"
        f"    {path}"
    )


# ---------------------------------------------------------------------
# Audio download
# ---------------------------------------------------------------------

def download_audio_sample(
    recordings,
    n,
    state,
    out_dir=None,
):
    """
    Download up to n audio recordings.

    The function does not perform scientific cleaning.
    It only handles acquisition/access constraints.
    """

    if out_dir is None:
        out_dir = RAW_AUDIO_DIR

    out_dir.mkdir(parents=True, exist_ok=True)

    downloaded = 0
    skipped = 0
    failed = 0

    for rec in recordings:

        if downloaded >= n:
            break

        recording_id = rec.get("id")
        url = rec.get("file")

        # Audio unavailable/restricted.
        if not url:
            skipped += 1
            continue

        filename = out_dir / f"{state}_{recording_id}.mp3"

        if filename.exists():
            downloaded += 1
            continue

        try:

            response = requests.get(
                url,
                timeout=60,
            )

            response.raise_for_status()

            content_type = response.headers.get(
                "content-type",
                ""
            ).lower()

            if len(response.content) == 0:
                raise ValueError("Empty response.")

            # Save only after successful response validation.
            filename.write_bytes(response.content)

            downloaded += 1

        except Exception as exc:

            failed += 1

            print(
                f"[{state}] Failed to download "
                f"XC{recording_id}: {exc}"
            )

        time.sleep(0.5)

    print(
        f"[{state}] "
        f"Downloaded={downloaded}, "
        f"Skipped={skipped}, "
        f"Failed={failed}"
    )

    return {
        "state": state,
        "requested": n,
        "downloaded": downloaded,
        "skipped": skipped,
        "failed": failed,
    }