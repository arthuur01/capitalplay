"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link  from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

interface PricingPlan {
  id?: string;
  name: string;
  badge: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  buttonText?: string;
  isPopular?: boolean;
}

interface Pricing4Props {
  title?: string;
  description?: string;
  plans?: PricingPlan[];
  className?: string;
}

const Pricing4 = ({
  title = "Preços",
  description = "Encontre preços que se encaixam no seu orçamento.",
  plans,
  className = "",
}: Pricing4Props) => {
  const [isAnnually, setIsAnnually] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        console.log("Iniciando fetch de planos...");
        const res = await fetch("/api/pricing");
        
        if (!res.ok) {
          throw new Error("Falha ao buscar planos");
        }
        
        const data = await res.json();
        console.log("Planos recebidos:", data);
        
        const plans = data.map((plan: any) => ({
          id: plan.id,
          name: plan.Nome || "",
          badge: plan.Badge || "",
          monthlyPrice: `$${plan.Mensal}`,
          yearlyPrice: `$${plan.Anual}`,
          features: plan.Funcionalidades || [],
          buttonText: "Assinar",
          isPopular: plan.isPopular || false,
        }));
        
        console.log("Planos mapeados:", plans);
        setPricingPlans(plans);
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const displayPlans = pricingPlans.length > 0 ? pricingPlans : plans || [];
  if (loading) {
    return (
      <section className={`py-32 ${className}`}>
        <div className="container flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  return (
    <section className={`py-32 ${className}`}>
      <div className="container">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <h2 className="text-pretty text-4xl font-bold lg:text-6xl">
            {title}
          </h2>
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <p className="text-muted-foreground max-w-3xl lg:text-xl">
              {description}
            </p>
            <div className=" flex h-11 w-fit shrink-0 items-center rounded-md p-1 text-lg">
              <RadioGroup
                defaultValue="monthly"
                className="h-full grid-cols-2"
                onValueChange={(value) => {
                  setIsAnnually(value === "annually");
                }}
              >
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="monthly"
                    className="text-muted-foreground peer-data-[state=checked]:text-white flex h-full cursor-pointer items-center justify-center px-7 font-semibold"
                  >
                    Mensal
                  </Label>
                </div>
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="annually"
                    id="annually"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="annually"
                    className="text-muted-foreground peer-data-[state=checked]:text-white flex h-full cursor-pointer items-center justify-center gap-1 px-7 font-semibold"
                  >
                    Anual
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex w-full flex-col items-stretch gap-6 md:flex-row">
            {displayPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex w-full flex-col rounded-lg border p-6 text-left ${
                  plan.isPopular ? "" : ""
                }`}
              >
                <Badge className="mb-8 block w-fit uppercase">
                  {plan.badge}
                </Badge>
                <span className="text-4xl font-medium">
                  {isAnnually ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <p
                  className={`text-muted-foreground ${plan.monthlyPrice === "$0" ? "invisible" : ""}`}
                >
                  {isAnnually ? "Anual" : "Mensal"}
                </p>
                <Separator className="my-6" />
                <div className="flex h-full flex-col justify-between gap-20">
                  <ul className="text-muted-foreground space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <Check className="size-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard/payment" className="cursor-pointer">
                  <Button className="w-full cursor-pointer">{plan.buttonText || "Comprar"}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing4 };
