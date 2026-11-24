import { obterSessaoAtual } from "./autenticacaoService";
import { CLINICAS_PARCEIRAS } from "./pacienteLogadoService";
import { PERFIS } from "@/constants/perfis";

const STORAGE_KEY = "exameja_chat_v1";
const CANAL = "exameja-chat";
const LIMITE_PADRAO = 30;
const LIMITE_MAXIMO = 50;
const TAMANHO_MAXIMO_TEXTO = 1000;
const CLINICA_DEMO_UID = "labvida";
const PACIENTE_DEMO = { uid: "pac-demo", nome: "Maria Clara Souza" };
const RESPOSTA_AUTOMATICA_DEMO =
  "Recebemos sua mensagem! A recepção responde em horário comercial (segunda a sábado, das 7h às 18h).";
const ATRASO_RESPOSTA_DEMO_MS = 1500;

export const LIMITE_TEXTO_MENSAGEM = TAMANHO_MAXIMO_TEXTO;

const ouvintesLocais = new Set();
const canal = typeof BroadcastChannel === "function" ? new BroadcastChannel(CANAL) : null;

canal?.addEventListener("message", (evento) => {
  ouvintesLocais.forEach((ouvinte) => ouvinte(evento.data));
});

function erroComStatus(mensagem, status) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function lerEstado() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) return JSON.parse(salvo);
  } catch {
    return { conversas: {}, mensagens: {} };
  }
  return { conversas: {}, mensagens: {} };
}

function salvarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    return;
  }
}

function avisar(evento) {
  ouvintesLocais.forEach((ouvinte) => ouvinte(evento));
  canal?.postMessage(evento);
}

function nomeDaClinica(clinicaUid) {
  return CLINICAS_PARCEIRAS.find((clinica) => clinica.id === clinicaUid)?.nome ?? "Clínica";
}

function minutosAtras(minutos) {
  return new Date(Date.now() - minutos * 60 * 1000).toISOString();
}

function criarConversaNoEstado(estado, { clienteUid, clienteNome, clinicaUid }, mensagensIniciais = []) {
  const id = `${clienteUid}_${clinicaUid}`;
  const mensagens = mensagensIniciais.map((mensagem, indice) => ({
    id: `${id}-seed-${indice}`,
    ...mensagem,
  }));
  const ultima = mensagens[mensagens.length - 1];

  estado.conversas[id] = {
    id,
    clienteUid,
    clinicaUid,
    clienteNome,
    clinicaNome: nomeDaClinica(clinicaUid),
    ultimaMensagem: ultima ? ultima.texto.slice(0, 100) : null,
    criadoEm: mensagens[0]?.criadoEm ?? new Date().toISOString(),
    atualizadoEm: ultima?.criadoEm ?? new Date().toISOString(),
  };
  estado.mensagens[id] = mensagens;
  return estado.conversas[id];
}

function garantirConversasDeExemplo(estado, participante) {
  const temConversas = Object.values(estado.conversas).some(
    (conversa) =>
      conversa[participante.tipo === "cliente" ? "clienteUid" : "clinicaUid"] === participante.uid
  );
  if (temConversas) return;

  const cliente =
    participante.tipo === "cliente"
      ? { clienteUid: participante.uid, clienteNome: participante.nome }
      : { clienteUid: PACIENTE_DEMO.uid, clienteNome: PACIENTE_DEMO.nome };
  const clinicaPrincipal = participante.tipo === "clinica" ? participante.uid : CLINICA_DEMO_UID;

  criarConversaNoEstado(estado, { ...cliente, clinicaUid: clinicaPrincipal }, [
    {
      remetenteUid: cliente.clienteUid,
      texto: "Bom dia! Para o hemograma eu preciso ficar em jejum?",
      criadoEm: minutosAtras(180),
    },
    {
      remetenteUid: clinicaPrincipal,
      texto: "Bom dia! Não é obrigatório, mas recomendamos 3 horas sem refeições gordurosas.",
      criadoEm: minutosAtras(172),
    },
    {
      remetenteUid: cliente.clienteUid,
      texto: "Perfeito, obrigado! Vocês aceitam Unimed?",
      criadoEm: minutosAtras(170),
    },
    {
      remetenteUid: clinicaPrincipal,
      texto: "Aceitamos sim. É só trazer a carteirinha e um documento com foto.",
      criadoEm: minutosAtras(165),
    },
  ]);

  if (participante.tipo === "cliente") {
    criarConversaNoEstado(estado, { ...cliente, clinicaUid: "belem-imagem" }, [
      {
        remetenteUid: cliente.clienteUid,
        texto: "Olá, qual o prazo para o laudo da ultrassonografia?",
        criadoEm: minutosAtras(60 * 26),
      },
      {
        remetenteUid: "belem-imagem",
        texto: "Olá! O laudo fica pronto em até 2 dias úteis e você recebe por e-mail.",
        criadoEm: minutosAtras(60 * 25),
      },
    ]);
  }

  salvarEstado(estado);
}

function validarPaginacao({ limite, cursor } = {}) {
  const limiteNumero = limite === undefined ? LIMITE_PADRAO : Number(limite);
  if (!Number.isSafeInteger(limiteNumero) || limiteNumero < 1) {
    throw erroComStatus("O limite deve ser um número inteiro entre 1 e 50.", 400);
  }
  return { limite: Math.min(limiteNumero, LIMITE_MAXIMO), cursor };
}

function paginar(lista, { limite, cursor }) {
  let inicio = 0;
  if (cursor !== undefined) {
    const posicao = lista.findIndex((item) => item.id === cursor);
    if (posicao === -1) throw erroComStatus("Cursor de paginação não encontrado.", 400);
    inicio = posicao + 1;
  }
  const pagina = lista.slice(inicio, inicio + limite);
  const temMais = lista.length > inicio + limite;
  return { pagina, proximoCursor: temMais ? pagina[pagina.length - 1].id : null };
}

