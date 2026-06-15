const STACK_KEY = "sb:nav-stack";
const MAX_STACK = 40;

function readStack(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
  } catch {
    /* ignore quota */
  }
}

export function formatNavHref(pathname: string, searchParams: URLSearchParams | { toString(): string }): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Record each in-app route visit (skips consecutive duplicates). */
export function pushNavEntry(href: string): void {
  const stack = readStack();
  if (stack[stack.length - 1] === href) return;
  stack.push(href);
  writeStack(stack);
}

/** Returns the previous in-app route and trims the current page off the stack. */
export function consumePreviousNav(currentHref: string): string | null {
  const stack = readStack();
  while (stack.length > 0 && stack[stack.length - 1] === currentHref) {
    stack.pop();
  }
  const previous = stack.length > 0 ? stack[stack.length - 1]! : null;
  writeStack(stack);
  return previous;
}
