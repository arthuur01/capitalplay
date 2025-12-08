"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebaseConfig"
import AddPaymentDialog from "./add-payment-dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import EditPaymentDialog from "./edit-payment-dialog"
import { FcSimCardChip } from "react-icons/fc"
import { RiVisaLine } from "react-icons/ri"

type PaymentDoc = {
  id: string
  Nome: string
  Numero_cartao: string
  Last4?: string
  Cvc: number
  Data_validade: [number, number] | any
  Email: string
}

export function PaymentPage() {
  const [user, loadingUser] = useAuthState(auth)
  const [payments, setPayments] = useState<PaymentDoc[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [editOpenId, setEditOpenId] = useState<string | null>(null)
  const router = useRouter()

  const maskCardNumber = (last4?: string) => {
    return '**** **** **** ' + (last4 || '****')
  }

  const loadPayments = async () => {
    if (!user) { setLoadingData(false); return }
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/payment?userId=${user.uid}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setPayments(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error loading payments:", err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (loadingUser) return
    if (!user) {
      // Redirect unauthenticated users away from payments
      router.replace("/login")
      return
    }
    loadPayments()
  }, [user, loadingUser])

  const handleDelete = async (id: string) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      await fetch(`/api/payment?userId=${user.uid}&taskId=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      await loadPayments()
    } catch (e) { console.error(e) }
  }

  if (loadingUser || loadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    // Fallback while redirecting
    return null
  }

  return (
    <div className="rounded-lg border bg-card  bg-linear-to-b from-zinc-900 to-neutral-900 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">Métodos de Pagamento</h2>
        <AddPaymentDialog user={user} onAdded={loadPayments} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
        {payments.map((it) => (
          <Card className="mt-2 rounded-4xl border bg-linear-to-b from-black to-slate-900 max-w-1/3" key={it.id}>
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
                <div className="tracking-widest text-2xl font-light">{maskCardNumber(it.Last4)}</div>
                <div className="text-lg font-medium">{it.Nome || "Nome do titular"}</div>
                <div className="flex items-center gap-4 text-sm font-light">
                  <span>{it.Cvc || "000"}</span>
                  <span>{
                    (() => {
                      const dv = it.Data_validade
                      if (!dv) return "MM/YY"
                      if (Array.isArray(dv) && dv.length === 2) {
                        const [month, year] = dv
                        return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
                      }
                      return "MM/YY"
                    })()
                  }</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditOpenId(it.id)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(it.id)}>Excluir</Button>
                </div>
              </div>
            </CardContent>
            {editOpenId === it.id && (
              <EditPaymentDialog
                open={true}
                onOpenChange={(v)=> !v && setEditOpenId(null)}
                user={user}
                payment={it}
                onSaved={loadPayments}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
