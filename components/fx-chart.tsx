"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type Candle = { time: number; rate: number | null }

const chartConfig = {
  rate: {
    label: "Taxa",
    theme: {
      light: "hsl(217 91% 60%)",
      dark: "hsl(217 91% 60%)",
    },
  },
} satisfies ChartConfig

const ranges = [
  { id: "30d", label: "30D" },
  { id: "6m", label: "6M" },
  { id: "1y", label: "1A" },
]

const CURRENCIES = [
  "USD",
  "EUR",
  "BRL",
  "GBP",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "ARS",
]

export function FxChart() {
  const [base, setBase] = React.useState("USD")
  const [quote, setQuote] = React.useState("EUR")
  const [range, setRange] = React.useState("30d")
  const [data, setData] = React.useState<Candle[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ base, quote, range })
      const res = await fetch(`/api/fx?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const candles: Candle[] = (json?.candles || []).filter((c: Candle) =>
        Number.isFinite(c?.time)
      )
      setData(candles)
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar cotações")
    } finally {
      setLoading(false)
    }
  }, [base, quote, range])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatted = React.useMemo(() => data.map((d) => ({ t: d.time, rate: d.rate ?? undefined })), [data])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Gráfico de Moedas</CardTitle>
          <CardDescription>
            {base}/{quote} — período: {ranges.find((r) => r.id === range)?.label}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={base} onValueChange={(v) => setBase(v)}>
            <SelectTrigger size="sm" className="h-8 min-w-24 px-2.5">
              <SelectValue placeholder="Base" />
            </SelectTrigger>
            <SelectContent align="end">
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground text-sm">/</span>

          <Select value={quote} onValueChange={(v) => setQuote(v)}>
            <SelectTrigger size="sm" className="h-8 min-w-24 px-2.5">
              <SelectValue placeholder="Cotação" />
            </SelectTrigger>
            <SelectContent align="end">
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v)}
            variant="outline"
            className="hidden sm:flex ml-2"
          >
            {ranges.map((r) => (
              <ToggleGroupItem key={r.id} value={r.id} className="h-8 px-2.5">
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
          {loading ? (
            <div className="flex h-[360px] w-full items-center justify-center">
              <span className="text-sm text-muted-foreground">Carregando…</span>
            </div>
          ) : error ? (
            <div className="flex h-[360px] w-full items-center justify-center">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={formatted} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-rate)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-rate)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("pt-BR")}
                />
                <YAxis
                  dataKey="rate"
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-rate)"
                  fill="url(#fillRate)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
