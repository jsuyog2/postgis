module.exports = function (filter) {
    return `
    SELECT
      i.table_name,
      i.table_type,
      g.f_geometry_column as geometry_column,
      g.coord_dimension,
      g.srid,
      g.type
    FROM
      information_schema.tables i
    LEFT JOIN geometry_columns g
    ON i.table_name = g.f_table_name
    INNER JOIN information_schema.table_privileges p
    ON i.table_name = p.table_name
    AND p.grantee in (current_user, 'PUBLIC')
    AND p.privilege_type = 'SELECT'
    WHERE
    i.table_schema not in  ('pg_catalog', 'information_schema')
  
      -- Optional where filter
      ${filter ? `and ${filter}` : ''}
  
    ORDER BY table_name
    `
}