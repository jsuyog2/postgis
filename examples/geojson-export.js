/**
 * GeoJSON Export Example
 *
 * Run:
 *   DATABASE_URL=postgres://user:pass@localhost/mydb node examples/geojson-export.js
 */

const { Client } = require('pg');
const Postgis = require('postgis');
const fs = require('fs');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const postgis = new Postgis(client);

  try {
    const TABLE = process.env.TABLE_NAME || 'my_layer';

    // Export all features as GeoJSON FeatureCollection
    const fc = await postgis.geojson(TABLE, {
      precision: 6,       // 6 decimal places ≈ 10cm accuracy
      columns: 'name',    // include extra property columns
    });

    console.log(`Exported ${fc.features.length} features.`);

    // Save to file
    fs.writeFileSync('output.geojson', JSON.stringify(fc, null, 2));
    console.log('Saved to output.geojson');

    // Also export as Geobuf (compact binary)
    const buf = await postgis.geobuf(TABLE);
    fs.writeFileSync('output.pbf', buf);
    console.log(`Saved Geobuf: ${buf.length} bytes`);

  } finally {
    await client.end();
  }
}

main().catch(console.error);
