export const SURVIVOR_BASE_PATH = "/survivor";

export function survivorPath(...segments: string[]): string {
  const tail = segments.filter(Boolean).join("/");
  return tail ? `${SURVIVOR_BASE_PATH}/${tail}` : SURVIVOR_BASE_PATH;
}