function participaDa(conversa, participante) {
  return conversa.clienteUid === participante.uid || conversa.clinicaUid === participante.uid;
}

function buscarConversaPermitida(estado, conversaId, participante) {
  const conversa = estado.conversas[conversaId];
  if (!conversa) throw erroComStatus("Conversa não encontrada.", 404);
  if (!participaDa(conversa, participante)) {
    throw erroComStatus("Somente participantes podem acessar esta conversa.", 403);
  }
  return conversa;
}

function gravarMensagem(estado, conversa, remetenteUid, texto) {
  const mensagem = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    remetenteUid,
    texto,
    criadoEm: new Date().toISOString(),
  };
  estado.mensagens[conversa.id] = [...(estado.mensagens[conversa.id] ?? []), mensagem];
  conversa.ultimaMensagem = texto.slice(0, 100);
  conversa.atualizadoEm = mensagem.criadoEm;
  salvarEstado(estado);
  avisar({ tipo: "nova-mensagem", conversaId: conversa.id, mensagem });
  return mensagem;
}

function agendarRespostaDemo(conversaId, clinicaUid) {
  setTimeout(() => {
    const estado = lerEstado();
    const conversa = estado.conversas[conversaId];
    if (!conversa) return;
    gravarMensagem(estado, conversa, clinicaUid, RESPOSTA_AUTOMATICA_DEMO);
  }, ATRASO_RESPOSTA_DEMO_MS);
}

export function obterParticipanteAtual() {
  const sessao = obterSessaoAtual();
  if (!sessao?.token) return null;
  if (sessao.perfil === PERFIS.CLINICA) {
    return {
      uid: sessao.clinicaUid ?? CLINICA_DEMO_UID,
      tipo: "clinica",
      nome: sessao.nome,
    };
  }
  if (sessao.perfil === PERFIS.PACIENTE) {
    return { uid: sessao.id, tipo: "cliente", nome: sessao.nome };
  }
  return null;
}

function exigirParticipante() {
  const participante = obterParticipanteAtual();
  if (!participante) throw erroComStatus("Entre na sua conta para usar o chat.", 401);
  return participante;
}

export async function listarConversas(paginacao) {
  const participante = exigirParticipante();
  const opcoes = validarPaginacao(paginacao);
  const estado = lerEstado();
  garantirConversasDeExemplo(estado, participante);

  const campo = participante.tipo === "cliente" ? "clienteUid" : "clinicaUid";
  const minhas = Object.values(estado.conversas)
    .filter((conversa) => conversa[campo] === participante.uid)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));

  const { pagina, proximoCursor } = paginar(minhas, opcoes);
  return { conversas: pagina, proximoCursor };
}

export async function iniciarConversa(clinicaUid) {
  const participante = exigirParticipante();
  if (typeof clinicaUid !== "string" || !clinicaUid.trim()) {
    throw erroComStatus("Informe um identificador válido para a clínica.", 400);
  }
  if (participante.tipo !== "cliente") {
    throw erroComStatus("Somente pacientes podem iniciar uma conversa.", 403);
  }
  if (!CLINICAS_PARCEIRAS.some((clinica) => clinica.id === clinicaUid)) {
    throw erroComStatus("Clínica não encontrada.", 404);
  }

  const estado = lerEstado();
  const id = `${participante.uid}_${clinicaUid}`;
  if (estado.conversas[id]) return estado.conversas[id];

  const conversa = criarConversaNoEstado(estado, {
    clienteUid: participante.uid,
    clienteNome: participante.nome,
    clinicaUid,
  });
  salvarEstado(estado);
  avisar({ tipo: "conversa-criada", conversaId: id });
  return conversa;
}

export async function listarMensagens(conversaId, paginacao) {
  const participante = exigirParticipante();
  const opcoes = validarPaginacao(paginacao);
  const estado = lerEstado();
  buscarConversaPermitida(estado, conversaId, participante);

  const maisNovasPrimeiro = [...(estado.mensagens[conversaId] ?? [])].reverse();
  const { pagina, proximoCursor } = paginar(maisNovasPrimeiro, opcoes);
  return { mensagens: pagina, proximoCursor };
}

export async function enviarMensagem(conversaId, texto) {
  const participante = exigirParticipante();
  const textoLimpo = typeof texto === "string" ? texto.trim() : "";
  if (textoLimpo.length < 1 || textoLimpo.length > TAMANHO_MAXIMO_TEXTO) {
    throw erroComStatus(`O texto deve conter de 1 a ${TAMANHO_MAXIMO_TEXTO} caracteres.`, 400);
  }

  const estado = lerEstado();
  const conversa = buscarConversaPermitida(estado, conversaId, participante);
  const anteriores = estado.mensagens[conversaId] ?? [];
  const ultimaAnterior = anteriores[anteriores.length - 1];
  const mensagem = gravarMensagem(estado, conversa, participante.uid, textoLimpo);

  const clinicaFalouPorUltimo = !ultimaAnterior || ultimaAnterior.remetenteUid === conversa.clinicaUid;
  const jaRespondeuAutomaticamente = ultimaAnterior?.texto === RESPOSTA_AUTOMATICA_DEMO;
  if (participante.tipo === "cliente" && clinicaFalouPorUltimo && !jaRespondeuAutomaticamente) {
    agendarRespostaDemo(conversaId, conversa.clinicaUid);
  }
  return mensagem;
}

export function assinarChat(aoReceberEvento) {
  ouvintesLocais.add(aoReceberEvento);
  return () => ouvintesLocais.delete(aoReceberEvento);
}
