module.exports = function (table, geom_column = 'geom', srid = '4326', filter) {
  return `
    SELECT
      ST_Extent(ST_Transform(${geom_column}, ${srid})) as bbox
    FROM
      ${table}
    ${filter ? `WHERE ${filter}` : ''}
    `
}