import { Box, Container, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const RECURSOS_DISPONIVEIS = [
  {
    titulo: "Busca por exame",
    descricao: "Consulte o catálogo TUSS e encontre ofertas publicadas pelas clínicas.",
    destino: "/busca",
    rotulo: "Buscar exames",
  },
  {
    titulo: "Localização no mapa",
    descricao: "Informe um endereço ou compartilhe sua localização para encontrar clínicas próximas.",
    destino: "/busca",
    rotulo: "Encontrar clínicas",
  },
  {
    titulo: "Filtros de convênio e preço",
    descricao: "Filtre ofertas por convênio e ordene os resultados por distância ou preço.",
    destino: "/busca",
    rotulo: "Ver filtros",
  },
  {
    titulo: "Contato com a clínica",
    descricao: "Consulte as informações disponíveis e use o chat para tirar dúvidas com a unidade.",
    destino: "/busca",
    rotulo: "Consultar clínicas",
  },
];

export default function VitrineFuncionalidades() {
  return (
    <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }} mt={{ base: 14, md: 20 }} className="revelar-secao">
      <VStack align="stretch" gap={2} mb={6}>
        <Heading as="h2" fontSize={{ base: "1.45rem", md: "1.8rem" }} color="var(--color-text)">
          O que você pode fazer no Exame Já
        </Heading>
        <Text color="var(--color-text-muted)">
          Consulte ofertas e informações cadastradas pelas clínicas parceiras.
        </Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        {RECURSOS_DISPONIVEIS.map((recurso) => (
          <Box key={recurso.titulo} as={RouterLink} to={recurso.destino} className="landing-cartao" p={5} border="1px solid var(--color-border-soft)" borderRadius="var(--radius-lg)" bg="var(--color-surface)" _hover={{ borderColor: "var(--color-primary)" }}>
            <Heading as="h3" fontSize="1rem" color="var(--color-text)" mb={2}>{recurso.titulo}</Heading>
            <Text fontSize="0.82rem" color="var(--color-text-muted)" mb={3}>{recurso.descricao}</Text>
            <Text fontSize="0.82rem" fontWeight="bold" color="var(--color-primary)">{recurso.rotulo} →</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
