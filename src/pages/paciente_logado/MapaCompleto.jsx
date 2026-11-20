import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { CLINICAS_PARCEIRAS } from "@/services/pacienteLogadoService";

// TODO: Conectar com serviço de geolocalização e coordenadas das unidades no back-end
export default function MapaCompleto() {
  const navegar = useNavigate();

  return (
    <Container
      maxW="1120px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "100px", md: 12 }}
      className="animar-entrada"
    >
      <Box mb={6}>
        <Heading
          as="h1"
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "1.5rem", md: "1.9rem" }}
          color="var(--color-text)"
          mb={1}
        >
          Mapa de Clínicas e Laboratórios
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Visualização geográfica das unidades credenciadas e filtros por proximidade.
        </Text>
      </Box>

      {/* Área Placeholder do Mapa */}
      <Box
        p={{ base: 6, md: 10 }}
        mb={8}
        bg="var(--color-surface)"
        border="1px dashed var(--color-border-soft)"
        borderRadius="24px"
        textAlign="center"
        boxShadow="var(--shadow-sm)"
      >
        <Badge
          mb={4}
          px={3}
          py={1}
          borderRadius="var(--radius-full)"
          bg="var(--color-primary-soft)"
          color="var(--color-primary)"
          fontFamily="var(--font-heading)"
          fontWeight={700}
          fontSize="0.76rem"
        >
          Placeholder de Geolocalização
        </Badge>

        <Flex
          w="56px"
          h="56px"
          mx="auto"
          mb={4}
          borderRadius="var(--radius-full)"
          bg="var(--color-bg)"
          border="1px solid var(--color-border-soft)"
          align="center"
          justify="center"
          color="var(--color-primary)"
        >
          <Box
            as="svg"
            w="24px"
            h="24px"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </Box>
        </Flex>

        <Heading
          as="h2"
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize="1.2rem"
          color="var(--color-text)"
          mb={2}
        >
          Mapa interativo aguardando integração com Back-end
        </Heading>

        <Text
          maxW="540px"
          mx="auto"
          fontFamily="var(--font-body)"
          fontSize="0.9rem"
          color="var(--color-text-muted)"
        >
          Assim que o back-end disponibilizar as coordenadas e endereços cadastrados das clínicas, o mapa interativo será conectado neste espaço. Enquanto isso, você pode consultar as unidades abaixo.
        </Text>
      </Box>

      {/* Lista rápida das unidades disponíveis */}
      <Heading
        as="h2"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-bold)"
        fontSize="1.1rem"
        color="var(--color-text)"
        mb={3.5}
      >
        Unidades cadastradas ({CLINICAS_PARCEIRAS.length})
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {CLINICAS_PARCEIRAS.map((clinica) => (
          <Box
            key={clinica.id}
            p={5}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Heading
              as="h3"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="1rem"
              color="var(--color-text)"
              mb={1}
            >
              {clinica.nome}
            </Heading>
            <Text
              fontFamily="var(--font-body)"
              fontSize="0.84rem"
              color="var(--color-text-muted)"
              mb={4}
            >
              {clinica.unidade} • {clinica.bairro} ({clinica.distanciaKm} km)
            </Text>
            <Button
              type="button"
              size="sm"
              w="100%"
              bg="var(--color-primary)"
              _hover={{ bg: "var(--color-primary-hover)" }}
              color="var(--color-text-on-primary)"
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.82rem"
              onClick={() =>
                navegar(`/paciente/agendar?clinicaId=${clinica.id}`)
              }
            >
              Agendar nesta clínica
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}