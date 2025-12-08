import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getAuth } from "firebase-admin/auth"

export async function GET(request: Request) {
  try {
    // Pegar userId do header ou query param (você precisa passar o user autenticado)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Verificar token de autenticação do Firebase (Bearer <idToken>)
    const authHeader = (request.headers as any).get?.("authorization") || (request as any).headers?.get?.("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({
        error: "Missing auth token",
        code: "auth/missing-token",
        message: "Envie o header Authorization: Bearer <idToken>"
      }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json({
        error: "Invalid auth token",
        code: "auth/invalid-token",
        message: "ID token inválido ou expirado"
      }, { status: 401 })
    }

    // Garantir que o token corresponde ao userId solicitado
    const uid = decoded.uid
    if (!userId || userId !== uid) {
      return NextResponse.json({
        error: "Permission denied",
        code: "auth/userid-mismatch",
        message: "userId do query não corresponde ao usuário autenticado",
        details: { userId, uid }
      }, { status: 403 })
    }

    // Buscar métodos de pagamento do usuário: users/{userId}/metodos_pagamento (Admin SDK)
    const paymentsRef = adminDb.collection(`users/${userId}/metodos_pagamento`)
    const snapshot = await paymentsRef.get()

    const payments = snapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        Id: data.Id || doc.id,
        Nome: data.Nome || "",
        Numero_cartao: data.Numero_cartao || "",
        Last4: data.Last4 || "",
        Cvc: typeof data.Cvc === "number" ? data.Cvc : Number(data.Cvc ?? 0),
        Data_validade: data.Data_validade ?? null,
        Email: data.Email || "",
      }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error loading payments:", error)
    return NextResponse.json({ error: "Failed to load payments", code: "payments/load-failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json({
        error: "Missing auth token",
        code: "auth/missing-token",
        message: "Envie o header Authorization: Bearer <idToken>"
      }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({
        error: "Permission denied",
        code: "auth/userid-mismatch",
        message: "userId do query não corresponde ao usuário autenticado",
        details: { userId, uid: decoded?.uid }
      }, { status: 403 })
    }

    const body = await request.json()
    const { Nome, Numero_cartao, Last4, Cvc, Data_validade, Email } = body

    if (!Nome) {
      return NextResponse.json({ error: "Missing Nome", code: "payments/missing-nome" }, { status: 400 })
    }

    const paymentsRef = adminDb.collection(`users/${userId}/metodos_pagamento`)
    const newDocRef = paymentsRef.doc()
    await newDocRef.set({
      Id: newDocRef.id,
      Nome,
      Numero_cartao: Numero_cartao ?? "",
      Last4: Last4 ?? "",
      Cvc: typeof Cvc === "number" ? Cvc : Number(Cvc ?? 0),
      Data_validade: Array.isArray(Data_validade) ? Data_validade : [0, 0],
      Email: Email ?? "",
    })

    return NextResponse.json({ id: newDocRef.id, success: true })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment", code: "payments/create-failed" }, { status: 500 })
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
      return NextResponse.json({
        error: "Missing auth token",
        code: "auth/missing-token",
        message: "Envie o header Authorization: Bearer <idToken>"
      }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({
        error: "Permission denied",
        code: "auth/userid-mismatch",
        message: "userId do query não corresponde ao usuário autenticado",
        details: { userId, uid: decoded?.uid }
      }, { status: 403 })
    }

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId", code: "payments/missing-taskId", message: "Informe o id do documento via query param taskId" }, { status: 400 })
    }

    const body = await request.json()
    const updates: any = {}

    if (body.Id !== undefined) updates.Id = body.Id
    if (body.Nome !== undefined) updates.Nome = body.Nome
    if (body.Numero_cartao !== undefined) updates.Numero_cartao = body.Numero_cartao
    if (body.Last4 !== undefined) updates.Last4 = body.Last4
    if (body.Cvc !== undefined) updates.Cvc = typeof body.Cvc === "number" ? body.Cvc : Number(body.Cvc ?? 0)
    if (body.Data_validade !== undefined) {
      updates.Data_validade = Array.isArray(body.Data_validade) ? body.Data_validade : [0, 0]
    }
    if (body.Email !== undefined) updates.Email = body.Email

    const paymentRef = adminDb.doc(`users/${userId}/metodos_pagamento/${taskId}`)
    await paymentRef.update(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Failed to update payment", code: "payments/update-failed" }, { status: 500 })
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
      return NextResponse.json({
        error: "Missing auth token",
        code: "auth/missing-token",
        message: "Envie o header Authorization: Bearer <idToken>"
      }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded || !userId || userId !== decoded.uid) {
      return NextResponse.json({
        error: "Permission denied",
        code: "auth/userid-mismatch",
        message: "userId do query não corresponde ao usuário autenticado",
        details: { userId, uid: decoded?.uid }
      }, { status: 403 })
    }

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId", code: "payments/missing-taskId", message: "Informe o id do documento via query param taskId" }, { status: 400 })
    }

    const paymentRef = adminDb.doc(`users/${userId}/metodos_pagamento/${taskId}`)
    await paymentRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json({ error: "Failed to delete payment", code: "payments/delete-failed" }, { status: 500 })
  }
}

// Removidos helpers de prioridade por não se aplicarem à coleção de pagamentos
