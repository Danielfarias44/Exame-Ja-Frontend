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

export function destinoInternoSeguro(destino, rotaPadrao = "/") {
  if (typeof destino !== "string" || !destino.startsWith("/") || destino.startsWith("//")) return rotaPadrao;
  const temCaractereProibido = [...destino].some((caractere) => {
    const codigo = caractere.charCodeAt(0);
    return caractere === "\\" || codigo < 32 || codigo === 127;
  });
  if (temCaractereProibido) return rotaPadrao;
  try {
    const url = new URL(destino, window.location.origin);
    if (url.origin !== window.location.origin) return rotaPadrao;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return rotaPadrao;
  }
}
