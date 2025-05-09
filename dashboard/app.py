from flask import Flask, render_template
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

    queries = {
        "points_vs_cost": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.totalPoints"],
                "order": {"Players.totalPoints": "desc"},
                "limit": 20
            }
        },
        "most_selected": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.totalPoints"],
                "order": {"Players.totalPoints": "desc"},
                "limit": 20
            }
        },
        "most_minutes": {
            "query": {
                "dimensions": ["Players.name"],
                "measures": ["Players.minutes"],
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

    return render_template("dashboard.html", data=results)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)