module.exports = function (point, srid = '4326') {
  const [x, y, srid1]  = point.match(/^((-?\d+\.?\d+)(,-?\d+\.?\d+)(,[0-9]{4}))/)[0].split(',');

  return `
  SELECT
    ST_X(
      ST_Transform(
        st_setsrid(
          st_makepoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as x,
    ST_Y(
      ST_Transform(
        st_setsrid(
          st_makepoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as y
  `
}