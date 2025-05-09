cube(`GameweekWinners`, {
  sql: `SELECT * FROM dbt_fpl.gameweek_score`,

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
      type: `number`
    },

    leagueId: {
      sql: `league_id`,
      type: `number`
    },

    gameweek: {
      sql: `gameweek`,
      type: `number`
    },

    rank: {
      sql: `rank`,
      type: `number`
    },

    entryName: {
      sql: `entry_name`,
      type: `string`
    }
  }
});