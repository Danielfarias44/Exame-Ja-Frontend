const ROTULOS = {
  pendente: "Aguardando confirmação",
  confirmado: "Confirmado",
  recusado: "Recusado",
  cancelado: "Cancelado",
  concluido: "Concluído",
  expirado: "Expirado",
};

const TONS = {
  pendente: "warning",
  confirmado: "success",
  recusado: "error",
  cancelado: "neutral",
  concluido: "primary",
  expirado: "neutral",
};

export function rotuloStatusAgendamento(status) {
  return ROTULOS[status] || status || "Situação não informada";
}

export function tomStatusAgendamento(status) {
  return TONS[status] || "neutral";
}
