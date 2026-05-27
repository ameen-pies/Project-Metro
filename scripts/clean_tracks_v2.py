"""
Build clean Line 4 track from OSM data.
- Include shared segments for downtown (Tunis Marine → Barcelone → République)
- Include Line 4-only ways for the rest
- Remove duplicate reversed ways (keep one direction only)
- Single clean polyline from Tunis Marine to Kheireddine
"""
import json, re, os, math

path = r"C:\Users\AIGLE\.openclaude\projects\C--Users-AIGLE-OneDrive-Bureau-opencode-project-METRO\6d86a419-7bf8-430d-8e73-50594104d4ff\tool-results\call_fa4af2875691489981a29002.txt"

with open(path, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

json_start = raw.index("{")
json_str = raw[json_start:]
json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", json_str)
data = json.loads(json_str)

# Get all ways with "4" in ref
all_ways = []
for el in data["elements"]:
    if el.get("type") != "way":
        continue
    tags = el.get("tags", {})
    ref = tags.get("ref", "")
    if "4" in ref:
        coords = [[p["lat"], p["lon"]] for p in el["geometry"]]
        all_ways.append({
            "id": el["id"],
            "ref": ref,
            "coords": coords,
            "start": coords[0],
            "end": coords[-1],
            "mid_lon": sum(c[1] for c in coords) / len(coords),
        })

# Remove duplicate reversed ways
# Two ways are duplicates if their start/end are very close (reversed)
def coord_close(a, b, tol=0.0005):
    return abs(a[0]-b[0]) < tol and abs(a[1]-b[1]) < tol

seen = set()
unique_ways = []
for w in all_ways:
    # Create a key based on midpoint
    key = (round(w["mid_lon"], 4), round(w["start"][0], 4))
    if key not in seen:
        seen.add(key)
        unique_ways.append(w)

print(f"Total ways: {len(all_ways)}, After dedup: {len(unique_ways)}")

# Sort east to west
unique_ways.sort(key=lambda w: -w["mid_lon"])

# Chain them
all_coords = []
for i, w in enumerate(unique_ways):
    if i == 0:
        all_coords.extend(w["coords"])
    else:
        prev_end = all_coords[-1]
        curr_start = w["coords"][0]
        curr_end = w["coords"][-1]

        dist_start = math.sqrt((prev_end[0]-curr_start[0])**2 + (prev_end[1]-curr_start[1])**2)
        dist_end = math.sqrt((prev_end[0]-curr_end[0])**2 + (prev_end[1]-curr_end[1])**2)

        if dist_end < dist_start:
            w["coords"].reverse()

        all_coords.extend(w["coords"])

# Prepend Tunis Marine → Farhat Hached → Place de Barcelone segment
# These coords follow Avenue Habib Bourguiba (from OSM inspection)
tunis_marine_segment = [
    [36.8001263, 10.1928958],  # Tunis Marine station
    [36.7998, 10.1915],
    [36.7994, 10.1900],
    [36.7990, 10.1885],
    [36.7986, 10.1872],
    [36.7978921, 10.1860984],  # Farhat Hached station
    [36.7975, 10.1845],
    [36.7970, 10.1830],
    [36.7965, 10.1818],
    [36.7960949, 10.1804490],  # Place de Barcelone station
]

# Check if existing coords start near Barcelone
first = all_coords[0]
if abs(first[0] - 36.796) < 0.002 and abs(first[1] - 10.180) < 0.002:
    all_coords = tunis_marine_segment + all_coords

print(f"Total chained coords: {len(all_coords)}")
print(f"Start: {all_coords[0]}")
print(f"End: {all_coords[-1]}")

# Write TS with green dotted style throughout
lines = []
for lat, lon in all_coords:
    lines.append(f"          [{lat}, {lon}],")
coord_str = "\n".join(lines)

ts_code = f'''export const LINE4_TRACKS: TrackCollection = {{
  type: "FeatureCollection",
  features: [
    {{
      type: "Feature",
      properties: {{ name: "Metro 4 Rail Line", color: "#00E676" }},
      geometry: {{
        type: "LineString",
        coordinates: [
{coord_str}
        ],
      }},
    }},
  ],
}};
'''

base = os.path.dirname(__file__)
ts_outpath = os.path.join(base, "line4_clean_v2_ts.txt")
with open(ts_outpath, "w", encoding="utf-8") as f:
    f.write(ts_code)

print(f"Saved: {ts_outpath}")
