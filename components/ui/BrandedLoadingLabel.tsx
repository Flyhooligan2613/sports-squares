"use client";

import { useEffect, useState } from "react";
import {
  getLoadingMessage,
  type LoadingContext,
} from "@/lib/platform/language";

interface BrandedLoadingLabelProps {
  context?: LoadingContext;
  className?: string;
}

/** Rotating branded loading copy from the Contest Language Engine™. */
export default function BrandedLoadingLabel({
  context = "general",
  className = "text-center text-sb-muted py-12 animate-pulse text-sm",
}: BrandedLoadingLabelProps) {
  const [message, setMessage] = useState(() => getLoadingMessage(context));

  useEffect(() => {
    setMessage(getLoadingMessage(context));
    const id = window.setInterval(() => {
      setMessage(getLoadingMessage(context));
    }, 3000);
    return () => window.clearInterval(id);
  }, [context]);

  return (
    <p className={className} role="status" aria-live="polite">
      {message}
    </p>
  );
}
