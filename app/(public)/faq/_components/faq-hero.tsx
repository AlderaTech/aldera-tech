import { CircleHelp } from "lucide-react";
import { StudioPageHero } from "../../_components/studio-page-hero";

export function FaqHero() {
  return (
    <StudioPageHero
      icon={CircleHelp}
      label="FAQ"
      title="Pertanyaan yang sering ditanyakan"
      description="Tidak menemukan jawaban? Hubungi kami, kami senang menjelaskan."
    />
  );
}
