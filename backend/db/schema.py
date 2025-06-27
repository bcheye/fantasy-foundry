from sqlalchemy import (
    Table,
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    MetaData,
    PrimaryKeyConstraint,
    func,
)
from sqlalchemy.schema import CreateSchema
from sqlalchemy.exc import ProgrammingError
from db.connector import SQLAlchemyConnector
from sqlalchemy.dialects.postgresql import TIMESTAMP as PG_TIMESTAMP

# Initialize connector
db = SQLAlchemyConnector(
    user="bcheye",
    password="password",
    host="localhost",
    database="fpl_db",
    debug=True,
)

metadata = MetaData(schema="fpl")

# Define tables

overview = Table(
    "overview",
    metadata,
    Column("entry_id", Integer),
    Column("overall_points", Integer),
    Column("overall_rank", Integer),
    Column("gameweek_points", Integer),
    Column("current_gameweek", Integer),
    Column("team_value", Integer),
    PrimaryKeyConstraint("entry_id", "current_gameweek", name="overview_pkey"),
)

gameweek_history = Table(
    "gameweek_history",
    metadata,
    Column("entry_id", Integer),
    Column("gameweek", Integer),
    Column("points", Integer),
    Column("total_points", Integer),
    Column("overall_rank", Integer),
    Column("team_value", Integer),
    Column("cost", Integer),
    Column("points_on_bench", Integer),
    PrimaryKeyConstraint("entry_id", "gameweek", name="gw_history_pkey"),
)
mini_leagues = Table(
    "mini_leagues",
    metadata,
    Column("entry_id", Integer),
    Column("league_id", Integer),
    Column("name", String),
    Column("created", DateTime),
    Column("league_type", String),
    PrimaryKeyConstraint("entry_id", "league_id", name="mini_leagues_pkey"),
)

mini_league_entries = Table(
    "mini_league_entries",
    metadata,
    Column("entry_id", Integer, nullable=False),
    Column("entry_name", String),
    Column("player_name", String),
    Column("rank", Integer),
    Column("total", Integer),
    Column("league_id", Integer, nullable=False),
    PrimaryKeyConstraint("entry_id", "league_id", name="mini_league_entries_pkey"),
)

mini_league_gameweek_scores = Table(
    "mini_league_gameweek_scores",
    metadata,
    Column("entry_id", Integer, nullable=False),
    Column("league_id", Integer, nullable=False),
    Column("gameweek", Integer, nullable=False),
    Column("points", Integer),
    Column("cost", Integer),
    PrimaryKeyConstraint(
        "entry_id", "gameweek", "league_id", name="mini_league_gameweek_scores_pkey"
    ),
)

players = Table(
    "players",
    metadata,
    Column("player_id", Integer, primary_key=True),
    Column("first_name", String),
    Column("second_name", String),
    Column("name", String),
    Column("team", Integer),
    Column("position_type_id", Integer),
    Column("cost", Float),
    Column("total_points", Integer),
    Column("selected_by_percent", String),
    Column("minutes", Integer),
    Column("goals_scored", Integer),
    Column("assists", Integer),
    Column("clean_sheets", Integer),
    Column("yellow_cards", Integer),
    Column("red_cards", Integer),
)

teams = Table(
    "teams",
    metadata,
    Column("team_id", Integer, primary_key=True),
    Column("name", String),
    Column("short_name", String),
    Column("strength_overall_home", Integer),
    Column("strength_overall_away", Integer),
)

gameweeks = Table(
    "gameweeks",
    metadata,
    Column("gameweek_id", Integer, primary_key=True),
    Column("name", String),
    Column("deadline_time", DateTime),
    Column("average_entry_score", Integer),
    Column("finished", Boolean),
    Column("data_checked", Boolean),
    Column("is_current", Boolean),
    Column("is_next", Boolean),
)

positions = Table(
    "positions",
    metadata,
    Column("position_type_id", Integer, primary_key=True),
    Column("singular_name", String),
    Column("plural_name", String),
)
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("first_name", String, nullable=False),
    Column("last_name", String, nullable=False),
    Column("email", String, unique=True, nullable=False),
    Column("password_hash", String, nullable=False),
    Column("fpl_entry_id", Integer),
    Column("created_at", PG_TIMESTAMP(timezone=True), server_default=func.now()),
    Column(
        "updated_at",
        PG_TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    ),
)
mini_league_standings = Table(
    "mini_league_standings",
    metadata,
    Column("entry_id", Integer, primary_key=True),
    Column("league_id", Integer, primary_key=True),
    Column("gameweek", Integer, primary_key=True),
    Column("rank", Integer),
    Column("last_rank", Integer),
    Column("entry_name", String),
    Column("player_name", String),
    Column("total_points", Integer),
)
# Create schema and tables
if __name__ == "__main__":
    with db:  # Ensures connection + disposal
        engine = db.engine
        try:
            with engine.begin() as conn:
                conn.execute(CreateSchema("fpl"))
                print("✔ Created schema 'fpl'")
        except ProgrammingError:
            print("ℹ Schema 'fpl' already exists — skipping")

        with engine.begin() as conn:
            metadata.create_all(conn)
            print("✔ All tables created successfully")
