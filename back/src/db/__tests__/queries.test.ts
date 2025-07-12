import { describe, test, before, after, mock } from "node:test"
import assert from "node:assert"
import { fetchDataByFilter } from "../queries.js"

describe("fetchDataByFilter", () => {
  test("should generate correct query when no parameters are provided", async () => {
    const expectedQuery = "SELECT 1, * FROM air_quality_data WHERE 1=1"
    const result = await fetchDataByFilter({})

    // Verify the generated query
    assert.strictEqual(result.query, expectedQuery)
    assert.deepStrictEqual(result.values, [])
  })

  test("should generate correct query with specific parameters", async () => {
    const expectedQuery =
      "SELECT 1, $1 AS co_gt, $2 AS no2_gt FROM air_quality_data WHERE 1=1"
    const values = ["co_gt", "no2_gt"]
    const result = await fetchDataByFilter({ parameters: values })

    // Verify the generated query
    assert.strictEqual(result.query, expectedQuery)
    assert.deepStrictEqual(result.values, values)
  })

  test("should generate correct query with date range filter", async () => {
    const expectedQuery =
      "SELECT 1, * FROM air_quality_data WHERE 1=1 AND date >= $1 AND date <= $2"
    const values = ["2023-01-01", "2023-12-31"]
    const result = await fetchDataByFilter({
      startDate: values[0],
      endDate: values[1],
    })

    // Verify the generated query
    assert.strictEqual(result.query, expectedQuery)
    assert.deepStrictEqual(result.values, values)
  })

  test("should generate correct query with parameters and date range", async () => {
    const expectedQuery =
      "SELECT 1, $1 AS co_gt, $2 AS no2_gt FROM air_quality_data WHERE 1=1 AND date >= $3 AND date <= $4"
    const values = ["co_gt", "no2_gt", "2023-01-01", "2023-12-31"]
    const result = await fetchDataByFilter({
      parameters: values.slice(0, 2),
      startDate: values[2],
      endDate: values[3],
    })

    // Verify the generated query
    assert.strictEqual(result.query, expectedQuery)
    assert.deepStrictEqual(result.values, values)
  })
})
