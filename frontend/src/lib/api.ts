import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/components/CandidateTable";
import { clientEnv } from "@/lib/env";

const API_URL = clientEnv.apiUrl;

type CandidateCreate = Omit<Candidate, "id" | "created_at" | "updated_at">;
type CandidateUpdate = Partial<CandidateCreate>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();

  if (!text) return null;

  const contentType = res.headers.get("content-type") ?? "";
  const looksLikeJson = contentType.includes("application/json");

  if (looksLikeJson) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new Error(
        `Resposta JSON inválida recebida do servidor (${res.status}).`,
      );
    }
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(res: Response, body: unknown): string {
  if (isRecord(body)) {
    if (typeof body.error === "string" && body.error.trim()) return body.error;
    if (typeof body.message === "string" && body.message.trim())
      return body.message;
  }

  if (typeof body === "string" && body.trim()) {
    if (body.trim().startsWith("<")) {
      return `Erro ${res.status}: resposta inválida recebida do servidor.`;
    }

    return body.trim();
  }

  return `Erro ${res.status}`;
}

async function getHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const body = await readResponseBody(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(res, body));
  }

  if (isRecord(body) && "data" in body) {
    return body.data as T;
  }

  return body as T;
}

export const candidatesApi = {
  list: async (): Promise<Candidate[]> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates`, { headers });
    return handleResponse<Candidate[]>(res);
  },

  create: async (data: CandidateCreate): Promise<Candidate> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<Candidate>(res);
  },

  update: async (id: string, data: CandidateUpdate): Promise<Candidate> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse<Candidate>(res);
  },

  delete: async (id: string): Promise<void> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates/${id}`, {
      method: "DELETE",
      headers,
    });
    return handleResponse<void>(res);
  },

  setFavorite: async (id: string, is_favorite: boolean): Promise<Candidate> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates/${id}/favorite`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ is_favorite }),
    });
    return handleResponse<Candidate>(res);
  },

  getResumeUrl: async (id: string): Promise<string> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/api/candidates/${id}/resume`, {
      headers,
    });
    const body = await handleResponse<{ url: string }>(res);
    return body.url;
  },
};

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const uploadApi = {
  resume: async (file: File): Promise<string> => {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/upload/resume`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const body = await handleResponse<{ path: string }>(res);
    return body.path as string;
  },
};
