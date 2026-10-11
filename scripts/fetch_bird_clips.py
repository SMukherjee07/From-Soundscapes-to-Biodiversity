"""Download + trim the showcase clips listed in birds.json into website/client/public/audio/birds/.
Needs: pip install requests ; ffmpeg on PATH.  Clips are CC-licensed Xeno-canto recordings: keep the attribution
(source link + license) that the site already shows, and respect NC/ND terms when remixing.
"""
import json, subprocess, sys
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
MAN = ROOT / "website" / "client" / "public" / "data" / "birds.json"
OUT = ROOT / "website" / "client" / "public" / "audio" / "birds"
CLIP_SECONDS = 16

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for st, birds in json.loads(MAN.read_text())["regions"].items():
        for b in birds:
            if not b.get("adaptable", True) or not b.get("audio"):
                print("SKIP (licence forbids adaptations, streamed from Xeno-canto instead):", b["common"]); continue
            dst = OUT / f"{b['id']}.mp3"
            if dst.exists():
                continue
            raw = OUT / f"{b['id']}.raw"
            try:
                r = requests.get(b["remote"], timeout=60, headers={"User-Agent": "soundscapes-course-project"}); r.raise_for_status()
                raw.write_bytes(r.content)
                start = max(0.0, (b["seconds"] - CLIP_SECONDS) / 2)
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(CLIP_SECONDS), "-i", str(raw),
                                "-ac", "1", "-ar", "32000", "-b:a", "64k", "-af", "afade=t=in:d=0.4,afade=t=out:st=%s:d=0.8" % (CLIP_SECONDS - 0.8), str(dst)], check=True)
                print("ok", st, b["common"], dst.name)
            except Exception as e:
                print("FAILED", st, b["common"], e, file=sys.stderr)
            finally:
                raw.unlink(missing_ok=True)

def write_attribution():
    lines = ["Clips are trimmed (16 s), faded, mono 64 kbps re-encodes of Xeno-canto recordings (adapted material).",
             "Shared under the original licence of each recording (e.g. CC BY-NC-SA: attribution, non-commercial, share-alike).", ""]
    for st, birds in json.loads(MAN.read_text())["regions"].items():
        for b in birds:
            if b.get("adaptable", True) and b.get("audio"):
                lines.append(f"XC{b['id']} | {b['common']} ({b['scientific']}) | {st} | {b['source']} | licence: {b['license']}")
    (OUT / "ATTRIBUTION.txt").write_text("\n".join(lines))

if __name__ == "__main__":
    main(); write_attribution()
