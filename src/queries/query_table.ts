/**
 * Generates a SQL query that selects rows from a table with optional
 * filtering, grouping, sorting and limiting.
 */
export function query_table(
  table: string,
  columns: string,
  filter?: string,
  group?: string,
  sort?: string,
  limit?: number | null
): string {
  return `SELECT
    ${columns}
  FROM
  ${table}
  ${filter ? `WHERE ${filter}` : ''}
  ${group ? `GROUP BY ${group}` : ''}
  ${sort ? `ORDER BY ${sort}` : ''}
  ${limit ? `LIMIT ${limit}` : ''}
`;
}
