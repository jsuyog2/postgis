// index.js
const { bbox, list_tables, transform_point, list_columns, query_table, nearest, mvt, intersect_point, intersect_feature, geojson, centroid, geobuf } = require("./lib");

module.exports = class Postgis {
    constructor(client) {
        if (!client || typeof client.query !== 'function') {
            throw new Error('A valid pg.Client instance is required.');
        }
        this.client = client;
    }

    async list_tables({ filter } = {}) {
        const query = list_tables(filter);
        return this._executeQuery(query);
    }

    async list_columns(table) {
        const query = list_columns(table);
        return this._executeQuery(query);
    }

    async query_table(table, { columns = '*', filter, group, sort, limit = 100 } = {}) {
        const query = query_table(table, columns, filter, group, sort, limit);
        return this._executeQuery(query);
    }

    async bbox(table, { geom_column = 'geom', srid = 4326, filter } = {}) {
        const query = bbox(table, geom_column, srid, filter);
        return this._executeQuery(query);
    }
    async centroid(table, { force_on_surface = false, geom_column = 'geom', srid = '4326', filter } = {}) {
        const query = centroid(table, force_on_surface, geom_column, srid, filter);
        return this._executeQuery(query);
    }
    async intersect_feature(table_from, table_to, { columns = '*', distance = '0', geom_column_from = 'geom', geom_column_to = 'geom', filter, sort, limit } = {}) {
        const query = intersect_feature(table_from, table_to, columns, distance, geom_column_from, geom_column_to, filter, sort, limit);
        return this._executeQuery(query);
    }
    async intersect_point(table, point, { columns = '*', distance = '0', geom_column = 'geom', filter, sort, limit = 10 } = {}) {
        const query = intersect_point(table, point, columns, distance, geom_column, filter, sort, limit);
        return this._executeQuery(query);
    }
    async geojson(table, { bounds, id_column, precision = 9, geom_column = 'geom', columns, filter } = {}) {
        const query = geojson(table, bounds, id_column, precision, geom_column, columns, filter);
        const rows = await this._executeQuery(query);
        const json = {
            type: 'FeatureCollection',
            features: rows.map((el) => el.geojson)
        }
        return json;
    }

    async geobuf(table, { bounds, geom_column = 'geom', columns, filter } = {}) {
        const query = geobuf(table, bounds, geom_column, columns, filter);
        const rows = await this._executeQuery(query);
        return rows[0].st_asgeobuf;
    }

    async mvt(table, x, y, z, { columns, id_column, geom_column = 'geom', filter } = {}) {
        const query = mvt(table, x, y, z, columns, id_column, geom_column, filter);
        return this._executeQuery(query);
    }
    async nearest(table, point, { columns = '*', geom_column = 'geom', filter, limit = 10 } = {}) {
        const query = nearest(table, point, columns, geom_column, filter, limit);
        return this._executeQuery(query);
    }

    async transform_point(point, { srid = 4326 } = {}) {
        const query = transform_point(point, srid);
        return this._executeQuery(query);
    }

    async _executeQuery(query) {
        try {
            const res = await this.client.query(query);
            return res.rows;
        } catch (err) {
            throw new Error(`Query execution failed: ${err.message}`);
        }
    }
};
