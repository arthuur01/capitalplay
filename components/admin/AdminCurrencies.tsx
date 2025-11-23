"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, RotateCcw } from "lucide-react";

interface DashboardCurrency {
  id: string;
  pair: string;
  name: string;
}

export function AdminCurrencies() {
  const [currencies, setCurrencies] = useState<DashboardCurrency[]>([]);
  const [name, setName] = useState("");
  const [pair, setPair] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch("/api/admin/currencies");
      if (res.ok) {
        const data = await res.json();
        setCurrencies(data);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSave = async () => {
    if (!name || !pair) return;
    try {
      const payload = {
        name,
        pair: pair.toUpperCase(),
        ...(editingId ? { id: editingId } : {})
      };

      await fetch("/api/admin/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setName("");
      setPair("");
      setEditingId(null);
      fetchCurrencies();
    } catch (error) {
      console.error("Error saving currency:", error);
    }
  };

  const handleEdit = (item: DashboardCurrency) => {
    setName(item.name);
    setPair(item.pair);
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setName("");
    setPair("");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta moeda?")) return;
    try {
      await fetch(`/api/admin/currencies?id=${id}`, {
        method: "DELETE",
      });
      fetchCurrencies();
    } catch (error) {
      console.error("Error deleting currency:", error);
    }
  };

  const handleRestoreDefaults = async () => {
    alert("Para restaurar os padrões, apague o arquivo 'data/dashboard_currencies.json' na pasta do projeto.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Moedas do Dashboard (AwesomeAPI)</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrões (Info)
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome (ex: Libra)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Par (ex: GBP-BRL)"
            value={pair}
            onChange={(e) => setPair(e.target.value)}
          />
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
            {currencies.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded bg-secondary/10"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.pair}
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
