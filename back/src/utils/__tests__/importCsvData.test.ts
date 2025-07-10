import { describe, test, before, after, mock } from "node:test"
import assert from "node:assert"
import fs from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import importCsvData from "../importCsvData.js"

describe("importCsvData", () => {
  let tempDir: string

  before(async () => {
    // Create a temporary directory for test files
    tempDir = await mkdtemp(path.join(tmpdir(), "csv-test-"))
  })

  after(async () => {
    // Clean up temporary files
    await rm(tempDir, { recursive: true, force: true })
  })

  test("should process CSV file with data less than chunk size", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test1.csv")
    const csvData = `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago`

    await writeFile(testCsvPath, csvData)

    let callCount = 0
    const processedData: Record<string, any>[] = []
    const chunkHandler = mock.fn(async (data: Record<string, any>[]) => {
      callCount++
      processedData.push(...data)
      return Promise.resolve()
    })

    // Act
    await importCsvData(testCsvPath, chunkHandler, 500)

    // Assert
    assert.strictEqual(
      callCount,
      1,
      "chunkHandler should be called once at the end"
    )
    assert.strictEqual(processedData.length, 3, "Should process 3 records")
  })

  test("should process CSV file with data equal to chunk size", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test2.csv")
    const csvData = `name,age,city
John,30,New York
Jane,25,Los Angeles`

    await writeFile(testCsvPath, csvData)

    let callCount = 0
    const processedData: Record<string, any>[] = []
    const chunkHandler = mock.fn(async (data: Record<string, any>[]) => {
      callCount++
      processedData.push(...data)
      return Promise.resolve()
    })

    // Act
    await importCsvData(testCsvPath, chunkHandler, 2)

    // Assert
    assert.strictEqual(
      callCount,
      1,
      "chunkHandler should be called once when data equals chunk size"
    )
    assert.strictEqual(processedData.length, 2, "Should process 2 records")
  })

  test("should process CSV file with data greater than chunk size", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test3.csv")
    const csvRows = ["name,age,city"]
    for (let i = 0; i < 5; i++) {
      csvRows.push(`Person${i},${20 + i},City${i}`)
    }
    const csvData = csvRows.join("\n")

    await writeFile(testCsvPath, csvData)

    let callCount = 0
    const processedData: Record<string, any>[] = []
    const chunkHandler = mock.fn(async (data: Record<string, any>[]) => {
      callCount++
      processedData.push(...data)
      return Promise.resolve()
    })

    // Act
    await importCsvData(testCsvPath, chunkHandler, 2)

    // Assert
    assert.strictEqual(
      callCount,
      3,
      "chunkHandler should be called 3 times (2 full chunks + 1 remaining)"
    )
    assert.strictEqual(processedData.length, 5, "Should process 5 records")
  })

  test("should reject when chunkHandler throws an error during end", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test5.csv")
    const csvData = `name,age,city
  John,30,New York`

    await writeFile(testCsvPath, csvData)

    const chunkHandler = mock.fn(async () => {
      throw new Error("Database error")
    })

    // Act & Assert
    await assert.rejects(
      importCsvData(testCsvPath, chunkHandler, 500),
      /Database error/,
      "Should reject with database error"
    )
  })
})
