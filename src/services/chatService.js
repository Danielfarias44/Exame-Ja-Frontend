import { PERFIS } from "@/constants/perfis";
import { obterSessaoAtual } from "./autenticacaoService";
import { apiPostWithCsrf, apiRequest } from "./httpClient";
import { getCachedClinicName } from "./api";

export const LIMITE_TEXTO_MENSAGEM = 1000;
const ouvintes = new Set();

function publicar(evento) {
  ouvintes.forEach((ouvinte) => ouvinte(evento));
}

function dataIso(valor) {
  if (typeof valor === "string") return valor;
  if (valor?._seconds) return new Date(valor._seconds * 1000).toISOString();
  if (typeof valor?.seconds === "number") return new Date(valor.seconds * 1000).toISOString();
  return "";
}

function normalizarMensagem(mensagem) {
  return { ...mensagem, criadoEm: dataIso(mensagem.criadoEm) };
}

function normalizarConversa(conversa, sessao) {
  const souCliente = sessao.perfil === PERFIS.PACIENTE;
  const clienteNome = conversa.clienteNome
    ?? conversa.nomeCliente
    ?? conversa.cliente?.nome
    ?? (souCliente ? sessao.nome : null);
  const nomeClinicaEmCache = getCachedClinicName(conversa.clinicaUid);
  const clinicaNome = conversa.clinicaNome
    ?? conversa.nomeFantasia
    ?? conversa.clinica?.nomeFantasia
    ?? conversa.clinica?.nome
    ?? (nomeClinicaEmCache !== "Clínica" ? nomeClinicaEmCache : null);
  return {
    ...conversa,
    clienteNome: clienteNome || `Paciente ${conversa.clienteUid || ""}`.trim(),
    clinicaNome: clinicaNome || `Clínica ${conversa.clinicaUid || ""}`.trim(),
    atualizadoEm: dataIso(conversa.atualizadoEm),
  };
}

export function obterParticipanteAtual() {
  const sessao = obterSessaoAtual();
  if (!sessao?.autenticado) return null;
  if (sessao.perfil === PERFIS.CLINICA) return { uid: sessao.id, tipo: "clinica", nome: sessao.nome };
  if (sessao.perfil === PERFIS.PACIENTE) return { uid: sessao.id, tipo: "cliente", nome: sessao.nome };
  return null;
}

function exigirParticipante() {
  const participante = obterParticipanteAtual();
  if (!participante) {
    const erro = new Error("Entre na sua conta para usar o chat.");
    erro.status = 401;
    throw erro;
  }
  return participante;
}

export async function listarConversas({ limite = 30, cursor } = {}) {
  const sessao = obterSessaoAtual();
  exigirParticipante();
  const params = new URLSearchParams({ limite: String(limite) });
  if (cursor) params.set("cursor", cursor);
  const data = await apiRequest(`/api/conversations?${params}`);
  return {
    conversas: (data?.conversas ?? []).map((conversa) => normalizarConversa(conversa, sessao)),
    proximoCursor: data?.proximoCursor ?? null,
  };
}

export async function iniciarConversa(clinicaUid) {
  exigirParticipante();
  const conversa = await apiPostWithCsrf("/api/conversations", { clinicaUid });
  publicar({ tipo: "conversa-criada" });
  return conversa;
}

export async function listarMensagens(conversaId, { limite = 30, cursor } = {}) {
  exigirParticipante();
  const params = new URLSearchParams({ limite: String(limite) });
  if (cursor) params.set("cursor", cursor);
  const data = await apiRequest(`/api/conversations/${encodeURIComponent(conversaId)}/messages?${params}`);
  return {
    mensagens: (data?.mensagens ?? []).map(normalizarMensagem),
    proximoCursor: data?.proximoCursor ?? null,
  };
}

export async function enviarMensagem(conversaId, texto) {
  exigirParticipante();
  const mensagem = await apiPostWithCsrf(`/api/conversations/${encodeURIComponent(conversaId)}/messages`, { texto });
  const normalizada = normalizarMensagem(mensagem);
  publicar({ tipo: "nova-mensagem", conversaId, mensagem: normalizada });
  return normalizada;
}

export function assinarChat(aoReceberEvento) {
  ouvintes.add(aoReceberEvento);
  return () => ouvintes.delete(aoReceberEvento);
}
