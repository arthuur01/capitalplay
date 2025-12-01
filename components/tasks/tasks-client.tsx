"use client"

import { useMemo } from "react"
import { User } from "firebase/auth"
import { getColumns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { TaskDisplay } from "./data/schema"

interface TasksClientProps {
  tasks: TaskDisplay[]
  user: User
  onRefresh: () => void
}

export function TasksClient({ tasks, user, onRefresh }: TasksClientProps) {
  const columns = useMemo(() => getColumns(user, onRefresh), [user, onRefresh])

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Tarefas</h2>
        <p className="text-sm text-muted-foreground">Gerencie suas tarefas do mês</p>
      </div>
      <DataTable<TaskDisplay, unknown> 
        data={tasks} 
        columns={columns} 
        user={user}
        onRefresh={onRefresh}
      />
    </div>
  )
}
