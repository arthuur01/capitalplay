"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from "firebase/auth"
import { Meta } from "../data/schema"
import { format } from "date-fns"

interface EditMetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meta: Meta
  user?: User
  onRefresh?: () => void
}

export function EditMetaDialog({ open, onOpenChange, meta, user, onRefresh }: EditMetaDialogProps) {
  const [titulo, setTitulo] = useState(meta.Titulo)
  const [valorMeta, setValorMeta] = useState(meta.Valor_meta.toString())
  const [status, setStatus] = useState(meta.Status || false)
  
  // Format dates for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return ""
    try {
      return new Date(dateStr).toISOString().split('T')[0]
    } catch {
      return ""
    }
  }

  const [dataInicial, setDataInicial] = useState(formatDateForInput(meta.Data_inicial))
  const [dataFinal, setDataFinal] = useState(formatDateForInput(meta.Data_final))
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const token = await user.getIdToken()
      
      const res = await fetch(`/api/metas?userId=${user.uid}&taskId=${meta.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Titulo: titulo,
          Valor_meta: parseFloat(valorMeta),
          Status: status,
          Data_inicial: dataInicial ? new Date(dataInicial).toISOString() : null,
          Data_final: dataFinal ? new Date(dataFinal).toISOString() : null,
        })
      })

      if (res.ok) {
        onRefresh?.()
        onOpenChange(false)
      } else {
        console.error("Failed to update meta")
      }
    } catch (error) {
      console.error("Error updating meta:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Meta Financeira</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da sua meta financeira.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Comprar Carro"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-valor">Valor da Meta (R$)</Label>
              <Input
                id="edit-valor"
                type="number"
                step="0.01"
                value={valorMeta}
                onChange={(e) => setValorMeta(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-status" 
                checked={status} 
                onCheckedChange={(c) => setStatus(!!c)} 
              />
              <Label htmlFor="edit-status">Concluído</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dataInicial">Data Inicial</Label>
                <Input
                  id="edit-dataInicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dataFinal">Data Final</Label>
                <Input
                  id="edit-dataFinal"
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
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
