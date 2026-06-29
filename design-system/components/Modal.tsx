"use client";

import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { Button } from "./Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sqds-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={cn("sqds-modal", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sqds-modal-title" : undefined}
      >
        {title ? (
          <header className="sqds-modal__header">
            <h2 id="sqds-modal-title" className="sqds-text-heading">
              {title}
            </h2>
          </header>
        ) : null}
        <div className="sqds-modal__body">{children}</div>
        {footer !== undefined ? (
          <footer className="sqds-modal__footer">{footer}</footer>
        ) : (
          <footer className="sqds-modal__footer">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onClose}>
              Confirm
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}
