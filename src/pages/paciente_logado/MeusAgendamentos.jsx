import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  cancelarAgendamento,
  obterDadosPacienteLogado,
} from "@/services/pacienteLogadoService";

export default function MeusAgendamentos() {
  const [searchParams] = useSearchParams();
  const navegar = useNavigate();

  const [agendamentos, setAgendamentos] = useState(
    () => obterDadosPacienteLogado().agendamentos
  );
  const [filtroStatus, setFiltroStatus] = useState("ativos");
  const [preparoAbertoId, setPreparoAbertoId] = useState(null);
  const [confirmandoCancelamentoId, setConfirmandoCancelamentoId] =
    useState(null);

  const recemCriado = searchParams.get("novo") === "1";

  const listaFiltrada = agendamentos.filter((ag) => {
    if (filtroStatus === "ativos") return ag.status === "Confirmado";
    if (filtroStatus === "cancelados") return ag.status === "Cancelado";
    return ag.status !== "Concluído";
  });

  function lidarComCancelamento(id) {
    cancelarAgendamento(id);
    setAgendamentos(obterDadosPacienteLogado().agendamentos);
    setConfirmandoCancelamentoId(null);
  }

  return (
    <Container
      maxW="960px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading
            as="h1"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "1.5rem", md: "1.9rem" }}
            color="var(--color-text)"
            mb={1}
          >
            Meus Agendamentos
          </Heading>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.92rem"
            color="var(--color-text-muted)"
          >
            Gerencie seus exames marcados, confira preparos e horários.
          </Text>
        </Box>

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
          + Novo agendamento
        </Button>
      </Flex>

      {recemCriado && (
        <Box
          mb={5}
          p={4}
          borderRadius="var(--radius-md)"
          bg="var(--color-success-soft)"
          color="var(--color-success)"
          fontFamily="var(--font-heading)"
          fontWeight={600}
          fontSize="0.88rem"
        >
          Agendamento confirmado com sucesso. Confira os detalhes e instruções de preparo abaixo.
        </Box>
      )}

      {/* Filtros */}
      <Flex gap={2} mb={5} flexWrap="wrap">
        {[
          { id: "ativos", label: "Confirmados" },
          { id: "todos", label: "Todos" },
          { id: "cancelados", label: "Cancelados" },
        ].map((aba) => {
          const ativa = filtroStatus === aba.id;
          return (
            <Box
              key={aba.id}
              as="button"
              type="button"
              onClick={() => setFiltroStatus(aba.id)}
              px={4}
              minH="36px"
              borderRadius="var(--radius-full)"
              bg={ativa ? "var(--color-primary)" : "var(--color-surface)"}
              color={
                ativa
                  ? "var(--color-text-on-primary)"
                  : "var(--color-text-muted)"
              }
              border="1px solid"
              borderColor={
                ativa ? "var(--color-primary)" : "var(--color-border-soft)"
              }
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.84rem"
              cursor="pointer"
            >
              {aba.label}
            </Box>
          );
        })}
      </Flex>

      {listaFiltrada.length === 0 ? (
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
            mb={1}
          >
            Nenhum agendamento encontrado nesta categoria
          </Text>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.86rem"
            color="var(--color-text-muted)"
            mb={4}
          >
            Você pode marcar um novo exame a qualquer momento.
          </Text>
          <Button
            type="button"
            size="sm"
            onClick={() => navegar("/paciente/agendar")}
            bg="var(--color-primary)"
            color="var(--color-text-on-primary)"
          >
            Agendar exame
          </Button>
        </Box>
      ) : (
        <VStack align="stretch" gap={4}>
          {listaFiltrada.map((ag) => {
            const cancelado = ag.status === "Cancelado";
            const mostrandoPreparo = preparoAbertoId === ag.id;
            const confirmando = confirmandoCancelamentoId === ag.id;

            return (
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
                  gap={2}
                  mb={3}
                >
                  <Box>
                    <Heading
                      as="h2"
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="1.08rem"
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
                      {ag.clinicaNome || ag.clinica} — {ag.unidade}
                    </Text>
                  </Box>

                  <Badge
                    px={3}
                    py={1}
                    borderRadius="var(--radius-full)"
                    bg={
                      cancelado
                        ? "var(--color-error-soft)"
                        : "var(--color-success-soft)"
                    }
                    color={
                      cancelado
                        ? "var(--color-error)"
                        : "var(--color-success)"
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={700}
                    fontSize="0.76rem"
                  >
                    {ag.status}
                  </Badge>
                </Flex>

                <Flex
                  gap={4}
                  flexWrap="wrap"
                  fontFamily="var(--font-body)"
                  fontSize="0.85rem"
                  color="var(--color-text)"
                  mb={4}
                >
                  <Text>
                    <strong>Data:</strong> {ag.data} às {ag.horario}
                  </Text>
                  <Text>
                    <strong>Modalidade:</strong> {ag.modalidade}
                  </Text>
                </Flex>

                {mostrandoPreparo && (
                  <Box
                    mb={4}
                    p={3.5}
                    borderRadius="var(--radius-md)"
                    bg="var(--color-bg)"
                    border="1px solid var(--color-border-soft)"
                    fontFamily="var(--font-body)"
                    fontSize="0.84rem"
                    color="var(--color-text-muted)"
                  >
                    <strong>Instruções de preparo:</strong> {ag.preparo}
                  </Box>
                )}

                {!cancelado && (
                  <Flex gap={2.5} flexWrap="wrap" align="center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      borderColor="var(--color-border-soft)"
                      color="var(--color-text)"
                      onClick={() =>
                        setPreparoAbertoId(mostrandoPreparo ? null : ag.id)
                      }
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      {mostrandoPreparo ? "Ocultar preparo" : "Ver preparo"}
                    </Button>

                    {!confirmando ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        color="var(--color-error)"
                        onClick={() => setConfirmandoCancelamentoId(ag.id)}
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.8rem"
                      >
                        Cancelar agendamento
                      </Button>
                    ) : (
                      <Flex gap={2} align="center">
                        <Button
                          type="button"
                          size="sm"
                          bg="var(--color-error)"
                          color="#ffffff"
                          onClick={() => lidarComCancelamento(ag.id)}
                          fontFamily="var(--font-heading)"
                          fontWeight={600}
                          fontSize="0.78rem"
                        >
                          Confirmar cancelamento
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmandoCancelamentoId(null)}
                          fontFamily="var(--font-heading)"
                          fontSize="0.78rem"
                        >
                          Manter
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                )}
              </Box>
            );
          })}
        </VStack>
      )}
    </Container>
  );
}