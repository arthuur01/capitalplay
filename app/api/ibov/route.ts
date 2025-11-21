import { NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance/client"

// Simple cache: revalidate every 60s
export const revalidate = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // Accept a symbol to allow fetching different indices; default to IBOV (^BVSP)
    const symbol = (searchParams.get("symbol") || "^BVSP").toUpperCase()
    const range = (searchParams.get("range") || "5d").toLowerCase()
    let interval = (searchParams.get("interval") || "15m").toLowerCase()

    // Compute period1 based on range
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const rangeToMs: Record<string, number> = {
      "1d": 1 * day,
      "5d": 5 * day,
      "1m": 30 * day,
      "3m": 90 * day,
      "1y": 365 * day,
    }

    const ms = rangeToMs[range] ?? rangeToMs["5d"]

    // Sensible default intervals per range if not provided
    if (!searchParams.get("interval")) {
      if (range === "1d" || range === "5d") interval = "15m"
      else if (range === "1m") interval = "1h"
      else interval = "1d" // 3m / 1y
    }

    const result = await yahooFinance.chart(symbol, {
      period1: new Date(now - ms),
      interval: interval as any,
    })

    const candles = result.quotes.map((q) => ({
      time: q.date?.getTime() || 0,
      close: q.close,
    }))

    return NextResponse.json({ symbol, range, interval, candles })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch IBOV data" },
      { status: 500 }
    )
  }
}
