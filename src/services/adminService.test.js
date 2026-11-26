import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import {
  decidirDenuncia,
  listarClinicasPendentes,
  listarDenuncias,
  listarEstabelecimentos,
  listarUsuarios,
  rejeitarClinica,
  suspenderClinica,
} from "./adminService";

vi.mock("@/services/httpClient", () => ({ apiRequest: vi.fn(), apiRequestWithCsrf: vi.fn() }));

beforeEach(() => {
  vi.mocked(apiRequest).mockReset().mockResolvedValue({});
  vi.mocked(apiRequestWithCsrf).mockReset().mockResolvedValue({});
});

describe("adminService", () => {
  it("lista a fila com o parâmetro limit que a rota de aprovação espera", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ clinicas: [{ uid: "a" }], proximoCursor: "a" });
    const pagina = await listarClinicasPendentes({ cursor: "x" });
    expect(apiRequest).toHaveBeenCalledWith("/api/admin/clinics?limit=50&cursor=x");
    expect(pagina).toEqual({ itens: [{ uid: "a" }], proximoCursor: "a" });
  });

  it("usa o parâmetro limite e omite filtros vazios nas outras listas", async () => {
    await listarEstabelecimentos({ status: "" });
    expect(apiRequest).toHaveBeenLastCalledWith("/api/admin/establishments?limite=30");
    await listarUsuarios({ tipo: "cliente", status: "ativo" });
    expect(apiRequest).toHaveBeenLastCalledWith("/api/admin/users?tipo=cliente&status=ativo&limite=30");
    await listarDenuncias({ status: "aberta", alvoTipo: "" });
    expect(apiRequest).toHaveBeenLastCalledWith("/api/admin/reports?status=aberta&limite=30");
  });

  it("devolve listas vazias quando o back não manda a chave esperada", async () => {
    vi.mocked(apiRequest).mockResolvedValue(null);
    expect(await listarUsuarios()).toEqual({ itens: [], proximoCursor: null });
  });

  it("codifica o uid nas ações sobre clínicas e envia o motivo", async () => {
    await rejeitarClinica("uid/estranho", "Documento ilegível");
    expect(apiRequestWithCsrf).toHaveBeenCalledWith("/api/admin/clinics/uid%2Festranho/reject", "POST", { motivo: "Documento ilegível" });
    await suspenderClinica("abc", "Denúncias confirmadas");
    expect(apiRequestWithCsrf).toHaveBeenLastCalledWith("/api/admin/clinics/abc/suspend", "POST", { motivo: "Denúncias confirmadas" });
  });

  it("só envia a nota da denúncia quando ela tem texto", async () => {
    await decidirDenuncia("d1", { acao: "descartar", nota: "   " });
    expect(apiRequestWithCsrf).toHaveBeenLastCalledWith("/api/admin/reports/d1", "PUT", { acao: "descartar" });
    await decidirDenuncia("d1", { acao: "resolver", nota: " ok " });
    expect(apiRequestWithCsrf).toHaveBeenLastCalledWith("/api/admin/reports/d1", "PUT", { acao: "resolver", nota: "ok" });
  });
});
