import { apiRequest, apiRequestWithCsrf } from "./httpClient";

const RESULTADOS_CACHE = "exameja_resultados_busca_v1";

export { apiRequest } from "./httpClient";

export function cacheSearchResults(offers) {
  try {
    sessionStorage.setItem(RESULTADOS_CACHE, JSON.stringify(offers));
  } catch {
    // A falta de armazenamento não impede a busca.
  }
}

export function getCachedClinicName(uid) {
  try {
    const offers = JSON.parse(sessionStorage.getItem(RESULTADOS_CACHE) || "[]");
    return offers.find((offer) => offer.clinicId === uid)?.name ?? "Clínica";
  } catch {
    return "Clínica";
  }
}

function adaptarResultado(resultado) {
  const { clinica = {}, exame = {}, preco = {} } = resultado;
  return {
    id: `${clinica.uid}:${exame.codigo}`,
    clinicId: clinica.uid,
    name: clinica.nomeFantasia,
    address: clinica.endereco,
    lat: clinica.latitude,
    lng: clinica.longitude,
    distanceKm: clinica.distanciaKm,
    insurances: (clinica.conveniosAceitos ?? []).map(({ nome }) => nome),
    insuranceIds: (clinica.conveniosAceitos ?? []).map(({ id }) => id),
    exam: exame.nome,
    examCode: exame.codigo,
    price: preco.valor,
    rating: Number.isFinite(clinica.avaliacaoMedia) && clinica.quantidadeAvaliacoes > 0
      ? clinica.avaliacaoMedia
      : null,
    reviewsCount: Number.isSafeInteger(clinica.quantidadeAvaliacoes)
      ? clinica.quantidadeAvaliacoes
      : 0,
  };
}

export async function getExamCatalog({ page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const pagina = await apiRequest(`/api/exams?${params}`);
  return {
    exams: (pagina?.dados ?? []).map((exame) => ({
      ...exame,
      nome: exame.nome ?? exame.descricao,
      codigo: String(exame.codigo),
    })),
    total: Number.isFinite(pagina?.total) ? pagina.total : null,
    pages: Number.isFinite(pagina?.paginas) ? pagina.paginas : null,
    currentPage: Number.isFinite(pagina?.paginaAtual) ? pagina.paginaAtual : page,
  };
}

export async function getInsurances() {
  const data = await apiRequest("/api/convenios");
  return (data?.convenios ?? []).map(({ id, nome }) => ({ id, name: nome }));
}

export async function searchExamOffers({
  codigoExame,
  endereco,
  latitude,
  longitude,
  convenioId,
  raioKm,
  precoMinimo,
  precoMaximo,
  ordenar = "distancia",
  limit = 100,
  offset = 0,
} = {}) {
  if (!codigoExame) throw new Error("Selecione um exame do catálogo TUSS.");
  const temEndereco = Boolean(endereco?.trim());
  const temLatitude = Number.isFinite(latitude);
  const temLongitude = Number.isFinite(longitude);
  if (temEndereco === (temLatitude && temLongitude)) {
    throw new Error("Informe um endereço ou use sua localização para buscar clínicas.");
  }

  const params = new URLSearchParams({
    codigoExame,
    ordenar: ordenar === "preco" ? "preco" : "distancia",
    limit: String(limit),
    offset: String(offset),
  });
  if (temEndereco) params.set("endereco", endereco.trim());
  else {
    params.set("latitude", String(latitude));
    params.set("longitude", String(longitude));
  }
  if (convenioId) params.set("convenioId", convenioId);
  if (raioKm !== undefined && raioKm !== "") params.set("raioKm", String(raioKm));
  if (precoMinimo !== undefined && precoMinimo !== "") params.set("precoMinimo", String(precoMinimo));
  if (precoMaximo !== undefined && precoMaximo !== "") params.set("precoMaximo", String(precoMaximo));

  const data = await apiRequest(`/api/clinics/search?${params}`);
  const offers = (data?.resultados ?? []).map(adaptarResultado);
  return {
    offers,
    location: data?.localizacao ?? null,
    total: Number(data?.total ?? 0),
    limit: Number(data?.limit ?? limit),
    offset: Number(data?.offset ?? offset),
    raw: data,
  };
}

export async function getEstablishment(id) {
  const resposta = await apiRequest(`/api/clinics/${encodeURIComponent(id)}`);
  const clinica = resposta?.clinica;
  if (!clinica) return null;

  const ofertasEmCache = await getEstablishmentOffers(id);
  const ofertaConhecida = ofertasEmCache[0];
  const ofertas = (clinica.ofertas ?? []).map((oferta) => ({
    id: `${id}:${oferta.codigoExame}`,
    clinicId: id,
    name: clinica.nomeFantasia,
    address: clinica.endereco,
    lat: clinica.latitude ?? ofertaConhecida?.lat,
    lng: clinica.longitude ?? ofertaConhecida?.lng,
    distanceKm: ofertaConhecida?.distanceKm,
    insurances: (clinica.conveniosAceitos ?? []).map(({ nome }) => nome),
    insuranceIds: (clinica.conveniosAceitos ?? []).map(({ id: convenioId }) => convenioId),
    exam: oferta.nomeExame,
    examCode: String(oferta.codigoExame),
    price: oferta.preco,
    rating: Number.isFinite(clinica.avaliacaoMedia) && clinica.quantidadeAvaliacoes > 0
      ? clinica.avaliacaoMedia
      : null,
    reviewsCount: Number.isSafeInteger(clinica.quantidadeAvaliacoes)
      ? clinica.quantidadeAvaliacoes
      : 0,
  }));
  return { clinic: clinica, offers: ofertas };
}

export async function getEstablishmentOffers(id) {
  try {
    const offers = JSON.parse(sessionStorage.getItem(RESULTADOS_CACHE) || "[]");
    return offers.filter((offer) => offer.clinicId === id || offer.id === id);
  } catch {
    return [];
  }
}

export async function getClinicReviews(uid, { limit = 20, cursor } = {}) {
  const params = new URLSearchParams({ limite: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return apiRequest(`/api/clinics/${encodeURIComponent(uid)}/reviews?${params}`);
}

export async function getClinicAvailability(uid, { inicio, fim, limite = 50, cursor } = {}) {
  const params = new URLSearchParams({ inicio, fim, limite: String(limite) });
  if (cursor) params.set("cursor", cursor);
  return apiRequest(`/api/clinics/${encodeURIComponent(uid)}/availability?${params}`);
}

export async function publishClinicAvailability(horarios) {
  return apiRequestWithCsrf("/api/clinics/me/availability", "POST", { horarios });
}

export async function removeClinicAvailability(dataHora) {
  return apiRequestWithCsrf(
    `/api/clinics/me/availability/${encodeURIComponent(dataHora)}`,
    "DELETE",
    {},
  );
}

export async function createAppointment(payload) {
  const resposta = await apiRequestWithCsrf("/api/appointments", "POST", payload);
  return resposta.agendamento ?? resposta;
}

export async function listAppointments({ limit = 30, cursor } = {}) {
  const params = new URLSearchParams({ limite: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return apiRequest(`/api/appointments?${params}`);
}

export async function getAppointment(id) {
  return apiRequest(`/api/appointments/${encodeURIComponent(id)}`);
}

export async function updateAppointment(id, payload) {
  return apiRequestWithCsrf(`/api/appointments/${encodeURIComponent(id)}`, "PUT", payload);
}

export async function createReview(payload) {
  return apiRequestWithCsrf("/api/reviews", "POST", payload);
}
