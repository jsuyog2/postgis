# FAQ

## Does this library work with pg.Pool?

Yes — acquire a client from the pool, pass it to `new Postgis(client)`, and release it when done:

```typescript
const client = await pool.connect();
const postgis = new Postgis(client);
try {
  return await postgis.geojson('my_layer');
} finally {
  client.release();
}
```

## What is the point format?

Point arguments use the format `"x,y,srid"` (e.g. `"73.5,14.9,4326"`):
- `x` = longitude / easting
- `y` = latitude / northing
- `srid` = 4-5 digit EPSG code

## Is this vulnerable to SQL injection?

This library uses **template literals** — it does **not** use parameterized queries. Table names,
column names, and `filter` strings are interpolated directly into SQL. Never pass raw user
input to these arguments. See [SECURITY.md](https://github.com/jsuyog2/postgis/blob/main/SECURITY.md)
for details.

## Can I use this with Sequelize or TypeORM?

No — this library wraps a raw `pg.Client`. If you use an ORM, call `.getQueryInterface()`
or access the underlying connection and pass it to `Postgis`.

## Why is `geobuf()` returning a Buffer instead of an object?

The `ST_AsGeobuf` PostGIS function returns raw binary (protobuf). This Buffer is ready to send
as a response with `Content-Type: application/x-protobuf`.

## Can I use `geojson()` with bbox filtering?

Yes — pass a `bounds` string:
- 4-value: `"xmin,ymin,xmax,ymax"` (WGS84 bounding box)
- 3-value: `"z,x,y"` (tile coordinates)

```typescript
await postgis.geojson('parcels', { bounds: '72.8,18.9,73.2,19.2' });
```

## What PostGIS version is required?

PostGIS **3.0+** is required for `ST_TileEnvelope` (used in MVT and bounds filtering).
For other methods, PostGIS 2.5+ should work.
