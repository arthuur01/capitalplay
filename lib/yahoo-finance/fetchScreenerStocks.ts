import { unstable_noStore as noStore } from "next/cache"
import type {
  ScreenerOptions,
  PredefinedScreenerModules,
  ScreenerResult,
} from "yahoo-finance2/modules/screener"
import yahooFinance from "@/lib/yahoo-finance/client"

const ITEMS_PER_PAGE = 40

export async function fetchScreenerStocks(query: string, count?: number) {
  noStore()

  // PAGINATION IS HANDLED BY TENSTACK TABLE

  const queryOptions: ScreenerOptions = {
    scrIds: query as PredefinedScreenerModules,
    count: count ? count : ITEMS_PER_PAGE,
    region: "US",
    lang: "en-US",
  }

  try {
    const response = await yahooFinance.screener(queryOptions, undefined, {
      validateResult: false,
    }) as ScreenerResult

    return response
  } catch (error) {
    console.log("Failed to fetch screener stocks", error)
    throw new Error("Failed to fetch screener stocks.")
  }
}
