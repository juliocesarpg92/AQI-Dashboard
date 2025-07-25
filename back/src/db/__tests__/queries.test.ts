import { describe, test, before, after, mock } from "node:test"
import assert from "node:assert"
import { prepareQueryFetchData } from "../queries.js"

describe("fetchDataByFilter", () => {
  test("should generate correct query when no parameters are provided", async () => {
    const expectedQueryBase = "SELECT * FROM air_quality_data WHERE 1=1"
    const result = await prepareQueryFetchData({})

    // Verify the generated query
    assert.ok(
      result.query.includes(expectedQueryBase),
      "Query should include expected base query"
    )
    assert.deepStrictEqual(result.values, [])
  })

  test("should generate correct query with specific parameters", async () => {
    const expectedQueryBase =
      "SELECT timestamp, co_gt, no2_gt FROM air_quality_data WHERE 1=1"
    const result = await prepareQueryFetchData({
      parameters: ["co_gt", "no2_gt"],
    })

    // Verify the generated query
    assert.ok(
      result.query.includes(expectedQueryBase),
      "Query should include expected base query"
    )
  })

  test("should generate correct query with date range filter", async () => {
    const expectedQueryBase =
      "SELECT * FROM air_quality_data WHERE 1=1 AND timestamp >= $1 AND timestamp <= $2"
    const values = [
      new Date("2023-01-01").getTime(),
      new Date("2023-12-31").getTime(),
    ]
    const result = await prepareQueryFetchData({
      startDate: values[0],
      endDate: values[1],
    })

    // Verify the generated query
    assert.ok(
      result.query.includes(expectedQueryBase),
      "Query should include expected base query"
    )
    assert.deepStrictEqual(result.values, values)
  })

  test("should generate correct query with parameters and date range", async () => {
    const expectedQueryBase =
      "SELECT timestamp, co_gt, no2_gt FROM air_quality_data WHERE 1=1 AND timestamp >= $1 AND timestamp <= $2"
    const values = [
      new Date("2023-01-01").getTime(),
      new Date("2023-12-31").getTime(),
    ]
    const result = await prepareQueryFetchData({
      parameters: ["co_gt", "no2_gt"],
      startDate: values[0],
      endDate: values[1],
    })

    // Verify the generated query
    assert.ok(
      result.query.includes(expectedQueryBase),
      "Query should include expected base query"
    )
    assert.deepStrictEqual(result.values, values)
  })
})
