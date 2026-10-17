import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import styles from "./pricing.module.css";

type PricingFaqItem = { q: string; a: string };

export function PricingFaq({ items }: { items: PricingFaqItem[] }) {
  return (
    <section
      className={styles.faqSection}
      aria-labelledby="pricing-faq-heading"
    >
      <div className={cn(shared.container, styles.faqGrid)}>
        <FadeUp className={styles.faqIntro}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">03</span>Sebelum memulai
          </p>
          <h2 id="pricing-faq-heading">
            Pertanyaan umum.
            <br />
            <span>Jawaban yang jelas.</span>
          </h2>
          <p>
            Temukan informasi tentang harga final, pembayaran, waktu pengerjaan,
            dan pemeliharaan.
          </p>
          <Link href={PUBLIC_ROUTES.contact} className={styles.contactLink}>
            <MessageCircle className="size-4" aria-hidden="true" />
            Diskusikan kebutuhan Anda
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </FadeUp>
        <FadeUp delay={0.1} className="min-w-0">
          <Accordion type="single" collapsible className={styles.faqList}>
            {items.map((item, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={item.q}
                className={styles.faqItem}
              >
                <AccordionTrigger className={styles.faqQuestion}>
                  <span className={styles.questionIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className={styles.faqAnswer}>
                  <p>{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}
