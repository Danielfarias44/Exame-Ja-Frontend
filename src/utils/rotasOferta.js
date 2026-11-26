export function rotaAgendamento(oferta) {
  const params = new URLSearchParams({
    clinicaId: oferta.clinicId,
    codigoExame: oferta.examCode ?? "",
    nomeExame: oferta.exam ?? "",
  });
  return `/paciente/agendar?${params}`;
}

export function rotaConversa(oferta) {
  return `/paciente/chat?${new URLSearchParams({ clinicaId: oferta.clinicId })}`;
}

export function rotaLoginComRetorno(destino) {
  return `/login?redirect=${encodeURIComponent(destino)}`;
}

export function rotaCadastroComRetorno(destino) {
  return `/cadastro?redirect=${encodeURIComponent(destino)}`;
}
