import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getAuth } from "firebase-admin/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json(
        { error: "Missing auth token", code: "auth/missing-token" },
        { status: 401 }
      )
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid auth token", code: "auth/invalid-token" },
        { status: 401 }
      )
    }

    if (!userId || userId !== decoded.uid) {
      return NextResponse.json(
        { error: "Permission denied", code: "auth/userid-mismatch" },
        { status: 403 }
      )
    }

    // Get default global stocks
    const globalStocksRef = adminDb.collection("game_stocks_default")
    const globalSnapshot = await globalStocksRef.get()
    const globalStocks = globalSnapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        Nome: data.Nome || data.name || "",
        Simbolo: data.Simbolo || data.symbol || "",
        Preco: (data.Preco || data.price) ?? 0,
        Mudanca: (data.Mudanca || data.change) ?? 0,
        Possuidas: (data.Possuidas || data.owned) ?? 0,
        Historico: data.Historico || data.history || [],
        isDefault: true,
      }
    })

    // Get user's personal stocks
    const userStocksRef = adminDb.collection(`users/${userId}/game_stocks`)
    const userSnapshot = await userStocksRef.get()
    const userStocks = userSnapshot.docs.map((doc) => {
      const data = doc.data() as any
      return {
        id: doc.id,
        Nome: data.Nome || data.name || "",
        Simbolo: data.Simbolo || data.symbol || "",
        Preco: (data.Preco || data.price) ?? 0,
        Mudanca: (data.Mudanca || data.change) ?? 0,
        Possuidas: (data.Possuidas || data.owned) ?? 0,
        Historico: data.Historico || data.history || [],
        isDefault: false,
      }
    })

    const allStocks = [...globalStocks, ...userStocks]
    return NextResponse.json(allStocks)
  } catch (error) {
    console.error("Error loading stocks:", error)
    return NextResponse.json(
      { error: "Failed to load stocks", code: "stocks/load-failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json(
        { error: "Missing auth token", code: "auth/missing-token" },
        { status: 401 }
      )
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid auth token", code: "auth/invalid-token" },
        { status: 401 }
      )
    }

    if (!userId || userId !== decoded.uid) {
      return NextResponse.json(
        { error: "Permission denied", code: "auth/userid-mismatch" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { stockId, Nome, Simbolo, Preco } = body

    if (!stockId || !Nome || !Simbolo) {
      return NextResponse.json(
        { error: "Missing required fields", code: "stocks/missing-fields" },
        { status: 400 }
      )
    }

    const stockRef = adminDb.collection(`users/${userId}/game_stocks`).doc(stockId)
    await stockRef.set({
      nome: Nome,
      symbol: Simbolo,
      price: Preco ?? 0,
      change: 0,
      owned: 0,
      history: [{ time: "0", price: Preco ?? 0 }],
    })

    return NextResponse.json({ success: true, id: stockId })
  } catch (error) {
    console.error("Error creating stock:", error)
    return NextResponse.json(
      { error: "Failed to create stock", code: "stocks/create-failed" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stockId = searchParams.get("stockId")
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json(
        { error: "Missing auth token", code: "auth/missing-token" },
        { status: 401 }
      )
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid auth token", code: "auth/invalid-token" },
        { status: 401 }
      )
    }

    if (!userId || userId !== decoded.uid) {
      return NextResponse.json(
        { error: "Permission denied", code: "auth/userid-mismatch" },
        { status: 403 }
      )
    }

    if (!stockId) {
      return NextResponse.json(
        { error: "Missing stockId", code: "stocks/missing-stockId" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates: any = {}
    
    if (body.Nome !== undefined) updates.nome = body.Nome
    if (body.Simbolo !== undefined) updates.symbol = body.Simbolo
    if (body.Preco !== undefined) updates.price = body.Preco
    if (body.Mudanca !== undefined) updates.change = body.Mudanca
    if (body.Possuidas !== undefined) updates.owned = body.Possuidas
    if (body.Historico !== undefined) updates.history = body.Historico

    const stockRef = adminDb.collection(`users/${userId}/game_stocks`).doc(stockId)
    await stockRef.update(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json(
      { error: "Failed to update stock", code: "stocks/update-failed" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stockId = searchParams.get("stockId")
    const userId = searchParams.get("userId")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined

    if (!token) {
      return NextResponse.json(
        { error: "Missing auth token", code: "auth/missing-token" },
        { status: 401 }
      )
    }

    const decoded = await getAuth().verifyIdToken(token).catch(() => null)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid auth token", code: "auth/invalid-token" },
        { status: 401 }
      )
    }

    if (!userId || userId !== decoded.uid) {
      return NextResponse.json(
        { error: "Permission denied", code: "auth/userid-mismatch" },
        { status: 403 }
      )
    }

    if (!stockId) {
      return NextResponse.json(
        { error: "Missing stockId", code: "stocks/missing-stockId" },
        { status: 400 }
      )
    }

    const stockRef = adminDb.collection(`users/${userId}/game_stocks`).doc(stockId)
    await stockRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stock:", error)
    return NextResponse.json(
      { error: "Failed to delete stock", code: "stocks/delete-failed" },
      { status: 500 }
    )
  }
}
