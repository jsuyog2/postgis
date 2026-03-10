# postgis

[![npm version](https://img.shields.io/npm/v/postgis.svg?style=flat-square)](https://www.npmjs.com/package/postgis)
[![npm downloads](https://img.shields.io/npm/dm/postgis.svg?style=flat-square)](https://www.npmjs.com/package/postgis)
[![Build Status](https://github.com/jsuyog2/postgis/actions/workflows/ci.yml/badge.svg)](https://github.com/jsuyog2/postgis/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/jsuyog2/postgis/branch/main/graph/badge.svg)](https://codecov.io/gh/jsuyog2/postgis)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

> A **lightweight, type-safe** Node.js library for interacting with PostGIS-enabled PostgreSQL databases. Export GeoJSON, serve MVT vector tiles, run spatial queries, and more — with zero runtime dependencies.

📖 **[Full Documentation →](https://jsuyog2.github.io/postgis)**

---

## Features

| Feature | Details |
|---|---|
| 🔷 **TypeScript First** | Full type definitions, IntelliSense, and compile-time safety |
| 📦 **Dual ESM + CJS** | Tree-shakable ESM + CommonJS fallback — works everywhere |
| ⚡ **Zero Runtime Deps** | Bring your own `pg` client, nothing else required |
| 🗺️ **Spatial Queries** | bbox, centroid, intersections, nearest, coordinate transforms |
| 📄 **GeoJSON Export** | Full `FeatureCollection` with bounds, ID, and precision control |
| 🗜️ **Geobuf Export** | Binary-compact protobuf encoding via `ST_AsGeobuf` |
| 🧱 **MVT Tiles** | Server-side Mapbox Vector Tiles via `ST_AsMVT` |
| 🧪 **Fully Tested** | 50+ unit tests with mocked `pg.Client` — no database needed |

---

## Installation

```bash
npm install postgis pg
```

```bash
yarn add postgis pg
```

```bash
pnpm add postgis pg
```

**Requirements:** Node.js ≥ 18, PostgreSQL ≥ 12, PostGIS ≥ 3.0

---

## Quick Start

```typescript
import { Client } from 'pg';
import Postgis from 'postgis';

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const postgis = new Postgis(client);

// List spatial tables
const tables = await postgis.list_tables();

// Export as GeoJSON
const fc = await postgis.geojson('parcels', { precision: 6, columns: 'name, area' });
console.log(fc.type); // "FeatureCollection"

// Find 5 nearest hospitals
const nearby = await postgis.nearest('hospitals', '73.5,14.9,4326', { limit: 5 });

await client.end();
```

**CommonJS:**

```javascript
const Postgis = require('postgis');
const postgis = new Postgis(client);
```

---

## API Documentation

### Constructor

```typescript
new Postgis(client: PostgisClient)
```

Accepts any `pg.Client`, `pg.Pool` client, or any object with a `query(sql)` method.

---

### `list_tables(options?)`

Lists all user-accessible tables with PostGIS geometry metadata.

```typescript
const tables = await postgis.list_tables({ filter: "table_type = 'BASE TABLE'" });
```

---

### `list_columns(table)`

Lists all columns of a table using PostgreSQL system catalogs.

```typescript
const cols = await postgis.list_columns('parcels');
// [{ field_name: 'geom', field_type: 'geometry' }, ...]
```

---

### `query_table(table, options?)`

Flexible SELECT with filter, group, sort, and limit.

```typescript
const rows = await postgis.query_table('parcels', {
  columns: 'id, name',
  filter: "status = 'active'",
  sort: 'name ASC',
  limit: 50,
});
```

---

### `bbox(table, options?)`

Returns the spatial bounding box (`ST_Extent`) of all geometries.

```typescript
const [{ bbox }] = await postgis.bbox('parcels', { srid: 4326 });
```

---

### `centroid(table, options?)`

Returns the centroid `(x, y)` of each geometry.

```typescript
const pts = await postgis.centroid('parcels', { force_on_surface: true });
```

---

### `intersect_feature(table_from, table_to, options?)`

Cross-table spatial intersection using `ST_DWithin`.

```typescript
const hits = await postgis.intersect_feature('roads', 'parcels', { distance: '50' });
```

---

### `intersect_point(table, point, options?)`

Features within `distance` of a point.

```typescript
// point format: "longitude,latitude,SRID"
const nearby = await postgis.intersect_point('shops', '73.5,14.9,4326', {
  distance: '500',
  limit: 20,
});
```

---

### `geojson(table, options?)`

Exports a GeoJSON `FeatureCollection`.

```typescript
const fc = await postgis.geojson('parcels', {
  bounds: '72.8,18.9,73.2,19.2',  // xmin,ymin,xmax,ymax
  precision: 6,
  columns: 'name, area',
});
// { type: 'FeatureCollection', features: [...] }
```

---

### `geobuf(table, options?)`

Exports features as a Geobuf binary `Buffer`.

```typescript
const buf = await postgis.geobuf('parcels');
res.setHeader('Content-Type', 'application/x-protobuf');
res.send(buf);
```

---

### `mvt(table, x, y, z, options?)`

Generates a Mapbox Vector Tile for tile coordinate `z/x/y`.

```typescript
const [{ mvt }] = await postgis.mvt('parcels', 0, 0, 0);
res.setHeader('Content-Type', 'application/vnd.mapbox-vector-tile');
res.send(mvt);
```

---

### `nearest(table, point, options?)`

KNN nearest-neighbor search ordered by `<->` distance operator.

```typescript
const closest = await postgis.nearest('hospitals', '73.5,14.9,4326', { limit: 5 });
// Each row includes a `distance` column
```

---

### `transform_point(point, options?)`

Transforms a point between coordinate systems.

```typescript
const [{ x, y }] = await postgis.transform_point('73.5,14.9,4326', { srid: 3857 });
```

---

## Configuration

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGIS_DEBUG` | Set to `'true'` to log all SQL queries to stderr |

### Point Format

Methods accepting a `point` argument use `"x,y,srid"` format:

```
73.70534,14.94202,4326  →  longitude,latitude,EPSG:4326
```

---

## Advanced Usage

### MVT Tile Server (Express)

```typescript
app.get('/tiles/:z/:x/:y.mvt', async (req, res) => {
  const client = await pool.connect();
  try {
    const postgis = new Postgis(client);
    const [row] = await postgis.mvt('parcels', +req.params.x, +req.params.y, +req.params.z);
    if (!row?.mvt) return res.status(204).end();
    res
      .setHeader('Content-Type', 'application/vnd.mapbox-vector-tile')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(row.mvt);
  } finally {
    client.release();
  }
});
```

### Using with pg.Pool

```typescript
const client = await pool.connect();
const postgis = new Postgis(client);
try {
  return await postgis.geojson('my_layer');
} finally {
  client.release();
}
```

---

## Performance Notes

- **Spatial indexes** are essential for large tables. Add a GiST index:
  ```sql
  CREATE INDEX ON my_layer USING GIST(geom);
  ```
- **MVT queries** internally call `ST_TileEnvelope` — PostGIS 3.0+ required.
- **Bounds filtering** avoids full-table scans when a `bounds` argument is provided.
- **`nearest()`** uses the index-accelerated `<->` KNN operator — much faster than `ORDER BY ST_Distance`.

---

## Security

> [!WARNING]
> SQL values (table names, column names, filters) are interpolated directly into SQL strings — **not parameterized**. Never pass raw user input as `table`, `filter`, or `columns` arguments.

See [SECURITY.md](SECURITY.md) for the full security policy and reporting process.

---

## Examples

See the [`examples/`](examples/) directory:

| File | Description |
|---|---|
| [`basic-usage.js`](examples/basic-usage.js) | List tables, columns, query, bbox |
| [`geojson-export.js`](examples/geojson-export.js) | Export GeoJSON and Geobuf to files |
| [`mvt-server.js`](examples/mvt-server.js) | Express MVT tile server with Mapbox GL JS viewer |

---

## FAQ

**Does it work with pg.Pool?**
Yes — acquire a client from the pool, pass it to `new Postgis(client)`, and release it after.

**CommonJS or ESM?**
Both. Import with `import Postgis from 'postgis'` (ESM) or `const Postgis = require('postgis')` (CJS).

**Any runtime dependencies?**
None. `pg` is a peer dependency — you install and manage it yourself.

Full FAQ: [jsuyog2.github.io/postgis/guide/faq](https://jsuyog2.github.io/postgis/guide/faq)

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up the dev environment
- Running tests (`npm test`)
- Submitting pull requests

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE) © [Suyog Dinesh Jadhav](https://github.com/jsuyog2)