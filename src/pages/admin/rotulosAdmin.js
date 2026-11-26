export const STATUS_CONTA = {
  pendente: { rotulo: "Em análise", tom: "warning" },
  aprovada: { rotulo: "Aprovada", tom: "success" },
  rejeitada: { rotulo: "Rejeitada", tom: "error" },
  suspensa: { rotulo: "Suspensa", tom: "neutral" },
  ativo: { rotulo: "Ativo", tom: "success" },
};

export const TIPO_USUARIO = {
  cliente: "Paciente",
  clinica: "Clínica",
};

export const STATUS_DENUNCIA = {
  aberta: { rotulo: "Aberta", tom: "warning" },
  resolvida: { rotulo: "Resolvida", tom: "success" },
  descartada: { rotulo: "Descartada", tom: "neutral" },
};

export const ALVO_DENUNCIA = {
  avaliacao: "Avaliação",
  mensagem: "Mensagem do chat",
  clinica: "Clínica",
};

export const CATEGORIA_DENUNCIA = {
  ofensivo: "Conteúdo ofensivo",
  spam: "Spam",
  falso: "Informação falsa",
  outro: "Outro motivo",
};

export function rotuloStatusConta(status) {
  return STATUS_CONTA[status] ?? { rotulo: status || "Sem status", tom: "neutral" };
}

export function formatarCnpj(cnpj) {
  const digitos = String(cnpj || "");
  if (digitos.length !== 14) return digitos || "Não informado";
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

export function opcoesDe(mapa, rotuloTodos) {
  return [
    { value: "", label: rotuloTodos },
    ...Object.entries(mapa).map(([valor, item]) => ({
      value: valor,
      label: typeof item === "string" ? item : item.rotulo,
    })),
  ];
}
