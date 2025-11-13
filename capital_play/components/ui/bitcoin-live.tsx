"use client"
import { useState, useEffect } from "react"

interface BtcPollProps {
  vs?: string
  intervalMs?: number
}

export default function BtcPoll({ vs = "brl", intervalMs = 10000 }: BtcPollProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrice = () => {
    setError(null)
    setLoading(true)

    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${vs}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Resposta não OK")
        return res.json()
      })
      .then((data) => {
        const newPrice = data.bitcoin?.[vs.toLowerCase()]
        if (typeof newPrice === "number") {
          setPrice(newPrice)
        } else {
          setError("Formato inesperado da resposta da API")
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, intervalMs)
    return () => clearInterval(id)
  }, [vs, intervalMs])

  return (
    <div>
      {error && <div style={{ color: "red" }}>Erro: {error}</div>}
      {price !== null && (
        <div style={{ fontSize: 20 }}>
          {price.toLocaleString("pt-BR", {
            style: "currency",
            currency: vs.toUpperCase(),
          })}
        </div>
      )}
    </div>
  )
}
