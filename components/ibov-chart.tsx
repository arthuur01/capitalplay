"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Candle = { time: number; close: number | null }

const chartConfig = {
  close: {
    label: "Fechamento",
    theme: {
      light: "hsl(217 91% 60%)",
      dark: "hsl(217 91% 60%)",
    },
  },
} satisfies ChartConfig

const ranges = [
  { id: "1d", label: "1D", interval: "15m" },
  { id: "5d", label: "5D", interval: "15m" },
  { id: "1m", label: "1M", interval: "1h" },
  { id: "3m", label: "3M", interval: "1d" },
  { id: "1y", label: "1A", interval: "1d" },
]

export function IbovChart() {
  const [data, setData] = React.useState<Candle[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [range, setRange] = React.useState<string>("5d")
  const [symbol, setSymbol] = React.useState<string>("^BVSP")

  const indices: { value: string; label: string }[] = [
    { value: "^BVSP", label: "IBOVESPA" },
    { value: "^GSPC", label: "S&P 500" },
    { value: "^IXIC", label: "NASDAQ" },
    { value: "^DJI", label: "DOW JONES" },
    { value: "^FTSE", label: "FTSE 100" },
    { value: "^N225", label: "NIKKEI 225" },
  ]

  const selectedIndex = React.useMemo(
    () => indices.find((i) => i.value === symbol) || indices[0],
    [symbol]
  )

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const selected = ranges.find((r) => r.id === range) || ranges[1]
      const params = new URLSearchParams({
        range: selected.id,
        interval: selected.interval,
        symbol,
      })
      const res = await fetch(`/api/ibov?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const candles: Candle[] = (json?.candles || []).filter((c: Candle) =>
        Number.isFinite(c?.time)
      )
      setData(candles)
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [range, symbol])

  React.useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 60_000)
    return () => clearInterval(id)
  }, [fetchData])

  const formatted = React.useMemo(
    () =>
      data.map((d) => ({
        t: d.time,
        close: d.close ?? undefined,
      })),
    [data]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div>
            <CardTitle>{selectedIndex.label}</CardTitle>
            <CardDescription>Fechamento recente (Yahoo Finance)</CardDescription>
          </div>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="h-8 px-2.5">
              <SelectValue placeholder="Selecione o índice" />
            </SelectTrigger>
            <SelectContent align="end">
              {indices.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v)}
          variant="outline"
          className="hidden sm:flex"
        >
          {ranges.map((r) => (
            <ToggleGroupItem key={r.id} value={r.id} className="h-8 px-2.5">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm text-muted-foreground">Carregando…</span>
            </div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          ) : (
            <AreaChart data={formatted} margin={{ left: 12, right: 12 }}>
              <defs>
                <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-close)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-close)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return range === "1d" || range === "5d"
                    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                    : d.toLocaleDateString("pt-BR")
                }}
                minTickGap={24}
              />
              <YAxis
                dataKey="close"
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) => (v ? v.toLocaleString("pt-BR") : "")}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--color-close)"
                fill="url(#fillClose)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
