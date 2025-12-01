"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebaseConfig"
import { TasksClient } from "./tasks-client"

interface TaskDisplay {
  id: string
  title: string
  status: string
  priority: string
}

export function TaskPage() {
  const [user] = useAuthState(auth)
  const [tasks, setTasks] = useState<TaskDisplay[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/tasks?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTasks(data)
      setLoading(false)
    } catch (err) {
      console.error("Error loading tasks:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [user])

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Carregando tarefas...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Faça login para ver suas tarefas</p>
      </div>
    )
  }

  return <TasksClient tasks={tasks as any} user={user} onRefresh={loadTasks} />
}