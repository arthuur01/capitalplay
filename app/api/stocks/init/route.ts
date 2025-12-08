import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// This endpoint initializes the default stocks in Firebase
export async function POST(request: Request) {
  try {
    const DEFAULT_GAME_STOCKS = [
      { id: "def1", name: "TechCorp", symbol: "TECH", price: 150, change: 0, owned: 0, history: [{ time: "0", price: 150 }] },
      { id: "def2", name: "BioMed Inc", symbol: "BIOM", price: 85, change: 0, owned: 0, history: [{ time: "0", price: 85 }] },
      { id: "def3", name: "EnergyPlus", symbol: "ENGY", price: 120, change: 0, owned: 0, history: [{ time: "0", price: 120 }] },
      { id: "def4", name: "RetailMax", symbol: "RETL", price: 60, change: 0, owned: 0, history: [{ time: "0", price: 60 }] },
      { id: "def5", name: "FinanceHub", symbol: "FINH", price: 200, change: 0, owned: 0, history: [{ time: "0", price: 200 }] },
      { id: "def6", name: "AutoDrive", symbol: "AUTO", price: 95, change: 0, owned: 0, history: [{ time: "0", price: 95 }] },
    ]

    for (const stock of DEFAULT_GAME_STOCKS) {
      const stockRef = adminDb.collection("game_stocks_default").doc(stock.id)
      await stockRef.set({
        Nome: stock.name,
        Simbolo: stock.symbol,
        Preco: stock.price,
        Mudanca: stock.change,
        Possuidas: stock.owned,
        Historico: stock.history,
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "6 ações padrão foram inicializadas no Firebase",
      stocks: DEFAULT_GAME_STOCKS 
    })
  } catch (error) {
    console.error("Error initializing default stocks:", error)
    return NextResponse.json(
      { error: "Failed to initialize default stocks", code: "stocks/init-failed" },
      { status: 500 }
    )
  }
}
