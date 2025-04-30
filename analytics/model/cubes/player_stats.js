cube(`PlayerStats`, {
    sql: `SELECT * FROM fpl.player_stats`,
  
    joins: {
      Players: {
        sql: `${CUBE}.player_id = ${Players}.player_id`,
        relationship: `belongsTo`,
      },
      Gameweeks: {
        sql: `${CUBE}.gameweek_id = ${Gameweeks}.gameweek_id`,
        relationship: `belongsTo`,
      }
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
      }
    },
  
    dimensions: {
      playerId: {
        sql: `player_id`,
        type: `number`,
      },
  
      gameweekId: {
        sql: `gameweek_id`,
        type: `number`,
      },
  
      minutes: {
        sql: `minutes`,
        type: `number`,
      },
  
      yellowCards: {
        sql: `yellow_cards`,
        type: `number`,
      },
  
      redCards: {
        sql: `red_cards`,
        type: `number`,
      }
    }
  });