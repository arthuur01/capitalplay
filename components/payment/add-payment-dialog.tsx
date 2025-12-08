"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "firebase/auth";
import { format } from "date-fns";
import { FcSimCardChip } from "react-icons/fc";
import { RiVisaLine } from "react-icons/ri";
import CryptoJS from "crypto-js";


type Props = {
  user: User;
  onAdded?: () => void;
};

export default function AddPaymentDialog({ user, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [Nome, setNome] = useState("");
  const [Numero_cartao, setNumeroCartao] = useState("");
  const [Cvc, setCvc] = useState("0");
  const [Data_validade, setDataValidade] = useState("");
  const [Email, setEmail] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\s/g, '');
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s/g, '');
    if (input.length <= 16) {
      setNumeroCartao(formatCardNumber(input));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const cleanCardNumber = Numero_cartao.replace(/\s/g, '');
      const hashedCardNumber = CryptoJS.MD5(cleanCardNumber).toString();
      const last4 = cleanCardNumber.slice(-4);
      let validadeArray = [0, 0];
      if (Data_validade && /^\d{4}-\d{2}$/.test(Data_validade)) {
        const [year, month] = Data_validade.split('-');
        validadeArray = [parseInt(month), parseInt(year)];
      }
      const res = await fetch(`/api/payment?userId=${user.uid}` ,{
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ Nome, Numero_cartao: hashedCardNumber, Last4: last4, Cvc: Number(Cvc), Data_validade: validadeArray, Email })
      });
      if (!res.ok) throw new Error("Failed to add");
      if (onAdded) onAdded();
      setOpen(false);
      setNome(""); setNumeroCartao(""); setCvc("0"); setDataValidade(""); setEmail("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="default">Adicionar método</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo método de pagamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={Nome} onChange={(e)=>setNome(e.target.value)} placeholder="Titular" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="numero">Número do cartão</Label>
            <Input id="numero" maxLength={19} value={Numero_cartao} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" value={Cvc} onChange={(e)=>setCvc(e.target.value)} placeholder="000" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validade">Data de validade (MM/YY)</Label>
              <Input id="validade" type="month" value={Data_validade} onChange={(e)=>setDataValidade(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={Email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>

          {/* Preview Card */} 
          <Card className="mt-2 rounded-4xl border bg-linear-to-r from-neutral-800 to-neutral-900">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <div className="text-4xl">
                  <RiVisaLine />
                </div>
                <div className="text-4xl">
                  <FcSimCardChip />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="tracking-widest text-2xl font-light">{Numero_cartao || "0000 0000 0000 0000"}</div>
                <div className="text-lg font-medium">{Nome || "Nome do titular"}</div>
                <div className="flex items-center gap-4 text-sm font-light">
                  <span>{Cvc || "000"}</span>
                  <span>
                     {
                      (() => {
                        if (!Data_validade) return "MM/YY";
                        if (/^\d{4}-\d{2}$/.test(Data_validade)) {
                          const [year, month] = Data_validade.split('-');
                          return `${month}/${year.slice(-2)}`;
                        }
                        return "MM/YY";
                      })()
                    }
                  </span>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
