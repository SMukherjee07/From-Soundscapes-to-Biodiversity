"""
Verify every figure referenced in researchContent.ts exists in client/public/research.
Exit code 1 if any are missing.
"""
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[3]
CONTENT = ROOT / "website" / "client" / "src" / "components" / "journal" / "researchContent.ts"
PUBLIC = ROOT / "website" / "client" / "public" / "research"

text = CONTENT.read_text()
# matches fig('name.png', ...) and the /research/ prefix in StoryKit usage
refs = set(re.findall(r"fig\(\s*'([^']+)'", text))
refs |= set(re.findall(r"/research/([A-Za-z0-9_.\-]+)", text))

missing = sorted(r for r in refs if not (PUBLIC / r).exists())
present = sorted(r for r in refs if (PUBLIC / r).exists())

print(f"present: {len(present)}  missing: {len(missing)}")
for m in missing:
    print("  MISSING:", m)
sys.exit(1 if missing else 0)