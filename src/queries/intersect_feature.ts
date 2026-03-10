/**
 * Generates a SQL query that returns features from `table_from` that are
 * within `distance` units of any feature in `table_to`.
 */
export function intersect_feature(
  table_from: string,
  table_to: string,
  columns: string,
  distance: string | number,
  geom_column_from: string,
  geom_column_to: string,
  filter?: string,
  sort?: string,
  limit?: number | null
): string {
  return `
   SELECT
    ${columns}

  FROM
    ${table_from},
    ${table_to}

  WHERE
    ST_DWithin(
      ${table_from}.${geom_column_from},
      ${table_to}.${geom_column_to},
      ${distance}
    )
    ${filter ? `AND ${filter}` : ''}

  ${sort ? `ORDER BY ${sort}` : ''}

  ${limit ? `LIMIT ${limit}` : ''}
  `;
}
