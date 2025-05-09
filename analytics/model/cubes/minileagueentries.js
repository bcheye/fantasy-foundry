cube(`MiniLeagueEntries`, {
  sql: `SELECT * FROM fpl.mini_league_entries`,

  joins: {
    MiniLeagues: {
      sql: `${CUBE}.league_id = ${MiniLeagues}.league_id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [entryName, playerName]
    },

    totalPoints: {
      sql: `total`,
      type: `sum`,
      title: `Total Points`
    }
  },

  dimensions: {
    entryId: {
      sql: `entry_id`,
      type: `number`,
      primaryKey: true
    },

    entryName: {
      sql: `entry_name`,
      type: `string`
    },

    playerName: {
      sql: `player_name`,
      type: `string`
    },

    rank: {
      sql: `rank`,
      type: `number`
    },

    total: {
      sql: `total`,
      type: `number`
    },

    leagueId: {
      sql: `league_id`,
      type: `number`
    }
  }
});