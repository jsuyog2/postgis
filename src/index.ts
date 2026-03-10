/**
 * @packageDocumentation
 * # postgis
 *
 * A lightweight, type-safe Node.js library for interacting with
 * PostGIS-enabled PostgreSQL databases.
 *
 * @example
 * ```typescript
 * import Postgis from 'postgis';
 * import { Client } from 'pg';
 *
 * const client = new Client({ connectionString: process.env.DATABASE_URL });
 * await client.connect();
 *
 * const postgis = new Postgis(client);
 * const tables = await postgis.list_tables();
 * ```
 */

import { bbox } from './queries/bbox.js';
import { centroid } from './queries/centroid.js';
import { geobuf } from './queries/geobuf.js';
import { geojson } from './queries/geojson.js';
import { intersect_feature } from './queries/intersect_feature.js';
import { intersect_point } from './queries/intersect_point.js';
import { list_columns } from './queries/list_columns.js';
import { list_tables } from './queries/list_tables.js';
import { mvt } from './queries/mvt.js';
import { nearest } from './queries/nearest.js';
import { query_table } from './queries/query_table.js';
import { transform_point } from './queries/transform_point.js';
import { logger } from './utils/logger.js';

import type {
  PostgisClient,
  ListTablesOptions,
  QueryTableOptions,
  BboxOptions,
  CentroidOptions,
  IntersectFeatureOptions,
  IntersectPointOptions,
  GeoJSONOptions,
  GeobufOptions,
  MvtOptions,
  NearestOptions,
  TransformPointOptions,
  FeatureCollection,
} from './types/index.js';

export type {
  PostgisClient,
  ListTablesOptions,
  QueryTableOptions,
  BboxOptions,
  CentroidOptions,
  IntersectFeatureOptions,
  IntersectPointOptions,
  GeoJSONOptions,
  GeobufOptions,
  MvtOptions,
  NearestOptions,
  TransformPointOptions,
  FeatureCollection,
};

/**
 * Main class for interacting with a PostGIS-enabled PostgreSQL database.
 *
 * Wrap any `pg.Client` (or pool client) with this class to get access
 * to high-level spatial query helpers.
 *
 * @example
 * ```typescript
 * const postgis = new Postgis(client);
 * const bbox = await postgis.bbox('my_layer');
 * ```
 */
export class Postgis {
  private readonly client: PostgisClient;

  /**
   * @param client - A connected `pg.Client` or any object with a `query(sql)` method.
   * @throws {TypeError} if `client` is missing or does not expose a `query` function.
   */
  constructor(client: PostgisClient) {
    if (!client || typeof client.query !== 'function') {
      throw new TypeError('A valid pg.Client instance is required.');
    }
    this.client = client;
  }

  // ─── Schema Introspection ────────────────────────────────────────────────

  /**
   * List all user-accessible tables in the database, joined with PostGIS
   * geometry metadata where available.
   *
   * @param options.filter - Optional SQL WHERE clause fragment.
   * @returns Array of table metadata rows.
   *
   * @example
   * ```typescript
   * const tables = await postgis.list_tables({ filter: "table_type = 'BASE TABLE'" });
   * ```
   */
  async list_tables({ filter }: ListTablesOptions = {}): Promise<Record<string, unknown>[]> {
    const sql = list_tables(filter);
    return this._executeQuery(sql);
  }

  /**
   * List all columns of a given table using PostgreSQL system catalogs.
   *
   * @param table - Table name.
   * @returns Array of `{ field_name, field_type }` rows.
   *
   * @example
   * ```typescript
   * const columns = await postgis.list_columns('my_layer');
   * ```
   */
  async list_columns(table: string): Promise<Record<string, unknown>[]> {
    const sql = list_columns(table);
    return this._executeQuery(sql);
  }

  // ─── General Querying ────────────────────────────────────────────────────

