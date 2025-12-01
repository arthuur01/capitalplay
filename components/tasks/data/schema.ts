import { z } from "zod"

// Schema adaptado para Firebase: calendar-checklist
export const taskSchema = z.object({
  id: z.string(), // Id do documento Firebase
  titulo: z.string(), // Titulo
  status: z.boolean(), // Status (true/false)
  prioridade: z.array(z.boolean()), // Array de prioridades [0,1,2]
  data: z.any().optional(), // Data (Firestore Timestamp)
})

export type Task = z.infer<typeof taskSchema>

// Schema para exibição na tabela (conversão)
export const taskDisplaySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(), // "done" | "todo"
  priority: z.string(), // "low" | "medium" | "high"
  label: z.string().optional(), // Optional label field
  date: z.string().nullable().optional(), // Data formatada (pode ser null)
})

export type TaskDisplay = z.infer<typeof taskDisplaySchema>
