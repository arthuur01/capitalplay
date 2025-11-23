"use client"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartLine, Bitcoin, DollarSign, Euro, Banknote } from "lucide-react"

interface CurrencyCardProps {
  pair: string; // e.g. "USD-BRL"
  name: string; // e.g. "Dólar"
  intervalMs?: number;
}

export function CurrencyCard({ pair, name, intervalMs = 15000 }: CurrencyCardProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number | null>(null)
  const [showChart, setShowChart] = useState(false)
  const chartRef = useRef<HTMLDivElement | null>(null)

  // Fetch Live Price
  useEffect(() => {
    const fetchPrice = () => {
      fetch(`https://economia.awesomeapi.com.br/json/last/${pair}`)
        .then(res => res.json())
        .then(data => {
          const key = pair.replace("-", "")
          const obj = data[key]
          if (obj && obj.bid) {
            setPrice(parseFloat(obj.bid))
          }
        })
        .catch(err => console.error(err))
    }
    fetchPrice()
    const id = setInterval(fetchPrice, intervalMs)
    return () => clearInterval(id)
  }, [pair, intervalMs])

  // Fetch Monthly Change
  useEffect(() => {
    const fetchHistory = () => {
      fetch(`https://economia.awesomeapi.com.br/json/daily/${pair}/30`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const latest = parseFloat(data[0].bid)
            const oldest = parseFloat(data[data.length - 1].bid)
            if (!isNaN(latest) && !isNaN(oldest)) {
              setChange(((latest - oldest) / oldest) * 100)
            }
          }
        })
        .catch(err => console.error(err))
    }
    fetchHistory()
    const id = setInterval(fetchHistory, 60 * 60 * 1000) 
    return () => clearInterval(id)
  }, [pair])

  // Load TradingView widget when chart should show
  useEffect(() => {
    if (showChart && chartRef.current) {
      chartRef.current.innerHTML = ""
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
      script.type = "text/javascript"
      script.async = true
      script.innerHTML = JSON.stringify({
        symbol: mapPairToTradingViewSymbol(),
        chartOnly: false,
        dateRange: "1M",
        noTimeScale: false,
        colorTheme: "dark",
        isTransparent: false,
        locale: "br",
        width: "100%",
        autosize: true,
        height: "100%",
      })
      chartRef.current.appendChild(script)
    }
  }, [showChart])

  const getIcon = () => {
    if (pair.includes("BTC")) return <Bitcoin className="size-4" />
    if (pair.includes("USD")) return <DollarSign className="size-4" />
    if (pair.includes("EUR")) return <Euro className="size-4" />
    return <Banknote className="size-4" />
  }

  const mapPairToTradingViewSymbol = () => {
    // Basic mapping for common pairs; extend as needed
    if (pair === "USD-BRL") return "FX_IDC:USDBRL"
    if (pair === "EUR-BRL") return "FX_IDC:EURBRL"
    if (pair === "BTC-BRL") return "BINANCE:BTCBRL"
    if (pair === "XAU-BRL") return "TVC:GOLD" // Gold reference; BRL conversion not direct
    // Fallback: try removing dash and assume FX_IDC prefix
    return `FX_IDC:${pair.replace("-", "")}`
  }

  const tradingViewSymbol = mapPairToTradingViewSymbol()

  const colorMap: Record<string, { trend: string; under: string }> = {
    BTC: { trend: '#f7931aff', under: 'rgba(247,147,26,0.15)' },
    USD: { trend: '#2c67c0ff', under: 'rgba(28,92,175,0.15)' },
    EUR: { trend: '#6f42c1ff', under: 'rgba(111,66,193,0.15)' },
    XAU: { trend: '#c9a227ff', under: 'rgba(201,162,39,0.15)' },
  }

  const baseKey = Object.keys(colorMap).find(k => pair.startsWith(k)) || 'USD'
  const trendColor = colorMap[baseKey].trend
  const underColor = colorMap[baseKey].under

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Cotação {name}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {price !== null ? formatCurrency(price) : "..."}
        </CardTitle>
        {change !== null && (
          <div className="absolute right-4 top-4">
            <div
              onMouseEnter={() => setShowChart(true)}
              onMouseLeave={() => setShowChart(false)}
              className="relative"
            >
              <Badge
                variant="outline"
                className={`flex gap-1 rounded-lg text-xs cursor-pointer ${change >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                <ChartLine className="size-3" />
                {change.toFixed(2)}%
              </Badge>
              {showChart && (
                <div className="absolute right-0 top-full mt-2 w-80 h-48 bg-background border rounded-lg shadow-lg z-50">
                  <div ref={chartRef} className="w-full h-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          BRL - {name} {getIcon()}
        </div>
        <div className="text-muted-foreground">
          Porcentagem dos últimos 30 dias.
        </div>
      </CardFooter>
    </Card>
  )
}
