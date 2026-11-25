import { Container, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function HomeLogado() {
  const sessao = obterSessaoAtual();
  const primeiroNome = sessao?.nome?.trim().split(/\s+/)[0] || "";

  return (
    <Container maxW="1120px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }} pb={{ base: "110px", md: 12 }}>
      <PageHeader title={primeiroNome ? `Olá, ${primeiroNome}` : "Bem-vindo ao Exame Já"} description="Encontre clínicas com ofertas para exames do catálogo TUSS e veja os resultados no mapa." />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} mt={6}>
        <Card>
          <Stack gap={4}>
            <Heading as="h2" fontSize="var(--text-lg)">Buscar clínicas</Heading>
            <Text color="var(--color-text-muted)">Escolha um exame do catálogo TUSS, informe sua localização e consulte as ofertas disponíveis no mapa.</Text>
            <Button asChild><Link to="/busca">Buscar exames no mapa</Link></Button>
          </Stack>
        </Card>
        <Card>
          <Stack gap={4}>
            <Heading as="h2" fontSize="var(--text-lg)">Falar com uma clínica</Heading>
            <Text color="var(--color-text-muted)">As conversas são registradas pela API e ficam associadas à sua conta.</Text>
            <Button asChild variant="outline"><Link to="/paciente/chat">Abrir conversas</Link></Button>
          </Stack>
        </Card>
      </SimpleGrid>
      <Flex mt={6} justify="center">
        <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Solicitações, confirmações e avaliações ficam vinculadas à sua conta.</Text>
      </Flex>
    </Container>
  );
}
