import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: Request) {
  try {
    const plansRef = adminDb.collection("planos_assinatura")
    const snapshot = await plansRef.get()

    const plans = snapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        Nome: data.Nome || data.nome || "",
        Badge: data.Badge || data.badge || "",
        Mensal: (data.Mensal || data.mensal) ?? 0,
        Anual: (data.Anual || data.anual) ?? 0,
        Funcionalidades: data.Funcionalidades || data.funcionalidades || [],
        isPopular: data.isPopular || false,
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error loading pricing plans:", error)
    return NextResponse.json(
      { error: "Failed to load pricing plans", code: "pricing/load-failed" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json(
        { error: "Missing planId", code: "pricing/missing-planId" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates: any = {}
    
    if (body.Nome !== undefined) updates.nome = body.Nome
    if (body.Badge !== undefined) updates.badge = body.Badge
    if (body.Mensal !== undefined) updates.mensal = body.Mensal
    if (body.Anual !== undefined) updates.anual = body.Anual
    if (body.Funcionalidades !== undefined) updates.funcionalidades = body.Funcionalidades

    const planRef = adminDb.collection("planos_assinatura").doc(planId)
    await planRef.update(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating pricing plan:", error)
    return NextResponse.json(
      { error: "Failed to update pricing plan", code: "pricing/update-failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planId, Nome, Badge, Mensal, Anual, Funcionalidades } = body

    if (!planId || !Nome) {
      return NextResponse.json(
        { error: "Missing required fields", code: "pricing/missing-fields" },
        { status: 400 }
      )
    }

    const planRef = adminDb.collection("planos_assinatura").doc(planId)
    await planRef.set({
      nome: Nome,
      badge: Badge || "",
      mensal: Mensal ?? 0,
      anual: Anual ?? 0,
      funcionalidades: Funcionalidades || [],
    })

    return NextResponse.json({ success: true, id: planId })
  } catch (error) {
    console.error("Error creating pricing plan:", error)
    return NextResponse.json(
      { error: "Failed to create pricing plan", code: "pricing/create-failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json(
        { error: "Missing planId", code: "pricing/missing-planId" },
        { status: 400 }
      )
    }

    const planRef = adminDb.collection("planos_assinatura").doc(planId)
    await planRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting pricing plan:", error)
    return NextResponse.json(
      { error: "Failed to delete pricing plan", code: "pricing/delete-failed" },
      { status: 500 }
    )
  }
}
