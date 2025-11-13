"use client"

import * as React from "react"

declare global {
  interface Window {
    TradingView?: any
  }
}

type TVChartProps = {
  symbol?: string
  interval?: string
  locale?: string
  timezone?: string
  className?: string
}

export function TradingViewAdvancedChart({
  symbol = "BMFBOVESPA:IBOV",
  interval = "60",
  locale = "br",
  timezone = "America/Sao_Paulo",
  className,
}: TVChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId().replace(/:/g, "")

  React.useEffect(() => {
    let canceled = false

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.TradingView) return resolve()
        const script = document.createElement("script")
        script.src = "https://s3.tradingview.com/tv.js"
        script.async = true
        script.onload = () => resolve()
        document.head.appendChild(script)
      })

    const init = async () => {
      await ensureScript()
      if (canceled) return
      if (!containerRef.current) return

  // Force dark theme and blue-accented overrides to match site
  const theme = "dark"

      // Clear previous widget if any
      containerRef.current.innerHTML = ""

      // Create container for TV widget
      const inner = document.createElement("div")
      inner.id = `tradingview_${id}`
      inner.style.height = "100%"
      inner.style.width = "100%"
      containerRef.current.appendChild(inner)

      // Instantiate widget
      // eslint-disable-next-line new-cap
      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone,
        theme,
        style: "1", // 1=candles
        locale,
        hide_top_toolbar: false,
        hide_legend: false,
        enable_publishing: false,
        withdateranges: true,
        container_id: inner.id,
        overrides: {
          // Background and grid
          "paneProperties.background": "#0b1220",
          "paneProperties.backgroundType": "solid",
          "paneProperties.vertGridProperties.color": "#1f2a44",
          "paneProperties.horzGridProperties.color": "#1f2a44",
          "scalesProperties.textColor": "#93c5fd", // blue-300
          // Blue accents for series borders/wicks
          "mainSeriesProperties.candleStyle.borderUpColor": "#3b82f6", // blue-500
          "mainSeriesProperties.candleStyle.borderDownColor": "#60a5fa", // blue-400
          "mainSeriesProperties.candleStyle.wickUpColor": "#3b82f6",
          "mainSeriesProperties.candleStyle.wickDownColor": "#60a5fa",
          // Watermark subtle
          "symbolWatermarkProperties.color": "rgba(59,130,246,0.05)",
        },
        loading_screen: {
          backgroundColor: "#0b1220",
          foregroundColor: "#3b82f6",
        },
      })
    }

    init()
    return () => {
      canceled = true
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [symbol, interval, locale, timezone, id])

  return (
    <div
      ref={containerRef}
      className={"w-full h-[90vh] " + (className ?? "")}
    />
  )
}
