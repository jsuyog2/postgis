module.exports = function (table_from, table_to, columns = '*', distance = '0', geom_column_from = 'geom', geom_column_to = 'geom', filter, sort, limit) {

    return `
   SELECT
    ${columns}

  FROM
    ${table_from},
    ${table_to}

  WHERE
    ST_DWithin(
      ${table_from}.${geom_column_from},
      ${table_to}.${geom_column_to},
      ${distance}
    )
    ${filter ? `AND ${filter}` : ''}

  ${sort ? `ORDER BY ${sort}` : ''}

  ${limit ? `LIMIT ${limit}` : ''}
  `
}