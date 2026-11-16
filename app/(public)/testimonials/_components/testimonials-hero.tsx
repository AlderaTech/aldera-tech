import { MessagesSquare } from "lucide-react";
import { StudioPageHero } from "../../_components/studio-page-hero";

export function TestimonialsHero({ count }: { count: number }) {
  return (
    <StudioPageHero
      icon={MessagesSquare}
      label="Testimoni"
      title="Kata klien kami"
      description={
        count > 0
          ? `${count} testimoni dari bisnis yang telah mempercayakan proyek mereka ke Aldera Tech.`
          : "Cerita kolaborasi dan pengalaman bersama tim Aldera Tech."
      }
    />
  );
}
