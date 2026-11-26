const ROTULOS = {
  pendente: "Aguardando confirmação",
  confirmado: "Confirmado",
  recusado: "Recusado",
  cancelado: "Cancelado",
  concluido: "Concluído",
  expirado: "Expirado",
};

export function rotuloStatusAgendamento(status) {
  return ROTULOS[status] || status || "Situação não informada";
}
