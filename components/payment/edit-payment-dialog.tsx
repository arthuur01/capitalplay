"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { format } from "date-fns";
import CryptoJS from "crypto-js";

export type PaymentDoc = {
  id: string
  Id?: string
  Nome: string
  Numero_cartao: string
  Last4?: string
  Cvc: number
  Data_validade: [number, number] | any
  Email: string
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
  payment: PaymentDoc;
  onSaved?: () => void;
};

export default function EditPaymentDialog({ open, onOpenChange, user, payment, onSaved }: Props) {
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\s/g, '');
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
    return formatted;
  };

  const [Nome, setNome] = useState(payment.Nome || "");
  const [Numero_cartao, setNumeroCartao] = useState(formatCardNumber(payment.Numero_cartao || ""));
  const [Cvc, setCvc] = useState(String(payment.Cvc ?? 0));
  const [Data_validade, setDataValidade] = useState(() => {
    try {
      if (Array.isArray(payment.Data_validade) && payment.Data_validade.length === 2) {
        const [month, year] = payment.Data_validade;
        return `${year}-${String(month).padStart(2, '0')}`;
      }
    } catch {}
    return "";
  });
  const [Email, setEmail] = useState(payment.Email || "");
  const [saving, setSaving] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s/g, '');
    if (input.length <= 16) {
      setNumeroCartao(formatCardNumber(input));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/payment?userId=${user.uid}&taskId=${payment.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ Nome, Numero_cartao, Cvc: Number(Cvc), Data_validade, Email })
      });
      if (!res.ok) throw new Error("Failed to save");
      onOpenChange(false);
      if (onSaved) onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar método de pagamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={Nome} onChange={(e)=>setNome(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="numero">Número do cartão</Label>
            <Input id="numero" maxLength={19} value={Numero_cartao} onChange={handleCardNumberChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" value={Cvc} onChange={(e)=>setCvc(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validade">Data de validade (MM/YY)</Label>
              <Input id="validade" type="month" value={Data_validade} onChange={(e)=>setDataValidade(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={Email} onChange={(e)=>setEmail(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
            <Button onClick={async ()=>{
              const cleanCardNumber = Numero_cartao.replace(/\s/g, '');
              const hashedCardNumber = CryptoJS.MD5(cleanCardNumber).toString();
              const last4 = cleanCardNumber.slice(-4);
              let validadeArray = [0, 0];
              if (Data_validade && /^\d{4}-\d{2}$/.test(Data_validade)) {
                const [year, month] = Data_validade.split('-');
                validadeArray = [parseInt(month), parseInt(year)];
              }
              await (async ()=>{
                try {
                  setSaving(true);
                  const token = await user.getIdToken();
                  const res = await fetch(`/api/payment?userId=${user.uid}&taskId=${payment.id}`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ Nome, Numero_cartao: hashedCardNumber, Last4: last4, Cvc: Number(Cvc), Data_validade: validadeArray, Email })
                  });
                  if (!res.ok) throw new Error("Failed to save");
                  onOpenChange(false);
                  if (onSaved) onSaved();
                } catch (e) {
                  console.error(e);
                } finally {
                  setSaving(false);
                }
              })();
            }} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
