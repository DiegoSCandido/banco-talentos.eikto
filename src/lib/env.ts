const LOCAL_API_URL = "http://localhost:3000";

const rawEnv = import.meta.env as Record<string, string | boolean | undefined>;

function readEnvVar(name: string): string | undefined {
  const value = rawEnv[name];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeUrl(name: string, value: string): string {
  try {
    new URL(value);
    return value.replace(/\/+$/, "");
  } catch {
    throw new Error(`${name} deve ser uma URL absoluta válida.`);
  }
}

function requireEnvVar(name: string): string {
  const value = readEnvVar(name);
  if (!value) {
    throw new Error(`${name} é obrigatório.`);
  }

  return value;
}

function resolveApiUrl(): string {
  const configuredApiUrl = readEnvVar("VITE_API_URL");

  if (configuredApiUrl) {
    return normalizeUrl("VITE_API_URL", configuredApiUrl);
  }

  if (import.meta.env.DEV) {
    return LOCAL_API_URL;
  }

  throw new Error("VITE_API_URL é obrigatório em produção.");
}

export const clientEnv = {
  apiUrl: resolveApiUrl(),
  supabaseUrl: normalizeUrl(
    "VITE_SUPABASE_URL",
    requireEnvVar("VITE_SUPABASE_URL"),
  ),
  supabasePublishableKey: requireEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY"),
};
