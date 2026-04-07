const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export type ScriptRecord = {
  id: string;
  title: string;
  content: string;
  sceneId: string;
  tags: Array<{
    id: string;
    label: "vocab" | "grammar";
    value: string;
  }>;
  visualPrompts: string[];
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  syncLevel: number;
  streakDays: number;
};

export type AuthResponse = {
  token: string;
  user: UserRecord;
};

export type VocabularyRecord = {
  id: string;
  term: string;
  type: "vocab" | "grammar";
  sceneId?: string;
};

export type VaultRecord = {
  id: string;
  vocabularyId: string;
  sceneId: string;
  cloudinaryPublicId: string;
  secureUrl?: string;
  assetType: "image" | "video" | "prompt";
  notes: string;
};

export type ScriptAnalysis = {
  provider: "openai" | "stub";
  nextStep?: string;
  tags: Array<{
    label: "vocab" | "grammar";
    value: string;
  }>;
  visualPrompts: string[];
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const api = {
  health: () => request<{ mongodb: { connected: boolean } }>("/health"),
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listScripts: () => request<ScriptRecord[]>("/api/scripts"),
  createScript: (payload: { title: string; content: string; sceneId: string }) =>
    request<ScriptRecord>("/api/scripts", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateScript: (
    id: string,
    payload: Partial<{ title: string; content: string; sceneId: string }>
  ) =>
    request<ScriptRecord>(`/api/scripts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  listVocabulary: () => request<VocabularyRecord[]>("/api/vocabulary"),
  listVault: () => request<VaultRecord[]>("/api/vault"),
  importVaultAsset: (payload: {
    vocabularyId: string;
    sceneId: string;
    sourceUrl: string;
    notes: string;
  }) =>
    request<{ provider: "cloudinary" | "stub"; item: VaultRecord }>(
      "/api/vault/import",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  analyzeScript: (script: string) =>
    request<ScriptAnalysis>("/api/ai/analyze-script", {
      method: "POST",
      body: JSON.stringify({ script })
    })
};
