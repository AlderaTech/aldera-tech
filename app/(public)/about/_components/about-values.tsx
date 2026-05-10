import { Card } from "@/components/ui/card";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { aboutValues } from "../_constants/about-content";

export function AboutValues() {
  return (
    <section className="editorial-ink">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="editorial-display text-4xl text-balance sm:text-5xl">
            Nilai yang kami pegang
          </h2>
          <p className="mt-4 text-white/58">
            Empat prinsip yang memandu cara kami bekerja.
          </p>
        </FadeUp>
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aboutValues.map((value, index) => {
            const isFeatured = index === 1;
            return (
              <StaggerItem key={value.title}>
                <Card
                  className={
                    isFeatured
                      ? "h-full gap-0 rounded-xl border-[#0b6bff]/30 bg-[#0b6bff] p-6 text-white transition-all hover:-translate-y-1"
                      : "editorial-card-dark h-full gap-0 rounded-xl p-6 text-white transition-all hover:-translate-y-1"
                  }
                >
                  <div
                    className={
                      isFeatured
                        ? "mb-4 flex size-11 items-center justify-center rounded-lg bg-white text-[#0b6bff]"
                        : "mb-4 flex size-11 items-center justify-center rounded-lg bg-white/10 text-[#0b6bff]"
                    }
                  >
                    <value.icon className="size-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{value.title}</h3>
                  <p
                    className={
                      isFeatured
                        ? "text-sm leading-relaxed text-white/72"
                        : "text-sm leading-relaxed text-white/58"
                    }
                  >
                    {value.description}
                  </p>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
