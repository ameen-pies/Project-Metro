import json, re, sys

path = "C:/Users/AIGLE/.openclaude/projects/C--Users-AIGLE-OneDrive-Bureau-opencode-project-METRO/6d86a419-7bf8-430d-8e73-50594104d4ff/tool-results/call_fa4af2875691489981a29002.txt"

with open(path, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

# Find JSON start
json_start = raw.index("{")
json_str = raw[json_start:]

# Remove control characters that break JSON
json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", json_str)

try:
    data = json.loads(json_str)
except json.JSONDecodeError as e:
    print(f"JSON error at pos {e.pos}: {e.msg}")
    # Show context around error
    start = max(0, e.pos - 50)
    end = min(len(json_str), e.pos + 50)
    print(f"Context: ...{repr(json_str[start:end])}...")
    sys.exit(1)

print(f"Parsed OK. Total elements: {len(data['elements'])}")

# Filter for Line 4 ways
line4_ways = []
for el in data["elements"]:
    if el.get("type") != "way":
        continue
    tags = el.get("tags", {})
    ref = tags.get("ref", "")
    if "4" in ref:
        line4_ways.append(el)

print(f"Found {len(line4_ways)} Line 4 ways")

all_coords = []
for way in line4_ways:
    coords = [[p["lat"], p["lon"]] for p in way["geometry"]]
    ref = way["tags"]["ref"]
    name = way["tags"].get("name:fr", way["tags"].get("name", ""))
    print(f"  Way {way['id']} | ref: {ref} | pts: {len(coords)} | {name}")
    all_coords.extend(coords)

print(f"\nTotal coords: {len(all_coords)}")

# Write as JS-ready JSON
import os
outpath = os.path.join(os.path.dirname(__file__), "line4_coords.json")
with open(outpath, "w") as out:
    json.dump(all_coords, out)
print(f"Saved to {outpath}")
