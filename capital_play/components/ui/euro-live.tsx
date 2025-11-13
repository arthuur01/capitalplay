"use client"
import { useState, useEffect } from "react"

interface EurToRealProps {
  intervalMs?: number
}

export default function EurToReal({ intervalMs = 10000 }: EurToRealProps) {
  const [brl, setBrl] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRate = () => {
    setError(null)

    fetch("https://economia.awesomeapi.com.br/json/last/EUR-BRL")
      .then(res => {
        if (!res.ok) throw new Error("Resposta não OK")
        return res.json()
      })
      .then(data => {
        const key = "EURBRL"
        const obj = data[key]
        if (obj && typeof obj.bid === "string") {
          const value = parseFloat(obj.bid)
          if (!isNaN(value)) {
            setBrl(value)
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
    fetchRate()
    const id = setInterval(fetchRate, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return (
    <div>
      {error && <div style={{ color: "red" }}>Erro: {error}</div>}
      {brl !== null && (
        <div style={{ fontSize: 24 }}>
          {brl.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </div>
      )}
    </div>
  )
}
