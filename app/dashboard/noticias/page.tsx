"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PrivateRoute } from "@/components/PrivateRoute"
import { NewsTable } from "@/components/news-table"
import { NewsLive } from "@/components/news-live"
import type { NewsItem, NewsResponse } from "@/types/news"

export default function NoticiasPage() {
  return (
    <PrivateRoute>
      <NoticiasPageContent />
    </PrivateRoute>
  )
}

function NoticiasPageContent() {
	const [items, setItems] = React.useState<NewsItem[]>([])
	const [loading, setLoading] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

	const fetchNews = React.useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const res = await fetch("/api/noticias", { cache: "no-store" })
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const data: NewsResponse = await res.json()
			setItems(data.items ?? [])
			setLastUpdated(new Date())
		} catch (e: any) {
			setError(e?.message ?? "Erro desconhecido")
		} finally {
			setLoading(false)
		}
	}, [])

	React.useEffect(() => {
		// Carrega imediatamente
		fetchNews()
		// Atualiza de 60 em 60 segundos
		const id = setInterval(fetchNews, 60_000)
		return () => clearInterval(id)
	}, [fetchNews])

	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col p-4 gap-4">
					{/* Live stream above the table */}
					<NewsLive />
					<div>
						<h1 className="text-xl font-semibold">Notícias de Mercado</h1>
						<p className="text-sm text-muted-foreground">
							Feed agregado do Google News (Negócios) — atualiza a cada 1 minuto.
						</p>
					</div>
							
					<NewsTable
						items={items}
						loading={loading}
						error={error}
						onRefresh={fetchNews}
						lastUpdated={lastUpdated}
					/>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

