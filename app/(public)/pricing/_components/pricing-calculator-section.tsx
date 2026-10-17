import { Calculator } from "lucide-react";
import shared from "../../_components/studio.module.css";
import { CalculatorWizard } from "./calculator-wizard";
import type { CalculatorData } from "../_types/calculator";
import styles from "./pricing.module.css";

type PricingCalculatorSectionProps = {
  data: CalculatorData;
  isAuthenticated: boolean;
  whatsappNumber?: string;
};

export function PricingCalculatorSection({
  data,
  isAuthenticated,
  whatsappNumber,
}: PricingCalculatorSectionProps) {
  return (
    <section
      id="calculator"
      className={styles.calculatorSection}
      aria-labelledby="calculator-heading"
    >
      <div className={shared.container}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              <span aria-hidden="true">02</span>Simulasi biaya interaktif
            </p>
            <h2 id="calculator-heading">
              Kalkulator
              <br />
              <span>estimasi proyek.</span>
            </h2>
          </div>
          <p className={styles.sectionDescription}>
            Sesuaikan jenis proyek, estimasi jumlah halaman, modul fitur, hingga
            layanan pemeliharaan berkala untuk mendapatkan estimasi investasi
            transparan secara langsung.
          </p>
        </div>
        <div className={styles.calculatorPanel}>
          <div className={styles.calculatorBar}>
            <span>
              <Calculator className="size-4" aria-hidden="true" />
              Rancang cakupan proyek Anda
            </span>
            <span>Lima langkah · Rincian biaya langsung</span>
          </div>
          <div className={styles.calculatorBody}>
            <CalculatorWizard
              data={data}
              isAuthenticated={isAuthenticated}
              whatsappNumber={whatsappNumber}
              appearance="studio"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
