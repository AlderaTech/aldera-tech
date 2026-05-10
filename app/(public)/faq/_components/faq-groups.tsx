import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeUp } from "@/components/shared/motion";
import type { FaqGroup } from "../_constants/faq-groups";

type FaqGroupsProps = {
  groups: FaqGroup[];
};

export function FaqGroups({ groups }: FaqGroupsProps) {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-md public-container-px space-y-10 py-14 sm:py-20">
        {groups.map((group, groupIndex) => (
          <FadeUp key={group.title} delay={groupIndex * 0.05}>
            <h2 className="mb-4 text-2xl font-black">{group.title}</h2>
            <div className="editorial-card rounded-xl px-6">
              <Accordion type="single" collapsible>
                {group.items.map((item, itemIndex) => (
                  <AccordionItem value={`${groupIndex}-${itemIndex}`} key={item.q}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-black/60">{item.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
