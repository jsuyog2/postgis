/**
 * Generates a SQL query that returns Mapbox Vector Tile (MVT) binary data
 * for the given tile coordinate (z/x/y).
 */
export function mvt(
  table: string,
  x: number,
  y: number,
  z: number,
  columns?: string,
  id_column?: string,
  geom_column: string = 'geom',
  filter?: string
): string {
  return `
      WITH mvtgeom as (
        SELECT
          ST_AsMVTGeom (
            ST_Transform(${geom_column}, 3857),
            ST_TileEnvelope(${z}, ${x}, ${y})
          ) as geom
          ${columns ? `, ${columns}` : ''}
          ${id_column ? `, ${id_column}` : ''}
        FROM
          ${table},
          (SELECT ST_SRID(${geom_column}) AS srid FROM ${table} WHERE ${geom_column} IS NOT NULL LIMIT 1) a
        WHERE
          ST_Intersects(
            ${geom_column},
            ST_Transform(
              ST_TileEnvelope(${z}, ${x}, ${y}),
              srid
            )
          )
  
          ${filter ? ` AND ${filter}` : ''}
      )
      SELECT ST_AsMVT(mvtgeom.*, '${table}', 4096, 'geom' ${
        id_column ? `, '${id_column}'` : ''
      }) AS mvt from mvtgeom;
    `;
}
