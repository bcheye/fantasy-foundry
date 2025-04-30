cube(`Fixtures`, {
    sql: `SELECT * FROM fpl.fixtures`,
  
    joins: {
      Gameweeks: {
        sql: `${CUBE}.event = ${Gameweeks}.gameweek_id`,
        relationship: `belongsTo`,
      },
      HomeTeam: {
        sql: `${CUBE}.home_team = ${HomeTeam}.team_id`,
        relationship: `belongsTo`,
      },
      AwayTeam: {
        sql: `${CUBE}.away_team = ${AwayTeam}.team_id`,
        relationship: `belongsTo`,
      }
    },
  
    measures: {
      count: {
        type: `count`,
      }
    },
  
    dimensions: {
      fixtureId: {
        sql: `fixture_id`,
        type: `number`,
        primaryKey: true,
      },
  
      kickoffTime: {
        sql: `kickoff_time`,
        type: `time`,
      },
  
      homeTeamDifficulty: {
        sql: `home_team_difficulty`,
        type: `number`,
      },
  
      awayTeamDifficulty: {
        sql: `away_team_difficulty`,
        type: `number`,
      },
  
      finished: {
        sql: `finished`,
        type: `boolean`,
      }
    }
  });