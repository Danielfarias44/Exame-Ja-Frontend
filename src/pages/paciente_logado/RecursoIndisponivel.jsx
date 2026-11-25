import { Container, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function RecursoIndisponivel({ titulo, descricao }) {
  return (
    <Container maxW="900px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <PageHeader title={titulo} description={descricao} />
      <Stack mt={6} gap={4}>
        <Text color="var(--color-text-muted)">
          Esta função será habilitada quando o endpoint correspondente estiver publicado no backend. Nenhuma alteração será apresentada como concluída localmente.
        </Text>
        <Button asChild><Link to="/busca">Voltar à busca de clínicas</Link></Button>
      </Stack>
    </Container>
  );
}
