import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import { aprovarClinica, listarClinicasPendentes, rejeitarClinica } from "@/services/adminService";
import AdminClinicas from "./AdminClinicas";

vi.mock("@/services/adminService", () => ({
  listarClinicasPendentes: vi.fn(),
  aprovarClinica: vi.fn(),
  rejeitarClinica: vi.fn(),
}));

const pendente = {
  uid: "c1",
  nomeFantasia: "Clínica Teste Aprovar",
  razaoSocial: "SECRETARIA DE ESTADO DE SAUDE PUBLICA",
  cnpj: "05054929000117",
  email: "caixa@temporario.dev",
  endereco: "Avenida Presidente Vargas, 800, Belém, PA",
  criadoEm: { _seconds: 1795723391, _nanoseconds: 0 },
  declaracaoVinculo: "Conta de teste.",
};

beforeEach(() => {
  vi.mocked(listarClinicasPendentes).mockReset().mockResolvedValue({ itens: [pendente], proximoCursor: null });
  vi.mocked(aprovarClinica).mockReset().mockResolvedValue({});
  vi.mocked(rejeitarClinica).mockReset().mockResolvedValue({});
});

describe("AdminClinicas", () => {
  it("mostra os dados da clínica pendente para análise", async () => {
    renderizar(<AdminClinicas />);
    expect(await screen.findByRole("heading", { name: "Clínica Teste Aprovar" })).toBeInTheDocument();
    expect(screen.getByText("05.054.929/0001-17")).toBeInTheDocument();
    expect(screen.getByText("Conta de teste.")).toBeInTheDocument();
  });

  it("aprova, tira o card da fila e avisa", async () => {
    renderizar(<AdminClinicas />);
    await userEvent.click(await screen.findByRole("button", { name: "Aprovar clínica" }));
    expect(aprovarClinica).toHaveBeenCalledWith("c1");
    expect(await screen.findByText(/foi aprovada/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Clínica Teste Aprovar" })).not.toBeInTheDocument();
    expect(screen.getByText("Nenhum cadastro aguardando análise")).toBeInTheDocument();
  });

  it("só rejeita com motivo e envia o texto ao back", async () => {
    renderizar(<AdminClinicas />);
    await userEvent.click(await screen.findByRole("button", { name: "Rejeitar cadastro" }));
    expect(rejeitarClinica).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText("Motivo da rejeição"), "Endereço incompleto, falta o número");
    await userEvent.click(screen.getByRole("button", { name: "Rejeitar cadastro" }));
    expect(rejeitarClinica).toHaveBeenCalledWith("c1", "Endereço incompleto, falta o número");
    expect(await screen.findByText(/foi rejeitada/)).toBeInTheDocument();
  });

  it("mostra erro com opção de tentar de novo quando a fila falha", async () => {
    vi.mocked(listarClinicasPendentes).mockRejectedValueOnce(new Error("Servidor fora do ar"));
    renderizar(<AdminClinicas />);
    expect(await screen.findByText("Servidor fora do ar")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Tentar novamente/ }));
    expect(await screen.findByRole("heading", { name: "Clínica Teste Aprovar" })).toBeInTheDocument();
  });
});
