# Getting Started

## Prerequisites

- **Node.js** 18 or later
- A running **PostgreSQL** database with the **PostGIS** extension enabled
- The [`pg`](https://www.npmjs.com/package/pg) package (`npm install pg`)

## Installation

::: code-group

```bash [npm]
npm install postgis pg
```

```bash [yarn]
yarn add postgis pg
```

```bash [pnpm]
pnpm add postgis pg
```

:::

## Quick Start

```typescript
import { Client } from 'pg';
import Postgis from 'postgis';

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const postgis = new Postgis(client);

// List all spatial tables
const tables = await postgis.list_tables();
console.log(tables);

// Export features as GeoJSON
const fc = await postgis.geojson('my_layer', { precision: 6 });
console.log(fc.type); // "FeatureCollection"

await client.end();
```

## CommonJS

```javascript
const { Client } = require('pg');
const Postgis = require('postgis');

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();

const postgis = new Postgis(client);
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGIS_DEBUG` | Set to `'true'` to enable SQL query logging |

## Using with a Pool

```typescript
import { Pool } from 'pg';
import Postgis from 'postgis';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Acquire a client from the pool
const client = await pool.connect();
const postgis = new Postgis(client);

try {
  const rows = await postgis.list_tables();
  console.log(rows);
} finally {
  client.release(); // Always release back to pool
}
```

## Version Compatibility

| Software | Minimum Version |
|---|---|
| Node.js | 18.x |
| PostgreSQL | 12+ |
| PostGIS | 3.0+ |
| pg (node-postgres) | 8.x |
