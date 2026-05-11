import Link from "next/link";
import { Check, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import type { PublicPricingPlan } from "@/lib/public-settings";
import { cn, formatCurrency } from "@/lib/utils";

export function PricingGrid({ plans }: { plans: PublicPricingPlan[] }) {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <StaggerItem key={plan.name}>
              <Card
                className={cn(
                  "relative flex h-full flex-col rounded-xl p-6 lg:p-8",
                  plan.featured
                    ? "border-black bg-[#08090d] text-white shadow-2xl"
                    : "editorial-card"
                )}
              >
                {plan.featured && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#0b6bff] text-white shadow-md hover:bg-[#0b6bff]">
                    <Star className="size-3 fill-current" />
                    Paling Populer
                  </Badge>
                )}
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p
                  className={cn(
                    "mt-1 mb-5 min-h-10 text-sm",
                    plan.featured ? "text-white/68" : "text-black/58"
                  )}
                >
                  {plan.tagline}
                </p>
                <div className="mb-6">
                  <div
                    className={cn(
                      "text-xs",
                      plan.featured ? "text-white/64" : "text-black/62"
                    )}
                  >
                    Mulai dari
                  </div>
                  <div className="text-3xl font-bold xxxl:text-4xl">
                    {formatCurrency(plan.priceFrom)}
                  </div>
                </div>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={`${plan.slug}-${feature.order}-${feature.text}`}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        !feature.included &&
                          (plan.featured ? "text-white/55" : "text-black/55")
                      )}
                    >
                      {feature.included ? (
                        <Check className="mt-0.5 size-4 shrink-0 text-[#0b6bff]" />
                      ) : (
                        <X
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            plan.featured ? "text-white/55" : "text-black/55"
                          )}
                        />
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  variant={plan.featured ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    plan.featured
                      ? "bg-[#0b6bff] text-white hover:bg-[#075bd8]"
                      : "border-black/15 bg-white/70"
                  )}
                >
                  <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                </Button>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="mt-10 rounded-xl border border-black/10 bg-white/70 p-6 text-center sm:p-8">
          <h3 className="text-xl font-black sm:text-2xl">Butuh estimasi lebih detail?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-black/62">
            Gunakan kalkulator harga kami untuk menghitung biaya berdasarkan fitur spesifik yang Anda butuhkan.
          </p>
          <Button asChild size="lg" className="mt-5 bg-[#08090d] text-white hover:bg-black">
            <Link href="/login?callbackUrl=/dashboard/calculator">Hitung Estimasi Detail</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
