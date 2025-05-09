cube(`MiniLeagues`, {
  sql: `SELECT * FROM fpl.mini_leagues`,

  joins: {
    MiniLeagueEntries: {
      sql: `${CUBE}.league_id = ${MiniLeagueEntries}.league_id`,
      relationship: `hasMany`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [name]
    }
  },

  dimensions: {
    leagueId: {
      sql: `league_id`,
      type: `number`,
      primaryKey: true
    },

    name: {
      sql: `name`,
      type: `string`
    },

    created: {
      sql: `created`,
      type: `time`
    }
  }
});