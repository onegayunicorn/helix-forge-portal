/**
 * Helix Forge API client — talks to FastAPI /api/v1.
 * Falls back to local fixtures when the backend is unreachable (offline research mode).
 */

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

export type EvidenceGrade = "SUPPORTED" | "EMERGING" | "DISPUTED" | "INSUFFICIENT" | "NEGATIVE";

export interface EvidenceLine {
  source: string;
  evidence_type: string;
  claim: string;
  confidence: number;
  grade: EvidenceGrade;
  pmid?: string | null;
  adapter_status?: string;
}

export interface ConcordanceResult {
  grade: EvidenceGrade;
  lines: EvidenceLine[];
  rules_applied: string[];
  denominator: number;
  research_seal: string;
}

export interface FrameResult {
  start_exon: number;
  end_exon: number;
  total_nt: number;
  length_mod_3: number;
  frame_status: "IN_FRAME" | "FRAMESHIFT";
  phenotype: "BMD_LIKE" | "DMD_LIKE" | "UNKNOWN";
  nmd_status: string;
  skip_rescue: string[];
  domains_impacted: string[];
  research_seal: string;
  provenance: Record<string, unknown>;
}

export interface SandboxRun {
  id: string;
  name: string;
  detail: string;
  status: string;
  duration_ms: number;
  created_at: string;
  provenance?: Record<string, unknown>;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  role: string;
}

let authToken: string | null =
  typeof localStorage !== "undefined" ? localStorage.getItem("hf_token") : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem("hf_token", token);
    else localStorage.removeItem("hf_token");
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const data = await request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function fetchHealth(): Promise<{ status: string; seal: string }> {
  return request("/health");
}

export async function computeFrame(
  start_exon: number,
  end_exon: number,
): Promise<FrameResult> {
  return request("/frame/compute", {
    method: "POST",
    body: JSON.stringify({ start_exon, end_exon, variant_class: "deletion" }),
  });
}

export async function gradeConcordance(
  variant_claim = "Pathogenic Exon 52 Deletion",
  sources_enabled: string[] = ["LOVD", "ClinVar"],
): Promise<ConcordanceResult> {
  return request("/evidence/concordance", {
    method: "POST",
    body: JSON.stringify({
      variant_claim,
      sources_enabled,
      text_mined_count: 0,
      include_refutation: false,
    }),
  });
}

export async function listRuns(): Promise<SandboxRun[]> {
  return request("/runs");
}

export async function createRun(name?: string): Promise<SandboxRun> {
  const q = name ? `?name=${encodeURIComponent(name)}` : "";
  return request(`/runs${q}`, { method: "POST" });
}

/** Fixture fallbacks used when the API is offline */
export const FIXTURE_EVIDENCE: EvidenceLine[] = [
  {
    source: "ClinVar",
    evidence_type: "Curated",
    claim: "del52 remains in-frame",
    confidence: 98,
    grade: "SUPPORTED",
  },
  {
    source: "LOVD",
    evidence_type: "Curated",
    claim: "Exon boundary agrees",
    confidence: 94,
    grade: "SUPPORTED",
  },
  {
    source: "Literature",
    evidence_type: "Text mined",
    claim: "Rescue route reported",
    confidence: 78,
    grade: "EMERGING",
  },
];

export const FIXTURE_RUNS: SandboxRun[] = [
  {
    id: "fix-1",
    name: "whole_locus_verification",
    detail: "6,319 blocks · 0 disagreements",
    status: "PASS",
    duration_ms: 188,
    created_at: new Date().toISOString(),
  },
  {
    id: "fix-2",
    name: "concordance_grade_del52",
    detail: "3 sources · supported",
    status: "PASS",
    duration_ms: 42,
    created_at: new Date().toISOString(),
  },
  {
    id: "fix-3",
    name: "frame_rescue_simulation",
    detail: "del44 + del45–53 · in-frame",
    status: "PASS",
    duration_ms: 71,
    created_at: new Date().toISOString(),
  },
  {
    id: "fix-4",
    name: "reference_manifest_check",
    detail: "79 exons · checksums aligned",
    status: "PASS",
    duration_ms: 16,
    created_at: new Date().toISOString(),
  },
];
