import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import { newsSourcesDb } from "@/lib/local-db"

// Revalidate this route every 60 seconds 
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
    const urls: string[] = []

    try {
      const sources = await newsSourcesDb.getAll()
      sources.forEach((source) => {
        if (source.url) urls.push(source.url)
      })
    } catch (e) {
      console.error("Error fetching news sources from DB, using default", e)
    }

    if (urls.length === 0) {
       // Fallback if DB is empty or fails
       urls.push("https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419&topic=B")
    }

    const fetchRss = async (url: string) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 60 },
          headers: {
            "user-agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          },
        })
        if (!res.ok) return []
        const xml = await res.text()
        const parser = new XMLParser({ ignoreAttributes: false })
        const parsed = parser.parse(xml)
        return (parsed?.rss?.channel?.item ?? []) as any[]
      } catch (e) {
        console.error(`Error fetching RSS from ${url}`, e)
        return []
      }
    }

    const allItemsArrays = await Promise.all(urls.map(fetchRss))
    const items = allItemsArrays.flat()

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

    // Sort by date descending
    news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

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
