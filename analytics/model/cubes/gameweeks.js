cube(`Gameweeks`, {
  sql: `SELECT * FROM fpl.gameweeks`,

  measures: {
    count: {
      type: `count`,
    },
    averageEntryScore: {
      sql: `average_entry_score`,
      type: `avg`,
    },
  },

  dimensions: {
    gameweekId: {
      sql: `gameweek_id`,
      type: `number`,
      primaryKey: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    deadlineTime: {
      sql: `deadline_time`,
      type: `time`,
    },

    finished: {
      sql: `finished`,
      type: `boolean`,
    }
  }
});