  /**
   * Query a table with optional column selection, filtering, grouping,
   * sorting and limiting.
   *
   * @param table - Table name.
   * @param options - Query options.
   * @returns Array of result rows.
   *
   * @example
   * ```typescript
   * const rows = await postgis.query_table('parcels', {
   *   columns: 'id, name',
   *   filter: "status = 'active'",
   *   sort: 'name ASC',
   *   limit: 50,
   * });
   * ```
   */
  async query_table(
    table: string,
    { columns = '*', filter, group, sort, limit = 100 }: QueryTableOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = query_table(table, columns, filter, group, sort, limit);
    return this._executeQuery(sql);
  }

  // ─── Spatial Operations ──────────────────────────────────────────────────

  /**
   * Calculate the spatial bounding box (extent) of all geometries in a table.
   *
   * @param table - Table name.
   * @param options.geom_column - Geometry column (default `'geom'`).
   * @param options.srid - Target SRID (default `4326`).
   * @param options.filter - Optional SQL WHERE clause fragment.
   * @returns Array containing a single `{ bbox }` row.
   *
   * @example
   * ```typescript
   * const [result] = await postgis.bbox('parcels');
   * console.log(result.bbox); // BOX(lng1 lat1, lng2 lat2)
   * ```
   */
  async bbox(
    table: string,
    { geom_column = 'geom', srid = 4326, filter }: BboxOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = bbox(table, geom_column, srid, filter);
    return this._executeQuery(sql);
  }

  /**
   * Calculate the centroid (x, y) of each geometry in a table.
   *
   * @param table - Table name.
   * @param options.force_on_surface - Use `ST_PointOnSurface` instead of `ST_Centroid` (default `false`).
   * @param options.geom_column - Geometry column (default `'geom'`).
   * @param options.srid - Target SRID (default `'4326'`).
   * @param options.filter - Optional SQL WHERE clause fragment.
   * @returns Array of `{ x, y }` rows.
   */
  async centroid(
    table: string,
    {
      force_on_surface = false,
      geom_column = 'geom',
      srid = '4326',
      filter,
    }: CentroidOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = centroid(table, force_on_surface, geom_column, srid, filter);
    return this._executeQuery(sql);
  }

  /**
   * Find features from `table_from` that are within `distance` of any feature
   * in `table_to` (using `ST_DWithin`).
   *
   * @param table_from - Source table.
   * @param table_to - Target table.
   * @param options - Intersection options.
   * @returns Array of matching feature rows.
   */
  async intersect_feature(
    table_from: string,
    table_to: string,
    {
      columns = '*',
      distance = '0',
      geom_column_from = 'geom',
      geom_column_to = 'geom',
      filter,
      sort,
      limit,
    }: IntersectFeatureOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = intersect_feature(
      table_from,
      table_to,
      columns,
      distance,
      geom_column_from,
      geom_column_to,
      filter,
      sort,
      limit
    );
    return this._executeQuery(sql);
  }

  /**
   * Find features in `table` that are within `distance` of the given point.
   *
   * @param table - Table name.
   * @param point - Point string in `"x,y,srid"` format (e.g. `"73.5,14.9,4326"`).
   * @param options - Intersection options.
   * @returns Array of matching feature rows.
   * @throws {Error} if `point` format is invalid.
   */
  async intersect_point(
    table: string,
    point: string,
    {
      columns = '*',
      distance = '0',
      geom_column = 'geom',
      filter,
      sort,
      limit = 10,
    }: IntersectPointOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = intersect_point(table, point, columns, distance, geom_column, filter, sort, limit);
    return this._executeQuery(sql);
  }

  // ─── Geometry Export ─────────────────────────────────────────────────────

