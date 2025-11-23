"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, RotateCcw } from "lucide-react";

interface ExchangeSymbol {
  id: string;
  symbol: string;
  category: string; // "Índices", "Ações", "Cripto"
}

export function AdminExchanges() {
  const [symbols, setSymbols] = useState<ExchangeSymbol[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [category, setCategory] = useState("Ações");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSymbols = async () => {
    try {
      const res = await fetch("/api/admin/exchanges");
      if (res.ok) {
        const data = await res.json();
        setSymbols(data);
      }
    } catch (error) {
      console.error("Error fetching exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymbols();
  }, []);

  const handleSave = async () => {
    if (!newSymbol) return;
    try {
      const payload = {
        symbol: newSymbol,
        category,
        ...(editingId ? { id: editingId } : {})
      };

      await fetch("/api/admin/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setNewSymbol("");
      setEditingId(null);
      fetchSymbols();
    } catch (error) {
      console.error("Error saving symbol:", error);
    }
  };

  const handleEdit = (item: ExchangeSymbol) => {
    setNewSymbol(item.symbol);
    setCategory(item.category);
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setNewSymbol("");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este ativo?")) return;
    try {
      await fetch(`/api/admin/exchanges?id=${id}`, {
        method: "DELETE",
      });
      fetchSymbols();
    } catch (error) {
      console.error("Error deleting symbol:", error);
    }
  };

  const handleRestoreDefaults = async () => {
    alert("Para restaurar os padrões, apague o arquivo 'data/exchanges.json' na pasta do projeto.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bolsas e Ativos (TradingView)</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrões (Info)
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Símbolo (ex: BMFBOVESPA:PETR4)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Índices">Índices</SelectItem>
              <SelectItem value="Ações">Ações</SelectItem>
              <SelectItem value="Cripto">Cripto</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave}>
            {editingId ? "Atualizar" : "Adicionar"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
          )}
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-2">
            {symbols.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded bg-secondary/10"
              >
                <div>
                  <p className="font-medium">{item.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
