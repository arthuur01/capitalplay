"use client";

import { useEffect, useState, Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Card } from "@/components/ui/card";
import { IbovChart } from "@/components/ibov-chart";
import { NewsTable } from "@/components/news-table";
import { PrivateRoute } from "@/components/PrivateRoute";
import type { NewsItem, NewsResponse } from "@/types/news";



// Função para verificar se o mercado está aberto (horário de NY)

// Componente interno que usa searchParams de forma síncrona


// Página principal
export default function Page() {
  return (
    <PrivateRoute>
      <DashboardContent />
    </PrivateRoute>
  );
}

function DashboardContent() {
  // Estado de notícias para exibir tabela abaixo do gráfico
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/noticias", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NewsResponse = await res.json();
        if (!mounted) return;
        setItems(data.items ?? []);
        setLastUpdated(new Date());
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Erro desconhecido");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    run();
    const id = setInterval(run, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-2 md:p-4">
            <SectionCards />
            {/* Gráfico */}
            <IbovChart />
            {/* Notícias abaixo do gráfico com container rolável */}
            <div>
              <div className="mb-2">
                <h2 className="text-xl font-semibold">Notícias de Mercado</h2>
                <p className="text-sm text-muted-foreground">
                  Feed agregado do Google News (Negócios) — atualiza a cada 1 minuto.
                </p>
              </div>
              <div className="max-h-[360px] overflow-y-auto pr-1">
                <NewsTable
                  items={items}
                  loading={loading}
                  error={error}
                  onRefresh={() => {
                    // acionando atualização manual
                    fetch("/api/noticias", { cache: "no-store" })
                      .then(async (res) => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data: NewsResponse = await res.json();
                        setItems(data.items ?? []);
                        setLastUpdated(new Date());
                      })
                      .catch((e) => setError(e?.message ?? "Erro desconhecido"));
                  }}
                  lastUpdated={lastUpdated}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}