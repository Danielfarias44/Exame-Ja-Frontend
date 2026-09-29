import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(query)}`);
  }

  return (
    <section>
      <h1>Encontre o exame que você precisa</h1>
      <p>Compare preços, convênios e avaliações de clínicas e laboratórios perto de você.</p>

      <form onSubmit={handleSubmit} role="search" aria-label="Buscar exame">
        <label htmlFor="exam-search">Nome do exame ou especialidade</label>
        <input
          id="exam-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: hemograma, ressonância..."
        />
        <button type="submit">Buscar</button>
      </form>
    </section>
  );
}
