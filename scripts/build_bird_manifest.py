"""Pick ~6 showcase species per state from master_metadata.csv and write website/client/public/data/birds.json.
Run from the repo root:  python scripts/build_bird_manifest.py   (then python scripts/fetch_bird_clips.py)
"""
import json, re
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
META = ROOT / "data" / "processed" / "master_metadata.csv"
OUT = ROOT / "website" / "client" / "public" / "data" / "birds.json"
PER_STATE = 6
MIN_SECONDS = 8

ARCH = [  # (archetype, regex on common name) - first match wins
    ("hummer", r"humming|mountaingem|mango|emerald|coquette"),
    ("owl", r"\bowl\b|screech|pygmy"),
    ("nightjar", r"nighthawk|poorwill|whip-poor-will|nightjar|chuck-will|pauraque"),
    ("raptor", r"hawk|eagle|falcon|kite|harrier|osprey|caracara|kestrel"),
    ("wader", r"heron|egret|ibis|crane|stilt|avocet|sandpiper|plover|curlew"),
    ("water", r"goose|duck|mallard|shoveler|teal|gadwall|wigeon|pintail|brant|gallinule|coot|grebe|merganser|scaup|canvasback"),
    ("quail", r"quail|grouse|turkey|pheasant|chachalaca|partridge"),
    ("roadrunner", r"roadrunner|cuckoo|anis?\b"),
    ("dove", r"dove|pigeon"),
    ("woodpecker", r"woodpecker|flicker|sapsucker"),
    ("corvid", r"crow|raven|jay\b|magpie|nutcracker"),
]
def archetype(name: str) -> str:
    n = name.lower()
    for a, rx in ARCH:
        if re.search(rx, n):
            return a
    return "songbird"

def main():
    m = pd.read_csv(META)
    m = m[(~m.flag_any.astype(bool)) & (m.duration_seconds.fillna(0) >= MIN_SECONDS)].copy()
    m["qrank"] = m.quality.map({"A": 0, "B": 1}).fillna(2)
    m["arch"] = m.common_name.map(archetype)
    regions = {}
    for st in ["CA", "AZ", "TX"]:
        d = m[m.state == st].sort_values(["qrank", "duration_seconds"], ascending=[True, False]).drop_duplicates("common_name")
        picks, seen = [], {}
        # round-robin over archetypes so the scene shows variety, songbirds last
        order = [a for a in d.arch.value_counts().index if a != "songbird"] + ["songbird"]
        while len(picks) < PER_STATE and any(len(d[(d.arch == a)]) > seen.get(a, 0) for a in order):
            for a in order:
                rows = d[d.arch == a]
                if seen.get(a, 0) < len(rows) and len(picks) < PER_STATE:
                    picks.append(rows.iloc[seen.get(a, 0)]); seen[a] = seen.get(a, 0) + 1
        regions[st] = [dict(
            adaptable=("-nd" not in str(r.license).lower()),
            id=str(int(r.recording_id)), common=r.common_name, scientific=r.scientific_name, arch=r.arch, state=st,
            date=str(r.date_original if isinstance(r.date_original, str) else r.date), time=str(r.time_original if isinstance(r.time_original, str) else r.time),
            quality=str(r.quality), seconds=round(float(r.duration_seconds), 1), license=str(r.license), source=str(r.source_url),
            remote=str(r.audio_url), audio=(f"/audio/birds/{int(r.recording_id)}.mp3" if "-nd" not in str(r.license).lower() else ""), lat=float(r.latitude), lon=float(r.longitude),
            blurb="",  # <- write your own short introduction to the bird here
        ) for r in picks]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dict(note="Curated showcase of six recordings per state - not a survey of regional biodiversity.", regions=regions), indent=1))
    for st, v in regions.items():
        print(st, [f"{b['common']} ({b['arch']})" for b in v])

if __name__ == "__main__":
    main()
