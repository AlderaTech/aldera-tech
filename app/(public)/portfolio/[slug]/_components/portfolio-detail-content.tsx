import { Lightbulb, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/shared/motion";
import type { PortfolioDetail } from "../../_data/portfolio";

type PortfolioDetailContentProps = {
  item: PortfolioDetail;
};

export function PortfolioDetailContent({ item }: PortfolioDetailContentProps) {
  const sections = [
    { icon: Target, title: "Tantangan", text: item.challenge },
    { icon: Lightbulb, title: "Solusi", text: item.solution },
    { icon: TrendingUp, title: "Hasil", text: item.result },
  ];

  return (
    <article className="editorial-surface">
      <div className="mx-auto max-w-screen-md public-container-px space-y-12 py-10 pb-20">
        {sections.map((section) => (
          <FadeUp key={section.title}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#0b6bff] text-white">
                <section.icon className="size-5" />
              </div>
              <h2 className="text-3xl font-black">{section.title}</h2>
            </div>
            <div className="prose prose-neutral max-w-none">
              <p>{section.text}</p>
            </div>
          </FadeUp>
        ))}

        {item.techStack.length > 0 && (
          <FadeUp>
            <h2 className="mb-3 text-3xl font-black">Teknologi</h2>
            <div className="flex flex-wrap gap-2">
              {item.techStack.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </FadeUp>
        )}
      </div>
    </article>
  );
}
