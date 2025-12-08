"use client";

import { PrivateRoute } from "@/components/PrivateRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubscriptions } from "@/components/admin/AdminSubscriptions";

export default function AdminPage() {
  return (
    <PrivateRoute requiredEmail="amiguelvieiramapa@gmail.com">
      <AdminPageContent />
    </PrivateRoute>
  );
}

function AdminPageContent() {

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie o conteúdo e configurações da plataforma.</p>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Planos de Assinatura</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <AdminSubscriptions></AdminSubscriptions>
        </TabsContent>
      </Tabs>
    </div>
  );
}
