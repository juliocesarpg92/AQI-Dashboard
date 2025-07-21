import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { validateFilterSchema, type Filter } from "./models/filters.js"
import { validator } from "hono/validator"
import * as z from "zod/v4"
import { fetchColumnNames, fetchData, setupDb } from "./db/index.js"

const app = new Hono()
app.use(logger())
app.use(cors())
app.use(secureHeaders())

// initialize db connection and import CSV data
await setupDb()

app.post(
  "/filter",
  validator("json", (value, c) => {
    const result = validateFilterSchema(value)
    if (!result.success) {
      return c.json(z.flattenError(result.error), 400)
    }
    return result.data
  }),
  async (c) => {
    const filter: Filter = c.req.valid("json")

    // white-listing parameters
    if (filter.parameters) {
      const allowedParameters = await fetchColumnNames()
      const exists = filter.parameters.every((param) =>
        allowedParameters.includes(param)
      )
      if (!exists) {
        return c.json({ message: "Invalid parameters provided." }, 400)
      }
    }

    const result = await fetchData(filter)

    if (!result || result.length === 0) {
      return c.json({ message: "No data found for the given filter." }, 404)
    }

    return c.json({
      message: "Data fetched successfully.",
      data: result,
    })
  }
)

app.get("/health", (c) => {
  return c.json({ status: "ok" })
})

serve(
  {
    fetch: app.fetch,
    port: process.env.BACK_PORT ? Number(process.env.BACK_PORT) : 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
