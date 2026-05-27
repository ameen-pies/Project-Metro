"""Generate TypeScript code for LINE4_TRACKS from OSM GeoJSON."""
import json, os

geojson_path = os.path.join(os.path.dirname(__file__), "line4_osm_tracks.json")
with open(geojson_path, "r") as f:
    data = json.load(f)

coords = data["features"][0]["geometry"]["coordinates"]

# Generate compact coordinate array string
lines = []
for i, (lat, lon) in enumerate(coords):
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
          [36.80642, 10.18078], // Place de la République
          [36.80422, 10.18128], // Eastbound via Rue de Paris
          [36.80207, 10.18092], // Ibn Rachiq (eastbound variant)
          [36.79714, 10.18006], // Merge back toward Place de Barcelone
        ],
      }},
    }},
  ],
}};
'''

outpath = os.path.join(os.path.dirname(__file__), "line4_tracks_ts.txt")
with open(outpath, "w", encoding="utf-8") as f:
    f.write(ts_code)

print(f"Generated {len(coords)} coordinates -> {outpath}")
print(f"File size: {os.path.getsize(outpath)} bytes")
