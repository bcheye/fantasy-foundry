from sqlalchemy import (
    create_engine, MetaData, Table, Column, Integer, String, Numeric, Boolean, DateTime
)
from sqlalchemy.schema import CreateSchema
from sqlalchemy.exc import ProgrammingError
from dotenv import load_dotenv
import os

load_dotenv()

# DB connection
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# Define schema name
SCHEMA_NAME = "fpl"
metadata = MetaData(schema=SCHEMA_NAME)

# Define tables
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

if __name__ == "__main__":
    # First: try to create the schema in an isolated transaction
    try:
        with engine.begin() as conn:
            conn.execute(CreateSchema(SCHEMA_NAME))
            print(f"✔ Created schema '{SCHEMA_NAME}'")
    except ProgrammingError:
        print(f"ℹ Schema '{SCHEMA_NAME}' already exists — skipping")

    # Then: create the tables in a clean, fresh transaction
    with engine.begin() as conn:
        metadata.create_all(conn)
        print("✔ All tables created successfully")