module.exports = function (table, point, columns, distance, geom_column, filter, sort, limit) {
  const [x, y, srid] = point.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+),([0-9]{4})$/).slice(1);
  return `
  SELECT
    ${columns}

  FROM
    ${table}

  WHERE
    ST_DWithin(
      ${geom_column},
      ST_Transform(
        st_setsrid(
           st_makepoint(${x}, ${y}),
          ${srid}
        ),
        (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
      ),
      ${distance}
    )
    ${filter ? `AND ${filter}` : ''}

  ${sort ? `ORDER BY ${sort}` : ''}

  ${limit ? `LIMIT ${limit}` : ''}
  `
}