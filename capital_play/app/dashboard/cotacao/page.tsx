"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FxChart } from "@/components/fx-chart"

export default function CotacaoPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cotação de Moedas</h1>
            <p className="text-sm text-muted-foreground">
              Selecione duas moedas e um período para visualizar o histórico.
            </p>
          </div>

          <FxChart />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}