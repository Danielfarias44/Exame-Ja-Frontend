import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar } from "@/test/renderizar";
import { getClinicsMap } from "@/services/api";
import MapaClinicas from "./MapaClinicas";

vi.mock("@/components/establishment/EstablishmentMap", () => ({
  default: ({ establishments }) => <div data-testid="mapa">{establishments.length} marcadores</div>,
}));
vi.mock("@/services/api", () => ({
  getInsurances: vi.fn().mockResolvedValue([{ id: "amil", name: "Amil" }, { id: "cassi", name: "Cassi" }]),
  getClinicsMap: vi.fn(),
}));

const centro = { latitude: -1.4558, longitude: -48.4902, nome: "Belém, PA" };
const nazare = { id: "c1", name: "Clínica Nazaré", address: "Av. Nazaré, 500", lat: -1.45, lng: -48.48, distanceKm: 0.6, insurances: ["Amil"], rating: null, reviewsCount: 0 };

describe("MapaClinicas", () => {
  it("mostra as clínicas de Belém no mapa e na lista, com link para os detalhes", async () => {
    vi.mocked(getClinicsMap).mockResolvedValue({ clinics: [nazare], center: centro, radiusKm: 30, withoutCoordinates: 1 });
    renderizar(<MapaClinicas />, { rota: "/mapa" });
    expect(await screen.findByText(/1 clínica a até 30 km de Belém, PA/)).toBeInTheDocument();
    expect(screen.getByText(/1 clínica ainda não tem endereço localizado/)).toBeInTheDocument();
    expect(screen.getByTestId("mapa")).toHaveTextContent("1 marcadores");
    const lista = screen.getByRole("list", { name: "Clínicas no mapa" });
    expect(within(lista).getByRole("link", { name: "Ver clínica: Clínica Nazaré" })).toHaveAttribute("href", "/estabelecimento/c1");
    expect(getClinicsMap).toHaveBeenCalledWith({ convenioId: "", raioKm: "30" });
  });

  it("refaz a consulta ao trocar o convênio e oferece mostrar todas quando nada aparece", async () => {
    vi.mocked(getClinicsMap).mockResolvedValue({ clinics: [], center: centro, radiusKm: 30, withoutCoordinates: 0 });
    renderizar(<MapaClinicas />, { rota: "/mapa" });
    await screen.findByText("Nenhuma clínica com esses filtros");
    await screen.findByRole("option", { name: "Cassi" });
    await userEvent.selectOptions(screen.getByLabelText("Convênio"), "cassi");
    expect(getClinicsMap).toHaveBeenLastCalledWith({ convenioId: "cassi", raioKm: "30" });
    await userEvent.click(await screen.findByRole("button", { name: "Mostrar todas" }));
    expect(getClinicsMap).toHaveBeenLastCalledWith({ convenioId: "", raioKm: "30" });
  });
});
