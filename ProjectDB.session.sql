SELECT 
    relname AS table_name, 
    attname AS column_name, 
    format_type(atttypid, atttypmod) AS data_type
FROM 
    pg_attribute
JOIN 
    pg_class ON pg_class.oid = pg_attribute.attrelid
WHERE 
    attnum > 0 
    AND NOT attisdropped
    AND relkind = 'r' -- 'r' means ordinary table
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');