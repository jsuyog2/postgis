/**
 * Generates a SQL query that returns the bounding box (spatial extent)
 * of all geometries in a table, transformed to the given SRID.
 */
export function bbox(
  table: string,
  geom_column: string,
  srid: number,
  filter?: string
): string {
  return `
    SELECT
      ST_Extent(ST_Transform(${geom_column}, ${srid})) as bbox
    FROM
      ${table}
    ${filter ? `WHERE ${filter}` : ''}
  `;
}
