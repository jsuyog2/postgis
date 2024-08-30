module.exports = function (table, force_on_surface, geom_column, srid, filter) {
  return `
    SELECT
      ST_X(
        ST_Transform(
          ${force_on_surface ? 'ST_PointOnSurface' : 'ST_Centroid'}(
            ${geom_column}
          ), ${srid})
      ) as x,
      ST_Y(
        ST_Transform(
          ${force_on_surface ? 'ST_PointOnSurface' : 'ST_Centroid'}(
            ${geom_column}
          ), ${srid})
      ) as y
  
    FROM
      ${table}
  
    ${filter ? `WHERE ${filter}` : ''}
  `
}