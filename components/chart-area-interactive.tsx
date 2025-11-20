"use client"

import * as React from "react"
// Componentes UI importados do seu diretório "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
// Um hook personalizado
import { useIsMobile } from "@/hooks/use-mobile" 

/**
 * Componente que exibe o gráfico do IBOVESPA interativo.
 * Ele carrega o widget 'Mini Symbol Overview' do TradingView
 * e permite a troca de período (7d, 30d, 90d).
 */
export function ChartAreaInteractive() {
  // Hook para verificar se o usuário está em um dispositivo móvel (não usado diretamente no JSX atual)
  const isMobile = useIsMobile() 
  // Estado para armazenar o período de tempo selecionado (padrão: 30 dias)
  const [timeRange, setTimeRange] = React.useState("30d")

  // Efeito colateral para carregar e atualizar o widget do TradingView
  React.useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js"
    script.async = true
    
    // Objeto de configuração para o widget
    script.innerHTML = JSON.stringify({
      // Símbolo do IBOVESPA na B3
      symbol: "IBOV", 
      width: "100%",
      height: "100%",
      locale: "br", // Configuração de idioma
      // Mapeia o estado React para o formato de período do TradingView
      dateRange:
        timeRange === "7d" ? "1W" : timeRange === "30d" ? "1M" : "3M", 
      colorTheme: "dark",
      trendLineColor: "#2563eb",
      underLineColor: "rgba(37,99,235,0.15)",
      isTransparent: true,
      autosize: true,
    })

    // Adiciona o script ao contêiner 'tv-widget-ibov'
    const container = document.getElementById("tv-widget-ibov")
    container?.replaceChildren() // Limpa o conteúdo anterior
    container?.appendChild(script)
  }, [timeRange]) // Roda novamente sempre que o período de tempo mudar

  return (
    // Card principal, usa container queries para responsividade
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>IBOVESPA</CardTitle>
        <CardDescription>
          {/* Descrição responsiva, muda com a largura do card */}
          <span className="@[540px]/card:block hidden">
            Variação do índice B3 nos últimos meses
          </span>
          <span className="@[540px]/card:hidden">Últimos meses</span>
        </CardDescription>

        {/* Toggle e Select de períodos - posicionados no canto superior direito */}
        <div className="absolute right-4 top-4">
          {/* ToggleGroup (Desktop/Tablet) - visível em telas maiores que 767px dentro do card */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              3 meses
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              30 dias
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              7 dias
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Select (Mobile) - visível em telas menores que 767px dentro do card */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">3 meses</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* Área onde o gráfico do TradingView será injetado */}
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div
          id="tv-widget-ibov" // ID usado pelo useEffect para anexar o widget
          className="w-full h-[280px] sm:h-[340px] rounded-xl overflow-hidden"
        />
      </CardContent>
    </Card>
  )
}