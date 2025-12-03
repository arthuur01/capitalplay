"use client"

import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebaseConfig"
import { MetasClient } from "./metas-client"
import { Meta } from "./data/schema"

export function MetasPage() {
  const [user] = useAuthState(auth)
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)

  const loadMetas = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/metas?userId=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMetas(data)
      setLoading(false)
    } catch (err) {
      console.error("Error loading metas:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetas()
  }, [user])

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Carregando metas...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Faça login para ver suas metas</p>
      </div>
    )
  }

  return <MetasClient metas={metas} user={user} onRefresh={loadMetas} />
}
