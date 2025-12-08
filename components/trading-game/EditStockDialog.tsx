"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Stock {
  id: string;
  Nome: string;
  Simbolo: string;
  Preco: number;
  Mudanca: number;
  Possuidas: number;
  Historico: any[];
}

type Props = {
  stock: Stock;
  onUpdated?: () => void;
};

export default function EditStockDialog({ stock, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [Nome, setNome] = useState(stock.Nome);
  const [Simbolo, setSimbolo] = useState(stock.Simbolo);
  const [Preco, setPreco] = useState(stock.Preco.toString());

  const handleSubmit = async () => {
    try {
      if (!Nome || !Simbolo || !Preco) {
        toast.error("Preencha todos os campos");
        return;
      }

      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/stocks?stockId=${stock.id}&userId=${user.uid}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          Nome,
          Simbolo,
          Preco: parseFloat(Preco),
        }),
      });

      if (!res.ok) throw new Error("Failed to update stock");
      toast.success(`Ação ${Simbolo} atualizada com sucesso`);
      if (onUpdated) onUpdated();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar ação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar ação</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da empresa</Label>
            <Input
              id="nome"
              value={Nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: TechCorp"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="simbolo">Símbolo (ticker)</Label>
            <Input
              id="simbolo"
              value={Simbolo}
              onChange={(e) => setSimbolo(e.target.value.toUpperCase())}
              placeholder="Ex: TECH"
              maxLength={10}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={Preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 150.00"
              min="0"
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
