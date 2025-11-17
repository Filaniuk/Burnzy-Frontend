"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
};

export function DragPortal({ children }: Props) {
  if (typeof document === "undefined") return null;

  const portalRoot = document.getElementById("drag-portal");
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
}
