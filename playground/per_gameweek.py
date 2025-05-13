import requests
import json
from sqlalchemy import create_engine, Column, Integer, String, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL database connection details

DB_USER = "bcheye"
DB_PASSWORD = "admin"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "bcheye"

# Construct the database connection URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create a SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Declare a base for our models
Base = declarative_base()

# Define the model for the gameweek_winners table
class GameweekWinner(Base):
    __tablename__ = "gameweek_winners"
    __table_args__ = {"schema": "fpl"}

    id = Column(Integer, primary_key=True)
    league_id = Column(Integer)
    gameweek = Column(Integer)
    manager_name = Column(String)
    team_name = Column(String)
    points = Column(Integer)

# Create the table in the database
Base.metadata.create_all(engine)

# Create a session to interact with the database
Session = sessionmaker(bind=engine)
session = Session()

def fetch_manager_history(manager_id):
    url = f"https://fantasy.premierleague.com/api/entry/{manager_id}/history/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get('current', [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching history for manager {manager_id}: {e}")
        return []
    except json.JSONDecodeError:
        print(f"Error decoding JSON for manager {manager_id}.")
        return []

def find_gameweek_winner(league_id, gameweek):
    url = f"https://fantasy.premierleague.com/api/leagues-classic/{league_id}/standings/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        standings = data.get('standings', {}).get('results', [])

        gameweek_scores = {}
        manager_names = {}

        for entry in standings:
            manager_id = entry['entry']
            manager_name = entry['entry_name']
            manager_names[manager_id] = manager_name
            history = fetch_manager_history(manager_id)
            for event in history:
                if event['event'] == gameweek:
                    gameweek_scores[manager_id] = event['points']
                    break

        if gameweek_scores:
            winner_manager_id = max(gameweek_scores, key=gameweek_scores.get)
            winning_score = gameweek_scores[winner_manager_id]
            winner_name = manager_names.get(winner_manager_id, "Unknown Manager")
            winning_team = [entry['player_name'] for entry in standings if entry['entry'] == winner_manager_id][0] if [entry['player_name'] for entry in standings if entry['entry'] == winner_manager_id] else "Unknown Team"
            # Create a new GameweekWinner object
            winner_data = GameweekWinner(
                league_id=league_id,
                gameweek=gameweek,
                manager_name=winner_name,
                team_name=winning_team,
                points=winning_score,
            )
            # Add the object to the session and commit it to the database
            session.add(winner_data)
            session.commit()

            print(f"Gameweek {gameweek} Winner:")
            print(f"  Manager: {winner_name}")
            print(f"  Team: {winning_team}")
            print(f"  Points: {winning_score}")
        else:
            print(f"Could not determine the winner for Gameweek {gameweek}.")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching league standings: {e}")
    except json.JSONDecodeError:
        print("Error decoding JSON response for league standings.")

def find_all_gameweek_winners(league_id):
    for gameweek in range(36, 39):
        print(f"\n--- Gameweek {gameweek} ---")
        find_gameweek_winner(league_id, gameweek)

if __name__ == "__main__":
    league_id = 1491375  # Replace with your actual League ID
    find_all_gameweek_winners(league_id)
    session.close() # Close the session
