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
-- Fixtures Table
CREATE TABLE fixtures (
    fixture_id INTEGER PRIMARY KEY,
    event INTEGER, -- Gameweek
    home_team INTEGER REFERENCES teams(team_id),
    away_team INTEGER REFERENCES teams(team_id),
    kickoff_time TIMESTAMP,
    home_team_difficulty INTEGER,
    away_team_difficulty INTEGER,
    finished BOOLEAN
);
-- Gameweeks Table
CREATE TABLE gameweeks (
    gameweek_id INTEGER PRIMARY KEY,
    name TEXT,
    deadline_time TIMESTAMP,
    average_entry_score INTEGER,
    finished BOOLEAN
);

-- Player Stats Table
CREATE TABLE player_stats (
    player_id INTEGER REFERENCES players(player_id),
    gameweek_id INTEGER REFERENCES gameweeks(gameweek_id),
    minutes INTEGER,
    goals_scored INTEGER,
    assists INTEGER,
    clean_sheets INTEGER,
    yellow_cards INTEGER,
    red_cards INTEGER,
    total_points INTEGER,
    PRIMARY KEY (player_id, gameweek_id)
);