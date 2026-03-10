import { parsePoint } from '../utils/validation.js';

/**
 * Generates a SQL query that returns the nearest features to a given point,
 * ordered by distance using the PostGIS KNN `<->` operator.
 *
 * @throws {Error} if `point` is not in the format `"x,y,srid"`
 */
export function nearest(
  table: string,
  point: string,
  columns: string,
  geom_column: string,
  filter?: string,
  limit: number = 10
): string {
  const { x, y, srid } = parsePoint(point);

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
    `;
}
