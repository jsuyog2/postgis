module.exports = function (table, bounds, geom_column, columns, filter) {
    let bounds_value = bounds ? bounds.split(',').map(Number) : null;

    return `
    SELECT
      ST_AsGeobuf(q, 'geom')
  
    FROM
    (
  
      SELECT
        ST_Transform(${geom_column}, 4326) as geom
        ${columns ? `, ${columns}` : ''}
  
      FROM
        ${table}
        ${bounds_value
            ? `, (SELECT ST_SRID(${geom_column}) AS srid FROM ${table} WHERE ${geom_column} IS NOT NULL LIMIT 1) sq`
            : ''
        }
  
      ${filter || bounds_value ? 'WHERE' : ''}
      ${filter ? `${filter}` : ''}
      ${filter && bounds_value ? 'AND' : ''}
      ${bounds_value && bounds_value.length === 4 ?
            `${geom_column} &&
        ST_Transform(
          ST_MakeEnvelope(${bounds_value.join()}, 4326),
          srid
        )
        `
            : ''
        }
      ${bounds_value && bounds_value.length === 3 ?
            `${geom_column} &&
        ST_Transform(
          ST_TileEnvelope(${bounds_value.join()}),
          srid
        )
        `
            : ''
        }
  
    ) as q;
  
    `
}