

module.exports = function (table, columns, filter, group, sort, limit = 100) {
  return `SELECT
    ${columns}
  FROM
  ${table}
  ${filter ? `WHERE ${filter}` : ''}
  ${group ? `GROUP BY ${group}` : ''}
  ${sort ? `ORDER BY ${sort}` : ''}
  ${limit ? `LIMIT ${limit}` : ''}
`
}