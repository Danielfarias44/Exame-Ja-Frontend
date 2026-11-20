import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  obterDadosPacienteLogado,
  registrarAvaliacaoAgendamento,
} from "@/services/pacienteLogadoService";

const SELOS_ATENDIMENTO = [
  "Pontualidade",
  "Atendimento cordial",
  "Ambiente limpo e organizado",
  "Coleta rápida e cuidadosa",
  "Resultado entregue no prazo",
];

export default function Avaliacao() {
  const [searchParams] = useSearchParams();
  const navegar = useNavigate();

  const agendamentoId = searchParams.get("id");
  const agendamento = useMemo(() => {
    const { agendamentos } = obterDadosPacienteLogado();
    return (
      agendamentos.find((ag) => ag.id === agendamentoId) ||
      agendamentos.find((ag) => ag.status === "Concluído")
    );
  }, [agendamentoId]);

  const [nota, setNota] = useState(5);
  const [selos, setSelos] = useState(["Pontualidade"]);
  const [comentario, setComentario] = useState("");

  function alternarSelo(selo) {
    setSelos((atual) =>
      atual.includes(selo)
        ? atual.filter((item) => item !== selo)
        : [...atual, selo]
    );
  }

  function enviarAvaliacao(evento) {
    evento.preventDefault();
    if (!agendamento) return;

    registrarAvaliacaoAgendamento(agendamento.id, {
      nota,
      selos,
      comentario: comentario.trim(),
    });

    navegar("/paciente/historico");
  }

  if (!agendamento) {
    return (
      <Container maxW="760px" px={{ base: 4, md: 6 }} py={8}>
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
            mb={3}
          >
            Atendimento não encontrado para avaliação
          </Text>
          <Button
            type="button"
            size="sm"
            onClick={() => navegar("/paciente/historico")}
            bg="var(--color-primary)"
            color="var(--color-text-on-primary)"
          >
            Voltar ao histórico
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxW="760px"
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
          Avaliar Atendimento
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Sua avaliação ajuda outros pacientes a escolherem a melhor clínica.
        </Text>
      </Box>

      <Box
        as="form"
        onSubmit={enviarAvaliacao}
        p={{ base: 5, md: 7 }}
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-sm)"
      >
        <VStack align="stretch" gap={5}>
          <Box
            p={4}
            borderRadius="var(--radius-md)"
            bg="var(--color-bg)"
            border="1px solid var(--color-border-soft)"
          >
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={700}
              fontSize="1rem"
              color="var(--color-text)"
            >
              {agendamento.exameNome || agendamento.exame}
            </Text>
            <Text
              fontFamily="var(--font-body)"
              fontSize="0.84rem"
              color="var(--color-text-muted)"
            >
              {agendamento.clinicaNome || agendamento.clinica} —{" "}
              {agendamento.unidade} • {agendamento.data}
            </Text>
          </Box>

          <Box>
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.9rem"
              color="var(--color-text)"
              mb={2}
            >
              Nota geral ({nota} de 5)
            </Text>
            <Flex gap={2}>
              {[1, 2, 3, 4, 5].map((valor) => {
                const ativo = valor <= nota;
                return (
                  <Box
                    key={valor}
                    as="button"
                    type="button"
                    w="44px"
                    h="44px"
                    borderRadius="var(--radius-md)"
                    bg={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-bg)"
                    }
                    color={
                      ativo
                        ? "var(--color-text-on-primary)"
                        : "var(--color-text-muted)"
                    }
                    border="1px solid"
                    borderColor={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-border-soft)"
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={700}
                    fontSize="1rem"
                    cursor="pointer"
                    onClick={() => setNota(valor)}
                  >
                    {valor}
                  </Box>
                );
              })}
            </Flex>
          </Box>

          <Box>
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.9rem"
              color="var(--color-text)"
              mb={2}
            >
              O que mais se destacou?
            </Text>
            <Flex gap={2} flexWrap="wrap">
              {SELOS_ATENDIMENTO.map((selo) => {
                const ativo = selos.includes(selo);
                return (
                  <Box
                    key={selo}
                    as="button"
                    type="button"
                    px={3.5}
                    minH="36px"
                    borderRadius="var(--radius-full)"
                    bg={
                      ativo
                        ? "var(--color-primary-soft)"
                        : "var(--color-bg)"
                    }
                    color={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)"
                    }
                    border="1px solid"
                    borderColor={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-border-soft)"
                    }
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.82rem"
                    cursor="pointer"
                    onClick={() => alternarSelo(selo)}
                  >
                    {selo}
                  </Box>
                );
              })}
            </Flex>
          </Box>

          <Box>
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.9rem"
              color="var(--color-text)"
              mb={1.5}
            >
              Comentário (opcional)
            </Text>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte como foi sua experiência na unidade..."
              rows={3}
              bg="var(--color-bg)"
              color="var(--color-text)"
              borderColor="var(--color-border-soft)"
              borderRadius="var(--radius-md)"
            />
          </Box>

          <Flex justify="flex-end" gap={3}>
            <Button
              type="button"
              variant="outline"
              borderColor="var(--color-border-soft)"
              color="var(--color-text)"
              onClick={() => navegar("/paciente/historico")}
              fontFamily="var(--font-heading)"
              fontWeight={600}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              bg="var(--color-primary)"
              _hover={{ bg: "var(--color-primary-hover)" }}
              color="var(--color-text-on-primary)"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              px={6}
            >
              Enviar avaliação
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
}