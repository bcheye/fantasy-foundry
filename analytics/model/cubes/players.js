cube(`Players`, {
  sql: `SELECT * FROM fpl.players`,

  joins: {
    Teams: {
      sql: `${CUBE}.team = ${Teams}.teamId`,
      relationship: `belongsTo`,
    },
    Positions: {
      sql: `${CUBE}.position_type_id = ${Positions}.positionTypeId`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: { type: `count` },
    totalPoints: { sql: `total_points`, type: `sum` },
    goalsScored: { sql: `goals_scored`, type: `sum` },
    assists: { sql: `assists`, type: `sum` },
    cleanSheets: { sql: `clean_sheets`, type: `sum` },
    minutes: { sql: `minutes`, type: `sum` },
    redCards: { sql: `red_cards`, type: `sum` },
    yellowCards: { sql: `yellow_cards`, type: `sum` },
    avgCost: { sql: `cost`, type: `avg` }
  },

  dimensions: {
    playerId: { sql: `player_id`, type: `number`, primaryKey: true },
    name: { sql: `name`, type: `string` },
    firstName: { sql: `first_name`, type: `string` },
    secondName: { sql: `second_name`, type: `string` },
    cost: { sql: `cost`, type: `number` },
    team: { sql: `team`, type: `number` },
    positionTypeId: { sql: `position_type_id`, type: `number` },
    selectedByPercent: { sql: `selected_by_percent`, type: `string` }
  }
});