const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3333").replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body != null ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    const erro = new Error(
      `Não foi possível conectar à API em ${BASE_URL}. Confirme que o backend está ativo e que a origem do frontend está autorizada no CORS.`,
    );
    erro.code = "NETWORK_ERROR";
    throw erro;
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  const requestId = response.headers.get("X-Request-ID");

  if (response.status === 401 && path !== "/api/auth/login" && path !== "/api/auth/me") {
    window.dispatchEvent(new Event("exameja:sessao-expirada"));
  }
  if (!response.ok) {
    const mensagemServidor = data?.message || data?.mensagem;
    const mensagemBase = mensagemServidor
      || (response.status >= 500
        ? `Falha no servidor (HTTP ${response.status}). O servidor não conseguiu concluir a solicitação. Tente novamente.`
        : `A solicitação foi recusada (HTTP ${response.status}).`);
    const mensagem = `${mensagemBase}${requestId ? ` Código para suporte: ${requestId}.` : ""}`;
    const erro = new Error(mensagem);
    erro.status = response.status;
    erro.code = data?.code;
    erro.requestId = requestId;
    throw erro;
  }
  return data;
}

export async function apiPostWithCsrf(path, payload) {
  return apiRequestWithCsrf(path, "POST", payload);
}

export async function apiRequestWithCsrf(path, method, payload) {
  const { csrfToken } = await apiRequest("/api/auth/csrf");
  if (!csrfToken) throw new Error("Não foi possível iniciar a validação de segurança. Tente novamente.");
  return apiRequest(path, {
    method,
    headers: { "X-CSRF-Token": csrfToken },
    body: JSON.stringify(payload),
  });
}
