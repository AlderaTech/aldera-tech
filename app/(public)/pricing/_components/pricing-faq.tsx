import { FadeUp } from "@/components/shared/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type PricingFaqItem = {
  q: string;
  a: string;
};

export function PricingFaq({ items }: { items: PricingFaqItem[] }) {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-md public-container-px pb-14 sm:pb-20">
        <FadeUp className="mb-10 text-center">
          <h2 className="editorial-display mb-3 text-4xl sm:text-5xl">
            Pertanyaan umum
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="editorial-card rounded-xl px-6"
          >
            {items.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={item.q}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-black/60">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeUp>
      </div>
    </section>
  );
}
