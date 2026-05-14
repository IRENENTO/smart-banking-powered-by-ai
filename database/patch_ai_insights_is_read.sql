-- Add is_read to ai_insights if missing (fixes AIInsight model vs older 02_missing_tables.sql schema)
SET @dbname = DATABASE();
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'ai_insights' AND COLUMN_NAME = 'is_read'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE ai_insights ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
