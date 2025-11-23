"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrivateRoute } from "@/components/PrivateRoute"
import { TradingGame } from "@/components/trading-game/TradingGame"

export default function TradingPage() {
  return (
    <PrivateRoute>
      <TradingPageContent />
    </PrivateRoute>
  )
}

function TradingPageContent() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trading</h1>
            <p className="text-sm text-muted-foreground">
              Um simulador simples para comprar e vender ações em tempo real.
            </p>
          </div>

          <TradingGame />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
