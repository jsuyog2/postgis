/**
 * MVT Tile Server Example
 *
 * Serves Mapbox Vector Tiles from a PostGIS table via Express.
 *
 * Run:
 *   npm install express
 *   DATABASE_URL=postgres://user:pass@localhost/mydb TABLE=my_layer node examples/mvt-server.js
 *
 * Then add to your Mapbox GL JS map:
 *   source: { type: 'vector', tiles: ['http://localhost:3000/tiles/{z}/{x}/{y}.mvt'] }
 */

const express = require('express');
const { Pool } = require('pg');
const Postgis = require('postgis');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TABLE = process.env.TABLE || 'my_layer';

// Serve MVT tiles at /tiles/:z/:x/:y.mvt
app.get('/tiles/:z/:x/:y.mvt', async (req, res) => {
  const { z, x, y } = req.params;
  const client = await pool.connect();

  try {
    const postgis = new Postgis(client);
    const [row] = await postgis.mvt(TABLE, Number(x), Number(y), Number(z));

    if (!row?.mvt) {
      return res.status(204).end(); // Empty tile
    }

    res
      .status(200)
      .setHeader('Content-Type', 'application/vnd.mapbox-vector-tile')
      .setHeader('Cache-Control', 'public, max-age=86400')
      .setHeader('Access-Control-Allow-Origin', '*')
      .end(row.mvt);
  } catch (err) {
    console.error('Tile error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// Serve a simple map viewer at /
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>MVT Tile Server</title>
      <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
      <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet" />
      <style>body, html, #map { margin:0; padding:0; height:100%; width:100%; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
        const map = new mapboxgl.Map({
          container: 'map', style: 'mapbox://styles/mapbox/dark-v11', center: [0, 0], zoom: 2
        });
        map.on('load', () => {
          map.addSource('postgis', { type: 'vector', tiles: ['http://localhost:3000/tiles/{z}/{x}/{y}.mvt'] });
          map.addLayer({ id: 'postgis-fill', type: 'fill', source: 'postgis', 'source-layer': '${TABLE}',
            paint: { 'fill-color': '#00cfff', 'fill-opacity': 0.5 }
          });
        });
      </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MVT tile server running at http://localhost:${PORT}`));
