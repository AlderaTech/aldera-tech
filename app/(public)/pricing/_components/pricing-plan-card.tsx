import Link from "next/link";
import { ArrowUpRight, Check, Layers3, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicPricingPlan } from "@/lib/public-settings";
import { cn, formatCurrency } from "@/lib/utils";
import styles from "./pricing-plans.module.css";

export function PricingPlanCard({
  plan,
  index,
}: {
  plan: PublicPricingPlan;
  index: number;
}) {
  return (
    <article
      className={cn(styles.planCard, plan.featured && styles.featured)}
      data-plan={plan.slug}
      aria-labelledby={`plan-${plan.slug}-heading`}
    >
      <div className={styles.cardTop}>
        <span className={styles.planIndex} aria-hidden="true">
          /{String(index + 1).padStart(2, "0")}
        </span>
        {plan.featured && (
          <span className={styles.featuredBadge}>
            <Layers3 className="size-3" aria-hidden="true" />
            Paket unggulan
          </span>
        )}
      </div>
      <h3 id={`plan-${plan.slug}-heading`}>{plan.name}</h3>
      <p className={styles.tagline}>{plan.tagline}</p>
      <div className={styles.price}>
        <span>Mulai dari</span>
        <strong data-pricing-value>{formatCurrency(plan.priceFrom)}</strong>
      </div>
      <div className={styles.featureLabel}>Cakupan paket</div>
      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li
            key={`${plan.slug}-${feature.order}-${feature.text}`}
            className={cn(!feature.included && styles.excluded)}
          >
            <span className={styles.featureIcon} aria-hidden="true">
              {feature.included ? (
                <Check className="size-3.5" />
              ) : (
                <Minus className="size-3.5" />
              )}
            </span>
            <span className="sr-only">
              {feature.included ? "Termasuk: " : "Tidak termasuk: "}
            </span>
            <span className={styles.featureText}>{feature.text}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        size="lg"
        variant={plan.featured ? "default" : "outline"}
        className={styles.planCta}
      >
        <Link href={plan.ctaHref}>
          {plan.ctaLabel}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
