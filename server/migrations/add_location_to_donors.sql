-- Migration: Add latitude and longitude to Donors table safely
-- Compatible with MySQL 8.0+

-- Check and add latitude if it doesn't exist
SET @col_lat_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Donors' 
    AND COLUMN_NAME = 'latitude'
);

SET @stmt_lat = IF(@col_lat_exists = 0, 
  'ALTER TABLE `Donors` ADD COLUMN `latitude` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `city`;', 
  'SELECT "Column latitude already exists" AS notice;'
);
PREPARE stmt_lat FROM @stmt_lat;
EXECUTE stmt_lat;
DEALLOCATE PREPARE stmt_lat;

-- Check and add longitude if it doesn't exist
SET @col_lng_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Donors' 
    AND COLUMN_NAME = 'longitude'
);

SET @stmt_lng = IF(@col_lng_exists = 0, 
  'ALTER TABLE `Donors` ADD COLUMN `longitude` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `latitude`;', 
  'SELECT "Column longitude already exists" AS notice;'
);
PREPARE stmt_lng FROM @stmt_lng;
EXECUTE stmt_lng;
DEALLOCATE PREPARE stmt_lng;

-- Add spatial index or standard composite index for location queries if beneficial
CREATE INDEX `idx_donors_location` ON `Donors` (`latitude`, `longitude`);
