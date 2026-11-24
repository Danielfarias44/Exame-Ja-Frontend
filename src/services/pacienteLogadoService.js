import { obterSessaoAtual } from "./autenticacaoService";

const STORAGE_KEY = "exameja_paciente_logado_v1";

export const CONVENIOS_DISPONIVEIS = [
  { id: "unimed", nome: "Unimed Belém" },
  { id: "hapvida", nome: "Hapvida" },
  { id: "bradesco", nome: "Bradesco Saúde" },
  { id: "amil", nome: "Amil" },
  { id: "sulamerica", nome: "SulAmérica" },
  { id: "cassi", nome: "Cassi" },
  { id: "ipasgo", nome: "Saúde Caixa" },
];

export const CATEGORIAS_EXAMES = [
  { id: "todos", label: "Todos" },
  { id: "sangue", label: "Sangue" },
  { id: "imagem", label: "Imagem" },
  { id: "cardio", label: "Cardio" },
  { id: "olhos", label: "Olhos" },
];

export const EXAMES_DISPONIVEIS = [
  {
    id: "hemograma",
    nome: "Hemograma Completo",
    categoria: "sangue",
    preparo: "Jejum não obrigatório (recomendado 3h sem refeições gordurosas).",
  },
  {
    id: "glicemia",
    nome: "Hemograma Completo + Glicemia em Jejum",
    categoria: "sangue",
    preparo: "Jejum obrigatório de 8 a 12 horas (água permitida).",
  },
  {
    id: "ultrassonografia-abdominal",
    nome: "Ultrassonografia Abdominal Total",
    categoria: "imagem",
    preparo: "Jejum de 6 horas e bexiga cheia (ingerir 4 copos de água 1h antes).",
  },
  {
    id: "eletrocardiograma",
    nome: "Eletrocardiograma (ECG)",
    categoria: "cardio",
    preparo: "Não exige jejum. Evitar cafeína e exercícios físicos 2h antes.",
  },
  {
    id: "mapeamento-retina",
    nome: "Mapeamento de Retina",
    categoria: "olhos",
    preparo: "Necessário acompanhante (dilatação da pupila).",
  },
];

export const CLINICAS_PARCEIRAS = [
  {
    id: "labvida",
    nome: "LabVida Diagnósticos",
    unidade: "Unidade Umarizal",
    endereco: "Av. Generalíssimo Deodoro, 1420 - Umarizal, Belém - PA",
    bairro: "Umarizal, Belém",
    distancia: "1,4 km",
    distanciaKm: 1.4,
    latitude: -1.4426,
    longitude: -48.4842,
    avaliacao: 4.9,
    totalAvaliacoes: 312,
    convenios: ["unimed", "hapvida", "bradesco", "amil"],
    conveniosAceitos: ["unimed", "hapvida", "bradesco", "amil"],
    exames: [
      "Hemograma Completo",
      "Hemograma Completo + Glicemia em Jejum",
      "Eletrocardiograma (ECG)",
    ],
    horarios: ["07:00", "07:30", "08:15", "09:00", "10:30", "14:00", "15:30"],
    imagem:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "belem-imagem",
    nome: "Centro Médico Belém Imagem",
    unidade: "Unidade Nazaré",
    endereco: "Av. Nazaré, 680 - Nazaré, Belém - PA",
    bairro: "Nazaré, Belém",
    distancia: "2,3 km",
    distanciaKm: 2.3,
    latitude: -1.4520,
    longitude: -48.4840,
    avaliacao: 4.8,
    totalAvaliacoes: 248,
    convenios: ["unimed", "bradesco", "sulamerica", "cassi"],
    conveniosAceitos: ["unimed", "bradesco", "sulamerica", "cassi"],
    exames: [
      "Hemograma Completo",
      "Ultrassonografia Abdominal Total",
      "Eletrocardiograma (ECG)",
    ],
    horarios: ["07:30", "08:15", "09:15", "11:30", "14:30", "16:00"],
    imagem:
      "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "diagnostica-para",
    nome: "Diagnóstica Pará",
    unidade: "Unidade Batista Campos",
    endereco: "Rua dos Mundurucus, 2110 - Batista Campos, Belém - PA",
    bairro: "Batista Campos, Belém",
    distancia: "3,1 km",
    distanciaKm: 3.1,
    latitude: -1.4615,
    longitude: -48.4905,
    avaliacao: 4.7,
    totalAvaliacoes: 189,
    convenios: ["hapvida", "amil", "ipasgo"],
    conveniosAceitos: ["hapvida", "amil", "ipasgo"],
    exames: [
      "Hemograma Completo",
      "Ultrassonografia Abdominal Total",
      "Mapeamento de Retina",
    ],
    horarios: ["08:00", "08:45", "10:00", "13:30", "16:00"],
    imagem:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
  },
];

