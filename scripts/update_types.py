"""Replace LINE4_TRACKS in types.ts with real OSM data."""
import os

base = os.path.dirname(__file__)
ts_path = os.path.join(base, "..", "Frontend", "src", "lib", "types.ts")
ts_tracks_path = os.path.join(base, "line4_tracks_ts.txt")

with open(ts_tracks_path, "r", encoding="utf-8") as f:
    new_tracks = f.read().strip()

with open(ts_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace LINE4_TRACKS
start_marker = "export const LINE4_TRACKS: TrackCollection = {"
end_marker = "};"

start_idx = content.index(start_marker)
# Find the matching closing };
depth = 0
i = start_idx
while i < len(content):
    if content[i] == "{":
        depth += 1
    elif content[i] == "}":
        depth -= 1
        if depth == 0:
            # Found the closing }
            end_idx = i + 1
            # Include trailing newline if present
            if end_idx < len(content) and content[end_idx] == "\n":
                end_idx += 1
            break
    i += 1

new_content = content[:start_idx] + new_tracks + "\n" + content[end_idx:]

with open(ts_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Updated {ts_path}")
print(f"Replaced {end_idx - start_idx} chars with {len(new_tracks)} chars")
