"use client"

import * as React from "react"

type MarketOverviewProps = {
  locale?: string
  className?: string
}

export function TradingViewMarketOverview({ locale = "br", className }: MarketOverviewProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    // Force dark theme to match site
    const theme = "dark"
    const el = ref.current
    el.innerHTML = ""

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
          symbols: [
            { s: "BMFBOVESPA:IBOV" },
            { s: "BMFBOVESPA:SMLL" },
            { s: "SP:SPX" },
            { s: "TVC:DXY" },
            { s: "DJ:DJI" },
          ],
        },
        {
          title: "Ações",
          symbols: [
            { s: "BMFBOVESPA:PETR4" },
            { s: "BMFBOVESPA:ITSA4" },
            { s: "BMFBOVESPA:VALE3" },
            { s: "BMFBOVESPA:MGLU3" },
          ],
        },
        {
          title: "Cripto",
          symbols: [
            { s: "CRYPTO:BTCUSD" },
            { s: "CRYPTO:ETHUSD" },
          ],
        },
      ],
    }
    script.innerHTML = JSON.stringify(config)
    el.appendChild(script)

    // Re-init on theme toggle could be added with MutationObserver; omitted for brevity
  }, [locale])

  return (
    <div className={"h-[60vh] w-full overflow-hidden " + (className ?? "")}>
      <div ref={ref} className="h-full w-full" />
    </div>
  )
}
