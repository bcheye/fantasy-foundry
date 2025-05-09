cube(`MiniLeagueGameweekScores`, {
  sql: `SELECT * FROM fpl.mini_league_gameweek_scores`,

  measures: {
    points: {
      sql: `points`,
      type: `sum`,
      title: `Points`
    }
  },

  dimensions: {
    entryId: {
      sql: `entry_id`,
      type: `number`,
      primaryKey: true
    },

    leagueId: {
      sql: `league_id`,
      type: `number`
    },

    gameweek: {
      sql: `gameweek`,
      type: `number`
    }
  }
});