"use client"

import { useState } from "react"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/firebaseConfig"
import { CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddPaymentMethod() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    numeroCartao: "",
    cvc: "",
    mesValidade: "",
    anoValidade: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create a date object for the validity
      // Assuming the validity is the first day of the selected month/year
      // or maybe the last day? Usually it's just the month/year that matters.
      // The image shows a full timestamp.
      
      if (!formData.mesValidade || !formData.anoValidade) {
        toast.error("Por favor, selecione a data de validade.")
        setLoading(false)
        return
      }

      const expiryDate = new Date(
        parseInt(formData.anoValidade),
        parseInt(formData.mesValidade) - 1,
        1
      )

      await addDoc(collection(db, "metodos_pagamento"), {
        Nome: formData.nome,
        Email: formData.email,
        Numero_cartao: formData.numeroCartao,
        Cvc: parseInt(formData.cvc) || 0,
        Data_validade: Timestamp.fromDate(expiryDate),
        created_at: Timestamp.now(),
      })

      toast.success("Método de pagamento adicionado com sucesso!")
      
      // Reset form
      setFormData({
        nome: "",
        email: "",
        numeroCartao: "",
        cvc: "",
        mesValidade: "",
        anoValidade: "",
      })
    } catch (error) {
      console.error("Erro ao adicionar método de pagamento:", error)

    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString())
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Adicionar Cartão de Crédito</CardTitle>
        <CardDescription>
          Insira os detalhes do seu cartão para adicionar um novo método de pagamento.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Digite o nome completo escrito no cartão"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numeroCartao">Número do Cartão</Label>
            <div className="relative">
              <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="numeroCartao"
                placeholder="0000 0000 0000 0000"
                className="pl-9"
                value={formData.numeroCartao}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="grid gap-2 col-span-2">
              <Label>Validade</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.mesValidade}
                  onValueChange={(val) => handleSelectChange("mesValidade", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.anoValidade}
                  onValueChange={(val) => handleSelectChange("anoValidade", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                maxLength={4}
                value={formData.cvc}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <CardFooter >
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-5 w-4 animate-spin" />}
            Adicionar Cartão
          </Button>
        </CardFooter>
        </CardContent>
        
      </form>
    </Card>
  )
}
