"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrivateRoute } from "@/components/PrivateRoute"
import { TradingViewAdvancedChart } from "@/components/tradingview-advanced-chart"
import { TradingViewMarketOverview } from "@/components/tradingview-market-overview"
import { TradingViewSymbolInfo } from "@/components/tradingview-symbol-info"

export default function BolsasPage() {
  return (
    <PrivateRoute>
      <BolsasPageContent />
    </PrivateRoute>
  )
}

function BolsasPageContent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_320px]">
            {/* Esquerda: Gráfico ocupando toda a área */}
            <div className="min-h-[70vh]">
              <TradingViewAdvancedChart symbol="BMFBOVESPA:IBOV" className="h-[70vh]" />
            </div>

            {/* Direita: Lista + Info IBOV, sem cards */}
            <div className="flex flex-col gap-3">
              <TradingViewMarketOverview />
              <TradingViewSymbolInfo symbol="BMFBOVESPA:IBOV" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
