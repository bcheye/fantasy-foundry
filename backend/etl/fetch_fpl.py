import requests
import json

FPL_API_BASE = "https://fantasy.premierleague.com/api"

def fetch_bootstrap_data():
    """Fetch main bootstrap-static data (players, teams, events)"""
    url = f"{FPL_API_BASE}/bootstrap-static/"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    data = fetch_bootstrap_data()
    with open("fpl_bootstrap.json", "w") as f:
        json.dump(data, f, indent=2)
    print("✔ Bootstrap data saved to fpl_bootstrap.json")
