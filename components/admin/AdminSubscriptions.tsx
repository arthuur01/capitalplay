"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: string;
  nome: string;
  badge: string;
  mensal: number;
  anual: number;
  funcionalidades: string[];
}

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    badge: "",
    mensal: 0,
    anual: 0,
    funcionalidades: [""]
  });

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pricing");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          nome: item.Nome,
          badge: item.Badge,
          mensal: item.Mensal,
          anual: item.Anual,
          funcionalidades: item.Funcionalidades || []
        }));
        setSubscriptions(mapped);
      }
    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: formData.nome,
          Nome: formData.nome,
          Badge: formData.badge,
          Mensal: formData.mensal,
          Anual: formData.anual,
          Funcionalidades: formData.funcionalidades.filter(f => f.trim() !== "")
        })
      });
      if (res.ok) {
        await loadSubscriptions();
        setIsCreateOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/pricing?planId=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nome: formData.nome,
          Badge: formData.badge,
          Mensal: formData.mensal,
          Anual: formData.anual,
          Funcionalidades: formData.funcionalidades.filter(f => f.trim() !== "")
        })
      });
      if (res.ok) {
        await loadSubscriptions();
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar este plano?")) return;
    try {
      const res = await fetch(`/api/pricing?planId=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await loadSubscriptions();
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const startEdit = (sub: Subscription) => {
    setFormData({
      nome: sub.nome,
      badge: sub.badge,
      mensal: sub.mensal,
      anual: sub.anual,
      funcionalidades: sub.funcionalidades.length > 0 ? sub.funcionalidades : [""]
    });
    setEditingId(sub.id);
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      badge: "",
      mensal: 0,
      anual: 0,
      funcionalidades: [""]
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      funcionalidades: [...prev.funcionalidades, ""]
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      funcionalidades: prev.funcionalidades.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      funcionalidades: prev.funcionalidades.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Planos de Assinatura</h2>
          <p className="text-muted-foreground">Gerencie os planos disponíveis</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <Card key={sub.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{sub.nome}</CardTitle>
                  <Badge className="mt-2">{sub.badge}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(sub)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensal:</span>
                  <span className="font-semibold">${sub.mensal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anual:</span>
                  <span className="font-semibold">${sub.anual}</span>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium">Funcionalidades:</span>
                  <ul className="mt-2 space-y-1">
                    {sub.funcionalidades.map((feat, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">• {feat}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Plano</DialogTitle>
            <DialogDescription>Preencha os dados do novo plano de assinatura</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-nome">Nome do Plano</Label>
              <Input
                id="create-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Basic"
              />
            </div>
            <div>
              <Label htmlFor="create-badge">Badge</Label>
              <Input
                id="create-badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: Basic"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-mensal">Preço Mensal ($)</Label>
                <Input
                  id="create-mensal"
                  type="number"
                  value={formData.mensal}
                  onChange={(e) => setFormData({ ...formData, mensal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="create-anual">Preço Anual ($)</Label>
                <Input
                  id="create-anual"
                  type="number"
                  value={formData.anual}
                  onChange={(e) => setFormData({ ...formData, anual: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Funcionalidades</Label>
              {formData.funcionalidades.map((feat, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <Input
                    value={feat}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="Digite uma funcionalidade"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addFeature} className="mt-2 w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Funcionalidade
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>Atualize as informações do plano</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome do Plano</Label>
              <Input
                id="edit-nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-badge">Badge</Label>
              <Input
                id="edit-badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-mensal">Preço Mensal ($)</Label>
                <Input
                  id="edit-mensal"
                  type="number"
                  value={formData.mensal}
                  onChange={(e) => setFormData({ ...formData, mensal: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-anual">Preço Anual ($)</Label>
                <Input
                  id="edit-anual"
                  type="number"
                  value={formData.anual}
                  onChange={(e) => setFormData({ ...formData, anual: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Funcionalidades</Label>
              {formData.funcionalidades.map((feat, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <Input
                    value={feat}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="Digite uma funcionalidade"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addFeature} className="mt-2 w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Funcionalidade
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setEditingId(null); resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={() => editingId && handleUpdate(editingId)}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
