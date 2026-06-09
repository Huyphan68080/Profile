import json
import os

log_path = r"C:\Users\Huyph\.gemini\antigravity\brain\f254fb10-18bd-4400-a1e1-4575ceba2cd9\.system_generated\logs\transcript.jsonl"
output_path = r"d:\Animations\scratch\log_matches.txt"

if os.path.exists(log_path):
    with open(log_path, "r", encoding="utf-8") as f, open(output_path, "w", encoding="utf-8") as out:
        for line in f:
            try:
                data = json.loads(line)
                content = data.get("content", "")
                if any(w in content for w in ["card", "phải", "trong suốt", "nhiện", "màn"]):
                    out.write(f"Step {data.get('step_index')}: {content}\n")
            except Exception:
                pass
    print("Matches written to scratch/log_matches.txt")
else:
    print("Log path not found")
