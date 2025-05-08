cube(`Players`, {
  sql: `SELECT * FROM fpl.players`,

  joins: {
    Teams: {
      relationship: `belongsTo`,
      sql: `${Players.team} = ${Teams.teamId}`
    },
    Positions: {
      relationship: `belongsTo`,
      sql: `${Players.positionTypeId} = ${Positions.positionTypeId}`
    }
  },

  measures: {
    count: {
      type: `count`
    },
    totalPoints: {
      sql: `total_points`,
      type: `sum`
    },
    goalsScored: {
      sql: `goals_scored`,
      type: `sum`
    },
    assists: {
      sql: `assists`,
      type: `sum`
    },
    minutes: {
      sql: `minutes`,
      type: `sum`
    },
    redCards: {
      sql: `red_cards`,
      type: `sum`
    },
    yellowCards: {
      sql: `yellow_cards`,
      type: `sum`
    }
  },

  dimensions: {
    playerId: {
      sql: `player_id`,
      type: `number`,
      primaryKey: true
    },
    name: {
      sql: `name`,
      type: `string`
    },
    firstName: {
      sql: `first_name`,
      type: `string`
    },
    secondName: {
      sql: `second_name`,
      type: `string`
    },
    cost: {
      sql: `cost`,
      type: `number`
    },
    selectedByPercent: {
      sql: `selected_by_percent`,
      type: `string`
    }
  }
});