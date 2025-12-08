import { z } from "zod"

export const paymentSchema = z.object({
  id: z.string(),
  Nome: z.string(),
  Numero_cartao: z.string(),
  Cvc: z.number(),
  Data_validade: z.any(), // Timestamp
})

export type PaymentMethod = z.infer<typeof paymentSchema>

export const paymentDisplaySchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  tier: z.string(),
  limit: z.number(),
  cardNumber: z.string(),
  expiryDate: z.string(),
})

export type PaymentDisplay = z.infer<typeof paymentDisplaySchema>
