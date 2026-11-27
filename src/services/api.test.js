import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./httpClient";
import { cacheSearchResults, getCachedClinicName, getClinicsMap, getEstablishment, getExamCatalog, searchExamOffers } from "./api";

vi.mock("./httpClient", () => ({ apiRequest: vi.fn(), apiRequestWithCsrf: vi.fn() }));

const resultadoBusca = {
  clinica: {
    uid: "c1",
    nomeFantasia: "Clínica Centro",
    endereco: "Av. Presidente Vargas, 800",
    latitude: -1.45,
    longitude: -48.49,
    distanciaKm: 1.2,
    conveniosAceitos: [{ id: "unimed", nome: "Unimed" }],
    avaliacaoMedia: 4.5,
    quantidadeAvaliacoes: 0,
  },
  exame: { codigo: "40304361", nome: "Hemograma" },
  preco: { valor: 35 },
};

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
});

describe("searchExamOffers", () => {
  it("exige exame e exatamente uma forma de localização", async () => {
    await expect(searchExamOffers({ latitude: 1, longitude: 2 })).rejects.toThrow(/exame/);
    await expect(searchExamOffers({ codigoExame: "1" })).rejects.toThrow(/endereço ou use sua localização/);
    await expect(searchExamOffers({ codigoExame: "1", endereco: "Rua A", latitude: 1, longitude: 2 }))
      .rejects.toThrow(/endereço ou use sua localização/);
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("monta a consulta só com os filtros preenchidos", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ resultados: [] });
    await searchExamOffers({ codigoExame: "40304361", latitude: -1.4, longitude: -48.4, convenioId: "", raioKm: "10", precoMaximo: "", ordenar: "avaliacao" });
    const url = new URL(vi.mocked(apiRequest).mock.calls[0][0], "http://local");
    expect(url.pathname).toBe("/api/clinics/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      codigoExame: "40304361",
      ordenar: "distancia",
      limit: "100",
      offset: "0",
      latitude: "-1.4",
      longitude: "-48.4",
      raioKm: "10",
    });
  });

  it("traduz a resposta da API para o formato dos componentes", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ resultados: [resultadoBusca], total: 1, clinicasSemCoordenadas: 2 });
    const resultado = await searchExamOffers({ codigoExame: "40304361", endereco: "Belém" });
    expect(resultado.total).toBe(1);
    expect(resultado.raw.clinicasSemCoordenadas).toBe(2);
    expect(resultado.offers[0]).toEqual({
      id: "c1:40304361",
      clinicId: "c1",
      name: "Clínica Centro",
      address: "Av. Presidente Vargas, 800",
      lat: -1.45,
      lng: -48.49,
      distanceKm: 1.2,
      insurances: ["Unimed"],
      insuranceIds: ["unimed"],
      exam: "Hemograma",
      examCode: "40304361",
      price: 35,
      rating: null,
      reviewsCount: 0,
    });
  });
});

describe("getExamCatalog", () => {
  it("usa a descrição como nome e o código como texto", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ dados: [{ codigo: 40304361, descricao: "Hemograma" }], paginas: 239, paginaAtual: 1 });
    const pagina = await getExamCatalog({ page: 1 });
    expect(apiRequest).toHaveBeenCalledWith("/api/exams?page=1&limit=100");
    expect(pagina.exams[0]).toMatchObject({ codigo: "40304361", nome: "Hemograma" });
    expect(pagina).toMatchObject({ pages: 239, currentPage: 1, total: null });
  });
});

describe("getEstablishment", () => {
  it("devolve null quando a clínica não existe na resposta", async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    expect(await getEstablishment("x")).toBeNull();
  });

  it("monta as ofertas e reaproveita a distância vinda da busca", async () => {
    cacheSearchResults([{ id: "c1:40304361", clinicId: "c1", name: "Clínica Centro", distanceKm: 3.4 }]);
    vi.mocked(apiRequest).mockResolvedValue({
      clinica: {
        nomeFantasia: "Clínica Centro",
        endereco: "Rua A",
        conveniosAceitos: [{ id: "amil", nome: "Amil" }],
        avaliacaoMedia: 4,
        quantidadeAvaliacoes: 3,
        ofertas: [{ codigoExame: 40304361, nomeExame: "Hemograma", preco: 30 }],
      },
    });
    const { offers } = await getEstablishment("c1");
    expect(offers[0]).toMatchObject({ examCode: "40304361", distanceKm: 3.4, rating: 4, reviewsCount: 3, insurances: ["Amil"] });
  });
});

describe("cache da busca", () => {
  it("lembra o nome da clínica e não quebra com cache corrompido", () => {
    cacheSearchResults([{ clinicId: "c1", name: "Clínica Centro" }]);
    expect(getCachedClinicName("c1")).toBe("Clínica Centro");
    expect(getCachedClinicName("outra")).toBe("Clínica");
    sessionStorage.setItem("exameja_resultados_busca_v1", "{quebrado");
    expect(getCachedClinicName("c1")).toBe("Clínica");
  });
});

describe("getClinicsMap", () => {
  it("chama o mapa sem parâmetros por padrão e traduz as clínicas para o formato da tela", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      centro: { latitude: -1.4558, longitude: -48.4902, nome: "Belém, PA" },
      raioKm: 30,
      clinicasSemCoordenadas: 2,
      clinicas: [{ uid: "c1", nomeFantasia: "Clínica Nazaré", endereco: "Av. Nazaré, 500", latitude: -1.45, longitude: -48.48, distanciaKm: 0.6, conveniosAceitos: [{ id: "amil", nome: "Amil" }], avaliacaoMedia: 4, quantidadeAvaliacoes: 0 }],
    });
    const resultado = await getClinicsMap();
    expect(apiRequest).toHaveBeenCalledWith("/api/clinics/map");
    expect(resultado.center.nome).toBe("Belém, PA");
    expect(resultado.withoutCoordinates).toBe(2);
    expect(resultado.clinics[0]).toMatchObject({ id: "c1", name: "Clínica Nazaré", lat: -1.45, lng: -48.48, insurances: ["Amil"], rating: null });
  });

  it("envia só os filtros preenchidos", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ clinicas: [] });
    await getClinicsMap({ convenioId: "amil", raioKm: "10" });
    expect(apiRequest).toHaveBeenCalledWith("/api/clinics/map?convenioId=amil&raioKm=10");
  });
});
