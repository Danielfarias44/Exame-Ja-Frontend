import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { testimonials } from "../../data/testimonials";
import Button from "@/components/ui/Button";
import LoginPrompt from "@/components/LoginPrompt";
import "./Home.css";
import Select from "@/components/ui/Select";
import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { mockConvenios, mockEdgeCaseEstablishments, mockEstablishments } from "@/services/mocks";
import { exameCategorias } from "@/services/mocksExames";


const gruposDeExames = exameCategorias.map((categoria) => ({
  label: categoria.nome,
  options: categoria.exames.map((exame) => ({ value: exame.id, label: exame.nome })),
}));

const opcoesRaio = [1, 3, 5, 10, 20].map((km) => ({ value: String(km), label: `${km} km` }));
const opcoesConvenio = mockConvenios.map((nome) => ({ value: nome, label: nome }));

function Section({ title, children }) {
  return (
    <Stack as="section" gap="var(--space-3)">
      <Heading as="h2" fontFamily="var(--font-heading)" fontSize="var(--text-xl)">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}


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

     <Section>
      <Stack>
          <Select
            label="Tipo de exame"
            placeholder="Escolha um exame"
            groups={gruposDeExames}
            helperText="Lista agrupada por categoria"
            required
            />
            <Select
            label="Convênio"
            placeholder="Escolha um Convênio"
            options={opcoesConvenio}
            helperText="Lista agrupada por categoria"
            
            />
            <Select
            label="Proximidade"
            options={opcoesRaio}
            DefaultValue="5"
            />
      </Stack>
      <Button maxWidth="150px">Pesquisar</Button>
     </Section>

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

      <section title="Aviso de login">
          <LoginPrompt action="conversar com a clínica" />
      </section>
    </div>
  );
}
