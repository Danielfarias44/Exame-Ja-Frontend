import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { obterDadosPacienteLogado } from "@/services/pacienteLogadoService";

export default function Historico() {
  const navegar = useNavigate();
  const { agendamentos } = useMemo(() => obterDadosPacienteLogado(), []);

  const concluidos = agendamentos.filter((ag) => ag.status === "Concluído");

  return (
    <Container
      maxW="960px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
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
          Histórico de Exames
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Consulte exames já realizados e avalie o atendimento das unidades.
        </Text>
      </Box>

      {concluidos.length === 0 ? (
        <Box
          p={8}
          textAlign="center"
          bg="var(--color-surface)"
          border="1px solid var(--color-border-soft)"
          borderRadius="var(--radius-lg)"
        >
          <Text
            fontFamily="var(--font-heading)"
            fontWeight={600}
            color="var(--color-text)"
          >
            Nenhum exame concluído até o momento
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={4}>
          {concluidos.map((ag) => (
            <Box
              key={ag.id}
              p={{ base: 5, md: 6 }}
              bg="var(--color-surface)"
              border="1px solid var(--color-border-soft)"
              borderRadius="var(--radius-lg)"
              boxShadow="var(--shadow-sm)"
            >
              <Flex
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                direction={{ base: "column", sm: "row" }}
                gap={3}
              >
                <Box>
                  <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                    <Badge
                      px={2.5}
                      py={0.5}
                      borderRadius="var(--radius-full)"
                      bg="var(--color-primary-soft)"
                      color="var(--color-primary)"
                      fontFamily="var(--font-heading)"
                      fontWeight={700}
                      fontSize="0.72rem"
                    >
                      Concluído
                    </Badge>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="0.8rem"
                      color="var(--color-text-muted)"
                    >
                      Realizado em {ag.data} às {ag.horario}
                    </Text>
                  </Flex>

                  <Heading
                    as="h2"
                    fontFamily="var(--font-heading)"
                    fontWeight="var(--weight-bold)"
                    fontSize="1.05rem"
                    color="var(--color-text)"
                    mb={0.5}
                  >
                    {ag.exameNome || ag.exame}
                  </Heading>

                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.86rem"
                    color="var(--color-text-muted)"
                  >
                    {ag.clinicaNome || ag.clinica} — {ag.unidade} •{" "}
                    {ag.modalidade}
                  </Text>
                </Box>

                <Flex gap={2.5} align="center" flexWrap="wrap">
                  {ag.avaliado ? (
                    <Badge
                      px={3}
                      py={1.5}
                      borderRadius="var(--radius-full)"
                      bg="var(--color-success-soft)"
                      color="var(--color-success)"
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.78rem"
                    >
                      Atendimento avaliado
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      bg="var(--color-primary)"
                      _hover={{ bg: "var(--color-primary-hover)" }}
                      color="var(--color-text-on-primary)"
                      onClick={() =>
                        navegar(`/paciente/avaliacao?id=${ag.id}`)
                      }
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.82rem"
                    >
                      Avaliar atendimento
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    borderColor="var(--color-border-soft)"
                    color="var(--color-text)"
                    onClick={() =>
                      navegar(
                        `/paciente/agendar?clinicaId=${ag.clinicaId}&exame=${encodeURIComponent(
                          ag.exameNome || ag.exame
                        )}`
                      )
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.82rem"
                  >
                    Agendar novamente
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Container>
  );
}