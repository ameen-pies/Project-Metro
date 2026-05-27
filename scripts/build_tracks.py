"""
Build Line 4 track GeoJSON from OSM way data.
Sorts ways by geographic position (east to west) to form the main trunk.
Separates shared segments from Line 4-only segments.
"""
import json, re, sys, os

path = r"C:\Users\AIGLE\.openclaude\projects\C--Users-AIGLE-OneDrive-Bureau-opencode-project-METRO\6d86a419-7bf8-430d-8e73-50594104d4ff\tool-results\call_fa4af2875691489981a29002.txt"

with open(path, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

json_start = raw.index("{")
json_str = raw[json_start:]
json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", json_str)
data = json.loads(json_str)

# Get all Line 4 ways
line4_ways = []
for el in data["elements"]:
    if el.get("type") != "way":
        continue
    tags = el.get("tags", {})
    ref = tags.get("ref", "")
    if "4" in ref:
        coords = [[p["lat"], p["lon"]] for p in el["geometry"]]
        line4_ways.append({
            "id": el["id"],
            "ref": ref,
            "coords": coords,
            "start_lat": coords[0][0],
            "start_lon": coords[0][1],
            "end_lat": coords[-1][0],
            "end_lon": coords[-1][1],
            "is_ligne4_only": ref == "Ligne 4",
        })

# Sort by longitude (east to west = Tunis Marine to Kheireddine)
line4_ways.sort(key=lambda w: -w["start_lon"])

# Print sorted overview
print("Line 4 ways sorted east to west:")
for w in line4_ways:
    marker = "  [L4]" if w["is_ligne4_only"] else "  [SHARED]"
    print(f"  {marker} Way {w['id']} | {w['ref']} | {len(w['coords'])} pts | "
          f"({w['start_lat']:.4f},{w['start_lon']:.4f}) -> ({w['end_lat']:.4f},{w['end_lon']:.4f})")

# Build two features:
# 1. Main Line 4 trunk (all ways connected)
# 2. Eastbound split (Ibn Rachiq bypass)

# Collect all coords for main line
all_main_coords = []
for w in line4_ways:
    all_main_coords.extend(w["coords"])

print(f"\nTotal main line coords: {len(all_main_coords)}")

# Write GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Metro 4 Main Rail Line", "color": "#E53935"},
            "geometry": {
                "type": "LineString",
                "coordinates": all_main_coords,
            },
        }
    ],
}

outpath = os.path.join(os.path.dirname(__file__), "line4_osm_tracks.json")
with open(outpath, "w") as f:
    json.dump(geojson, f, indent=2)

print(f"Saved GeoJSON to {outpath}")
