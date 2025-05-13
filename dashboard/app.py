from flask import Flask, render_template, request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CUBE_API_URL = "http://localhost:4000/cubejs-api/v1/load"
CUBE_API_TOKEN = os.getenv("CUBE_API_TOKEN", "sandbox")


@app.route("/")
def dashboard():
    headers = {"Authorization": f"Bearer {CUBE_API_TOKEN}"}

    selected_position = request.args.get("position")
    selected_team = request.args.get("team")

    cube_filters = []
    if selected_position:
        cube_filters.append({
            "member": "Players.positionTypeId",
            "operator": "equals",
            "values": [selected_position]
        })
    if selected_team:
        cube_filters.append({
            "member": "Players.team",
            "operator": "equals",
            "values": [selected_team]
        })

    queries = {
        "points_vs_cost": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.totalPoints", "Players.avgCost"],
                "filters": cube_filters,
                "order": {"Players.totalPoints": "desc"},
                "limit": 20
            }
        },
        "most_selected": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.totalPoints"],
                "filters": cube_filters,
                "order": {"Players.totalPoints": "desc"},
                "limit": 20
            }
        },
        "most_minutes": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.minutes"],
                "filters": cube_filters,
                "order": {"Players.minutes": "desc"},
                "limit": 10
            }
        }
    }

    results = {}
    for key, q in queries.items():
        r = requests.post(CUBE_API_URL, json=q, headers=headers)
        r.raise_for_status()
        results[key] = r.json().get("data", [])

    results["value_score"] = []
    for row in results["points_vs_cost"]:
        points = float(row["Players.totalPoints"])
        cost = float(row["Players.avgCost"])
        if cost > 0:
            value_score = round(points / cost, 2)
            results["value_score"].append({
                "name": row["Players.name"],
                "value": value_score
            })
    results["value_score"] = sorted(results["value_score"], key=lambda x: x["value"], reverse=True)[:10]

    results["value_table"] = []
    for row in results["points_vs_cost"]:
        try:
            name = row["Players.name"]
            points = float(row["Players.totalPoints"])
            cost = float(row["Players.avgCost"])
            if cost > 0:
                value = round(points / cost, 2)
                results["value_table"].append({
                    "name": name,
                    "points": int(points),
                    "cost": round(cost, 2),
                    "value": value
                })
        except (KeyError, ValueError, TypeError):
            continue

    positions = [
        {"id": "1", "name": "Goalkeeper"},
        {"id": "2", "name": "Defender"},
        {"id": "3", "name": "Midfielder"},
        {"id": "4", "name": "Forward"}
    ]
    teams = [
        {"id": "1", "name": "Arsenal"}, {"id": "2", "name": "Aston Villa"}, {"id": "3", "name": "Bournemouth"},
        {"id": "4", "name": "Brentford"}, {"id": "5", "name": "Brighton"}, {"id": "6", "name": "Burnley"},
        {"id": "7", "name": "Chelsea"}, {"id": "8", "name": "Crystal Palace"}, {"id": "9", "name": "Everton"},
        {"id": "10", "name": "Fulham"}, {"id": "11", "name": "Liverpool"}, {"id": "12", "name": "Luton"},
        {"id": "13", "name": "Man City"}, {"id": "14", "name": "Man United"}, {"id": "15", "name": "Newcastle"},
        {"id": "16", "name": "Nottingham Forest"}, {"id": "17", "name": "Sheffield United"},
        {"id": "18", "name": "Spurs"}, {"id": "19", "name": "West Ham"}, {"id": "20", "name": "Wolves"}
    ]

    return render_template("dashboard.html", data=results,
                           selected_position=selected_position,
                           selected_team=selected_team,
                           positions=positions,
                           teams=teams)


@app.route("/leagues")
def mini_leagues():
    return render_template("leagues.html")


@app.route("/league")
def league_detail():
    league_id = request.args.get("league_id")
    if not league_id:
        return "No league ID provided", 400

    headers = {
        "Authorization": f"Bearer {CUBE_API_TOKEN}",
        "Content-Type": "application/json"
    }

    # === Standings Query ===
    standings_query = {
        "measures": ["MiniLeagueEntries.totalPoints"],
        "dimensions": ["MiniLeagueEntries.entryName", "MiniLeagueEntries.rank", "MiniLeagues.leagueName"],
        "filters": [{
            "member": "MiniLeagueEntries.leagueId",
            "operator": "equals",
            "values": [league_id]
        }],
        "order": {"MiniLeagueEntries.rank": "asc"},
        "limit": 50
    }

    standings_res = requests.post(CUBE_API_URL, headers=headers, json={"query": standings_query})
    standings_res.raise_for_status()
    standings = standings_res.json().get("data", [])
    league_name = standings[0]["MiniLeagues.leagueName"] if standings else "Unknown League"

    # === Full Gameweek Data (for visualizations) ===
    all_gw_query = {
        "measures": ["GameweekWinners.points"],
        "dimensions": ["GameweekWinners.entryName", "GameweekWinners.gameweek", "GameweekWinners.rank"],
        "filters": [{
            "member": "GameweekWinners.leagueId",
            "operator": "equals",
            "values": [league_id]
        }],
        "order": {
            "GameweekWinners.gameweek": "asc",
            "GameweekWinners.rank": "asc"
        },
        "limit": 2000
    }

    all_gw_res = requests.post(CUBE_API_URL, headers=headers, json={"query": all_gw_query})
    all_gw_res.raise_for_status()
    full_gameweek_data = [{**row, "GameweekWinners.gameweek": int(row["GameweekWinners.gameweek"])} for row in all_gw_res.json().get("data", [])]

    # === Filtered Gameweek Data (for table) ===
    selected_gameweek = request.args.get("gameweek")
    selected_rank = request.args.get("rank")

    gw_filters = [{
        "member": "GameweekWinners.leagueId",
        "operator": "equals",
        "values": [league_id]
    }]
    if selected_gameweek:
        gw_filters.append({
            "member": "GameweekWinners.gameweek",
            "operator": "equals",
            "values": [selected_gameweek]
        })
    if selected_rank:
        gw_filters.append({
            "member": "GameweekWinners.rank",
            "operator": "equals",
            "values": [selected_rank]
        })

    gameweek_query = {
        "measures": ["GameweekWinners.points"],
        "dimensions": ["GameweekWinners.entryName", "GameweekWinners.gameweek", "GameweekWinners.rank"],
        "filters": gw_filters,
        "order": {
            "GameweekWinners.gameweek": "asc",
            "GameweekWinners.rank": "asc"
        },
        "limit": 200
    }

    gw_res = requests.post(CUBE_API_URL, headers=headers, json={"query": gameweek_query})
    gw_res.raise_for_status()
    gameweek_data = [{**row, "GameweekWinners.gameweek": int(row["GameweekWinners.gameweek"])} for row in gw_res.json().get("data", [])]

    return render_template(
        "league_detail.html",
        league_id=league_id,
        league_name=league_name,
        standings=standings,
        gameweek_data=gameweek_data,              # for Gameweek Table
        full_gameweek_data=full_gameweek_data,    # for JS charts
        selected_gameweek=selected_gameweek,
        selected_rank=selected_rank
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=50001)