module.exports = function (table, force_on_surface = false, geom_column = 'geom', srid = '4326', filter) {
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