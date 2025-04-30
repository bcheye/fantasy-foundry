import json
import pandas as pd

def load_raw_bootstrap(path="fpl_bootstrap.json"):
    with open(path) as f:
        return json.load(f)

def transform_players(data):
    players = pd.DataFrame(data["elements"])
    players = players[[
        "id", "first_name", "second_name", "web_name", "team",
        "element_type", "now_cost", "total_points", "selected_by_percent", "minutes", "goals_scored",
        "assists", "clean_sheets", "yellow_cards", "red_cards"
    ]]
    players.rename(columns={
        "id": "player_id",
        "web_name": "name",
        "element_type": "position_type_id",
        "now_cost": "cost"
    }, inplace=True)
    players["cost"] = players["cost"] / 10  # convert to millions
    return players

def transform_teams(data):
    teams = pd.DataFrame(data["teams"])
    teams = teams[["id", "name", "short_name", "strength_overall_home", "strength_overall_away"]]
    teams.rename(columns={"id": "team_id"}, inplace=True)
    return teams

def transform_gameweeks(data):
    gameweeks = pd.DataFrame(data["events"])
    gameweeks = gameweeks[[
        "id", "name", "deadline_time", "average_entry_score", "finished", "data_checked", "is_current", "is_next"
    ]]
    gameweeks.rename(columns={"id": "gameweek_id"}, inplace=True)
    return gameweeks

def transform_positions(data):
    positions = pd.DataFrame(data["element_types"])
    positions = positions[["id", "singular_name", "plural_name"]]
    positions.rename(columns={"id": "position_type_id"}, inplace=True)
    return positions

if __name__ == "__main__":
    raw = load_raw_bootstrap()

    df_players = transform_players(raw)
    df_teams = transform_teams(raw)
    df_gameweeks = transform_gameweeks(raw)
    df_positions = transform_positions(raw)

    df_players.to_csv("players.csv", index=False)
    df_teams.to_csv("teams.csv", index=False)
    df_gameweeks.to_csv("gameweeks.csv", index=False)
    df_positions.to_csv("positions.csv", index=False)

    print("✔ All transformed data saved as CSVs")
