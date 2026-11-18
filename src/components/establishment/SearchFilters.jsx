import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Stack, Text } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { mockConvenios } from "@/services/mocks";
import { exameCategorias } from "@/services/mocksExames";

// todo o mapeamento dos exames, convenios, raios e ordenação por preferências
const gruposDeExames = exameCategorias.map((categoria) => ({
  label: categoria.nome,
  options: categoria.exames.map((exame) => ({ value: exame.id, label: exame.nome })),
}));

const opcoesConvenio = mockConvenios.map((nome) => ({ value: nome, label: nome }));

const RAIOS_KM = ["1", "3", "5", "10", "20"];
const opcoesRaio = RAIOS_KM.map((km) => ({ value: km, label: `Até ${km} km` }));

const ORDENACOES = ["distancia", "preco", "avaliacao"];
const opcoesOrdenar = [
  { value: "distancia", label: "Mais perto" },
  { value: "preco", label: "Menor preço" },
  { value: "avaliacao", label: "Melhor avaliação" },
];

const PADRAO = { exame: "", convenio: "", raio: "5", ordenar: "distancia" };


function lerFiltrosDaUrl(searchParams) {
  const raio = searchParams.get("raio");
  const ordenar = searchParams.get("ordenar");
  return {
    exame: searchParams.get("exame") ?? PADRAO.exame,
    convenio: searchParams.get("convenio") ?? PADRAO.convenio,
    raio: RAIOS_KM.includes(raio) ? raio : PADRAO.raio,
    ordenar: ORDENACOES.includes(ordenar) ? ordenar : PADRAO.ordenar,
  };
}

function montarUrlDaBusca(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor);
  });
  return `/busca?${params.toString()}`;
}

export default function SearchFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filtros, setFiltros] = useState(() => lerFiltrosDaUrl(searchParams));
  const [erros, setErros] = useState({});
  const exameRef = useRef(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFiltros((atual) => ({ ...atual, [name]: value }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!filtros.exame) {
      setErros({ exame: "Escolha um exame para continuar." });
      exameRef.current?.focus(); 
      return;
    }

    navigate(montarUrlDaBusca(filtros));
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      noValidate 
      role="search"
      bg="var(--color-surface)"
      borderRadius="var(--radius-lg)"
      boxShadow="var(--shadow-md)"
      p="var(--space-6)"
    >
      <Stack as="fieldset" gap="var(--space-4)" border="0" p="0" m="0" minW="0">
        <Text
          as="legend"
          fontFamily="var(--font-heading)"
          fontSize="var(--text-xl)"
          fontWeight="var(--weight-bold)"
          color="var(--color-text)"
          p="0"
        >
          Encontre seu exame
        </Text>

        <Box
          display="grid"
          gap="var(--space-4)"
          gridTemplateColumns="1fr"
          css={{
            "@media (min-width: 640px)": { gridTemplateColumns: "repeat(2, 1fr)" },
            "@media (min-width: 1024px)": { gridTemplateColumns: "repeat(4, 1fr)" },
          }}
        >
          <Select
            ref={exameRef}
            name="exame"
            label="Tipo de exame"
            placeholder="Escolha um exame"
            groups={gruposDeExames}
            value={filtros.exame}
            onChange={handleChange}
            error={erros.exame}
            required
          />
          <Select
            name="convenio"
            label="Convênio"
            placeholder="Qualquer convênio"
            options={opcoesConvenio}
            value={filtros.convenio}
            onChange={handleChange}
          />
          <Select
            name="raio"
            label="Distância"
            options={opcoesRaio}
            value={filtros.raio}
            onChange={handleChange}
          />
          <Select
            name="ordenar"
            label="Prioridade"
            options={opcoesOrdenar}
            value={filtros.ordenar}
            onChange={handleChange}
          />
        </Box>

        <Button type="submit" alignSelf="flex-start">
          Pesquisar
        </Button>
      </Stack>
    </Box>
  );
}
