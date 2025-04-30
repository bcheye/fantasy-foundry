cube(`Teams`, {
  sql: `SELECT * FROM fpl.teams`,

  measures: {
    count: {
      type: `count`,
    },
  },

  dimensions: {
    teamId: {
      sql: `team_id`,
      type: `number`,
      primaryKey: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    shortName: {
      sql: `short_name`,
      type: `string`,
    },

    strengthOverallHome: {
      sql: `strength_overall_home`,
      type: `number`,
    },

    strengthOverallAway: {
      sql: `strength_overall_away`,
      type: `number`,
    },
  },
});