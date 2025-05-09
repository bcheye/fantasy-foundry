import requests
from backend.db.connector import PostgresConnector

def fetch_league_data(league_id):
    url = f"https://fantasy.premierleague.com/api/leagues-classic/{league_id}/standings/"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def load_league_to_db(data, db: PostgresConnector):
    league_id = data["league"]["id"]
    league_name = data["league"]["name"]

    # Insert league metadata (upsert-safe)
    db.insert_rows(
        table_name="mini_leagues",
        rows=[{
            "league_id": league_id,
            "name": league_name
        }],
        conflict_keys=["league_id"]
    )

    # Build entry rows
    standings = data["standings"]["results"]
    entry_rows = [
        {
            "entry_id": entry["entry"],
            "entry_name": entry["entry_name"],
            "player_name": entry["player_name"],
            "rank": entry["rank"],
            "total": entry["total"],
            "league_id": league_id
        }
        for entry in standings
    ]

    # Overwrite league entries
    db.insert_rows("mini_league_entries", entry_rows, overwrite=True)

if __name__ == "__main__":
    league_id = 1491375
    db = PostgresConnector()
    data = fetch_league_data(league_id)
    load_league_to_db(data, db)
    print(f"✔ Loaded mini league '{data['league']['name']}' with {len(data['standings']['results'])} entries.")
