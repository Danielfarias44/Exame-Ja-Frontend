import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";

export async function listarClinicasPendentes({ limite = 50, cursor } = {}) {
  const params = new URLSearchParams({ limit: String(limite) });
  if (cursor) params.set("cursor", cursor);
  const resposta = await apiRequest(`/api/admin/clinics?${params}`);
  return {
    clinicas: resposta.clinicas ?? resposta.dados ?? [],
    proximoCursor: resposta.proximoCursor ?? null,
  };
}

export async function aprovarClinica(uid) {
  return apiRequestWithCsrf(`/api/admin/clinics/${encodeURIComponent(uid)}/approve`, "POST", {});
}

export async function rejeitarClinica(uid, motivo) {
  return apiRequestWithCsrf(`/api/admin/clinics/${encodeURIComponent(uid)}/reject`, "POST", { motivo });
}
