"use client"
import { useState, useEffect } from "react"

interface GoldToRealProps {
  intervalMs?: number
}

export default function GoldToReal({ intervalMs = 10000 }: GoldToRealProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPrice = () => {
    setError(null)

    // Endpoint oficial da AwesomeAPI para Ouro (XAU → BRL)
    fetch("https://economia.awesomeapi.com.br/json/last/XAU-BRL")
      .then(res => {
        if (!res.ok) throw new Error("Resposta não OK")
        return res.json()
      })
      .then(data => {
        const key = "XAUBRL"
        const obj = data[key]

        if (obj && typeof obj.bid === "string") {
          const value = parseFloat(obj.bid)
          if (!isNaN(value)) {
            setPrice(value)
          } else {
            setError("Valor inválido retornado pela API")
          }
        } else {
          setError("Formato inesperado da resposta da API")
        }
      })
      .catch(err => {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      })
  }

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return (
    <div>
      {error && <div style={{ color: "red" }}>Erro: {error}</div>}
      {price !== null && (
        <div style={{ fontSize: 24 }}>
          {price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      )}
    </div>
  )
}
