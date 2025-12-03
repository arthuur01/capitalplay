"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "firebase/auth"

interface AddMetaDialogProps {
  user?: User
  onSuccess?: () => void
}

export function AddMetaDialog({ user, onSuccess }: AddMetaDialogProps) {
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [valorMeta, setValorMeta] = useState("")
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const token = await user.getIdToken()
      
      const res = await fetch(`/api/metas?userId=${user.uid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Titulo: titulo,
          Valor_meta: parseFloat(valorMeta),
          Data_inicial: dataInicial ? new Date(dataInicial).toISOString() : null,
          Data_final: dataFinal ? new Date(dataFinal).toISOString() : null,
        })
      })

      if (res.ok) {
        setTitulo("")
        setValorMeta("")
        setDataInicial("")
        setDataFinal("")
        setOpen(false)
        onSuccess?.()
      } else {
        console.error("Failed to create meta")
      }
    } catch (error) {
      console.error("Error creating meta:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Meta Financeira</DialogTitle>
            <DialogDescription>
              Crie uma nova meta financeira para acompanhar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Lucro de 20%"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor da Meta (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataInicial">Data Inicial</Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataFinal">Data Final</Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
