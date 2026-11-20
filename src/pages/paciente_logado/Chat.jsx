import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";

// TODO: Conectar com serviço de mensagens em tempo real (REST / WebSocket) do back-end
export default function Chat() {
  const navegar = useNavigate();

  return (
    <Container
      maxW="920px"
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
          Chat com Clínicas
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Canal direto com a recepção das unidades parceiras para dúvidas sobre preparo e cobertura.
        </Text>
      </Box>

      <Box
        p={{ base: 6, md: 10 }}
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
          Em integração com o Back-end
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
          Atendimento em tempo real aguardando API
        </Heading>

        <Text
          maxW="520px"
          mx="auto"
          mb={6}
          fontFamily="var(--font-body)"
          fontSize="0.9rem"
          color="var(--color-text-muted)"
        >
          Esta tela está reservada como placeholder até a definição dos endpoints de mensagens e filas de atendimento das clínicas no back-end.
        </Text>

        <Flex justify="center" gap={3} flexWrap="wrap">
          <Button
            type="button"
            onClick={() => navegar("/paciente/agendar")}
            bg="var(--color-primary)"
            _hover={{ bg: "var(--color-primary-hover)" }}
            color="var(--color-text-on-primary)"
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.86rem"
            minH="42px"
            px={5}
          >
            Agendar exame agora
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navegar("/paciente")}
            borderColor="var(--color-border-soft)"
            color="var(--color-text)"
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.86rem"
            minH="42px"
            px={5}
          >
            Voltar ao início
          </Button>
        </Flex>
      </Box>
    </Container>
  );
}