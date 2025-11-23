"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, RotateCcw } from "lucide-react";

interface GameStock {
  id: string;
  name: string;
  symbol: string;
  price: number;
}

export function AdminTradingStocks() {
  const [stocks, setStocks] = useState<GameStock[]>([]);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/admin/stocks");
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleSave = async () => {
    if (!name || !symbol || !price) return;
    try {
      const payload = {
        name,
        symbol: symbol.toUpperCase(),
        price: Number(price),
        ...(editingId ? { id: editingId } : {})
      };

      await fetch("/api/admin/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setName("");
      setSymbol("");
      setPrice("");
      setEditingId(null);
      fetchStocks();
    } catch (error) {
      console.error("Error saving stock:", error);
    }
  };

  const handleEdit = (item: GameStock) => {
    setName(item.name);
    setSymbol(item.symbol);
    setPrice(item.price.toString());
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setName("");
    setSymbol("");
    setPrice("");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta ação?")) return;
    try {
      await fetch(`/api/admin/stocks?id=${id}`, {
        method: "DELETE",
      });
      fetchStocks();
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const handleRestoreDefaults = async () => {
    alert("Para restaurar os padrões, apague o arquivo 'data/game_stocks.json' na pasta do projeto.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ações do Jogo de Trading</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrões (Info)
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            placeholder="Nome da Empresa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Símbolo (ex: PETR4)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Preço Inicial"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className="flex items-center justify-between p-3 border rounded bg-secondary/10"
              >
                <div>
                  <p className="font-medium">
                    {stock.name} ({stock.symbol})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Preço Inicial: R$ {stock.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(stock)}
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(stock.id)}
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
