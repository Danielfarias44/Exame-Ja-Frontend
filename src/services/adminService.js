import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";

function montarConsulta(parametros) {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") consulta.set(chave, String(valor));
  });
  return consulta.toString();
}

function rotaClinica(uid, acao) {
  return `/api/admin/clinics/${encodeURIComponent(uid)}/${acao}`;
}

export async function listarClinicasPendentes({ limite = 50, cursor } = {}) {
  const resposta = await apiRequest(`/api/admin/clinics?${montarConsulta({ limit: limite, cursor })}`);
  return {
    itens: resposta?.clinicas ?? [],
    proximoCursor: resposta?.proximoCursor ?? null,
  };
}

export async function listarEstabelecimentos({ status, limite = 30, cursor } = {}) {
  const resposta = await apiRequest(`/api/admin/establishments?${montarConsulta({ status, limite, cursor })}`);
  return {
    itens: resposta?.clinicas ?? [],
    proximoCursor: resposta?.proximoCursor ?? null,
  };
}

export async function listarUsuarios({ tipo, status, limite = 30, cursor } = {}) {
  const resposta = await apiRequest(`/api/admin/users?${montarConsulta({ tipo, status, limite, cursor })}`);
  return {
    itens: resposta?.usuarios ?? [],
    proximoCursor: resposta?.proximoCursor ?? null,
  };
}

export async function listarDenuncias({ status, alvoTipo, limite = 30, cursor } = {}) {
  const resposta = await apiRequest(`/api/admin/reports?${montarConsulta({ status, alvoTipo, limite, cursor })}`);
  return {
    itens: resposta?.denuncias ?? [],
    proximoCursor: resposta?.proximoCursor ?? null,
  };
}

export async function aprovarClinica(uid) {
  return apiRequestWithCsrf(rotaClinica(uid, "approve"), "POST", {});
}

export async function rejeitarClinica(uid, motivo) {
  return apiRequestWithCsrf(rotaClinica(uid, "reject"), "POST", { motivo });
}

export async function suspenderClinica(uid, motivo) {
  return apiRequestWithCsrf(rotaClinica(uid, "suspend"), "POST", { motivo });
}

export async function reativarClinica(uid, motivo) {
  return apiRequestWithCsrf(rotaClinica(uid, "reactivate"), "POST", { motivo });
}

export async function decidirDenuncia(id, { acao, nota }) {
  return apiRequestWithCsrf(`/api/admin/reports/${encodeURIComponent(id)}`, "PUT", {
    acao,
    ...(nota?.trim() ? { nota: nota.trim() } : {}),
  });
}
