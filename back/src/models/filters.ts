import * as z from "zod/v4"

export const filterSchema = z.object({
  parameters: z.array(z.string()).optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
})

export function validateFilterSchema(
  filter: unknown
): z.ZodSafeParseResult<Filter> {
  const validationResult = filterSchema.safeParse(filter)
  return validationResult
}

export type Filter = z.infer<typeof filterSchema>
