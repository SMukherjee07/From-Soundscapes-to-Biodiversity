"""
Extract ecoacoustic indices from cleaned audio using scikit-maad.
This IS the data-cleaning + feature-engineering step for the DataPrep_EDA tab.
"""
import pandas as pd
from pathlib import Path
from maad import sound, features
import librosa

RAW_AUDIO_DIR = Path("../data/raw/audio")
CLEAN_DIR = Path("../data/clean")

def load_and_validate(filepath, target_sr=44100, min_duration=2.0):
    """Load audio, standardize sample rate, flag corrupt/too-short files."""
    try:
        s, sr = librosa.load(filepath, sr=target_sr)
        duration = len(s) / sr
        if duration < min_duration:
            return None  # too short, drop
        return s, sr
    except Exception:
        return None  # corrupt file, drop

def compute_indices(s, sr):
    """Compute core ecoacoustic indices via scikit-maad."""
    Sxx, tn, fn, ext = sound.spectrogram(s, sr)
    aci = features.acoustic_complexity_index(Sxx)
    adi = features.acoustic_diversity_index(Sxx, fn)
    ndsi = features.soundscape_index(Sxx, fn)  # biophony/anthrophony ratio
    bi = features.bioacoustics_index(Sxx, fn)
    return {"ACI": aci, "ADI": adi, "NDSI": ndsi, "BI": bi}

def process_all(audio_dir=RAW_AUDIO_DIR):
    records = []
    dropped = 0
    for filepath in audio_dir.glob("*.mp3"):
        result = load_and_validate(filepath)
        if result is None:
            dropped += 1
            continue
        s, sr = result
        indices = compute_indices(s, sr)
        indices["recording_id"] = filepath.stem
        records.append(indices)
    print(f"Processed {len(records)} recordings, dropped {dropped} (corrupt/too short)")
    return pd.DataFrame(records)

if __name__ == "__main__":
    df = process_all()
    CLEAN_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(CLEAN_DIR / "acoustic_indices_clean.csv", index=False)
    print(df.describe())
