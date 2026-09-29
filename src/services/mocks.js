export const mockExams = [
  { id: "1", name: "Hemograma completo", specialty: "Análises clínicas" },
  { id: "2", name: "Ressonância magnética", specialty: "Imagem" },
  { id: "3", name: "Raio-X de tórax", specialty: "Imagem" },
];

export const mockEstablishments = [
  {
    id: "1",
    name: "Laboratório Vida",
    address: "Av. Almirante Barroso, 1200 - Belém, PA",
    price: 45.0,
    insurances: ["Unimed", "Hapvida"],
    rating: 4.6,
    reviewsCount: 128,
    lat: -1.4558,
    lng: -48.4902,
  },
  {
    id: "2",
    name: "Clínica São Lucas",
    address: "Tv. Rui Barbosa, 300 - Belém, PA",
    price: 60.0,
    insurances: ["Bradesco Saúde"],
    rating: 4.2,
    reviewsCount: 54,
    lat: -1.4502,
    lng: -48.4841,
  },
  {
    id: "3",
    name: "Diagnóstico Amazônia",
    address: "Rua dos Mundurucus, 500 - Belém, PA",
    price: 38.0,
    insurances: ["Unimed", "SUS"],
    rating: 4.8,
    reviewsCount: 201,
    lat: -1.4433,
    lng: -48.4776,
  },
];

export const mockReviews = [
  { id: "1", author: "Ana P.", rating: 5, comment: "Atendimento rápido e organizado." },
  { id: "2", author: "Carlos M.", rating: 4, comment: "Bom preço, mas demorou um pouco." },
];
