"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

type Props = {
  onAdded?: () => void;
};

export default function AddStockDialog({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [Nome, setNome] = useState("");
  const [Simbolo, setSimbolo] = useState("");
  const [Preco, setPreco] = useState("");

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
      const stockId = uuidv4();
      const token = await user.getIdToken();
      
      const res = await fetch(`/api/stocks?userId=${user.uid}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          stockId,
          Nome,
          Simbolo,
          Preco: parseFloat(Preco),
        }),
      });

      if (!res.ok) throw new Error("Failed to add stock");
      toast.success(`Ação ${Simbolo} criada com sucesso`);
      if (onAdded) onAdded();
      setOpen(false);
      setNome("");
      setSimbolo("");
      setPreco("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar ação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova ação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar nova ação</DialogTitle>
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
            <Label htmlFor="preco">Preço inicial (R$)</Label>
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
            {loading ? "Criando..." : "Criar ação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