export const OFERTAS_EXAMES = [
  {
    id: "of-hemo-labvida",
    exameId: "hemograma",
    exameNome: "Hemograma Completo",
    categoria: "sangue",
    clinicaId: "labvida",
    clinicaNome: "LabVida Diagnósticos",
    unidade: "Unidade Umarizal",
    bairro: "Umarizal, Belém",
    distanciaKm: 1.4,
    avaliacao: 4.9,
    precoParticular: 38.0,
    conveniosAceitos: ["unimed", "hapvida", "bradesco", "amil"],
    prazoResultado: "Mesmo dia (até 18h)",
    proximoHorario: "Amanhã, 07:30",
    preparo: "Jejum não obrigatório (recomendado 3h sem refeições gordurosas).",
  },
  {
    id: "of-hemo-belem",
    exameId: "hemograma",
    exameNome: "Hemograma Completo",
    categoria: "sangue",
    clinicaId: "belem-imagem",
    clinicaNome: "Centro Médico Belém Imagem",
    unidade: "Unidade Nazaré",
    bairro: "Nazaré, Belém",
    distanciaKm: 2.3,
    avaliacao: 4.8,
    precoParticular: 45.0,
    conveniosAceitos: ["unimed", "bradesco", "sulamerica"],
    prazoResultado: "Até 24 horas",
    proximoHorario: "Amanhã, 08:15",
    preparo: "Jejum não obrigatório.",
  },
  {
    id: "of-hemo-diag",
    exameId: "hemograma",
    exameNome: "Hemograma Completo",
    categoria: "sangue",
    clinicaId: "diagnostica-para",
    clinicaNome: "Diagnóstica Pará",
    unidade: "Unidade Batista Campos",
    bairro: "Batista Campos, Belém",
    distanciaKm: 3.1,
    avaliacao: 4.7,
    precoParticular: 32.0,
    conveniosAceitos: ["hapvida", "amil", "ipasgo"],
    prazoResultado: "Até 24 horas",
    proximoHorario: "Hoje, 16:00",
    preparo: "Jejum não obrigatório.",
  },
  {
    id: "of-usg-belem",
    exameId: "ultrassonografia-abdominal",
    exameNome: "Ultrassonografia Abdominal Total",
    categoria: "imagem",
    clinicaId: "belem-imagem",
    clinicaNome: "Centro Médico Belém Imagem",
    unidade: "Unidade Nazaré",
    bairro: "Nazaré, Belém",
    distanciaKm: 2.3,
    avaliacao: 4.8,
    precoParticular: 145.0,
    conveniosAceitos: ["unimed", "bradesco", "sulamerica", "cassi"],
    prazoResultado: "Laudo na hora",
    proximoHorario: "Amanhã, 09:15",
    preparo: "Jejum de 6 horas e bexiga cheia (ingerir 4 copos de água 1h antes).",
  },
  {
    id: "of-usg-diag",
    exameId: "ultrassonografia-abdominal",
    exameNome: "Ultrassonografia Abdominal Total",
    categoria: "imagem",
    clinicaId: "diagnostica-para",
    clinicaNome: "Diagnóstica Pará",
    unidade: "Unidade Batista Campos",
    bairro: "Batista Campos, Belém",
    distanciaKm: 3.1,
    avaliacao: 4.7,
    precoParticular: 129.0,
    conveniosAceitos: ["hapvida", "amil"],
    prazoResultado: "Até 2 horas após o exame",
    proximoHorario: "Quinta, 10:00",
    preparo: "Jejum de 6 horas e bexiga cheia.",
  },
  {
    id: "of-ecg-labvida",
    exameId: "eletrocardiograma",
    exameNome: "Eletrocardiograma (ECG)",
    categoria: "cardio",
    clinicaId: "labvida",
    clinicaNome: "LabVida Diagnósticos",
    unidade: "Unidade Umarizal",
    bairro: "Umarizal, Belém",
    distanciaKm: 1.4,
    avaliacao: 4.9,
    precoParticular: 75.0,
    conveniosAceitos: ["unimed", "hapvida", "bradesco"],
    prazoResultado: "Mesmo dia",
    proximoHorario: "Amanhã, 14:00",
    preparo: "Não exige jejum. Evitar cafeína e exercícios físicos 2h antes.",
  },
  {
    id: "of-ecg-belem",
    exameId: "eletrocardiograma",
    exameNome: "Eletrocardiograma (ECG)",
    categoria: "cardio",
    clinicaId: "belem-imagem",
    clinicaNome: "Centro Médico Belém Imagem",
    unidade: "Unidade Nazaré",
    bairro: "Nazaré, Belém",
    distanciaKm: 2.3,
    avaliacao: 4.8,
    precoParticular: 85.0,
    conveniosAceitos: ["unimed", "sulamerica", "cassi"],
    prazoResultado: "Laudo em 24 horas",
    proximoHorario: "Amanhã, 11:30",
    preparo: "Não exige jejum.",
  },
  {
    id: "of-oftalmo-diag",
    exameId: "mapeamento-retina",
    exameNome: "Mapeamento de Retina",
    categoria: "olhos",
    clinicaId: "diagnostica-para",
    clinicaNome: "Diagnóstica Pará",
    unidade: "Unidade Batista Campos",
    bairro: "Batista Campos, Belém",
    distanciaKm: 3.1,
    avaliacao: 4.7,
    precoParticular: 110.0,
    conveniosAceitos: ["hapvida", "amil", "ipasgo"],
    prazoResultado: "Laudo imediato",
    proximoHorario: "Sexta, 08:45",
    preparo: "Necessário acompanhante (dilatação da pupila).",
  },
];

