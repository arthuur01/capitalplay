import { NextResponse } from "next/server"

// Cache for 30 minutes
export const revalidate = 1800

type RangeKey = "30d" | "6m" | "1y"

function computeDates(range: RangeKey): { start: string; end: string } {
  const endDate = new Date()
  const end = endDate.toISOString().slice(0, 10)
  const d = new Date(endDate)
  if (range === "30d") d.setDate(d.getDate() - 30)
  else if (range === "6m") d.setMonth(d.getMonth() - 6)
  else d.setFullYear(d.getFullYear() - 1)
  const start = d.toISOString().slice(0, 10)
  return { start, end }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const base = (searchParams.get("base") || "USD").toUpperCase()
    const quote = (searchParams.get("quote") || "EUR").toUpperCase()
    const range = (searchParams.get("range") || "30d").toLowerCase() as RangeKey

    const { start, end } = computeDates(range)

    // Frankfurter.app timeseries: https://www.frankfurter.app/docs/
    const url = `https://api.frankfurter.app/${start}..${end}?from=${base}&to=${quote}`
    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) throw new Error(`Upstream ${res.status}`)
    const json = await res.json()

    // Map to consistent timeseries
    const rates = json?.rates || {}
    const candles = Object.keys(rates)
      .sort()
      .map((date) => ({
        time: new Date(date).getTime(),
        rate: typeof rates[date]?.[quote] === "number" ? rates[date][quote] : null,
      }))

    return NextResponse.json({ base, quote, range, start, end, candles })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch FX data" },
      { status: 500 }
    )
  }
}
