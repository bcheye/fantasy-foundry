CREATE SCHEMA IF NOT EXISTS fpl;

-- Teams Table
CREATE TABLE IF NOT EXISTS fpl.teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    strength_overall_home INTEGER,
    strength_overall_away INTEGER
);

-- Positions Table
CREATE TABLE IF NOT EXISTS fpl.positions (
    position_type_id INTEGER PRIMARY KEY,
    singular_name TEXT NOT NULL,
    plural_name TEXT NOT NULL
);

-- Gameweeks Table
CREATE TABLE IF NOT EXISTS fpl.gameweeks (
    gameweek_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    deadline_time TIMESTAMP NOT NULL,
    average_entry_score INTEGER,
    finished BOOLEAN,
    data_checked BOOLEAN,
    is_current BOOLEAN,
    is_next BOOLEAN
);

-- Players Table
CREATE TABLE IF NOT EXISTS fpl.players (
    player_id INTEGER PRIMARY KEY,
    first_name TEXT,
    second_name TEXT,
    name TEXT,
    team INTEGER REFERENCES fpl.teams(team_id),
    position_type_id INTEGER REFERENCES fpl.positions(position_type_id),
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

CREATE TABLE IF NOT EXISTS fpl.mini_league_gameweek_scores (
    entry_id INTEGER,
    league_id INTEGER,
    gameweek INTEGER,
    points INTEGER,
    PRIMARY KEY (entry_id, gameweek)
);