const ESTADO_INICIAL_DEMO = {
  paciente: {
    id: "pac-01",
    nome: "Maria Clara Souza",
    email: "maria.clara@email.com",
    telefone: "(91) 98412-3390",
    cpf: "123.456.789-00",
    dataNascimento: "1996-05-14",
    cidade: "Belém - PA",
    conveniosIds: ["unimed", "hapvida"],
  },
  agendamentos: [
    {
      id: "ag-101",
      exame: "Hemograma Completo + Glicemia em Jejum",
      exameNome: "Hemograma Completo + Glicemia em Jejum",
      clinicaId: "labvida",
      clinica: "LabVida Diagnósticos",
      clinicaNome: "LabVida Diagnósticos",
      unidade: "Unidade Umarizal",
      data: "24/11/2026",
      horario: "07:30",
      modalidade: "Convênio (Unimed Belém)",
      status: "Confirmado",
      preparo:
        "Jejum obrigatório de 8 a 12 horas (água permitida). Levar documento com foto e pedido médico.",
      avaliado: false,
    },
    {
      id: "ag-098",
      exame: "Eletrocardiograma (ECG)",
      exameNome: "Eletrocardiograma (ECG)",
      clinicaId: "belem-imagem",
      clinica: "Centro Médico Belém Imagem",
      clinicaNome: "Centro Médico Belém Imagem",
      unidade: "Unidade Nazaré",
      data: "10/10/2026",
      horario: "09:00",
      modalidade: "Particular",
      status: "Concluído",
      preparo: "Sem necessidade de jejum.",
      avaliado: false,
    },
  ],
  notificacoes: [
    {
      id: "not-1",
      tipo: "confirmacao",
      titulo: "Agendamento confirmado",
      mensagem:
        "Seu exame Hemograma Completo + Glicemia em Jejum está confirmado para 24/11/2026 às 07:30.",
      data: "Hoje, 10:20",
      lida: false,
    },
    {
      id: "not-2",
      tipo: "preparo",
      titulo: "Lembrete de preparo",
      mensagem:
        "Lembre-se de iniciar o jejum de 8 horas na noite anterior à sua coleta.",
      data: "Ontem, 18:00",
      lida: false,
    },
  ],
};

