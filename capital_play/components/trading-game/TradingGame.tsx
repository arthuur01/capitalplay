"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { StockChart } from "./StockChart";

interface PriceHistory {
  time: string;
  price: number;
}

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  owned: number;
  history: PriceHistory[];
}

const initialStocks: Stock[] = [
  { id: "1", name: "TechCorp", symbol: "TECH", price: 150, change: 0, owned: 0, history: [{ time: "0", price: 150 }] },
  { id: "2", name: "BioMed Inc", symbol: "BIOM", price: 85, change: 0, owned: 0, history: [{ time: "0", price: 85 }] },
  { id: "3", name: "EnergyPlus", symbol: "ENGY", price: 120, change: 0, owned: 0, history: [{ time: "0", price: 120 }] },
  { id: "4", name: "RetailMax", symbol: "RETL", price: 60, change: 0, owned: 0, history: [{ time: "0", price: 60 }] },
  { id: "5", name: "FinanceHub", symbol: "FINH", price: 200, change: 0, owned: 0, history: [{ time: "0", price: 200 }] },
  { id: "6", name: "AutoDrive", symbol: "AUTO", price: 95, change: 0, owned: 0, history: [{ time: "0", price: 95 }] },
];

export const TradingGame = () => {
  const [cash, setCash] = useState(10000);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [initialCash] = useState(10000);

  const updatePrices = () => {
    setStocks((prevStocks) =>
      prevStocks.map((stock) => {
        const changePercent = (Math.random() - 0.5) * 10;
        const priceChange = stock.price * (changePercent / 100);
        const newPrice = Math.max(10, stock.price + priceChange);
        
        // Add to history (keep last 20 points)
        const newHistory = [
          ...stock.history,
          { 
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            price: Number(newPrice.toFixed(2)) 
          }
        ].slice(-20);
        
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(changePercent.toFixed(2)),
          history: newHistory,
        };
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(updatePrices, 3000);
    return () => clearInterval(interval);
  }, []);

  const buyStock = (stock: Stock) => {
    if (cash >= stock.price) {
      setCash((prev) => Number((prev - stock.price).toFixed(2)));
      setStocks((prev) =>
        prev.map((s) => (s.id === stock.id ? { ...s, owned: s.owned + 1 } : s))
      );
      toast.success(`Comprou 1 ação de ${stock.symbol}`, {
        description: `Preço: R$ ${stock.price.toFixed(2)}`,
      });
    } else {
      toast.error("Saldo insuficiente!");
    }
  };

  const sellStock = (stock: Stock) => {
    if (stock.owned > 0) {
      setCash((prev) => Number((prev + stock.price).toFixed(2)));
      setStocks((prev) =>
        prev.map((s) => (s.id === stock.id ? { ...s, owned: s.owned - 1 } : s))
      );
      toast.success(`Vendeu 1 ação de ${stock.symbol}`, {
        description: `Preço: R$ ${stock.price.toFixed(2)}`,
      });
    } else {
      toast.error("Você não possui esta ação!");
    }
  };

  const portfolioValue = stocks.reduce((acc, stock) => acc + stock.price * stock.owned, 0);
  const totalValue = cash + portfolioValue;
  const profit = totalValue - initialCash;
  const profitPercent = ((profit / initialCash) * 100).toFixed(2);

  const resetGame = () => {
    setCash(10000);
    setStocks(initialStocks);
    toast.info("Jogo reiniciado!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Simulador de Trading
            </h1>
            <p className="text-muted-foreground">
              Compre e venda ações em tempo real
            </p>
          </div>
          <Button onClick={resetGame} variant="secondary" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription>Dinheiro</CardDescription>
              <CardTitle className="text-2xl text-foreground">
                R$ {cash.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription>Valor em Ações</CardDescription>
              <CardTitle className="text-2xl text-foreground">
                R$ {portfolioValue.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardDescription>Patrimônio Total</CardDescription>
              <CardTitle className="text-2xl text-foreground">
                R$ {totalValue.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className={`border-border ${profit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            <CardHeader className="pb-3">
              <CardDescription>Lucro/Prejuízo</CardDescription>
              <CardTitle className={`text-2xl flex items-center gap-2 ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {profit >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                R$ {profit.toFixed(2)} ({profitPercent}%)
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Stocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <Card key={stock.id} className="border-border bg-card hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-foreground">{stock.symbol}</CardTitle>
                    <CardDescription>{stock.name}</CardDescription>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                      stock.change >= 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(stock.change).toFixed(2)}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Chart */}
                <div className="h-[100px] -mx-2">
                  <StockChart 
                    data={stock.history} 
                    color={stock.change >= 0 ? "#22c55e" : "#ef4444"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      {stock.price.toFixed(2)}
                    </span>
                  </div>
                  {stock.owned > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Possui: {stock.owned}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => buyStock(stock)}
                    className="flex-1"
                    variant="default"
                    disabled={cash < stock.price}
                  >
                    Comprar
                  </Button>
                  <Button
                    onClick={() => sellStock(stock)}
                    className="flex-1"
                    variant="destructive"
                    disabled={stock.owned === 0}
                  >
                    Vender
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
