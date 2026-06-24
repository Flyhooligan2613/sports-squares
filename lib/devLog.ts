/** Dev-only logging — stripped from production user consoles. */
export function devWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(...args);
  }
}
