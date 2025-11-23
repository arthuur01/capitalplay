"use client"

import { useEffect, useState } from "react"
import { CurrencyCard } from "@/components/ui/currency-card"

interface DashboardCurrency {
  id: string;
  pair: string;
  name: string;
}

export function SectionCards() {
  const [currencies, setCurrencies] = useState<DashboardCurrency[]>([])

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("/api/admin/currencies")
        if (res.ok) {
          const data = await res.json()
          setCurrencies(data)
        }
      } catch (error) {
        console.error("Error fetching currencies:", error)
      }
    }
    fetchCurrencies()
  }, [])

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {currencies.map((currency) => (
        <CurrencyCard 
          key={currency.id} 
          pair={currency.pair} 
          name={currency.name} 
        />
      ))}
    </div>
  )
}
