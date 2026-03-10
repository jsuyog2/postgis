# Troubleshooting

This guide covers common issues and their solutions when using `postgis` in production or development environments.

<GsapReveal animation="fade-up" :delay="0.1">

## Database Privileges

**Error:** `permission denied for schema public`

Ensure your PostgreSQL user and `pg.Client` connection have sufficient privileges to execute queries and create extensions if needed.
To fix, connect as a superuser or verify privileges:
```sql
GRANT ALL ON SCHEMA public TO my_user;
```

</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.1">

## Missing PostGIS Extension

**Error:** `function st_asmvt() does not exist` or `PostgreSQL 42883: function st_asmvt() does not exist`

This occurs when either PostGIS is not installed correctly or you are targeting the wrong `search_path`.
Make sure:
1. Running `CREATE EXTENSION postgis;` succeeded.
2. You are using PostGIS version **`>= 3.0`** (required for `ST_AsMVT` and `mvt()`).

</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.1">

## Invalid SRID Formats

**Error:** `parsePoint error: Invalid point format "..."`

When using methods like `intersect_point()`, ensure the provided point follows the `"x,y,srid"` format strictly.

**Invalid:**
```typescript
// ❌ missing SRID
await postgis.nearest('cities', '73.5 14.9');

// ❌ non-numeric
await postgis.nearest('cities', 'lon,lat,4326');
```

**Valid:**
```typescript
await postgis.nearest('cities', '73.5,14.9,4326');
```

</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.1">

## Timeout Errors during Large Queries

If a `query_table()` or `geojson()` export hangs, it generally means there's no spatial index on your geometry column.

**Solution:** Always create a GiST index on large spatial tables:
```sql
CREATE INDEX my_geometry_idx ON my_table USING GIST (geom);
```

</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.1">

## "A valid pg.Client instance is required"

You passed `null`, `undefined`, or an object without a `query()` method to the `Postgis` constructor.

```typescript
// ❌ Wrong
const postgis = new Postgis(null);

// ✅ Correct
const client = new Client({ /* config */ });
await client.connect();
const postgis = new Postgis(client);
```

</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.1">

## MVT Returns Empty Tiles (HTTP 204)

- Check that your data falls exactly within the requested tile bounds.
- Ensure the geometry column has a spatial index setup via `GIST(geom)`.
- Verify that the geometries are stored in a valid CRS (usually `4326` or `3857`).

</GsapReveal>
