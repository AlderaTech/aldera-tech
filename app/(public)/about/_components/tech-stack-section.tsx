import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { techStack } from "../_constants/about-content";
import { groupTechStackTools } from "../_utils/group-tech-stack";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import { TechStackCard } from "./tech-stack-card";
import styles from "./tech-stack.module.css";

type ToolDisplayItem = {
  name: string;
  category: string;
  icon?: string | null;
};

export async function TechStackSection() {
  const dbTools = await safeDb<ToolDisplayItem[]>(async () => {
    const data = await prisma.techTool.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        name: true,
        category: true,
        icon: true,
      },
    });
    return data;
  }, []);

  const itemsToUse: ToolDisplayItem[] =
    dbTools && dbTools.length > 0
      ? dbTools
      : techStack.map((item) => ({
          name: item.name,
          category: item.category,
        }));

  const groups = groupTechStackTools(itemsToUse);

  return (
    <section
      className={cn(shared.section, styles.section)}
      aria-labelledby="about-tools-heading"
    >
      <div className={shared.container}>
        <FadeUp className={styles.sectionHeader}>
          <div>
            <p className={cn(shared.eyebrow, styles.eyebrow)}>
              Fondasi untuk produk yang bekerja
            </p>
            <h2 id="about-tools-heading" className={styles.heading}>
              Alat yang <span>kami kuasai</span>
            </h2>
          </div>
          <div className={styles.headerDetails}>
            <p className={cn(shared.description, styles.intro)}>
              Kami percaya pada alat yang tepat untuk setiap masalah, bukan satu
              alat untuk semua.
            </p>
            <div className={styles.stackSummary}>
              <div>
                <strong>{itemsToUse.length}</strong>
                <span>Teknologi</span>
              </div>
              <span className={styles.summaryDivider} aria-hidden="true" />
              <div>
                <strong>{groups.length}</strong>
                <span>Kategori</span>
              </div>
            </div>
          </div>
        </FadeUp>
        <StaggerContainer className={styles.grid}>
          {groups.map(({ category, tools }, index) => (
            <StaggerItem key={category} className={styles.cardSlot}>
              <TechStackCard
                category={category}
                tools={tools}
                featured={index === 0}
                position={index + 1}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
