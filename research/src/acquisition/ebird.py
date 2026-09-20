"""
Pull recent eBird observations for the same study regions used
for Xeno-canto acquisition.

Scope:
    California, Arizona, Texas

Purpose:
    Provide an independent ecological observation source that can
    later be compared with acoustic features and biodiversity metrics.

Note:
    The eBird API provides limited/recent/summary outputs.
    It is not a replacement for the full eBird Basic Dataset.
"""

import json
import os
from pathlib import Path

import requests
from dotenv import load_dotenv


# ---------------------------------------------------------------------
# Project paths
# ---------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[3]

RAW_EBIRD_DIR = PROJECT_ROOT / "data" / "raw" / "ebird"

RAW_EBIRD_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------
# API configuration
# ---------------------------------------------------------------------

load_dotenv(PROJECT_ROOT / ".env")

EBIRD_API_KEY = os.getenv("EBIRD_API_KEY")

if not EBIRD_API_KEY:
    raise RuntimeError(
        "EBIRD_API_KEY not found. "
        "Check that your .env file is in the project root."
    )

BASE_URL = "https://api.ebird.org/v2/data/obs/{region}/recent"


# ---------------------------------------------------------------------
# Study regions
# ---------------------------------------------------------------------

REGIONS = {
    "CA": "US-CA",
    "AZ": "US-AZ",
    "TX": "US-TX",
}


# ---------------------------------------------------------------------
# Observation acquisition
# ---------------------------------------------------------------------

def fetch_region_observations(
    region_code,
    back_days=30,
):
    """
    Pull recent eBird observations for one region.

    Parameters
    ----------
    region_code : str
        eBird region code, e.g. US-CA.

    back_days : int
        Number of days back from the current date.

    Returns
    -------
    list
        Raw eBird observation records.
    """

    headers = {
        "X-eBirdApiToken": EBIRD_API_KEY
    }

    response = requests.get(
        BASE_URL.format(region=region_code),
        headers=headers,
        params={"back": back_days},
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    return data


# ---------------------------------------------------------------------
# Raw observation storage
# ---------------------------------------------------------------------

def save_raw_observations(
    observations,
    state,
    path=None,
):
    """
    Save raw eBird observations without modifying them.
    """

    if path is None:
        path = RAW_EBIRD_DIR / f"ebird_observations_raw_{state}.json"

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        path,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            observations,
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(
        f"[{state}] Saved "
        f"{len(observations)} raw eBird observations to:\n"
        f"    {path}"
    )


# ---------------------------------------------------------------------
# Direct execution
# ---------------------------------------------------------------------

if __name__ == "__main__":

    for state, region_code in REGIONS.items():

        observations = fetch_region_observations(
            region_code
        )

        save_raw_observations(
            observations,
            state,
        )

        species_codes = {
            obs.get("speciesCode")
            for obs in observations
            if obs.get("speciesCode")
        }

        print(
            f"[{state}] "
            f"{len(observations)} observations, "
            f"{len(species_codes)} unique species"
        )