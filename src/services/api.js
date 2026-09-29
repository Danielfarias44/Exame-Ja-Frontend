import { mockExams, mockEstablishments, mockReviews } from "./mocks";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao chamar ${path}`);
  }
  return response.json();
}

// GET /exams e GET /exams/search
export async function searchExams(query = "") {
  if (USE_MOCKS) {
    const q = query.toLowerCase();
    return mockExams.filter(
      (exam) =>
        exam.name.toLowerCase().includes(q) || exam.specialty.toLowerCase().includes(q)
    );
  }
  return request(`/exams/search?q=${encodeURIComponent(query)}`);
}

// GET /establishments (com filtros: local, preço, convênio, especialidade)
export async function searchEstablishments(filters = {}) {
  if (USE_MOCKS) {
    return mockEstablishments;
  }
  const params = new URLSearchParams(filters);
  return request(`/establishments?${params.toString()}`);
}

// GET /establishments/:id
export async function getEstablishment(id) {
  if (USE_MOCKS) {
    return mockEstablishments.find((e) => e.id === id) ?? null;
  }
  return request(`/establishments/${id}`);
}

// GET /establishments/:id/reviews
export async function getEstablishmentReviews(id) {
  if (USE_MOCKS) {
    return mockReviews;
  }
  return request(`/establishments/${id}/reviews`);
}

// GET /establishments/compare
export async function compareEstablishments(ids = []) {
  if (USE_MOCKS) {
    return mockEstablishments.filter((e) => ids.includes(e.id));
  }
  const params = new URLSearchParams({ ids: ids.join(",") });
  return request(`/establishments/compare?${params.toString()}`);
}
