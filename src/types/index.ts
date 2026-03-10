/**
 * PostGIS Node.js Library — TypeScript Type Definitions
 * @module postgis/types
 */

/** A minimal pg.Client-compatible interface */
export interface PostgisClient {
  query(sql: string): Promise<{ rows: Record<string, unknown>[] }>;
}

/** Options for {@link Postgis.list_tables} */
export interface ListTablesOptions {
  /** Optional SQL WHERE clause fragment (e.g. `"table_type = 'BASE TABLE'"`) */
  filter?: string;
}

/** Options for {@link Postgis.query_table} */
export interface QueryTableOptions {
  /** Columns to select. Defaults to `'*'` */
  columns?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
  /** GROUP BY clause */
  group?: string;
  /** ORDER BY clause */
  sort?: string;
  /** Max rows to return. Defaults to `100`. Pass `null` to remove limit */
  limit?: number | null;
}

/** Options for {@link Postgis.bbox} */
export interface BboxOptions {
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** Target SRID for the bounding box. Defaults to `4326` */
  srid?: number;
  /** SQL WHERE clause fragment */
  filter?: string;
}

/** Options for {@link Postgis.centroid} */
export interface CentroidOptions {
  /** Use `ST_PointOnSurface` instead of `ST_Centroid`. Defaults to `false` */
  force_on_surface?: boolean;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** Target SRID. Defaults to `'4326'` */
  srid?: string | number;
  /** SQL WHERE clause fragment */
  filter?: string;
}

/** Options for {@link Postgis.intersect_feature} */
export interface IntersectFeatureOptions {
  /** Columns to select. Defaults to `'*'` */
  columns?: string;
  /** Search radius in CRS units. Defaults to `'0'` */
  distance?: string | number;
  /** Geometry column in the first (from) table. Defaults to `'geom'` */
  geom_column_from?: string;
  /** Geometry column in the second (to) table. Defaults to `'geom'` */
  geom_column_to?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
  /** ORDER BY clause */
  sort?: string;
  /** Max rows to return */
  limit?: number | null;
}

/** Options for {@link Postgis.intersect_point} */
export interface IntersectPointOptions {
  /** Columns to select. Defaults to `'*'` */
  columns?: string;
  /** Search radius in CRS units. Defaults to `'0'` */
  distance?: string | number;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
  /** ORDER BY clause */
  sort?: string;
  /** Max rows to return. Defaults to `10` */
  limit?: number | null;
}

/** Options for {@link Postgis.geojson} */
export interface GeoJSONOptions {
  /**
   * Spatial filter as a comma-separated bounding box.
   * - 4 values → `xmin,ymin,xmax,ymax` (WGS84 envelope)
   * - 3 values → `z,x,y` (tile envelope)
   */
  bounds?: string;
  /** Column to use as the GeoJSON feature `id` */
  id_column?: string;
  /** Coordinate decimal precision. Defaults to `9` */
  precision?: number;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** Extra columns to include in feature properties */
  columns?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
}

/** Options for {@link Postgis.geobuf} */
export interface GeobufOptions {
  /**
   * Spatial filter as a comma-separated bounding box.
   * - 4 values → `xmin,ymin,xmax,ymax`
   * - 3 values → `z,x,y` (tile envelope)
   */
  bounds?: string;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** Extra columns to include */
  columns?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
}

/** Options for {@link Postgis.mvt} */
export interface MvtOptions {
  /** Extra attribute columns to embed in the tile */
  columns?: string;
  /** Column to use as the MVT feature ID */
  id_column?: string;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
}

/** Options for {@link Postgis.nearest} */
export interface NearestOptions {
  /** Columns to select. Defaults to `'*'` */
  columns?: string;
  /** Geometry column name. Defaults to `'geom'` */
  geom_column?: string;
  /** SQL WHERE clause fragment */
  filter?: string;
  /** Max rows to return. Defaults to `10` */
  limit?: number;
}

/** Options for {@link Postgis.transform_point} */
export interface TransformPointOptions {
  /** Target SRID. Defaults to `4326` */
  srid?: number;
}

/** GeoJSON FeatureCollection returned by {@link Postgis.geojson} */
export interface FeatureCollection {
  type: 'FeatureCollection';
  features: unknown[];
}

/** Parsed point coordinates extracted from a point string */
export interface ParsedPoint {
  x: string;
  y: string;
  srid: string;
}
