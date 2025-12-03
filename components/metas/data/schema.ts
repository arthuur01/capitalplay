import { z } from "zod"

export const metaSchema = z.object({
  id: z.string(),
  Titulo: z.string(),
  Valor_meta: z.number(),
  Status: z.boolean().optional(),
  Data_inicial: z.string().nullable(),
  Data_final: z.string().nullable(),
})

export type Meta = z.infer<typeof metaSchema>
