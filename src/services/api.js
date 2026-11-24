import { mockEstablishments, mockReviews } from "./mocks";
import { obterSessaoAtual, sairDaConta } from "./autenticacaoService";
import {
  CATEGORIAS_EXAMES,
  CLINICAS_PARCEIRAS,
  CONVENIOS_DISPONIVEIS,
  OFERTAS_EXAMES,
} from "./pacienteLogadoService";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function apiRequest(path, options = {}) {
  const sessao = obterSessaoAtual();

  const headers = {
    "Content-Type": "application/json",
    ...(sessao?.token ? { Authorization: `Bearer ${sessao.token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sairDaConta();
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const dados = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      dados?.mensagem ||
        dados?.message ||
        `Erro ${response.status} ao chamar ${path}`
    );
  }

  return dados;
}

async function request(path, options) {
  return apiRequest(path, options);
}

// GET /establishments/:id
export async function getEstablishment(id) {
  if (USE_MOCKS) {
    return mockEstablishments.find((e) => e.id === id) ?? null;
  }
  return request(`/establishments/${id}`);
}

// GET /establishments/:id/reviews
export async function getEstablishmentReviews(id) {
  if (USE_MOCKS) {
    return mockReviews;
  }
  return request(`/establishments/${id}/reviews`);
}

const ORDENACOES = {
  distancia: (a, b) => compararComNulosNoFim(a.distanceKm, b.distanceKm),
  preco: (a, b) => compararComNulosNoFim(a.price, b.price),
  avaliacao: (a, b) => compararComNulosNoFim(b.rating, a.rating),
};

function compararComNulosNoFim(valorA, valorB) {
  if (valorA == null && valorB == null) return 0;
  if (valorA == null) return 1;
  if (valorB == null) return -1;
  return valorA - valorB;
}

function normalizar(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function nomeDoConvenio(id) {
  return CONVENIOS_DISPONIVEIS.find((convenio) => convenio.id === id)?.nome ?? id;
}

function adaptarOferta(oferta) {
  const clinica = CLINICAS_PARCEIRAS.find((item) => item.id === oferta.clinicaId);
  return {
    id: oferta.id,
    clinicId: oferta.clinicaId,
    name: oferta.clinicaNome,
    unit: oferta.unidade,
    address: clinica?.endereco ?? oferta.bairro,
    exam: oferta.exameNome,
    price: oferta.precoParticular ?? null,
    rating: oferta.avaliacao ?? null,
    reviewsCount: clinica?.totalAvaliacoes ?? 0,
    distanceKm: oferta.distanciaKm ?? null,
    insurances: (oferta.conveniosAceitos ?? []).map(nomeDoConvenio),
    insuranceIds: oferta.conveniosAceitos ?? [],
    nextSlot: oferta.proximoHorario ?? null,
    resultTime: oferta.prazoResultado ?? null,
    lat: clinica?.latitude ?? null,
    lng: clinica?.longitude ?? null,
  };
}

function ofertaCorrespondeAoTermo(oferta, termo) {
  if (!termo) return true;
  const categoria = CATEGORIAS_EXAMES.find((item) => item.id === oferta.categoria)?.label;
  const campos = [
    oferta.exameNome,
    oferta.clinicaNome,
    oferta.bairro,
    categoria,
    ...(oferta.conveniosAceitos ?? []).map(nomeDoConvenio),
  ];
  return campos.some((campo) => normalizar(campo).includes(termo));
}

export async function searchExamOffers({ q = "", convenio = "", ordenar = "distancia" } = {}) {
  const termo = normalizar(q.trim());
  const ordenacao = ORDENACOES[ordenar] ?? ORDENACOES.distancia;

  return OFERTAS_EXAMES.filter((oferta) => ofertaCorrespondeAoTermo(oferta, termo))
    .filter((oferta) => !convenio || (oferta.conveniosAceitos ?? []).includes(convenio))
    .map(adaptarOferta)
    .sort(ordenacao);
}

export async function getInsurances() {
  return CONVENIOS_DISPONIVEIS.map(({ id, nome }) => ({ id, name: nome }));
}
