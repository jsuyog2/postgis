// __tests__/postgis.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Postgis from '../src/index';

describe('Postgis', () => {
  let client: { query: ReturnType<typeof vi.fn> };
  let postgis: Postgis;

  beforeEach(() => {
    client = {
      query: vi.fn()
    };
    postgis = new Postgis(client);
  });

  describe('constructor', () => {
    it('should throw an error if client is not provided', () => {
      // @ts-expect-error intentional invalid arg
      expect(() => new Postgis()).toThrow('A valid pg.Client instance is required.');
    });

    it('should not throw an error if a valid client is provided', () => {
      expect(() => new Postgis(client)).not.toThrow();
    });
  });

  describe('list_tables', () => {
    it('should execute the correct query', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const filter = 'srid = 4326';
      await postgis.list_tables({ filter });
      expect(client.query).toHaveBeenCalledWith(expect.stringMatching(/SELECT\s+i\.table_name,\s+i\.table_type,\s+g\.f_geometry_column\s+as\s+geometry_column,\s+g\.coord_dimension,\s+g\.srid,\s+g\.type\s+FROM\s+information_schema\.tables\s+i\s+LEFT\s+JOIN\s+geometry_columns\s+g\s+ON\s+i\.table_name\s+=\s+g\.f_table_name\s+INNER\s+JOIN\s+information_schema\.table_privileges\s+p\s+ON\s+i\.table_name\s+=\s+p\.table_name\s+AND\s+p\.grantee\s+in\s+\(current_user,\s+'PUBLIC'\)\s+AND\s+p\.privilege_type\s+=\s+'SELECT'\s+WHERE\s+i\.table_schema\s+not\s+in\s+\('pg_catalog',\s+'information_schema'\)\s+--\s+Optional\s+where\s+filter\s+and\s+srid\s+=\s+4326\s+ORDER\s+BY\s+table_name/));
    });
    it('should execute the correct query without filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const expectedQuery = `
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

    ORDER BY table_name
    `.replace(/\s+/g, ' ').trim();
      await postgis.list_tables();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });

  describe('list_columns', () => {
    it('should execute the correct query', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      await postgis.list_columns(table);
      expect(client.query).toHaveBeenCalledWith(expect.stringMatching(
        new RegExp(
          `SELECT\\s+attname\\s+as\\s+field_name,\\s+typname\\s+as\\s+field_type\\s+FROM\\s+pg_namespace,\\s+pg_attribute,\\s+pg_type,\\s+pg_class\\s+WHERE\\s+pg_type\\.oid\\s+=\\s+atttypid\\s+AND\\s+pg_class\\.oid\\s+=\\s+attrelid\\s+AND\\s+relnamespace\\s+=\\s+pg_namespace\\.oid\\s+AND\\s+attnum\\s+>=\\s+1\\s+AND\\s+relname\\s+=\\s+'${table}'`
        )
      ));
    });
  });


  describe('query_table', () => {
    it('should execute the correct query with parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const options = { columns: 'name', filter: `"state" = 'GOA'`, group: 'name', sort: 'name', limit: 10 };
      await postgis.query_table(table, options);
      const expectedQuery = new RegExp(
        `^SELECT\\s+${options.columns}\\s+FROM\\s+${table}\\s*` +
        `${options.filter ? `WHERE\\s+${options.filter}\\s*` : ''}` +
        `${options.group ? `GROUP\\s+BY\\s+${options.group}\\s*` : ''}` +
        `${options.sort ? `ORDER\\s+BY\\s+${options.sort}\\s*` : ''}` +
        `${options.limit ? `LIMIT\\s+${options.limit}\\s*` : ''}$`
      );
      expect(client.query).toHaveBeenCalledWith(expect.stringMatching(expectedQuery));
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      await postgis.query_table(table);
      const expectedQuery = `
      SELECT * FROM ${table}
  `.replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with limit null', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const options = { limit: null };
      await postgis.query_table(table, options);
      const expectedQuery = `
      SELECT * FROM ${table}
  `.replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });



  describe('bbox', () => {
    const queryFun = (table: string, geom_column = 'geom', srid: string | number = '4326', filter?: string) => {
      return `
        SELECT
      ST_Extent(ST_Transform(${geom_column}, ${srid})) as bbox
    FROM
      ${table}
    ${filter ? `WHERE ${filter}` : ''}
      `
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const geom_column = 'geom';
      const srid = '4326';
      const filter = '';
      await postgis.bbox(table, { geom_column, srid: Number(srid), filter });
      const expectedQuery = queryFun(table, geom_column, srid, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      await postgis.bbox(table);
      const expectedQuery = queryFun(table).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
    it('should execute the query without filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const geom_column = 'geom';
      const srid = '4326';
      const filter = 'column_name = "value"';
      await postgis.bbox(table, { geom_column, srid: Number(srid), filter });
      const expectedQuery = queryFun(table, geom_column, srid, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });

  describe('centroid', () => {
    const queryFun = (table: string, force_on_surface = false, geom_column = 'geom', srid = '4326', filter?: string) => {
      return `
  SELECT
      ST_X(
        ST_Transform(
          ${force_on_surface ? 'ST_PointOnSurface' : 'ST_Centroid'}(
            ${geom_column}
          ), ${srid})
      ) as x,
      ST_Y(
        ST_Transform(
          ${force_on_surface ? 'ST_PointOnSurface' : 'ST_Centroid'}(
            ${geom_column}
          ), ${srid})
      ) as y
  
    FROM
      ${table}
  
    ${filter ? `WHERE ${filter}` : ''}
`
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const force_on_surface = false;
      const geom_column = 'geom';
      const srid = '4326';
      const filter = '';
      await postgis.centroid(table, { force_on_surface, geom_column, srid, filter });
      const expectedQuery = queryFun(table, force_on_surface, geom_column, srid, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      await postgis.centroid(table);
      const expectedQuery = queryFun(table).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
    it('should execute the query with filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const force_on_surface = true;
      const geom_column = 'geom';
      const srid = '4326';
      const filter = 'column_name = "value"';
      await postgis.centroid(table, { force_on_surface, geom_column, srid, filter });
      const expectedQuery = queryFun(table, force_on_surface, geom_column, srid, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });


  describe('intersect_feature', () => {
    const queryFun = (table_from: string, table_to: string, columns = '*', distance = '0', geom_column_from = 'geom', geom_column_to = 'geom', filter?: string, sort?: string, limit?: number | null) => {
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
      `
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table_from = 'table_name';
      const table_to = 'other_table';
      const columns = '*'
      const distance = '0'
      const geom_column_from = 'geom'
      const geom_column_to = 'geom'
      const filter = ''
      const sort = 'some_column ASC'
      const limit = 10
      await postgis.intersect_feature(table_from, table_to, { columns, distance, geom_column_from, geom_column_to, filter, sort, limit });
      const expectedQuery = queryFun(table_from, table_to, columns, distance, geom_column_from, geom_column_to, filter, sort, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table_from = 'table_name';
      const table_to = 'other_table';
      await postgis.intersect_feature(table_from, table_to);
      const expectedQuery = queryFun(table_from, table_to).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table_from = 'table_name';
      const table_to = 'other_table';
      const columns = '*'
      const distance = '0'
      const geom_column_from = 'geom'
      const geom_column_to = 'geom'
      const filter = 'column_name = "value"'
      const sort = 'some_column ASC'
      const limit = 10
      await postgis.intersect_feature(table_from, table_to, { columns, distance, geom_column_from, geom_column_to, filter, sort, limit });
      const expectedQuery = queryFun(table_from, table_to, columns, distance, geom_column_from, geom_column_to, filter, sort, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });



  describe('intersect_point', () => {
    const queryFun = (table: string, point: string, columns = '*', distance = '0', geom_column = 'geom', filter?: string, sort?: string, limit?: number | null) => {
      const [x, y, srid] = point.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+),([0-9]{4})$/)!.slice(1);

      return `
       SELECT
    ${columns}

  FROM
    ${table}

  WHERE
    ST_DWithin(
      ${geom_column},
      ST_Transform(
        st_setsrid(
           st_makepoint(${x}, ${y}),
          ${srid}
        ),
        (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
      ),
      ${distance}
    )
    ${filter ? `AND ${filter}` : ''}

  ${sort ? `ORDER BY ${sort}` : ''}

  ${limit ? `LIMIT ${limit}` : ''}
      `
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      const columns = '*'
      const distance = '0'
      const geom_column = 'geom'
      const filter = ''
      const sort = 'some_column ASC'
      const limit = 10
      await postgis.intersect_point(table, point, { columns, distance, geom_column, filter, sort, limit });
      const expectedQuery = queryFun(table, point, columns, distance, geom_column, filter, sort, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      await postgis.intersect_point(table, point);
      const expectedQuery = queryFun(table, point).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      const columns = '*'
      const distance = '0'
      const geom_column = 'geom'
      const filter = 'column_name ="value"'
      const sort = 'some_column ASC'
      const limit = 10
      await postgis.intersect_point(table, point, { columns, distance, geom_column, filter, sort, limit });
      const expectedQuery = queryFun(table, point, columns, distance, geom_column, filter, sort, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without limit', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      const columns = '*'
      const distance = '0'
      const geom_column = 'geom'
      const filter = 'column_name ="value"'
      const sort = 'some_column ASC'
      const limit = null
      await postgis.intersect_point(table, point, { columns, distance, geom_column, filter, sort, limit });
      const expectedQuery = queryFun(table, point, columns, distance, geom_column, filter, sort, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should throw an error for invalid point format', async () => {
      await expect(postgis.intersect_point('table', 'invalid-point')).rejects.toThrow('Invalid point format');
    });
  });



  describe('geojson', () => {
    const queryFun = (table: string, bounds?: string, id_column?: string, precision = 9, geom_column = 'geom', columns?: string, filter?: string) => {
      const bounds_value = bounds ? bounds.split(',').map(Number) : null;
      return `SELECT
        jsonb_build_object(
          'type',       'Feature',
          ${id_column ? `'id', ${id_column},` : ''
        }
          'geometry',   ST_AsGeoJSON(geom, ${parseInt(String(precision), 10)})::jsonb,
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
      ) as subq`
    }
    it('should return geojson object', async () => {
      client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
      const table = 'table_name';
      const result = await postgis.geojson(table, {});
      expect(result).toEqual({ type: 'FeatureCollection', features: [{}] });
    });

    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const id_column = 'id';
      const precision = 9;
      const filter = '';
      const bounds = '1,2'
      await postgis.geojson(table, { bounds, id_column, precision, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, id_column, precision, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
      const table = 'table_name';
      await postgis.geojson(table);
      const expectedQuery = queryFun(table).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with filter and bounds length 3', async () => {
      client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const id_column = 'id';
      const precision = 9;
      const filter = 'column_name = "value"';
      const bounds = '1,2,3'
      await postgis.geojson(table, { bounds, id_column, precision, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, id_column, precision, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with bounds length 4', async () => {
      client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const id_column = 'id';
      const precision = 9;
      const filter = 'column_name = "value"';
      const bounds = '1,2,3,4'
      await postgis.geojson(table, { bounds, id_column, precision, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, id_column, precision, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });

  describe('geobuf', () => {
    const queryFun = (table: string, bounds?: string, geom_column = 'geom', columns?: string, filter?: string) => {
      const bounds_value = bounds ? bounds.split(',').map(Number) : null;
      return `SELECT
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
    it('should return geobuf data', async () => {
      client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
      const table = 'table_name';
      const result = await postgis.geobuf(table, {});
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const filter = '';
      const bounds = '1,2'
      await postgis.geobuf(table, { bounds, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
      const table = 'table_name';
      await postgis.geobuf(table);
      const expectedQuery = queryFun(table).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with filter and bounds length 3', async () => {
      client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const filter = 'column_name = "value"';
      const bounds = '1,2,3'
      await postgis.geobuf(table, { bounds, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with bounds length 4', async () => {
      client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
      const table = 'table_name';
      const columns = '*';
      const geom_column = 'geom';
      const filter = 'column_name = "value"';
      const bounds = '1,2,3,4'
      await postgis.geobuf(table, { bounds, geom_column, columns, filter });
      const expectedQuery = queryFun(table, bounds, geom_column, columns, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });

  describe('mvt', () => {
    const queryFun = (table: string, x: number, y: number, z: number, columns?: string | null, id_column?: string | null, geom_column = 'geom', filter?: string) => {
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
      SELECT ST_AsMVT(mvtgeom.*, '${table}', 4096, 'geom' ${id_column ? `, '${id_column}'` : ''
        }) AS mvt from mvtgeom;
`
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const x = 0, y = 0, z = 0;
      const columns = '*';
      const id_column = 'id';
      const geom_column = 'geom';
      const filter = '';

      await postgis.mvt(table, x, y, z, { columns, id_column });

      const expectedQuery = queryFun(table, x, y, z, columns, id_column, geom_column, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });


    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const x = 0, y = 0, z = 0;

      await postgis.mvt(table, x, y, z);

      const expectedQuery = queryFun(table, x, y, z).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });


    it('should execute the query with filter', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const x = 0, y = 0, z = 0;
      const columns = null;
      const id_column = null;
      const geom_column = 'geom';
      const filter = 'column_name = "value"';

      await postgis.mvt(table, x, y, z, { filter });

      const expectedQuery = queryFun(table, x, y, z, columns, id_column, geom_column, filter).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });
  });


  describe('nearest', () => {
    const queryFun = (table: string, point: string, columns = '*', geom_column = 'geom', filter?: string, limit = 10) => {
      const [x, y, srid] = point.match(/^((-?\d+\.?\d+)(,-?\d+\.?\d+)(,[0-9]{4}))/)![0].split(',')
      return `
       SELECT
      ${columns},
      ST_Distance(
        ST_Transform(
          st_setsrid( st_makepoint(${x}, ${y}), ${srid} ),
          (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
        ),
        ${geom_column}
      ) as distance
  
    FROM
    ${table}
  
    ${filter ? `WHERE ${filter}` : ''}
  
    ORDER BY
      ${geom_column} <-> ST_Transform(
        st_setsrid( st_makepoint(${x}, ${y}), ${srid} ),
        (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
      )
  
    LIMIT ${limit}
      `
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      const columns = '*';
      const geom_column = 'geom';
      const filter = '';
      const limit = 10;

      await postgis.nearest(table, point, { columns, geom_column, filter, limit });

      const expectedQuery = queryFun(table, point, columns, geom_column, filter, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';

      await postgis.nearest(table, point);

      const expectedQuery = queryFun(table, point).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query with filter parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const table = 'table_name';
      const point = '73.70534,14.94202,4326';
      const columns = '*';
      const geom_column = 'geom';
      const filter = 'column_name = "value"';
      const limit = 10;

      await postgis.nearest(table, point, { columns, geom_column, filter, limit });

      const expectedQuery = queryFun(table, point, columns, geom_column, filter, limit).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should throw an error for invalid point format', async () => {
      await expect(postgis.nearest('table', 'bad-point')).rejects.toThrow('Invalid point format');
    });
  });


  describe('transform_point', () => {
    const queryFun = (point: string, srid: string | number) => {
      const [x, y, srid1] = point.match(/^(-?\d+\.?\d+),(-?\d+\.?\d+),([0-9]{4})$/)!.slice(1);
      return ` SELECT
    ST_X(
      ST_Transform(
        ST_SetSRID(
          ST_MakePoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as x,
    ST_Y(
      ST_Transform(
        ST_SetSRID(
          ST_MakePoint(${x}, ${y}),
          ${srid1}
        ),
        ${srid}
      )
    ) as y`
    }
    it('should execute the correct query with default parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const point = '73.70534,14.94202,4326';
      const srid = '3857';
      await postgis.transform_point(point, { srid: Number(srid) });
      const expectedQuery = queryFun(point, srid).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should execute the query without parameters', async () => {
      client.query.mockResolvedValue({ rows: [] });
      const point = '73.70534,14.94202,4326';
      const srid = '4326';
      await postgis.transform_point(point);

      const expectedQuery = queryFun(point, srid).replace(/\s+/g, ' ').trim();
      const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();
      expect(receivedQuery).toMatch(expectedQuery);
    });

    it('should throw an error for invalid point format', async () => {
      const invalidPoint = 'invalid,point,format';
      await expect(postgis.transform_point(invalidPoint)).rejects.toThrow('Invalid point format');
    });

    it('should throw an error when query execution fails', async () => {
      const errorMessage = 'Query failed';
      client.query.mockRejectedValue(new Error(errorMessage));

      const point = '73.70534,14.94202,4326';
      const srid = 3857;

      await expect(postgis.transform_point(point, { srid }))
        .rejects
        .toThrow(`Query execution failed: ${errorMessage}`);
    });
  });

  describe('_executeQuery', () => {
    it('should throw an error when query execution fails', async () => {
      const errorMessage = 'Query failed';
      client.query.mockRejectedValueOnce(new Error(errorMessage));

      // @ts-expect-error accessing private method for testing
      await expect(postgis._executeQuery('SELECT * FROM some_table'))
        .rejects
        .toThrow(`Query execution failed: ${errorMessage}`);
    });
  });

});
