"use client";

import { CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { PROFILE_PREVIEW_PAYMENTS } from "../_data/profile-preview-data";
import { usePreviewSelection } from "../_hooks/use-preview-selection";
import type { PreviewPaymentMethod } from "../_types/profile-preview";
import { ProfileDialogContent } from "./profile-dialog";
import {
  PreviewFeedback,
  PreviewPanelHeader,
} from "./profile-preview-primitives";
import styles from "./profile-preview.module.css";

export function ProfilePaymentPanel({
  methods = PROFILE_PREVIEW_PAYMENTS,
}: {
  methods?: readonly PreviewPaymentMethod[];
}) {
  const preview = usePreviewSelection(methods[0]?.id ?? "");
  const selected =
    methods.find((method) => method.id === preview.selectedId) ?? methods[0];
  if (!selected)
    return (
      <section
        className={styles.panel}
        aria-labelledby="profile-payments-heading"
      >
        <PreviewPanelHeader
          id="profile-payments-heading"
          title="Informasi Pembayaran"
          icon={CreditCard}
        />
        <PreviewFeedback status="empty" label="Belum ada metode demo" />
      </section>
    );
  const Icon = selected.kind === "bank" ? Landmark : CreditCard;
  return (
    <section
      className={styles.panel}
      aria-labelledby="profile-payments-heading"
    >
      <PreviewPanelHeader
        id="profile-payments-heading"
        title="Informasi Pembayaran"
        icon={CreditCard}
      />
      <div className={styles.paymentMethod}>
        <span className={styles.methodIcon} aria-hidden="true">
          <Icon size={24} />
        </span>
        <div>
          <h3>{selected.name}</h3>
          <p className={styles.maskedNumber}>{selected.maskedNumber}</p>
          <span>Metode contoh • Belum terhubung</span>
        </div>
      </div>
      <Dialog open={preview.open} onOpenChange={preview.onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className={styles.actionButton}>
            Kelola
          </Button>
        </DialogTrigger>
        <ProfileDialogContent
          title="Kelola metode demo"
          description="Pratinjau lokal. Tidak ada nomor kartu asli, penyimpanan server, atau transaksi."
        >
          <fieldset className={styles.choices}>
            <legend className={styles.choiceLegend}>
              Pilihan metode (Opsional)
            </legend>
            {methods.map((method) => (
              <label
                key={method.id}
                className={styles.choiceCard}
                data-selected={preview.draftId === method.id}
              >
                <input
                  type="radio"
                  name="demo-payment-method"
                  value={method.id}
                  checked={preview.draftId === method.id}
                  onChange={() => preview.setDraftId(method.id)}
                />
                <span>
                  <strong>{method.name}</strong>
                  <span className={styles.maskedNumber}>
                    {method.maskedNumber}
                  </span>
                  <small>{method.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <p className={styles.demoNote}>
            Pilihan hanya berlaku pada preview ini dan kembali ke contoh awal
            setelah halaman dimuat ulang.
          </p>
          <div className={styles.dialogActions}>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={preview.applyPreview}>Terapkan di Preview</Button>
          </div>
        </ProfileDialogContent>
      </Dialog>
      <p className={styles.demoNote}>
        Nomor tersamarkan ini fiktif. Tidak dapat digunakan untuk pembayaran.
      </p>
    </section>
  );
}
