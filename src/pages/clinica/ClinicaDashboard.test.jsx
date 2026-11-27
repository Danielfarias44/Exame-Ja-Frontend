import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { listAppointments, updateAppointment } from "@/services/api";
import ClinicaDashboard from "./ClinicaDashboard";

vi.mock("@/services/httpClient", () => ({ apiRequest: vi.fn(), apiRequestWithCsrf: vi.fn() }));
vi.mock("@/services/api", () => ({
  getExamCatalog: vi.fn().mockResolvedValue({ exams: [], pages: 1, currentPage: 1, total: null }),
  getClinicAvailability: vi.fn().mockResolvedValue({ horarios: [], proximoCursor: null }),
  listAppointments: vi.fn().mockResolvedValue({ agendamentos: [], proximoCursor: null }),
  publishClinicAvailability: vi.fn(),
  removeClinicAvailability: vi.fn(),
  updateAppointment: vi.fn(),
}));

const CONVENIOS = ["amil", "cassi", "geap-saude", "hapvida", "unimed", "sulamerica"].map((id) => ({ id, nome: id.toUpperCase(), ativo: true }));

beforeEach(() => {
  sessionStorage.setItem("exameja_sessao_ativa_v1", JSON.stringify({ id: "c1", perfil: "clinica", nome: "Clínica", autenticado: true }));
  vi.mocked(apiRequest).mockReset().mockImplementation(async (rota) => {
    if (rota === "/api/users/me") return { usuario: { uid: "c1", tipo: "clinica", status: "aprovada", nomeFantasia: "Clínica Teste", conveniosAceitos: [] } };
    if (rota === "/api/clinics/me/exams") return { ofertas: [] };
    if (rota === "/api/convenios") return { convenios: CONVENIOS };
    if (rota.startsWith("/api/clinics/c1")) return { clinica: { latitude: -1.45, longitude: -48.49 } };
    throw new Error(`rota inesperada ${rota}`);
  });
  vi.mocked(apiRequestWithCsrf).mockReset();
});

async function marcarCinco() {
  for (const nome of ["AMIL", "CASSI", "GEAP-SAUDE", "HAPVIDA", "UNIMED"]) {
    await userEvent.click(await screen.findByRole("checkbox", { name: nome }));
  }
}

describe("ClinicaDashboard – convênios", () => {
  it("salva 5 convênios, avisa junto do botão e completa o item do checklist", async () => {
    vi.mocked(apiRequestWithCsrf).mockImplementation(async (_rota, _metodo, corpo) => ({ usuario: { conveniosAceitos: corpo.conveniosAceitos } }));
    renderizar(<ClinicaDashboard />);
    const checklist = await screen.findByRole("region", { name: "Para aparecer na busca" });
    expect(within(checklist).getByText(/0 agora/)).toBeInTheDocument();
    await marcarCinco();
    await userEvent.click(screen.getByRole("button", { name: "Salvar convênios" }));
    expect(apiRequestWithCsrf).toHaveBeenCalledWith("/api/users/me", "PATCH", { conveniosAceitos: ["amil", "cassi", "geap-saude", "hapvida", "unimed"] });
    expect(await screen.findByText("5 convênios salvos.")).toBeInTheDocument();
    const item = within(checklist).getByText(/5 agora/).closest("li");
    expect(within(item).getByText("Concluído:")).toBeInTheDocument();
  });

  it("mostra a recusa do back perto do botão e não marca o item como feito", async () => {
    vi.mocked(apiRequestWithCsrf).mockRejectedValue(new Error("Informe de 5 a 10 IDs de convênios válidos."));
    renderizar(<ClinicaDashboard />);
    await marcarCinco();
    await userEvent.click(screen.getByRole("button", { name: "Salvar convênios" }));
    const erro = await screen.findByText("Informe de 5 a 10 IDs de convênios válidos.");
    const cartao = screen.getByRole("group", { name: "Convênios que a clínica atende" }).parentElement;
    expect(cartao).toContainElement(erro);
    const checklist = screen.getByRole("region", { name: "Para aparecer na busca" });
    const item = within(checklist).getByText(/0 agora/).closest("li");
    expect(within(item).getByText("Pendente:")).toBeInTheDocument();
  });
});

describe("ClinicaDashboard – pedidos", () => {
  it("lista o pedido pendente primeiro e mostra a confirmação dentro da seção de pedidos", async () => {
    const pedidos = [
      { id: "a2", status: "confirmado", nomeExame: "Raio-X", dataHora: "2026-12-01T10:00:00Z", clienteNome: "Dois" },
      { id: "a1", status: "pendente", nomeExame: "Hemograma", dataHora: "2026-12-01T09:00:00Z", clienteNome: "Um" },
    ];
    vi.mocked(listAppointments).mockResolvedValue({ agendamentos: pedidos, proximoCursor: null });
    vi.mocked(updateAppointment).mockResolvedValue({});
    renderizar(<ClinicaDashboard />);
    const secao = await screen.findByRole("region", { name: /Pedidos de agendamento/ });
    const itens = within(secao).getAllByRole("listitem");
    expect(within(itens[0]).getByText("Hemograma")).toBeInTheDocument();
    expect(within(itens[0]).getByText("Aguardando confirmação")).toBeInTheDocument();
    await userEvent.click(within(itens[0]).getByRole("button", { name: "Confirmar" }));
    expect(updateAppointment).toHaveBeenCalledWith("a1", { acao: "confirmar" });
    expect(await within(secao).findByText("Solicitação confirmada.")).toBeInTheDocument();
    vi.mocked(listAppointments).mockResolvedValue({ agendamentos: [], proximoCursor: null });
  });
});
