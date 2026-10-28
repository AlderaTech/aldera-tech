"use client";

import { useState } from "react";

export function usePreviewSelection(initialId: string) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [draftId, setDraftId] = useState(initialId);
  const [open, setOpen] = useState(false);

  function onOpenChange(next: boolean) {
    if (next) setDraftId(selectedId);
    setOpen(next);
  }

  function applyPreview() {
    setSelectedId(draftId);
    setOpen(false);
  }

  return { selectedId, draftId, setDraftId, open, onOpenChange, applyPreview };
}
