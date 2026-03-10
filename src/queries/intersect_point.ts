import { parsePoint } from '../utils/validation.js';

/**
 * Generates a SQL query that returns features from `table` that are
 * within `distance` units of the given point.
 *
 * @throws {Error} if `point` is not in the format `"x,y,srid"`
 */
export function intersect_point(
  table: string,
  point: string,
  columns: string,
  distance: string | number,
  geom_column: string,
  filter?: string,
  sort?: string,
  limit?: number | null
): string {
  const { x, y, srid } = parsePoint(point);

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
  `;
}
