"""
Pull eBird checklist-based species richness for the same Colorado region,
to later validate against acoustic indices (Module 2+ analysis, but
metadata gathered now as part of A1's 'additional data source' requirement).
"""
import requests
import pandas as pd
from pathlib import Path

EBIRD_API_KEY = "YOUR_EBIRD_KEY_HERE"  # register at ebird.org/api/keygen
BASE_URL = "https://api.ebird.org/v2/data/obs/{region}/recent"
RAW_DIR = Path("../data/raw")

def fetch_region_observations(region_code="US-CO", back_days=30):
    """Pull recent observations for a region — species richness = unique species count."""
    headers = {"X-eBirdApiToken": EBIRD_API_KEY}
    resp = requests.get(
        BASE_URL.format(region=region_code),
        headers=headers,
        params={"back": back_days}
    )
    resp.raise_for_status()
    return resp.json()

if __name__ == "__main__":
    obs = fetch_region_observations()
    df = pd.DataFrame(obs)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(RAW_DIR / "ebird_richness_raw.csv", index=False)
    print(f"Pulled {len(df)} observations, {df['speciesCode'].nunique()} unique species")
