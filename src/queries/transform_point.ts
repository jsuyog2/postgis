import { parsePoint } from '../utils/validation.js';

/**
 * Generates a SQL query that transforms a point from one SRID to another.
 *
 * @throws {Error} if `point` is not in the format `"x,y,srid"`
 */
export function transform_point(point: string, srid: number): string {
  const { x, y, srid: srid1 } = parsePoint(point);

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
}