  /**
   * Export features from `table` as a GeoJSON `FeatureCollection`.
   *
   * @param table - Table name.
   * @param options - GeoJSON export options.
   * @returns A GeoJSON `FeatureCollection`.
   *
   * @example
   * ```typescript
   * const fc = await postgis.geojson('parcels', { precision: 6 });
   * // { type: 'FeatureCollection', features: [...] }
   * ```
   */
  async geojson(
    table: string,
    { bounds, id_column, precision = 9, geom_column = 'geom', columns, filter }: GeoJSONOptions = {}
  ): Promise<FeatureCollection> {
    const sql = geojson(table, bounds, id_column, precision, geom_column, columns, filter);
    const rows = await this._executeQuery(sql);
    return {
      type: 'FeatureCollection',
      features: rows.map((el) => (el as { geojson: unknown }).geojson),
    };
  }

  /**
   * Export features from `table` as a Geobuf binary buffer.
   *
   * @param table - Table name.
   * @param options - Geobuf export options.
   * @returns A `Buffer` containing the Geobuf-encoded data.
   *
   * @example
   * ```typescript
   * const buf = await postgis.geobuf('parcels');
   * res.setHeader('Content-Type', 'application/x-protobuf');
   * res.send(buf);
   * ```
   */
  async geobuf(
    table: string,
    { bounds, geom_column = 'geom', columns, filter }: GeobufOptions = {}
  ): Promise<Buffer> {
    const sql = geobuf(table, bounds, geom_column, columns, filter);
    const rows = await this._executeQuery(sql);
    return (rows[0] as { st_asgeobuf: Buffer }).st_asgeobuf;
  }

  /**
   * Generate a Mapbox Vector Tile (MVT) for the given `z/x/y` tile coordinate.
   *
   * @param table - Table name.
   * @param x - Tile X coordinate.
   * @param y - Tile Y coordinate.
   * @param z - Zoom level.
   * @param options - MVT options.
   * @returns Array containing the raw MVT binary in a `{ mvt }` row.
   *
   * @example
   * ```typescript
   * const [{ mvt: tile }] = await postgis.mvt('parcels', 0, 0, 0);
   * res.setHeader('Content-Type', 'application/vnd.mapbox-vector-tile');
   * res.send(tile);
   * ```
   */
  async mvt(
    table: string,
    x: number,
    y: number,
    z: number,
    { columns, id_column, geom_column = 'geom', filter }: MvtOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = mvt(table, x, y, z, columns, id_column, geom_column, filter);
    return this._executeQuery(sql);
  }

  /**
   * Find the nearest features in `table` to a given point, ordered by distance.
   *
   * @param table - Table name.
   * @param point - Point string in `"x,y,srid"` format (e.g. `"73.5,14.9,4326"`).
   * @param options - Nearest options.
   * @returns Array of nearest feature rows (each includes a `distance` column).
   * @throws {Error} if `point` format is invalid.
   */
  async nearest(
    table: string,
    point: string,
    { columns = '*', geom_column = 'geom', filter, limit = 10 }: NearestOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = nearest(table, point, columns, geom_column, filter, limit);
    return this._executeQuery(sql);
  }

  /**
   * Transform a point from one coordinate reference system to another.
   *
   * @param point - Point string in `"x,y,srid"` format (e.g. `"73.5,14.9,4326"`).
   * @param options.srid - Target SRID (default `4326`).
   * @returns Array of `{ x, y }` rows with the transformed coordinates.
   * @throws {Error} if `point` format is invalid.
   *
   * @example
   * ```typescript
   * const [pt] = await postgis.transform_point('73.5,14.9,4326', { srid: 3857 });
   * ```
   */
  async transform_point(
    point: string,
    { srid = 4326 }: TransformPointOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const sql = transform_point(point, srid);
    return this._executeQuery(sql);
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  /**
   * Execute a raw SQL string against the client and return result rows.
   * @internal
   */
  private async _executeQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    logger.debug('Executing query:', sql.replace(/\s+/g, ' ').trim().slice(0, 120));
    try {
      const res = await this.client.query(sql);
      return (res.rows ?? []) as T[];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Query execution failed:', message);
      throw new Error(`Query execution failed: ${message}`);
    }
  }
}

export default Postgis;
