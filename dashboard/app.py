from flask import Flask, render_template, request
import requests
import os
from dotenv import load_dotenv
import pprint

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
        points = float(row.get("Players.totalPoints", 0))
        cost = float(row.get("Players.avgCost", 0))
        if cost > 0:
            value_score = round(points / cost, 2)
            results["value_score"].append({
                "name": row["Players.name"],
                "value_score": value_score
            })


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
    pprint.pprint(results["points_vs_cost"])

    return render_template("dashboard.html", data=results,
                           selected_position=selected_position,
                           selected_team=selected_team,
                           positions=positions,
                           teams=teams)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=50001)
