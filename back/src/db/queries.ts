import type { Filter } from "../models/filters.js"

export const queryCreateTableSchema = `
-- Air Quality Monitoring Data Table
CREATE TABLE air_quality_data (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    co_gt DECIMAL(10,4),                    -- CO(GT) - Carbon monoxide reference
    pt08_s1_co INTEGER,                     -- PT08.S1(CO) - CO sensor response
    nmhc_gt DECIMAL(10,4),                  -- NMHC(GT) - Non-methane hydrocarbons reference
    c6h6_gt DECIMAL(10,4),                  -- C6H6(GT) - Benzene reference
    pt08_s2_nmhc INTEGER,                   -- PT08.S2(NMHC) - NMHC sensor response
    nox_gt DECIMAL(10,4),                   -- NOx(GT) - Nitrogen oxides reference
    pt08_s3_nox INTEGER,                    -- PT08.S3(NOx) - NOx sensor response
    no2_gt DECIMAL(10,4),                   -- NO2(GT) - Nitrogen dioxide reference
    pt08_s4_no2 INTEGER,                    -- PT08.S4(NO2) - NO2 sensor response
    pt08_s5_o3 INTEGER,                     -- PT08.S5(O3) - Ozone sensor response
    temperature DECIMAL(5,2),               -- T - Temperature in Celsius
    relative_humidity DECIMAL(5,2),         -- RH - Relative humidity percentage (0-100%)
    absolute_humidity DECIMAL(6,3)          -- AH - Absolute humidity in g/m³ (improved precision)
);

-- Create indexes for common queries
CREATE INDEX idx_air_quality_datetime ON air_quality_data(timestamp);
CREATE INDEX idx_air_quality_co ON air_quality_data(co_gt);
CREATE INDEX idx_air_quality_no2 ON air_quality_data(no2_gt);

-- Add comments for documentation
COMMENT ON TABLE air_quality_data IS 'Air quality monitoring data with chemical concentrations and sensor responses';
COMMENT ON COLUMN air_quality_data.co_gt IS 'Carbon monoxide concentration from reference sensor (mg/m³)';
COMMENT ON COLUMN air_quality_data.no2_gt IS 'Nitrogen dioxide concentration from reference sensor (µg/m³)';
COMMENT ON COLUMN air_quality_data.temperature IS 'Temperature in Celsius';
COMMENT ON COLUMN air_quality_data.relative_humidity IS 'Relative humidity percentage';
`

export const queryCheckTableExists = `
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'air_quality_data'
);
`

export const queryExtractTableColumnNames = `
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'air_quality_data';
`

export const queryCheckTableHasData = `
SELECT COUNT(*) > 0 AS has_data
FROM air_quality_data;
`

export const queryDropTable = `
DROP TABLE IF EXISTS air_quality_data;
`

export const queryInsertOne = `
INSERT INTO air_quality_data (co_gt, pt08_s1_co, nmhc_gt, c6h6_gt, pt08_s2_nmhc, nox_gt, pt08_s3_nox, no2_gt, pt08_s4_no2, pt08_s5_o3, temperature, relative_humidity, absolute_humidity, timestamp)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
`

export const prepareQueryFetchData = (filter: Filter) => {
  const { parameters, startDate, endDate } = filter

  const values: any[] = []
  let paramIndex = 1

  let query = `SELECT `

  // filter by parameter
  if (parameters && parameters.length > 0) {
    query += `timestamp, `
    query += `${parameters.join(", ")}`
  } else {
    query += `*`
  }

  query += ` FROM air_quality_data WHERE 1=1`

  // filter by date range
  if (startDate) {
    query += ` AND timestamp >= $${paramIndex++}`
    values.push(startDate)
  }
  if (endDate) {
    query += ` AND timestamp <= $${paramIndex++}`
    values.push(endDate)
  }

  query += ` ORDER BY timestamp`

  return { query, values }
}
