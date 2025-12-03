"use client"

import { useMemo } from "react"
import { User } from "firebase/auth"
import { getColumns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { Meta } from "./data/schema"

interface MetasClientProps {
  metas: Meta[]
  user: User
  onRefresh: () => void
}

export function MetasClient({ metas, user, onRefresh }: MetasClientProps) {
  const columns = useMemo(() => getColumns(user, onRefresh), [user, onRefresh])

  return (
    <div className="rounded-lg border bg-card p-6 mt-6">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Metas Financeiras</h2>
        <p className="text-sm text-muted-foreground">Gerencie suas metas financeiras</p>
      </div>
      <DataTable<Meta, unknown> 
        data={metas} 
        columns={columns} 
        user={user}
        onRefresh={onRefresh}
      />
    </div>
  )
}
