"use client"

import { useEffect, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export default function BtcMonthChange() {
  const [change, setChange] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://economia.awesomeapi.com.br/json/daily/BTC-BRL/30")
        if (!res.ok) throw new Error("Resposta não OK")
        const data = await res.json()

        if (!Array.isArray(data) || data.length === 0) {
          setError("Sem dados retornados")
          return
        }

        const latest = parseFloat(data[0].bid)
        const oldest = parseFloat(data[data.length - 1].bid)

        if (isNaN(latest) || isNaN(oldest)) {
          setError("Dados inválidos")
          return
        }

        const percentChange = ((latest - oldest) / oldest) * 100
        setChange(percentChange)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000) // atualiza a cada 15s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="select-none">
      {change !== null && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              className={`cursor-pointer transition-colors ${
                change >= 0
                  ? "text-green-500 hover:text-green-400"
                  : "text-red-500 hover:text-red-400"
              }`}
            >
              {change.toFixed(2)}%
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            className="w-[360px] h-[400px] p-0"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <TradingViewWidget />
          </PopoverContent>
        </Popover>
      )}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}

function TradingViewWidget() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: "BINANCE:BTCBRL",
      width: "100%",
      height: "100%",
      locale: "br",
      dateRange: "1M",
      colorTheme: "dark",
      trendLineColor: "#2c67c0ff",
      underLineColor: "rgba(28, 92, 175, 0.15)",
      isTransparent: false,
    })

    const container = document.getElementById("tradingview-btc-widget")
    container?.appendChild(script)

    return () => {
      container?.replaceChildren()
    }
  }, [])

  return (
    <div
      id="tradingview-btc-widget"
      className="h-full w-full rounded-lg overflow-hidden"
    />
  )
}
