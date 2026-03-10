/**
 * Basic Usage Example
 *
 * Run:
 *   DATABASE_URL=postgres://user:pass@localhost/mydb node examples/basic-usage.js
 */

const { Client } = require('pg');
const Postgis = require('postgis');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const postgis = new Postgis(client);

  try {
    // 1. List all spatial tables
    const tables = await postgis.list_tables();
    console.log('Tables:', tables.map((t) => t.table_name));

    if (tables.length === 0) {
      console.log('No tables found. Make sure PostGIS is installed.');
      return;
    }

    const firstTable = tables[0].table_name;

    // 2. List columns of the first table
    const columns = await postgis.list_columns(firstTable);
    console.log(`Columns of "${firstTable}":`, columns);

    // 3. Query first 5 rows
    const rows = await postgis.query_table(firstTable, { limit: 5 });
    console.log(`First 5 rows of "${firstTable}":`, rows);

    // 4. Bounding box
    const [{ bbox }] = await postgis.bbox(firstTable);
    console.log(`Bounding box:`, bbox);

  } finally {
    await client.end();
  }
}

main().catch(console.error);
