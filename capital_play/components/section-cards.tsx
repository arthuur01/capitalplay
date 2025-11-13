import { TrendingDownIcon, TrendingUpIcon, ChartLine, Bitcoin, DollarSign,Euro, PiggyBank} from "lucide-react"
import BtcPoll from "./ui/bitcoin-live"
import RealToUsd from "./ui/dolar-live"
import EurToReal from "./ui/euro-live"
import GoldToReal from "./ui/gold-live"
import { Badge } from "@/components/ui/badge"
import UsdMonthChange from "./ui/monthly-dolar"
import BtcMonthChange from "./ui/monthly-bitcoin"
import EurMonthChange from "./ui/monthly-euro"
import GoldMonthChange from "./ui/monthly-gold"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Cotação Bitcoin</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            <BtcPoll vs="brl" intervalMs={15000} />
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <ChartLine className="size-3" />
              <BtcMonthChange />
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            BRL - BITCOIN <Bitcoin className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Porcentagem dos últimos 30 dias.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Cotação Dólar</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            <RealToUsd intervalMs={15000} />
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <ChartLine className="size-3" />
              <UsdMonthChange />
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            BRL - Dólar<DollarSign className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Porcentagem dos últimos 30 dias.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Cotação Euro</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            <EurToReal intervalMs={15000} />
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <ChartLine className="size-3" />
              <EurMonthChange/>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            BRL - Euro<Euro className="size-4" />
          </div>
          <div className="text-muted-foreground">Porcentagem dos últimos 30 dias.</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Cotação do Ouro</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            <GoldToReal intervalMs={15000} />
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <ChartLine className="size-3" />
              <GoldMonthChange/>
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
           BRL - ONÇA TROY<PiggyBank className="size-4" />
          </div>
          <div className="text-muted-foreground">Porcentagem dos últimos 30 dias.</div>
        </CardFooter>
      </Card>
    </div>
  )
}
