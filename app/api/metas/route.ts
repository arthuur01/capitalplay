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

    // Buscar tasks do usuário: users/{userId}/meta_financeira (Admin SDK)
    const tasksRef = adminDb.collection(`users/${userId}/meta_financeira`)
    const snapshot = await tasksRef.get()

    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        Titulo: data.Titulo || "",
        Valor_meta: data.Valor_meta || 0,
        Status: data.Status || false,
        Data_inicial: data.Data_inicial?.toDate?.()?.toISOString() || null,
        Data_final: data.Data_final?.toDate?.()?.toISOString() || null,
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
    const { Titulo, Valor_meta, Status, Data_inicial, Data_final } = body

    if (!Titulo) {
      return NextResponse.json({ error: "Missing Titulo" }, { status: 400 })
    }

    const tasksRef = adminDb.collection(`users/${userId}/meta_financeira`)
    const docRef = await tasksRef.add({
      Titulo,
      Valor_meta: Valor_meta || 0,
      Status: Status || false,
      Data_inicial: Data_inicial ? Timestamp.fromDate(new Date(Data_inicial)) : Timestamp.now(),
      Data_final: Data_final ? Timestamp.fromDate(new Date(Data_final)) : Timestamp.now(),
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

    if (body.Titulo !== undefined) updates.Titulo = body.Titulo
    if (body.Valor_meta !== undefined) updates.Valor_meta = body.Valor_meta
    if (body.Status !== undefined) updates.Status = body.Status
    if (body.Data_inicial !== undefined) updates.Data_inicial = body.Data_inicial ? Timestamp.fromDate(new Date(body.Data_inicial)) : null
    if (body.Data_final !== undefined) updates.Data_final = body.Data_final ? Timestamp.fromDate(new Date(body.Data_final)) : null

    const taskRef = adminDb.doc(`users/${userId}/meta_financeira/${taskId}`)
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

    const taskRef = adminDb.doc(`users/${userId}/meta_financeira/${taskId}`)
    await taskRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}

