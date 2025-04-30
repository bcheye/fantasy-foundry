cube(`Players`, {
  sql: `SELECT * FROM fpl.players`,

  joins: {
    Teams: {
      sql: `${CUBE}.team = ${Teams}.team_id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    totalPoints: {
      sql: `total_points`,
      type: `sum`,
    },

    totalGoals: {
      sql: `goals_scored`,
      type: `sum`,
    },

    totalAssists: {
      sql: `assists`,
      type: `sum`,
    },

    count: {
      type: `count`,
    },
  },

  dimensions: {
    playerId: {
      sql: `player_id`,
      type: `number`,
      primaryKey: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    firstName: {
      sql: `first_name`,
      type: `string`,
    },

    secondName: {
      sql: `second_name`,
      type: `string`,
    },

    positionTypeId: {
      sql: `position_type_id`,
      type: `number`,
    },

    team: {
      sql: `team`,
      type: `number`,
    },

    cost: {
      sql: `cost`,
      type: `number`,
    },

    selectedByPercent: {
      sql: `selected_by_percent`,
      type: `string`,
    },

    minutes: {
      sql: `minutes`,
      type: `number`,
    },

    cleanSheets: {
      sql: `clean_sheets`,
      type: `number`,
    },

    yellowCards: {
      sql: `yellow_cards`,
      type: `number`,
    },

    redCards: {
      sql: `red_cards`,
      type: `number`,
    },
  },
});