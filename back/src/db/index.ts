import { Pool } from "pg"
import {
  queryCheckTableExists,
  queryCheckTableHasData,
  queryCreateTableSchema,
  queryDropTable,
  prepareQueryFetchData,
  queryInsertOne,
  queryExtractTableColumnNames,
} from "./queries.js"
import importCsvData from "../utils/importCsvData.js"
import { existsSync } from "node:fs"
import type { Filter } from "../models/filters.js"

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "database",
  port: Number(process.env.DB_PORT) || 5432,
})

async function seedInitialData() {
  console.log("Seeding initial data...")
  console.time("seeding")
  if (!process.env.CSV_FILE_PATH) {
    console.error("CSV_FILE_PATH environment variable is not set.")
    return
  }
  if (!existsSync(process.env.CSV_FILE_PATH)) {
    console.error(`CSV file not found at path: ${process.env.CSV_FILE_PATH}`)
    return
  }
  await importCsvData(process.env.CSV_FILE_PATH, bulkInsert, 500)
  console.timeEnd("seeding")
}

export async function setupDb() {
  // remove existing table in development mode
  // if (process.env.NODE_ENV === "development") {
  //   console.log(
  //     "Running in development mode, dropping existing table if it exists..."
  //   )
  //   await pool.query(queryDropTable)
  //   console.log("Existing table dropped.")
  // }

  // check if the table already exists
  const tableExists = await pool.query(queryCheckTableExists)
  if (tableExists.rows[0].exists) {
    console.log("Table already exists.")
  } else {
    console.log("Creating table...")
    await pool.query(queryCreateTableSchema)
    console.log("Table created successfully")
  }

  // check if the table has data
  const hasData = await pool.query(queryCheckTableHasData)
  if (hasData.rows[0].has_data) {
    console.log("Table has data.")
    return
  } else {
    await seedInitialData()
    console.log("Database setup complete")
  }
}

async function bulkInsert(data: Record<string, any>[]) {
  for (const record of data) {
    console.log(`Inserting record: ${JSON.stringify(record)}`)
    await pool.query(queryInsertOne, Object.values(record))
  }
}

export async function fetchData(filter: Filter) {
  const { query, values } = prepareQueryFetchData(filter)
  console.log(`Executing query: ${query} with values: ${values}`)
  const result = await pool.query(query, values)
  console.log(`Fetched ${result.rowCount} records`)
  return result.rows
}

export async function fetchColumnNames() {
  const result = await pool.query(queryExtractTableColumnNames)
  return result.rows.map((row) => row.column_name)
}
