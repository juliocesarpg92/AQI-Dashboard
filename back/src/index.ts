import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { validateFilterSchema } from "./models/filters.js"
import { validator } from "hono/validator"
import * as z from "zod/v4"

const app = new Hono()
app.use(logger())
app.use(cors())
app.use(secureHeaders())

// initialize db connection

// import csv data

app.get(
  "/filter",
  validator("query", (value, c) => {
    const result = validateFilterSchema(value)
    if (!result.success) {
      return c.json(z.flattenError(result.error), 400)
    }
    return result.data
  }),
  (c) => {
    const { parameters, startDate, endDate } = c.req.valid("query")
    return c.json({
      parameters,
      startDate,
      endDate,
      message: "Hello, Hono!",
    })
  }
)

app.get("/health", (c) => {
  return c.json({ status: "ok" })
})

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
