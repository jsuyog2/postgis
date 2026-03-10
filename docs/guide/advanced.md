# Advanced Usage

## Streaming MVT Tiles (Express)

```typescript
import express from 'express';
import { Pool } from 'pg';
import Postgis from 'postgis';

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/tiles/:table/:z/:x/:y.mvt', async (req, res) => {
  const { table, z, x, y } = req.params;
  const client = await pool.connect();

  try {
    const postgis = new Postgis(client);
    const [row] = await postgis.mvt(table, Number(x), Number(y), Number(z));

    if (!row?.mvt) {
      return res.status(204).send(); // Empty tile
    }

    res
      .status(200)
      .setHeader('Content-Type', 'application/vnd.mapbox-vector-tile')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(row.mvt);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});
```

## GeoJSON API Endpoint

```typescript
app.get('/geojson/:table', async (req, res) => {
  const client = await pool.connect();
  try {
    const postgis = new Postgis(client);
    const { bounds, filter } = req.query as Record<string, string>;

    const fc = await postgis.geojson(req.params.table, {
      bounds,
      filter,
      precision: 6,
    });

    res.json(fc);
  } finally {
    client.release();
  }
});
```

## Debug Logging

Enable SQL query logging by setting the `POSTGIS_DEBUG` environment variable:

```bash
POSTGIS_DEBUG=true node server.js
```

Each query will log to `stderr`:

```
[postgis:debug] 2026-03-10T05:52:00.000Z SELECT i.table_name, i.table_type ...
```

## Working with Coordinate Systems

All geometry methods accept a `srid` option where applicable:

```typescript
// Get bbox in Web Mercator (EPSG:3857)
const [{ bbox }] = await postgis.bbox('my_layer', { srid: 3857 });

// Transform a point from WGS84 to Web Mercator
const [{ x, y }] = await postgis.transform_point('73.5,14.9,4326', { srid: 3857 });
```

## Point Format

Methods that accept a `point` argument expect it in `"x,y,srid"` format:

```typescript
const point = '73.70534,14.94202,4326'; // longitude,latitude,SRID

await postgis.nearest('cities', point, { limit: 5 });
await postgis.intersect_point('parcels', point, { distance: '1000' });
await postgis.transform_point(point, { srid: 3857 });
```

> [!WARNING]
> Do **not** pass raw user input directly as `table`, `filter`, or `columns`.
> These values are interpolated directly into SQL. Sanitize all user-controlled values.
