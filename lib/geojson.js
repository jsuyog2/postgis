module.exports = function (table, bounds, id_column, precision, geom_column, columns, filter) {
    let bounds_value = bounds ? bounds.split(',').map(Number) : null;

    return `
      SELECT
        jsonb_build_object(
          'type',       'Feature',
          ${id_column ? `'id', ${id_column},` : ''
        }
          'geometry',   ST_AsGeoJSON(geom, ${parseInt(precision, 10)})::jsonb,
          'properties', to_jsonb( subq.* ) - 'geom' ${id_column ? `- '${id_column}'` : ''}
        ) AS geojson
  
      FROM (
        SELECT
          ST_Transform(${geom_column}, 4326) as geom
          ${columns ? `, ${columns}` : ''}
          ${id_column ? `, ${id_column}` : ''}
        FROM
          ${table},
          (SELECT ST_SRID(${geom_column}) AS srid FROM ${table} WHERE ${geom_column} IS NOT NULL LIMIT 1) a
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
      ) as subq
    `
}