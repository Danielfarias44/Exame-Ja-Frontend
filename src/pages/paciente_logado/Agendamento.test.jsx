import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderizar } from "@/test/renderizar";
import { getClinicAvailability, getEstablishment } from "@/services/api";
import Agendamento from "./Agendamento";

vi.mock("@/services/api", () => ({
  createAppointment: vi.fn(),
  getClinicAvailability: vi.fn().mockResolvedValue({ horarios: [], proximoCursor: null }),
  getEstablishment: vi.fn().mockResolvedValue({ clinic: { nomeFantasia: "Clínica Centro" } }),
}));

describe("Agendamento", () => {
  it("trata como link inválido quando falta o código TUSS", () => {
    renderizar(<Agendamento />, { rota: "/paciente/agendar?clinicaId=c1&nomeExame=Hemograma" });
    expect(screen.getByText("Agendamento inválido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a busca" })).toBeInTheDocument();
    expect(getClinicAvailability).not.toHaveBeenCalled();
  });

  it("explica quando a clínica não publicou horários", async () => {
    renderizar(<Agendamento />, { rota: "/paciente/agendar?clinicaId=c1&codigoExame=40304361&nomeExame=Hemograma" });
    expect(await screen.findByText(/não publicou horários disponíveis/)).toBeInTheDocument();
    expect(screen.getByText("Hemograma · TUSS 40304361")).toBeInTheDocument();
    expect(getEstablishment).toHaveBeenCalledWith("c1");
  });
});
