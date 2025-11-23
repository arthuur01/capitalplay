"use client";

import { PrivateRoute } from "@/components/PrivateRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminFileManager } from "@/components/admin/AdminFileManager";
import { AdminExchanges } from "@/components/admin/AdminExchanges";
import { AdminNews } from "@/components/admin/AdminNews";
import { AdminTradingStocks } from "@/components/admin/AdminTradingStocks";
import { AdminCurrencies } from "@/components/admin/AdminCurrencies";

export default function AdminPage() {
  return (
    <PrivateRoute requiredEmail="capitalplay01@gmail.com">
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

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="exchanges">Bolsas</TabsTrigger>
          <TabsTrigger value="currencies">Moedas</TabsTrigger>
          <TabsTrigger value="news">Notícias</TabsTrigger>
          <TabsTrigger value="trading">Trading Game</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <AdminFileManager />
        </TabsContent>

        <TabsContent value="exchanges" className="space-y-4">
          <AdminExchanges />
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <AdminCurrencies />
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <AdminNews />
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <AdminTradingStocks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
