"use client"

import * as React from "react"

type MarketOverviewProps = {
  locale?: string
  className?: string
}

interface ExchangeSymbol {
  symbol: string;
  category: string;
}

export function TradingViewMarketOverview({ locale = "br", className }: MarketOverviewProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [customSymbols, setCustomSymbols] = React.useState<ExchangeSymbol[]>([])

  React.useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetch("/api/admin/exchanges");
        if (res.ok) {
          const data = await res.json();
          setCustomSymbols(data);
        }
      } catch (error) {
        console.error("Error fetching custom symbols:", error)
      }
    }
    fetchSymbols()
  }, [])

  React.useEffect(() => {
    if (!ref.current) return

    // Force dark theme to match site
    const theme = "dark"
    const el = ref.current
    el.innerHTML = ""

    // Filter custom symbols by category
    const indices = customSymbols.filter(s => s.category === "Índices").map(s => ({ s: s.symbol }))
    const stocks = customSymbols.filter(s => s.category === "Ações").map(s => ({ s: s.symbol }))
    const crypto = customSymbols.filter(s => s.category === "Cripto").map(s => ({ s: s.symbol }))

    // If no data, use defaults just to show something (fallback)
    const finalIndices = indices.length > 0 ? indices : [
      { s: "BMFBOVESPA:IBOV" },
      { s: "BMFBOVESPA:SMLL" },
      { s: "SP:SPX" },
      { s: "TVC:DXY" },
      { s: "DJ:DJI" },
    ]

    const finalStocks = stocks.length > 0 ? stocks : [
      { s: "BMFBOVESPA:PETR4" },
      { s: "BMFBOVESPA:ITSA4" },
      { s: "BMFBOVESPA:VALE3" },
      { s: "BMFBOVESPA:MGLU3" },
    ]

    const finalCrypto = crypto.length > 0 ? crypto : [
      { s: "CRYPTO:BTCUSD" },
      { s: "CRYPTO:ETHUSD" },
    ]

    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
    script.async = true
    const config = {
      colorTheme: theme,
      dateRange: "12M",
      showChart: true,
      locale,
      width: "100%",
      height: "100%",
      isTransparent: false,
      showSymbolLogo: true,
      tabs: [
        {
          title: "Índices",
          symbols: finalIndices,
        },
        {
          title: "Ações",
          symbols: finalStocks,
        },
        {
          title: "Cripto",
          symbols: finalCrypto,
        },
      ],
    }
    script.innerHTML = JSON.stringify(config)
    el.appendChild(script)

  }, [locale, customSymbols])

  return (
    <div className={"h-[60vh] w-full overflow-hidden " + (className ?? "")}>
      <div ref={ref} className="h-full w-full" />
    </div>
  )
}
