import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"

// Revalidate this route every 60 seconds when deployed on Vercel
export const revalidate = 60

// Simple helper to coerce various date formats
function parseDate(input?: string): string {
  if (!input) return new Date().toISOString()
  const d = new Date(input)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function hashId(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export async function GET() {
  try {
    // Google News RSS em Português (tópico negócios). Pode ajustar a query conforme a necessidade.
    const rssUrl =
      "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419&topic=B"

    const res = await fetch(rssUrl, {
      // Deixa o cache do lado do servidor se beneficiar por 60s
      next: { revalidate: 60 },
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Falha ao obter RSS: ${res.status}` },
        { status: 502 }
      )
    }

    const xml = await res.text()
    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(xml)

    // Estrutura típica: rss.channel.item é um array
    const items = (parsed?.rss?.channel?.item ?? []) as any[]

    const news = items.map((it) => {
      const title: string = it?.title ?? ""
      const link: string = it?.link ?? ""
      const pubDate: string = parseDate(it?.pubDate)
      // Google News inclui <source> às vezes
      const source: string = it?.source?.["#text"] ?? it?.source ?? "Google News"
      return {
        id: hashId(link || title + pubDate),
        title,
        url: link,
        source,
        publishedAt: pubDate,
      }
    })

    return NextResponse.json(
      { items: news },
      {
        headers: {
          // Cache no CDN por 60s; clientes podem revalidar após 30s
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao processar feed", details: `${err?.message ?? err}` },
      { status: 500 }
    )
  }
}
