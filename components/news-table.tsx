"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewsItem } from "@/types/news"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NewsTableProps {
  items: NewsItem[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  lastUpdated?: Date | null
}

export function NewsTable({ items, loading, error, onRefresh, lastUpdated }: NewsTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastUpdated ? (
            <span>Atualizado: {lastUpdated.toLocaleTimeString()}</span>
          ) : (
            <span>Nenhum carregamento ainda</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={loading}>
            {loading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </div>
      <div className={cn("border rounded-md text-lg", loading && "animate-pulse")}> 
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 text-base md:text-lg">Título</TableHead>
              <TableHead className="hidden h-10 text-base md:text-lg md:table-cell">Fonte</TableHead>
              <TableHead className="hidden h-10 text-base md:text-lg md:table-cell">
                Publicação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={3} className="py-2.5 text-red-600">
                  Erro: {error}
                </TableCell>
              </TableRow>
            )}
            {loading &&
              items.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="opacity-70">
                  <TableCell colSpan={3} className="py-2.5">
                    <div className="h-5 w-full rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && items.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={3} className="py-2.5 text-muted-foreground">
                  Sem notícias no momento.
                </TableCell>
              </TableRow>
            )}
            {items.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="py-2.5 font-medium">
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {n.title}
                  </a>
                </TableCell>
                <TableCell className="hidden py-2.5 md:table-cell">
                  {n.source}
                </TableCell>
                <TableCell className="hidden py-2.5 md:table-cell">
                  {new Date(n.publishedAt).toLocaleString("pt-BR", {
                    hour12: false,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Atualização automática a cada 60s.</p>
    </div>
  )
}
