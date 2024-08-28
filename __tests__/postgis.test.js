// __tests__/postgis.test.js
const Postgis = require('../index'); // Adjust the path if necessary

describe('Postgis', () => {
    let client;
    let postgis;

    beforeEach(() => {
        client = {
            query: jest.fn()
        };
        postgis = new Postgis(client);
    });

    describe('constructor', () => {
        it('should throw an error if client is not provided', () => {
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

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });

    describe('list_columns', () => {
        it('should execute the correct query', async () => {
            // Mock the client.query method to resolve with an empty rows array
            client.query.mockResolvedValue({ rows: [] });

            // Define the table name for the test
            const table = 'table_name';

            // Call the function to execute
            await postgis.list_columns(table);

            // Expect the client.query method to be called with the correct SQL query
            expect(client.query).toHaveBeenCalledWith(expect.stringMatching(
                new RegExp(
                    `SELECT\\s+attname\\s+as\\s+field_name,\\s+typname\\s+as\\s+field_type\\s+FROM\\s+pg_namespace,\\s+pg_attribute,\\s+pg_type,\\s+pg_class\\s+WHERE\\s+pg_type\\.oid\\s+=\\s+atttypid\\s+AND\\s+pg_class\\.oid\\s+=\\s+attrelid\\s+AND\\s+relnamespace\\s+=\\s+pg_namespace\\.oid\\s+AND\\s+attnum\\s+>=\\s+1\\s+AND\\s+relname\\s+=\\s+'${table}'`
                )
            ));
        });
    });


    describe('query_table', () => {
        it('should execute the correct query with parameters', async () => {
            // Mock the client.query method to resolve with an empty rows array
            client.query.mockResolvedValue({ rows: [] });

            // Define the table and options for the test
            const table = 'table_name';
            const options = { columns: 'name', filter: `"state" = 'GOA'`, group: 'name', sort: 'name', limit: 10 };

            // Call the function to execute
            await postgis.query_table(table, options);

            // Define the expected regular expression for the query
            const expectedQuery = new RegExp(
                `^SELECT\\s+${options.columns}\\s+FROM\\s+${table}\\s*` +
                `${options.filter ? `WHERE\\s+${options.filter}\\s*` : ''}` +
                `${options.group ? `GROUP\\s+BY\\s+${options.group}\\s*` : ''}` +
                `${options.sort ? `ORDER\\s+BY\\s+${options.sort}\\s*` : ''}` +
                `${options.limit ? `LIMIT\\s+${options.limit}\\s*` : ''}$`
            );

            // Expect the client.query method to be called with the correct SQL query
            expect(client.query).toHaveBeenCalledWith(expect.stringMatching(expectedQuery));
        });
    });



    describe('bbox', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table = 'table_name';
            await postgis.bbox(table, { filter: "column_name='name'" });

            // Define the expected SQL query string
            const expectedQuery = `
                SELECT
                  ST_Extent(ST_Transform(geom, 4326)) as bbox
                FROM
                  ${table}
                  WHERE column_name='name'
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            expect(receivedQuery).toMatch(expectedQuery);
        });
    });

    describe('centroid', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table = 'table_name';

            // Call the function with default parameters
            await postgis.centroid(table, { filter: "column_name='name'" });

            // Define the expected SQL query
            const expectedQuery = `
                SELECT
                  ST_X(
                    ST_Transform(
                      ST_Centroid(
                        geom
                      ), 4326)
                  ) as x,
                  ST_Y(
                    ST_Transform(
                      ST_Centroid(
                        geom
                      ), 4326)
                  ) as y
                FROM
                  ${table}
                WHERE column_name='name'
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });


    describe('intersect_feature', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table_from = 'table_name';
            const table_to = 'other_table';

            // Call the function with default parameters
            await postgis.intersect_feature(table_from, table_to, { filter: "some_column='value'", sort: 'some_column ASC', limit: 10 });

            // Define the expected SQL query
            const expectedQuery = `
                SELECT
                  *
                FROM
                  ${table_from},
                  ${table_to}
                WHERE
                  ST_DWithin(
                    ${table_from}.geom,
                    ${table_to}.geom,
                    0
                  )
                AND some_column='value'
                ORDER BY some_column ASC
                LIMIT 10
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });



    describe('intersect_point', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table = 'table_name';
            const point = '73.70534,14.94202,4326'; // Ensure this is in the correct format

            // Call the function with default parameters
            await postgis.intersect_point(table, point, { filter: "some_column='value'", sort: 'some_column ASC', limit: 10 });

            // Define the expected SQL query with lowercase PostGIS functions
            const expectedQuery = `
                SELECT
                  *
                FROM
                  ${table}
                WHERE
                  ST_DWithin(
                    geom,
                    ST_Transform(
                      st_setsrid(
                        st_makepoint(73.70534, 14.94202),
                        4326
                      ),
                      (SELECT ST_SRID(geom) FROM ${table} LIMIT 1)
                    ),
                    0
                  )
                AND some_column='value'
                ORDER BY some_column ASC
                LIMIT 10
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });



    describe('geojson', () => {
        it('should return geojson object', async () => {
            client.query.mockResolvedValue({ rows: [{ geojson: {} }] });
            const table = 'table_name';
            const result = await postgis.geojson(table, {});
            expect(result).toEqual({ type: 'FeatureCollection', features: [{}] });
        });
    });

    describe('geobuf', () => {
        it('should return geobuf data', async () => {
            client.query.mockResolvedValue({ rows: [{ st_asgeobuf: Buffer.from('') }] });
            const table = 'table_name';
            const result = await postgis.geobuf(table, {});
            expect(result).toBeInstanceOf(Buffer);
        });
    });

    describe('mvt', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table = 'table_name';
            const x = 0, y = 0, z = 0;
            const columns = '*'; // Default or adjust as needed
            const id_column = 'id'; // Default or adjust as needed
            const geom_column = 'geom'; // Default or adjust as needed
            const filter = ''; // Default or adjust as needed

            await postgis.mvt(table, x, y, z, { columns, id_column });

            // Define the expected SQL query with normalized whitespace
            const expectedQuery = `
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
                }) AS mvt
                from mvtgeom;
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });


    describe('nearest', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const table = 'table_name';
            const point = '73.70534,14.94202,4326';
            const columns = '*'; // Default or adjust as needed
            const geom_column = 'geom'; // Default or adjust as needed
            const filter = ''; // Adjust as needed
            const limit = 10; // Default or adjust as needed

            await postgis.nearest(table, point, { columns, geom_column, filter, limit });
            const match = point.match(/^((-?\d+\.?\d+)(,-?\d+\.?\d+)(,[0-9]{4}))/)[0].split(',')
            const [x, y, srid] = match; // Extract matched groups

            // Define the expected SQL query with normalized whitespace
            const expectedQuery = `
                SELECT
                  ${columns},
                  ST_Distance(
                    ST_Transform(
                      st_setsrid(
                        st_makepoint(${x}, ${y}),
                        ${srid}
                      ),
                      (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
                    ),
                    ${geom_column}
                  ) as distance
                FROM
                  ${table}
                ${filter ? `WHERE ${filter}` : ''}
                ORDER BY
                  ${geom_column} <-> ST_Transform(
                    st_setsrid(
                      st_makepoint(${x}, ${y}),
                      ${srid}
                    ),
                    (SELECT ST_SRID(${geom_column}) FROM ${table} LIMIT 1)
                  )
                LIMIT ${limit}
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });


    describe('transform_point', () => {
        it('should execute the correct query with default parameters', async () => {
            client.query.mockResolvedValue({ rows: [] });
            const point = '73.70534,14.94202,4326';
            const srid = '3857'; // Set the SRID you want to transform to
            await postgis.transform_point(point, { srid: srid });
            const match = point.match(/^((-?\d+\.?\d+)(,-?\d+\.?\d+)(,[0-9]{4}))/)[0].split(',')
            const [x, y, srid1] = match;
            // Define the expected SQL query with normalized whitespace
            const expectedQuery = `
                SELECT
                  ST_X(
                    ST_Transform(
                      st_setsrid(
                        st_makepoint(${x}, ${y}),
                          ${srid1}
                      ),
                    ${srid}
                    )
                  ) as x,
                  ST_Y(
                    ST_Transform(
                      st_setsrid(
                        st_makepoint(${x}, ${y}),
                            ${srid1}
                      ),
                    ${srid}
                    )
                  ) as y
            `.replace(/\s+/g, ' ').trim(); // Normalize to single line

            // Normalize the received query to single line for comparison
            const receivedQuery = client.query.mock.calls[0][0].replace(/\s+/g, ' ').trim();

            // Expect the received query to match the expected pattern
            expect(receivedQuery).toMatch(expectedQuery);
        });
    });
    describe('_executeQuery', () => {
        it('should throw an error when query execution fails', async () => {
            const errorMessage = 'Query failed';
            client.query.mockRejectedValueOnce(new Error(errorMessage)); // Use mockRejectedValueOnce to ensure it's used once

            await expect(postgis._executeQuery('SELECT * FROM some_table'))
                .rejects
                .toThrow(`Query execution failed: ${errorMessage}`);
        });
    });


});
