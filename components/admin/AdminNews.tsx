"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Pencil, RotateCcw } from "lucide-react";

interface NewsSource {
  id: string;
  name: string;
  url: string;
}

export function AdminNews() {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Error fetching news sources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleSave = async () => {
    if (!newName || !newUrl) return;
    try {
      const payload = {
        name: newName,
        url: newUrl,
        ...(editingId ? { id: editingId } : {})
      };

      await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setNewName("");
      setNewUrl("");
      setEditingId(null);
      fetchSources();
    } catch (error) {
      console.error("Error saving news source:", error);
    }
  };

  const handleEdit = (item: NewsSource) => {
    setNewName(item.name);
    setNewUrl(item.url);
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setNewName("");
    setNewUrl("");
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta fonte?")) return;
    try {
      await fetch(`/api/admin/news?id=${id}`, {
        method: "DELETE",
      });
      fetchSources();
    } catch (error) {
      console.error("Error deleting news source:", error);
    }
  };

  const handleRestoreDefaults = async () => {
    alert("Para restaurar os padrões, apague o arquivo 'data/news_sources.json' na pasta do projeto.");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fontes de Notícias (RSS)</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRestoreDefaults}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrões (Info)
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome da Fonte (ex: Google News)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="URL do RSS"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
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
            {sources.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded bg-secondary/10"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {item.url}
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
