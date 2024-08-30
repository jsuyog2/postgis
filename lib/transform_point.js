module.exports = function (point, srid) {
  try {
    // Extract x, y, and srid1 from the point string using a regex match
    const [x, y, srid1] = point.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+),([0-9]{4})$/).slice(1);

    return `
  SELECT
    ST_X(
      ST_Transform(
        ST_SetSRID(
          ST_MakePoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as x,
    ST_Y(
      ST_Transform(
        ST_SetSRID(
          ST_MakePoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as y
  `;
  } catch (error) {
    throw new Error("Invalid point format");
  }
}
