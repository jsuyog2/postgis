module.exports = function (table, point, columns, geom_column, filter, limit) {
  const [x, y, srid] = point.match(/^((-?\d+\.?\d+)(,-?\d+\.?\d+)(,[0-9]{4}))/)[0].split(',')
  return `
    SELECT
      ${columns},
      ST_Distance(
        ST_Transform(
          st_setsrid( st_makepoint(${x}, ${y}), ${srid} ),
          (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
        ),
        ${geom_column}
      ) as distance
  
    FROM
    ${table}
  
    ${filter ? `WHERE ${filter}` : ''}
  
    ORDER BY
      ${geom_column} <-> ST_Transform(
        st_setsrid( st_makepoint(${x}, ${y}), ${srid} ),
        (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
      )
  
    LIMIT ${limit}
    `
}