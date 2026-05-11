import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { techStack } from "../_constants/about-content";

export function TechStackSection() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="editorial-display text-4xl text-balance sm:text-5xl">
            Alat yang kami kuasai
          </h2>
          <p className="mt-4 text-black/60">
            Kami percaya pada alat yang tepat untuk setiap masalah, bukan satu
            alat untuk semua.
          </p>
        </FadeUp>
        <StaggerContainer className="flex flex-wrap justify-center gap-3">
          {techStack.map((item) => (
            <StaggerItem key={item.name}>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 transition-all hover:border-black/30 hover:shadow-md">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-black/62">{item.category}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
