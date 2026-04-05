import { supabase } from "@/integrations/supabase/client";
import type { Candidate } from "@/components/CandidateTable";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type CandidateCreate = Omit<Candidate, "id" | "created_at" | "updated_at">;
type CandidateUpdate = Partial<CandidateCreate>;

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
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `Erro ${res.status}`);
  return (body.data ?? body) as T;
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

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Erro ${res.status}`);
    }

    const body = await res.json();
    return body.path as string;
  },
};
