module.exports = function (table, geom_column, srid, filter) {
  return `
    SELECT
      ST_Extent(ST_Transform(${geom_column}, ${srid})) as bbox
    FROM
      ${table}
    ${filter ? `WHERE ${filter}` : ''}
    `
}