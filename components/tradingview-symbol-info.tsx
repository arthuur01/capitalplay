"use client"

import * as React from "react"

type SymbolInfoProps = {
  symbol?: string
  locale?: string
  className?: string
}

export function TradingViewSymbolInfo({
  symbol = "BMFBOVESPA:IBOV",
  locale = "br",
  className,
}: SymbolInfoProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!ref.current) return
    // Force dark theme
    const theme = "dark"
    const el = ref.current
    el.innerHTML = ""
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
    script.async = true
    const config = {
      symbol,
      locale,
      colorTheme: theme,
      isTransparent: false,
      width: "100%",
      height: 250,
      showIntervalTabs: true,
      showCurrency: true,
    }
    script.innerHTML = JSON.stringify(config)
    el.appendChild(script)
  }, [symbol, locale])

  return (
    <div className={"w-full overflow-hidden " + (className ?? "")}>
      <div ref={ref} className="w-full" />
    </div>
  )
}
