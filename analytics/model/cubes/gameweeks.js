cube(`Gameweeks`, {
  sql: `SELECT * FROM fpl.gameweeks`,

  measures: {
    count: {
      type: `count`
    },
    avgEntryScore: {
      sql: `average_entry_score`,
      type: `avg`
    }
  },

  dimensions: {
    gameweekId: {
      sql: `gameweek_id`,
      type: `number`,
      primaryKey: true
    },
    name: {
      sql: `name`,
      type: `string`
    },
    deadlineTime: {
      sql: `deadline_time`,
      type: `time`
    },
    isCurrent: {
      sql: `is_current`,
      type: `boolean`
    },
    isNext: {
      sql: `is_next`,
      type: `boolean`
    },
    finished: {
      sql: `finished`,
      type: `boolean`
    },
    dataChecked: {
      sql: `data_checked`,
      type: `boolean`
    }
  }
});