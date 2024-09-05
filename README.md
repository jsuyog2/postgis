# PostGIS for Node.js

This Node.js class provides methods for interacting with a PostgreSQL/PostGIS database. It abstracts common spatial operations and queries, allowing you to easily perform spatial operations on your PostGIS-enabled PostgreSQL database.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [list_tables](#list_tables)
  - [list_columns](#list_columns)
  - [query_table](#query_table)
  - [bbox](#bbox)
  - [centroid](#centroid)
  - [intersect_feature](#intersect_feature)
  - [intersect_point](#intersect_point)
  - [geojson](#geojson)
  - [geobuf](#geobuf)
  - [mvt](#mvt)
  - [nearest](#nearest)
  - [transform_point](#transform_point)
- [Error Handling](#error-handling)
- [License](#license)

## Installation

1. Install the required packages using npm:

   ```bash
   npm install pg
   ```

2. Install the `postgis` package:

   ```bash
   npm install postgis
   ```

## Usage

To use the `Postgis` class, first initialize it with a PostgreSQL client instance from the `pg` package:

```javascript
const { Client } = require('pg');
const Postgis = require('postgis');

const client = new Client({
    connectionString: 'your_connection_string'
});

client.connect();

const postgis = new Postgis(client);

// Example usage
async function run() {
    try {
        const tables = await postgis.list_tables({ filter: 'table_type = \'BASE TABLE\'' });
        console.log('Tables:', tables);

        const columns = await postgis.list_columns('your_table');
        console.log('Columns:', columns);

        const features = await postgis.query_table('your_table', {
            columns: 'name, geom',
            filter: `"column_name" = 'value'`,
            sort: 'name ASC',
            limit: 50
        });
        console.log('Features:', features);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
```

## API Reference

### `list_tables(options)`

Lists all tables in the database. Optionally, you can filter by schema or other parameters.

**Parameters:**
- `options` (optional): JSON object with the following properties:
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
A list of tables with their metadata.

**Example:**

```javascript
const tables = await postgis.list_tables({ filter: 'table_type = \'BASE TABLE\'' });
```

### `list_columns(table)`

Lists all columns in a given table.

**Parameters:**
- `table`: The name of the table.

**Returns:**
A list of columns in the table.

**Example:**

```javascript
const columns = await postgis.list_columns('your_table');
```

### `query_table(table, options)`

Queries a table with optional parameters for columns, filtering, grouping, sorting, and limiting the results.

**Parameters:**
- `table`: The name of the table.
- `options` (optional): JSON object with the following properties:
  - `columns` (optional): Columns to retrieve, defaults to `'*'`.
  - `filter` (optional): A SQL WHERE clause filter.
  - `group` (optional): Columns to group by.
  - `sort` (optional): Sorting order.
  - `limit` (optional): Limit the number of results, defaults to `100`.

**Returns:**
A list of rows from the query.

**Example:**

```javascript
const features = await postgis.query_table('your_table', {
    columns: 'name, geom',
    filter: `"column_name" = 'value'`,
    sort: 'name ASC',
    limit: 50
});
```

### `bbox(table, options)`

Calculates the bounding box (extent) for a given table based on a specified geometry column.

**Parameters:**
- `table`: The name of the table.
- `options` (optional): JSON object with the following properties:
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `srid` (optional): The SRID for the bounding box, defaults to `4326`.
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
An object representing the bounding box with coordinates.

**Example:**

```javascript
const bbox = await postgis.bbox('your_table', {
    geom_column: 'geom',
    srid: 4326,
    filter: `"some_column" = 'some_value'`
});
```

### `centroid(table, options)`

Calculates the centroid of geometries in a given table.

**Parameters:**
- `table`: The name of the table.
- `options` (optional): JSON object with the following properties:
  - `force_on_surface` (optional): Whether to force the centroid to be on the surface, defaults to `false`.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `srid` (optional): The SRID, defaults to `'4326'`.
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
A list of centroids.

**Example:**

```javascript
const centroids = await postgis.centroid('your_table', {
    force_on_surface: true,
    geom_column: 'geom',
    srid: 4326,
    filter: `"column_name" = 'value'`
});
```

### `intersect_feature(table_from, table_to, options)`

Finds intersections between features in two tables.

**Parameters:**
- `table_from`: The first table.
- `table_to`: The second table.
- `options` (optional): JSON object with the following properties:
  - `columns` (optional): Columns to retrieve, defaults to `'*'`.
  - `distance` (optional): Distance for the intersection, defaults to `'0'`.
  - `geom_column_from` (optional): The geometry column for the first table, defaults to `'geom'`.
  - `geom_column_to` (optional): The geometry column for the second table, defaults to `'geom'`.
  - `filter` (optional): A SQL WHERE clause filter.
  - `sort` (optional): Sorting order.
  - `limit` (optional): Limit the number of results.

**Returns:**
A list of intersecting features.

**Example:**

```javascript
const intersections = await postgis.intersect_feature('table1', 'table2', {
    columns: 'name, geom',
    distance: '10',
    filter: `"some_column" = 'some_value'`,
    sort: 'name ASC',
    limit: 50
});
```

### `intersect_point(table, point, options)`

Finds features in a table that intersect with a given point.

**Parameters:**
- `table`: The name of the table.
- `point`: The point to intersect with.
- `options` (optional): JSON object with the following properties:
  - `columns` (optional): Columns to retrieve, defaults to `'*'`.
  - `distance` (optional): Distance for the intersection, defaults to `'0'`.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `filter` (optional): A SQL WHERE clause filter.
  - `sort` (optional): Sorting order.
  - `limit` (optional): Limit the number of results.

**Returns:**
A list of features intersecting with the point.

**Example:**

```javascript
const features = await postgis.intersect_point('your_table', '1,1,4326', {
    columns: 'name, geom',
    distance: '5',
    filter: `"some_column" = 'some_value'`,
    sort: 'name ASC',
    limit: 10
});
```

### `geojson(table, options)`

Converts features from a table to GeoJSON format.

**Parameters:**
- `table`: The name of the table.
- `options` (optional): JSON object with the following properties:
  - `bounds` (optional): Bounding box for the results.
  - `id_column` (optional): Column to use as the feature ID.
  - `precision` (optional): Precision for coordinates, defaults to `9`.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `columns` (optional): Columns to retrieve.
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
A GeoJSON `FeatureCollection`.

**Example:**

```javascript
const geojson = await postgis.geojson('your_table', {
    bounds: 'xmin ymin, xmax ymax',
    id_column: 'id',
    precision: 6,
    geom_column: 'geom',
    columns: 'name, geom',
    filter: `"some_column" = 'some_value'`
});
```

### `geobuf(table, options)`

Converts features from a table to Geobuf format.

**Parameters:**
- `table`: The name of the table.
- `options` (optional): JSON object with the following properties:
  - `bounds` (optional): Bounding box for the results.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `columns` (optional): Columns to retrieve.
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
A Geobuf binary encoded string.

**Example:**

```javascript
const geobuf = await postgis.geobuf('your_table', {
    bounds: 'xmin ymin, xmax ymax',
    geom_column: 'geom',
    columns: 'name, geom',
    filter: `"some_column" = 'some_value'`
});
```

### `mvt(table, x, y, z, options)`

Generates a Mapbox Vector Tile (MVT) for a given tile coordinate.

**Parameters:**
- `table`: The name of the table.
- `x`: The x-coordinate of the tile.
- `y`: The y-coordinate of the tile.
- `z`: The zoom level.
- `options` (optional): JSON object with the following properties:
  - `columns` (optional): Columns to retrieve.
  - `id_column` (optional): Column to use as the feature ID.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `filter` (optional): A SQL WHERE clause filter.

**Returns:**
A Mapbox Vector Tile.

**Example:**

```javascript
const mvt = await postgis.mvt('your_table', 1, 2, 3, {
    columns: 'name, geom',
    id_column: 'id',
    filter: `"some_column" = 'some_value'`
});
```

### `nearest(table, point, options)`

Finds the nearest features to a given point.

**Parameters:**
- `table`: The name of the table.
- `point`: The point to find the nearest features to.
- `options` (optional): JSON object with the following properties:
  - `columns` (optional): Columns to retrieve, defaults to `'*'`.
  - `geom_column` (optional): The geometry column, defaults to `'geom'`.
  - `filter` (optional): A SQL WHERE clause filter.
  - `limit` (optional): Limit the number of results, defaults to `10`.

**Returns:**
A list of the nearest features.

**Example:**

```javascript
const nearest = await postgis.nearest('your_table', '1,1,4326', {
    columns: 'name, geom',
    filter: `"some_column" = 'some_value'`,
    limit: 5
});
```

### `transform_point(point, options)`

Transforms a point from one SRID to another.

**Parameters:**
- `point`: The point to transform.
- `options` (optional): JSON object with the following properties:
  - `srid` (optional): The target SRID, defaults to `4326`.

**Returns:**
The transformed point.

**Example:**

```javascript
const transformed = await postgis.transform_point('1,1,4326', { srid: 3857 });
```

## Error Handling

All methods throw an error if the query execution fails. Ensure proper error handling in your application to manage these errors.

```javascript
try {
    const result = await postgis.someMethod();
    console.log(result);
} catch (err) {
    console.error('Error:', err);
}
```

## Version Compatibility

- **PostgreSQL:** Compatible with PostgreSQL 12 and higher.
- **PostGIS:** Compatible with PostGIS 3.0 and higher.
- **Node.js:** Compatible with Node.js 14.x and higher.
- **pg (node-postgres):** Version 8.x and higher.

## Testing

If you create a pull request, tests better pass :)

  ```bash
  npm install
  npm test
  ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.