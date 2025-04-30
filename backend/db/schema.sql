-- Drop if exists (safe re-runs)
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;

-- Teams Table
CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    strength_overall_home INTEGER,
    strength_overall_away INTEGER
);

-- Players Table
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    first_name TEXT,
    second_name TEXT,
    name TEXT,  -- Web name
    team INTEGER REFERENCES teams(team_id),
    position_type_id INTEGER,
    cost NUMERIC,
    total_points INTEGER,
    selected_by_percent TEXT,
    minutes INTEGER,
    goals_scored INTEGER,
    assists INTEGER,
    clean_sheets INTEGER,
    yellow_cards INTEGER,
    red_cards INTEGER
);