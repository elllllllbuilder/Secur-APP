// src/components/StatusBadge.tsx
import React from "react";
import type { DocStatus } from "@/types";

export default function StatusBadge({ status }: { status?: DocStatus | null }) {
  const map: Record<DocStatus, string> = {
    PENDING: "badge pending",
    APPROVED: "badge ok",
    REJECTED: "badge bad",
  };

  const label = status ?? "PENDING";

  return <span className={map[label] || "badge"}>{label}</span>;
}
