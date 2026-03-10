# Troubleshooting

## `A valid pg.Client instance is required`

You passed `null`, `undefined`, or an object without a `query()` method to the `Postgis` constructor.

```typescript
// ❌ Wrong
const postgis = new Postgis(null);

// ✅ Correct
const client = new Client({ ... });
await client.connect();
const postgis = new Postgis(client);
```

## `Invalid point format "..."`

The `point` argument must be in `"x,y,srid"` format with a 4-5 digit SRID.

```typescript
// ❌ Wrong
await postgis.nearest('cities', '73.5 14.9'); // missing SRID
await postgis.nearest('cities', 'lon,lat,4326'); // non-numeric

// ✅ Correct
await postgis.nearest('cities', '73.5,14.9,4326');
```

## `Query execution failed: ...`

The query failed at the database level. Check:
1. The table and column names are correct
2. PostGIS is installed: `SELECT PostGIS_Version();`
3. The `geom` column exists (or set `geom_column` to the correct name)
4. The client is connected

Enable debug logging to see the full SQL:
```bash
POSTGIS_DEBUG=true node your-script.js
```

## MVT returns empty tiles

- Check that your data falls within the requested tile bounds
- Ensure the geometry column has a spatial index: `CREATE INDEX ON my_table USING GIST(geom);`
- Verify that the geometries are in a valid CRS

## `ST_TileEnvelope does not exist`

Your PostGIS version is older than 3.0. Upgrade to PostGIS 3.0+ or avoid the `bounds` (tile) option.

## GeoJSON precision looks wrong

Use the `precision` option to control decimal places (default `9`):

```typescript
await postgis.geojson('parcels', { precision: 5 }); // 5 decimal places ≈ 1m accuracy
```
