/**
 * Generates a SQL query that returns the centroid (x, y) of each geometry
 * in a table, transformed to the given SRID.
 */
export function centroid(
  table: string,
  force_on_surface: boolean,
  geom_column: string,
  srid: string | number,
  filter?: string
): string {
  const fn = force_on_surface ? 'ST_PointOnSurface' : 'ST_Centroid';
  return `
    SELECT
      ST_X(
        ST_Transform(
          ${fn}(
            ${geom_column}
          ), ${srid})
      ) as x,
      ST_Y(
        ST_Transform(
          ${fn}(
            ${geom_column}
          ), ${srid})
      ) as y
  
    FROM
      ${table}
  
    ${filter ? `WHERE ${filter}` : ''}
  `;
}
