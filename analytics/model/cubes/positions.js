cube(`Positions`, {
  sql: `SELECT * FROM fpl.positions`,

  measures: {
    count: { type: `count` }
  },

  dimensions: {
    positionTypeId: { sql: `position_type_id`, type: `number`, primaryKey: true },
    singularName: { sql: `singular_name`, type: `string` },
    pluralName: { sql: `plural_name`, type: `string` }
  }
});