function criarEstadoParaSessao(sessao) {
  const emailSessao = (sessao.email || "").trim().toLowerCase();

  if (emailSessao === "maria.clara@email.com") {
    return structuredClone(ESTADO_INICIAL_DEMO);
  }

  return {
    paciente: {
      id: sessao.id || `pac-${Date.now()}`,
      nome: sessao.nome || "Paciente",
      email: emailSessao,
      telefone: sessao.telefone || "",
      cpf: sessao.cpf || "",
      dataNascimento: sessao.dataNascimento || "",
      cidade: sessao.cidade || "Belém - PA",
      conveniosIds: Array.isArray(sessao.conveniosIds)
        ? sessao.conveniosIds
        : [],
    },
    agendamentos: [],
    notificacoes: [
      {
        id: `not-boas-vindas-${Date.now()}`,
        tipo: "sistema",
        titulo: "Conta criada com sucesso",
        mensagem: `Bem-vindo(a) ao ExameJá, ${
          (sessao.nome || "Paciente").split(" ")[0]
        }. Você já pode buscar, comparar e agendar seus exames.`,
        data: "Agora mesmo",
        lida: false,
      },
    ],
  };
}

function lerEstado() {
  const sessao = obterSessaoAtual();

  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    let estado = salvo ? JSON.parse(salvo) : null;

    if (sessao && sessao.perfil === "paciente") {
      const emailSalvo = (estado?.paciente?.email || "").trim().toLowerCase();
      const emailSessao = (sessao.email || "").trim().toLowerCase();

      if (!estado || (emailSessao && emailSalvo !== emailSessao)) {
        estado = criarEstadoParaSessao(sessao);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
      }
      return estado;
    }

    if (!estado) {
      estado = structuredClone(ESTADO_INICIAL_DEMO);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    }

    return estado;
  } catch {
    return structuredClone(ESTADO_INICIAL_DEMO);
  }
}

function salvarEstado(novoEstado) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novoEstado));
  window.dispatchEvent(new Event("exameja:estado-atualizado"));
  window.dispatchEvent(new Event("exameja:paciente-atualizado"));
}

/* ============================================================================
 * LEITURA DE ESTADO, PERFIL E CONVÊNIOS
 * ========================================================================== */

export function obterDadosPacienteLogado() {
  return lerEstado();
}

export function obterPerfilPaciente() {
  return lerEstado().paciente;
}

export function atualizarPerfilPaciente(dadosAtualizados) {
  const estado = lerEstado();
  estado.paciente = { ...estado.paciente, ...dadosAtualizados };
  salvarEstado(estado);
  return estado.paciente;
}

export function atualizarConveniosPaciente(conveniosIds) {
  const estado = lerEstado();
  estado.paciente.conveniosIds = conveniosIds.slice(0, 5);
  salvarEstado(estado);
  return estado.paciente;
}

/* ============================================================================
 * AGENDAMENTOS, HISTÓRICO E AVALIAÇÕES
 * ========================================================================== */

