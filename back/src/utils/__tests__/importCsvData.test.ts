import { describe, test, before, after, mock } from "node:test"
import assert from "node:assert"
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
    const csvData = `Date      ; Time    ; CO(GT); PT08.S1(CO); NMHC(GT); C6H6(GT); PT08.S2(NMHC); NOx(GT); PT08.S3(NOx); NO2(GT); PT08.S4(NO2); PT08.S5(O3); T   ; RH  ; AH    ; ; 
10/03/2004; 18.00.00; -200  ; 1360       ; 150     ; -200    ; 1046         ; 166    ; 1056        ; 113    ; 1692        ; 1268       ; 13,6; 48,9; 0,7578; ; 
10/03/2004; 19.00.00; 2     ; 1292       ; 112     ; 9,4     ; 955          ; 103    ; 1174        ; 92     ; 1559        ; 972        ; 13,3; 47,7; 0,7255; ; 
10/03/2004; 20.00.00; 2,2   ; 1402       ; 88      ; 9,0     ; 939          ; 131    ; 1140        ; 114    ; 1555        ; 1074       ; 11,9; 54,0; 0,7502; ; 
`

    const firstRowResult = {
      co_gt: null,
      pt08_s1_co: 1360,
      nmhc_gt: 150,
      c6h6_gt: null,
      pt08_s2_nmhc: 1046,
      nox_gt: 166,
      pt08_s3_nox: 1056,
      no2_gt: 113,
      pt08_s4_no2: 1692,
      pt08_s5_o3: 1268,
      t: 13.6,
      rh: 48.9,
      ah: 0.7578,
      timestamp: new Date(2004, 2, 10, 18, 0, 0),
    }

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

    console.log("Processed Data:", processedData[0])
    console.log("First record should match:", firstRowResult)
    // Assert
    assert.strictEqual(
      callCount,
      1,
      "chunkHandler should be called once at the end"
    )
    assert.strictEqual(processedData.length, 3, "Should process 3 records")
    assert.deepStrictEqual(
      processedData[0],
      firstRowResult,
      "First record should match"
    )
  })

  test("should process CSV file with data equal to chunk size", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test2.csv")
    const csvData = `name;age;city
John;30;New York
Jane;25;Los Angeles`

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
    const csvRows = ["name;age;city"]
    for (let i = 0; i < 5; i++) {
      csvRows.push(`Person${i};${20 + i};City${i}`)
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
    const csvData = `name;age;city
  John;30;New York`

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

  test("should skip empty lines", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test6.csv")
    const csvRows = ["name;age;city"]
    for (let i = 0; i < 5; i++) {
      csvRows.push(`Person${i};${20 + i};City${i}`)
    }
    csvRows.push(`;;`) // Add an empty row to test handling of empty lines
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
    assert.strictEqual(processedData.length, 5, "Should process only 5 records")
  })

  test("should handle large CSV file efficiently", async () => {
    // Arrange
    const testCsvPath = path.join(tempDir, "test6.csv")
    const csvRows = ["name;age;city"]
    for (let i = 0; i < 10000; i++) {
      csvRows.push(`Person${i};${20 + i};City${i}`)
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
    const startTime = Date.now()
    await importCsvData(testCsvPath, chunkHandler, 500)
    const endTime = Date.now()

    // Assert
    assert.strictEqual(
      callCount,
      20,
      "chunkHandler should be called 20 times (10000 records / 500 chunk size)"
    )
    assert.strictEqual(
      processedData.length,
      10000,
      "Should process all 10000 records"
    )
    assert.ok(endTime - startTime < 5000, "Should complete within 5 seconds")
  })
})
