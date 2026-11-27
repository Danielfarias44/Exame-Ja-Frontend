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
    descricao: "Veja no mapa todas as clínicas aprovadas em Belém e região, com endereço e convênios.",
    destino: "/mapa",
    rotulo: "Abrir o mapa",
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
    <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} mt={{ base: "var(--space-16)", md: "var(--space-16)" }} className="revelar-secao">
      <VStack align="stretch" gap="var(--space-2)" mb="var(--space-6)">
        <Heading as="h2" fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }} color="var(--color-text)">
          O que você pode fazer no Exame Já
        </Heading>
        <Text color="var(--color-text-muted)">
          Consulte ofertas e informações cadastradas pelas clínicas parceiras.
        </Text>
      </VStack>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="var(--space-4)">
        {RECURSOS_DISPONIVEIS.map((recurso) => (
          <Box key={recurso.titulo} as={RouterLink} to={recurso.destino} className="landing-cartao" p="var(--space-6)" border="var(--border-width) solid var(--color-border-soft)" borderRadius="var(--radius-lg)" bg="var(--color-surface)" _hover={{ borderColor: "var(--color-primary)" }}>
            <Heading as="h3" fontSize="var(--text-sm)" color="var(--color-text)" mb="var(--space-2)">{recurso.titulo}</Heading>
            <Text fontSize="var(--text-xs)" color="var(--color-text-muted)" mb="var(--space-3)">{recurso.descricao}</Text>
            <Text fontSize="var(--text-xs)" fontWeight="var(--weight-bold)" color="var(--color-primary)">{recurso.rotulo} →</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
