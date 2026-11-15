import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { testimonials } from "../../data/testimonials";
import Button from "@/components/ui/Button";
import "./Home.css";

const steps = [
  {
    title: "Encontre a clínica certa",
    description: "Compare preço, distância e avaliações antes de decidir.",
  },
  {
    title: "Diga o que você precisa",
    description: "Filtre por exame, especialidade ou convênio aceito.",
  },
  {
    title: "Agende e acompanhe",
    description: "Receba lembretes de preparo e veja seu histórico depois.",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate(`/busca?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>
            Achar uma clínica não devia ser mais difícil do que fazer o exame.
          </h1>
          <p className="hero-subtitle">
            Diga o exame e o convênio que você usa — mostramos quem atende
            perto de você, com preço e prazo claros antes de agendar.
          </p>

          <form className="search-form" onSubmit={handleSubmit} role="search" aria-label="Buscar exame ou clínica">
            <label htmlFor="home-search" className="sr-only">
              Buscar exames ou clínicas
            </label>
            <input
              id="home-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar exames ou clínicas..."
            />
            <Button type="submit">Buscar</Button>
          </form>
        </div>

        <div className="hero-image" aria-hidden="true">
          <img src="src/components/mapa.png" height={380} width={380}/>
        </div>
      </section>

      <section className="steps">
        <h2>Do sintoma ao exame, sem burocracia</h2>
        <ol className="steps-list">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="testimonials">
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <blockquote key={t.id}>
              <p>“{t.quote}”</p>
              <footer>
                <strong>{t.author}</strong>
                <span> · {t.context}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <p>Comece a agilizar seus exames a partir de agora, é simples e rápido.</p>
        {/* TODO: /cadastro é a tela de cadastro do Bruno (conta/agendamento) */}
        <button type="button" onClick={() => navigate("/cadastro")}>
          Criar conta
        </button>
      </section>
    </div>
  );
}