export function criarNovoAgendamento(dados) {
  const estado = lerEstado();
  const nomeExame = dados.exameNome || dados.exame || "Exame Laboratorial";
  const nomeClinica = dados.clinicaNome || dados.clinica || "Clínica Parceira";

  const novo = {
    id: `ag-${Date.now()}`,
    status: "Confirmado",
    avaliado: false,
    ...dados,
    exame: nomeExame,
    exameNome: nomeExame,
    clinica: nomeClinica,
    clinicaNome: nomeClinica,
  };

  estado.agendamentos.unshift(novo);
  estado.notificacoes.unshift({
    id: `not-${Date.now()}`,
    tipo: "confirmacao",
    titulo: "Novo agendamento realizado",
    mensagem: `${novo.exameNome} agendado em ${novo.clinicaNome} para ${novo.data} às ${novo.horario}.`,
    data: "Agora mesmo",
    lida: false,
  });
  salvarEstado(estado);
  return novo;
}

export function cancelarAgendamento(agendamentoId) {
  const estado = lerEstado();
  estado.agendamentos = estado.agendamentos.map((ag) =>
    ag.id === agendamentoId ? { ...ag, status: "Cancelado" } : ag
  );
  salvarEstado(estado);
}

export function registrarAvaliacaoAgendamento(
  agendamentoId,
  avaliacaoDados = {}
) {
  const estado = lerEstado();
  estado.agendamentos = estado.agendamentos.map((ag) =>
    ag.id === agendamentoId ? { ...ag, avaliado: true, avaliacaoDados } : ag
  );
  salvarEstado(estado);
}

/* ============================================================================
 * NOTIFICAÇÕES
 * ========================================================================== */

export function obterNotificacoesPaciente() {
  return lerEstado().notificacoes;
}

export function marcarNotificacaoComoLida(notificacaoId) {
  const estado = lerEstado();
  estado.notificacoes = estado.notificacoes.map((n) =>
    n.id === notificacaoId ? { ...n, lida: true } : n
  );
  salvarEstado(estado);
}

export function marcarTodasNotificacoesComoLidas() {
  const estado = lerEstado();
  estado.notificacoes = estado.notificacoes.map((n) => ({ ...n, lida: true }));
  salvarEstado(estado);
}

/* ============================================================================
 * BUSCA COM FILTROS E COMPARAÇÃO DE EXAMES
 * ========================================================================== */

export function buscarOfertasExames({
  termo = "",
  categoria = "todos",
  convenioFiltro = "todos",
  precoMaximo = null,
  ordenarPor = "relevancia",
} = {}) {
  const { paciente } = lerEstado();
  const meusConvenios = paciente?.conveniosIds || [];
  const termoNormalizado = termo.trim().toLowerCase();

  let lista = OFERTAS_EXAMES.filter((oferta) => {
    if (categoria !== "todos" && oferta.categoria !== categoria) {
      return false;
    }

    if (termoNormalizado) {
      const corresponde =
        oferta.exameNome.toLowerCase().includes(termoNormalizado) ||
        oferta.clinicaNome.toLowerCase().includes(termoNormalizado) ||
        oferta.bairro.toLowerCase().includes(termoNormalizado);
      if (!corresponde) return false;
    }

    if (convenioFiltro === "meus_convenios") {
      const atendeAlgumMeu = oferta.conveniosAceitos.some((id) =>
        meusConvenios.includes(id)
      );
      if (!atendeAlgumMeu) return false;
    } else if (
      convenioFiltro !== "todos" &&
      convenioFiltro !== "particular"
    ) {
      if (!oferta.conveniosAceitos.includes(convenioFiltro)) return false;
    }

    if (precoMaximo && Number(precoMaximo) > 0) {
      if (oferta.precoParticular > Number(precoMaximo)) return false;
    }

    return true;
  });

  if (ordenarPor === "menor_preco") {
    lista = [...lista].sort((a, b) => a.precoParticular - b.precoParticular);
  } else if (ordenarPor === "menor_distancia") {
    lista = [...lista].sort((a, b) => a.distanciaKm - b.distanciaKm);
  } else if (ordenarPor === "melhor_avaliacao") {
    lista = [...lista].sort((a, b) => b.avaliacao - a.avaliacao);
  }

  return lista;
}

export function obterOfertasPorIds(ids = []) {
  return ids
    .map((id) => OFERTAS_EXAMES.find((item) => item.id === id))
    .filter(Boolean);
}
