import requests
import time
from backend.db.connector import PostgresConnector

API_BASE = "https://fantasy.premierleague.com/api"

def fetch_entry_history(entry_id):
    url = f"{API_BASE}/entry/{entry_id}/history/"
    r = requests.get(url)
    r.raise_for_status()
    return r.json()

def extract_gameweek_scores(entry_id, league_id, history_data):
    existing = {item["event"]: item["points"] for item in history_data.get("current", [])}
    results = []

    for gw in range(1, 39):  # Gameweeks 1–38
        results.append({
            "entry_id": entry_id,
            "league_id": league_id,
            "gameweek": gw,
            "points": existing.get(gw, 0)  # Fill missing with 0
        })

    return results

def load_gameweek_scores():
    db = PostgresConnector()
    engine = db.get_engine()
    entries = db.get_table("mini_league_entries")

    with engine.connect() as conn:
        entry_rows = conn.execute(entries.select()).fetchall()

    all_scores = []
    for row in entry_rows:
        try:
            entry_id = row.entry_id
            league_id = row.league_id
            data = fetch_entry_history(entry_id)
            scores = extract_gameweek_scores(entry_id, league_id, data)
            all_scores.extend(scores)
            time.sleep(1.2)  # To avoid rate-limiting
        except Exception as e:
            print(f"⚠️ Failed to fetch entry {entry_id}: {e}")

    print(f"Inserting {len(all_scores)} rows into gameweek scores table...")
    db.insert_rows("mini_league_gameweek_scores", all_scores, overwrite=True)

if __name__ == "__main__":
    load_gameweek_scores()