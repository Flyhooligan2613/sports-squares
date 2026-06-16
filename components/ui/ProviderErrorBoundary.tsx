"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ProviderErrorBoundaryProps {
  children: ReactNode;
  /** Log prefix, e.g. GenesisProvider */
  name: string;
  fallback?: ReactNode;
}

interface ProviderErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates optional platform providers/modals so a render failure does not crash the shell.
 */
export class ProviderErrorBoundary extends Component<
  ProviderErrorBoundaryProps,
  ProviderErrorBoundaryState
> {
  state: ProviderErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ProviderErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
