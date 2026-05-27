"""
Build clean Line 4 track from OSM data.
Only uses Ligne 4-only ways, chains them east-to-west.
"""
import json, re, os

path = r"C:\Users\AIGLE\.openclaude\projects\C--Users-AIGLE-OneDrive-Bureau-opencode-project-METRO\6d86a419-7bf8-430d-8e73-50594104d4ff\tool-results\call_fa4af2875691489981a29002.txt"

with open(path, "r", encoding="utf-8", errors="replace") as f:
    raw = f.read()

json_start = raw.index("{")
json_str = raw[json_start:]
json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", json_str)
data = json.loads(json_str)

# Only Line 4 exclusive ways (ref == "Ligne 4" exactly)
l4_only = []
for el in data["elements"]:
    if el.get("type") != "way":
        continue
    tags = el.get("tags", {})
    ref = tags.get("ref", "")
    if ref == "Ligne 4":
        coords = [[p["lat"], p["lon"]] for p in el["geometry"]]
        l4_only.append({
            "id": el["id"],
            "coords": coords,
            "start": coords[0],
            "end": coords[-1],
            "mid_lon": sum(c[1] for c in coords) / len(coords),
        })

# Sort east (high lon) to west (low lon)
l4_only.sort(key=lambda w: -w["mid_lon"])

print(f"Line 4-only ways: {len(l4_only)}")
for w in l4_only:
    print(f"  Way {w['id']} | {len(w['coords'])} pts | "
          f"({w['start'][0]:.4f},{w['start'][1]:.4f}) -> ({w['end'][0]:.4f},{w['end'][1]:.4f})")

# Chain ways: connect end of one to start of next
# Each way's end should be close to next way's start
all_coords = []
for i, w in enumerate(l4_only):
    if i == 0:
        all_coords.extend(w["coords"])
    else:
        # Check if we need to reverse or if there's a gap
        prev_end = all_coords[-1]
        curr_start = w["coords"][0]
        curr_end = w["coords"][-1]

        dist_start = ((prev_end[0]-curr_start[0])**2 + (prev_end[1]-curr_start[1])**2)**0.5
        dist_end = ((prev_end[0]-curr_end[0])**2 + (prev_end[1]-curr_end[1])**2)**0.5

        if dist_end < dist_start:
            # Reverse this way to connect
            w["coords"].reverse()

        all_coords.extend(w["coords"])

print(f"\nTotal chained coords: {len(all_coords)}")

# Write GeoJSON
geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"name": "Metro 4 Main Rail Line", "color": "#E53935"},
            "geometry": {
                "type": "LineString",
                "coordinates": all_coords,
            },
        },
        {
            "type": "Feature",
            "properties": {"name": "Eastbound Split Loop", "color": "#00E676"},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [36.80642, 10.18078],
                    [36.80422, 10.18128],
                    [36.80207, 10.18092],
                    [36.79714, 10.18006],
                ],
            },
        },
    ],
}

outpath = os.path.join(os.path.dirname(__file__), "line4_clean_tracks.json")
with open(outpath, "w") as f:
    json.dump(geojson, f)

# Also write as TS
lines = []
for lat, lon in all_coords:
    lines.append(f"          [{lat}, {lon}],")
coord_str = "\n".join(lines)

ts_code = f'''export const LINE4_TRACKS: TrackCollection = {{
  type: "FeatureCollection",
  features: [
    {{
      type: "Feature",
      properties: {{ name: "Metro 4 Main Rail Line", color: "#E53935" }},
      geometry: {{
        type: "LineString",
        coordinates: [
{coord_str}
        ],
      }},
    }},
    {{
      type: "Feature",
      properties: {{ name: "Eastbound Split Loop", color: "#00E676" }},
      geometry: {{
        type: "LineString",
        coordinates: [
          [36.80642, 10.18078],
          [36.80422, 10.18128],
          [36.80207, 10.18092],
          [36.79714, 10.18006],
        ],
      }},
    }},
  ],
}};
'''

ts_outpath = os.path.join(os.path.dirname(__file__), "line4_clean_ts.txt")
with open(ts_outpath, "w", encoding="utf-8") as f:
    f.write(ts_code)

print(f"Saved: {outpath}")
print(f"Saved: {ts_outpath}")
