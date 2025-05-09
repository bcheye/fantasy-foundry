from sqlalchemy import (
    Table, Column, Integer, String, Numeric, Boolean, DateTime
)
from sqlalchemy.schema import CreateSchema
from sqlalchemy.exc import ProgrammingError
from backend.db.connector import PostgresConnector

# Initialize connection
db = PostgresConnector(reflect=False)
engine = db.get_engine()
metadata = db.get_metadata()

# Define tables (schema already set in PostgresConnector)
players = Table("players", metadata,
    Column("player_id", Integer, primary_key=True),
    Column("first_name", String),
    Column("second_name", String),
    Column("name", String),
    Column("team", Integer),
    Column("position_type_id", Integer),
    Column("cost", Numeric),
    Column("total_points", Integer),
    Column("selected_by_percent", String),
    Column("minutes", Integer),
    Column("goals_scored", Integer),
    Column("assists", Integer),
    Column("clean_sheets", Integer),
    Column("yellow_cards", Integer),
    Column("red_cards", Integer)
)

teams = Table("teams", metadata,
    Column("team_id", Integer, primary_key=True),
    Column("name", String),
    Column("short_name", String),
    Column("strength_overall_home", Integer),
    Column("strength_overall_away", Integer)
)

gameweeks = Table("gameweeks", metadata,
    Column("gameweek_id", Integer, primary_key=True),
    Column("name", String),
    Column("deadline_time", DateTime),
    Column("average_entry_score", Integer),
    Column("finished", Boolean),
    Column("data_checked", Boolean),
    Column("is_current", Boolean),
    Column("is_next", Boolean)
)

positions = Table("positions", metadata,
    Column("position_type_id", Integer, primary_key=True),
    Column("singular_name", String),
    Column("plural_name", String)
)

mini_leagues = Table("mini_leagues", metadata,
    Column("league_id", Integer, primary_key=True),
    Column("name", String, nullable=False),
    Column("created", DateTime, nullable=True)
)

mini_league_entries = Table("mini_league_entries", metadata,
    Column("entry_id", Integer, primary_key=True),
    Column("entry_name", String),
    Column("player_name", String),
    Column("rank", Integer),
    Column("total", Integer),
    Column("league_id", Integer)
)

mini_league_gameweek_scores = Table("mini_league_gameweek_scores", metadata,
    Column("entry_id", Integer, primary_key=True),
    Column("league_id", Integer),
    Column("gameweek", Integer, primary_key=True),
    Column("points", Integer)
)

if __name__ == "__main__":
    try:
        with engine.begin() as conn:
            conn.execute(CreateSchema("fpl"))
            print("✔ Created schema 'fpl'")
    except ProgrammingError:
        print("ℹ Schema 'fpl' already exists — skipping")

    # Then: create all tables
    with engine.begin() as conn:
        metadata.create_all(conn)
        print("✔ All tables created successfully")