export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  publishedAt: string // ISO string
}

export interface NewsResponse {
  items: NewsItem[]
}
