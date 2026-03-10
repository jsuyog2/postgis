# API Reference

## Constructor

```typescript
const postgis = new Postgis(client);
```

| Parameter | Type | Description |
|---|---|---|
| `client` | `PostgisClient` | A connected `pg.Client` or any object with a `query(sql)` method |

**Throws** `TypeError` if `client` is not provided or does not have a `query` function.

---

## Schema Introspection

### `list_tables(options?)`

Lists all user-accessible tables with PostGIS geometry metadata.

```typescript
const tables = await postgis.list_tables({ filter: "table_type = 'BASE TABLE'" });
```

| Option | Type | Default | Description |
|---|---|---|---|
| `filter` | `string` | — | SQL WHERE clause fragment |

---

### `list_columns(table)`

Lists all columns of a given table.

```typescript
const cols = await postgis.list_columns('parcels');
// [{ field_name: 'id', field_type: 'int4' }, { field_name: 'geom', field_type: 'geometry' }]
```

---

## General Querying

### `query_table(table, options?)`

Flexible SELECT with optional filter, group, sort, limit.

```typescript
const rows = await postgis.query_table('parcels', {
  columns: 'id, name, area',
  filter: "status = 'active'",
  sort: 'area DESC',
  limit: 50,
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `columns` | `string` | `'*'` | Columns to SELECT |
| `filter` | `string` | — | WHERE clause |
| `group` | `string` | — | GROUP BY clause |
| `sort` | `string` | — | ORDER BY clause |
| `limit` | `number\|null` | `100` | LIMIT (pass `null` to remove) |

---

## Spatial Operations

### `bbox(table, options?)`

Returns the spatial extent of all geometries.

```typescript
const [{ bbox }] = await postgis.bbox('parcels', { srid: 4326 });
```

| Option | Type | Default |
|---|---|---|
| `geom_column` | `string` | `'geom'` |
| `srid` | `number` | `4326` |
| `filter` | `string` | — |

---

### `centroid(table, options?)`

Returns the centroid `(x, y)` of each row's geometry.

```typescript
const centroids = await postgis.centroid('parcels', { force_on_surface: true });
```

| Option | Type | Default |
|---|---|---|
| `force_on_surface` | `boolean` | `false` |
| `geom_column` | `string` | `'geom'` |
| `srid` | `string\|number` | `'4326'` |
| `filter` | `string` | — |

---

### `intersect_feature(table_from, table_to, options?)`

Finds cross-table intersections using `ST_DWithin`.

```typescript
const results = await postgis.intersect_feature('roads', 'parcels', {
  distance: '50',
  sort: 'name ASC',
});
```

| Option | Type | Default |
|---|---|---|
| `columns` | `string` | `'*'` |
| `distance` | `string\|number` | `'0'` |
| `geom_column_from` | `string` | `'geom'` |
| `geom_column_to` | `string` | `'geom'` |
| `filter` | `string` | — |
| `sort` | `string` | — |
| `limit` | `number\|null` | — |

---

### `intersect_point(table, point, options?)`

Finds features within `distance` of a point.

```typescript
const nearby = await postgis.intersect_point('restaurants', '73.5,14.9,4326', {
  distance: '500',
  limit: 20,
});
```

| Parameter | Type | Description |
|---|---|---|
| `point` | `string` | `"x,y,srid"` format |

---

### `nearest(table, point, options?)`

Returns features ordered by distance to a point.

```typescript
const closest = await postgis.nearest('hospitals', '73.5,14.9,4326', { limit: 5 });
// Each row includes a `distance` column
```

---

## Geometry Export

### `geojson(table, options?)`

Exports features as a GeoJSON `FeatureCollection`.

```typescript
const fc = await postgis.geojson('parcels', {
  bounds: '72.8,18.9,73.2,19.2',
  precision: 6,
  columns: 'name, area',
});
// { type: 'FeatureCollection', features: [...] }
```

| Option | Type | Default | Description |
|---|---|---|---|
| `bounds` | `string` | — | `"xmin,ymin,xmax,ymax"` or `"z,x,y"` |
| `id_column` | `string` | — | GeoJSON feature ID column |
| `precision` | `number` | `9` | Coordinate decimal places |
| `geom_column` | `string` | `'geom'` | |
| `columns` | `string` | — | Extra properties columns |
| `filter` | `string` | — | WHERE clause |

---

### `geobuf(table, options?)`

Exports features as a Geobuf `Buffer` (compact binary GeoJSON).

```typescript
const buf = await postgis.geobuf('parcels');
res.setHeader('Content-Type', 'application/x-protobuf');
res.send(buf);
```

---

### `mvt(table, x, y, z, options?)`

Generates a Mapbox Vector Tile for the given tile coordinate.

```typescript
const [{ mvt: tile }] = await postgis.mvt('parcels', 0, 0, 0);
res.setHeader('Content-Type', 'application/vnd.mapbox-vector-tile');
res.send(tile);
```

| Parameter | Type | Description |
|---|---|---|
| `x` | `number` | Tile X coordinate |
| `y` | `number` | Tile Y coordinate |
| `z` | `number` | Zoom level |

---

### `transform_point(point, options?)`

Transforms a point between coordinate systems.

```typescript
const [{ x, y }] = await postgis.transform_point('73.5,14.9,4326', { srid: 3857 });
```

| Option | Type | Default |
|---|---|---|
| `srid` | `number` | `4326` |
