"""Replace LINE4_TRACKS in types.ts with clean Line 4-only data."""
import os

base = os.path.dirname(__file__)
ts_path = os.path.join(base, "..", "Frontend", "src", "lib", "types.ts")
clean_path = os.path.join(base, "line4_clean_v2_ts.txt")

with open(clean_path, "r", encoding="utf-8") as f:
    new_tracks = f.read().strip()

with open(ts_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "export const LINE4_TRACKS: TrackCollection = {"
start_idx = content.index(start_marker)

depth = 0
i = start_idx
while i < len(content):
    if content[i] == "{":
        depth += 1
    elif content[i] == "}":
        depth -= 1
        if depth == 0:
            end_idx = i + 1
            if end_idx < len(content) and content[end_idx] == "\n":
                end_idx += 1
            break
    i += 1

new_content = content[:start_idx] + new_tracks + "\n" + content[end_idx:]

with open(ts_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Updated {ts_path}")
print(f"Replaced {end_idx - start_idx} chars with {len(new_tracks)} chars")
