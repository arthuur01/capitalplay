import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { Timestamp } from "firebase-admin/firestore"

export async function GET(request: Request) {
  try {
    // Pegar userId do header ou query param (você precisa passar o user autenticado)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Verificar token de autenticação do Firebase (Bearer <idToken>)
    const authHeader = (request.headers as any).get?.("authorization") || (request as any).headers?.get?.("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 })
    }

    // Garantir que o token corresponde ao userId solicitado
    const uid = decoded.uid
    if (!userId || userId !== uid) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Buscar tasks do usuário: users/{userId}/calendar-checklist (Admin SDK)
    const tasksRef = adminDb.collection(`users/${userId}/calendar-checklist`)
    const snapshot = await tasksRef.get()

    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        title: data.Titulo || data.titulo || "",
        status: data.Status ? "done" : "todo",
        priority: getPriorityFromArray(data.Prioridade || data.prioridade || []),
        date: data.Data?.toDate?.()?.toISOString() || null,
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error loading tasks:", error)
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await request.json()
    const { titulo, status, prioridade, data } = body

    if (!titulo) {
      return NextResponse.json({ error: "Missing titulo" }, { status: 400 })
    }

    const tasksRef = adminDb.collection(`users/${userId}/calendar-checklist`)
    const docRef = await tasksRef.add({
      Titulo: titulo,
      Status: status ?? false,
      Prioridade: prioridade ?? [false, true, false], // default medium
      Data: data ? Timestamp.fromDate(new Date(data)) : Timestamp.now(),
    })

    return NextResponse.json({ id: docRef.id, success: true })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const taskId = searchParams.get("taskId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 })
    }

    const body = await request.json()
    const updates: any = {}

    if (body.titulo !== undefined) updates.Titulo = body.titulo
    if (body.status !== undefined) updates.Status = body.status
    if (body.prioridade !== undefined) updates.Prioridade = body.prioridade
    if (body.data !== undefined) updates.Data = body.data ? Timestamp.fromDate(new Date(body.data)) : null

    const taskRef = adminDb.doc(`users/${userId}/calendar-checklist/${taskId}`)
    await taskRef.update(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const taskId = searchParams.get("taskId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 })
    }

    const taskRef = adminDb.doc(`users/${userId}/calendar-checklist/${taskId}`)
    await taskRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

function getPriorityFromArray(prioridade: boolean[]): string {
  // [true, false, false] = high (index 0)
  // [false, true, false] = medium (index 1)
  // [false, false, true] = low (index 2)
  const index = prioridade.findIndex((p) => p === true)
  if (index === 0) return "high"
  if (index === 1) return "medium"
  if (index === 2) return "low"
  return "medium"
}

function getPriorityArray(priority: string): [boolean, boolean, boolean] {
  if (priority === "high") return [true, false, false]
  if (priority === "medium") return [false, true, false]
  if (priority === "low") return [false, false, true]
  return [false, true, false]
}
