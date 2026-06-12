export class ConnectSampleConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectSampleConfigError";
  }
}

export function requireEnv(name: string, hint?: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ConnectSampleConfigError(
      `${name} is not configured.${hint ? ` ${hint}` : ""}`
    );
  }
  return value;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
