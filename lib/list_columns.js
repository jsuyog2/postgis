module.exports = function (table) {

    return `
    SELECT
    attname as field_name,
        typname as field_type

    FROM
    pg_namespace, pg_attribute, pg_type, pg_class

    WHERE
    pg_type.oid = atttypid AND
    pg_class.oid = attrelid AND
    relnamespace = pg_namespace.oid AND
    attnum >= 1 AND
    relname = '${table}'
        `

}