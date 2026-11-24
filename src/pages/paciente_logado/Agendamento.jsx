import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  CLINICAS_PARCEIRAS,
  CONVENIOS_DISPONIVEIS,
  criarNovoAgendamento,
  EXAMES_DISPONIVEIS,
  obterDadosPacienteLogado,
} from "@/services/pacienteLogadoService";

function obterDataAmanhaISO() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return amanha.toISOString().split("T")[0];
}

function formatarDataBR(dataISO) {
  if (!dataISO || !dataISO.includes("-")) return dataISO;
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Agendamento() {
  const [searchParams] = useSearchParams();
  const navegar = useNavigate();

  const { paciente } = useMemo(() => obterDadosPacienteLogado(), []);

  const clinicaParam = searchParams.get("clinicaId");
  const exameParam = searchParams.get("exame");

  const [clinicaId, setClinicaId] = useState(() => {
    if (clinicaParam && CLINICAS_PARCEIRAS.some((c) => c.id === clinicaParam)) {
      return clinicaParam;
    }
    return CLINICAS_PARCEIRAS[0].id;
  });

  const clinicaSelecionada = useMemo(
    () =>
      CLINICAS_PARCEIRAS.find((c) => c.id === clinicaId) ||
      CLINICAS_PARCEIRAS[0],
    [clinicaId]
  );

  const [exameNome, setExameNome] = useState(() => {
    if (exameParam) return exameParam;
    return clinicaSelecionada.exames[0] || EXAMES_DISPONIVEIS[0].nome;
  });

  const [tipoPagamento, setTipoPagamento] = useState("convenio");
  const [convenioId, setConvenioId] = useState(
    () => paciente.conveniosIds[0] || clinicaSelecionada.conveniosAceitos[0]
  );
  const [dataISO, setDataISO] = useState(obterDataAmanhaISO);
  const [horario, setHorario] = useState(
    () => clinicaSelecionada.horarios[0] || "08:00"
  );
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!clinicaSelecionada.exames.includes(exameNome)) {
      setExameNome(clinicaSelecionada.exames[0]);
    }
    if (!clinicaSelecionada.horarios.includes(horario)) {
      setHorario(clinicaSelecionada.horarios[0]);
    }
  }, [clinicaSelecionada, exameNome, horario]);

  const detalhesExame = useMemo(
    () =>
      EXAMES_DISPONIVEIS.find(
        (e) => e.nome.toLowerCase() === exameNome.toLowerCase()
      ),
    [exameNome]
  );

  function confirmarAgendamento(evento) {
    evento.preventDefault();
    setErro("");

    if (!dataISO) {
      setErro("Selecione uma data para o exame.");
      return;
    }
    if (!horario) {
      setErro("Selecione um horário disponível.");
      return;
    }

    const nomeConvenio =
      CONVENIOS_DISPONIVEIS.find((c) => c.id === convenioId)?.nome ||
      "Convênio";

    criarNovoAgendamento({
      exameNome,
      clinicaId: clinicaSelecionada.id,
      clinicaNome: clinicaSelecionada.nome,
      unidade: clinicaSelecionada.unidade,
      data: formatarDataBR(dataISO),
      horario,
      modalidade:
        tipoPagamento === "convenio"
          ? `Convênio (${nomeConvenio})`
          : "Particular",
      preparo:
        detalhesExame?.preparo ||
        "Apresentar documento oficial com foto e pedido médico na recepção.",
    });

    navegar("/paciente/agendamentos?novo=1");
  }

  return (
    <Container
      maxW="880px"
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
          Agendar Exame
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Escolha a unidade, o exame, a forma de atendimento e o melhor horário.
        </Text>
      </Box>

      {erro && (
        <Box
          mb={4}
          p={3.5}
          borderRadius="var(--radius-md)"
          bg="var(--color-error-soft)"
          color="var(--color-error)"
          fontFamily="var(--font-body)"
          fontSize="0.86rem"
        >
          {erro}
        </Box>
      )}

      <Box as="form" onSubmit={confirmarAgendamento}>
        <VStack align="stretch" gap={5}>
          {/* 1. Unidade */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={700}
              fontSize="0.95rem"
              color="var(--color-text)"
              mb={3}
            >
              1. Clínica ou Laboratório
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
              {CLINICAS_PARCEIRAS.map((clinica) => {
                const selecionada = clinica.id === clinicaId;
                return (
                  <Box
                    key={clinica.id}
                    as="button"
                    type="button"
                    textAlign="left"
                    p={3.5}
                    borderRadius="var(--radius-md)"
                    border="1.5px solid"
                    borderColor={
                      selecionada
                        ? "var(--color-primary)"
                        : "var(--color-border-soft)"
                    }
                    bg={
                      selecionada
                        ? "var(--color-primary-soft)"
                        : "var(--color-bg)"
                    }
                    cursor="pointer"
                    onClick={() => setClinicaId(clinica.id)}
                  >
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight={700}
                      fontSize="0.9rem"
                      color="var(--color-text)"
                      mb={0.5}
                    >
                      {clinica.nome}
                    </Text>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="0.78rem"
                      color="var(--color-text-muted)"
                    >
                      {clinica.unidade} • {clinica.distanciaKm} km
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* 2. Exame e Modalidade */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={700}
              fontSize="0.95rem"
              color="var(--color-text)"
              mb={3}
            >
              2. Exame e Modalidade
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Selecione o exame
                </Text>
                <Box
                  as="select"
                  value={exameNome}
                  onChange={(e) => setExameNome(e.target.value)}
                  w="100%"
                  minH="44px"
                  px={3}
                  borderRadius="var(--radius-md)"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  border="1px solid var(--color-border-soft)"
                  fontFamily="var(--font-body)"
                  fontSize="0.88rem"
                >
                  {clinicaSelecionada.exames.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </Box>
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Forma de atendimento
                </Text>
                <Flex gap={2}>
                  <Button
                    type="button"
                    flex="1"
                    minH="44px"
                    bg={
                      tipoPagamento === "convenio"
                        ? "var(--color-primary)"
                        : "var(--color-bg)"
                    }
                    color={
                      tipoPagamento === "convenio"
                        ? "var(--color-text-on-primary)"
                        : "var(--color-text)"
                    }
                    border="1px solid var(--color-border-soft)"
                    onClick={() => setTipoPagamento("convenio")}
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.84rem"
                  >
                    Convênio
                  </Button>
                  <Button
                    type="button"
                    flex="1"
                    minH="44px"
                    bg={
                      tipoPagamento === "particular"
                        ? "var(--color-primary)"
                        : "var(--color-bg)"
                    }
                    color={
                      tipoPagamento === "particular"
                        ? "var(--color-text-on-primary)"
                        : "var(--color-text)"
                    }
                    border="1px solid var(--color-border-soft)"
                    onClick={() => setTipoPagamento("particular")}
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.84rem"
                  >
                    Particular
                  </Button>
                </Flex>
              </Box>
            </SimpleGrid>

            {tipoPagamento === "convenio" && (
              <Box mt={4}>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Qual convênio será utilizado?
                </Text>
                <Box
                  as="select"
                  value={convenioId}
                  onChange={(e) => setConvenioId(e.target.value)}
                  w="100%"
                  minH="44px"
                  px={3}
                  borderRadius="var(--radius-md)"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  border="1px solid var(--color-border-soft)"
                  fontFamily="var(--font-body)"
                  fontSize="0.88rem"
                >
                  {CONVENIOS_DISPONIVEIS.map((conv) => (
                    <option key={conv.id} value={conv.id}>
                      {conv.nome}
                      {paciente.conveniosIds.includes(conv.id)
                        ? " (Salvo no seu perfil)"
                        : ""}
                    </option>
                  ))}
                </Box>
              </Box>
            )}

            {detalhesExame?.preparo && (
              <Box
                mt={4}
                p={3.5}
                borderRadius="var(--radius-md)"
                bg="var(--color-bg)"
                border="1px solid var(--color-border-soft)"
              >
                <Badge
                  mb={1}
                  px={2}
                  py={0.5}
                  borderRadius="var(--radius-full)"
                  bg="var(--color-primary-soft)"
                  color="var(--color-primary)"
                  fontSize="0.72rem"
                >
                  Orientação de preparo
                </Badge>
                <Text
                  fontFamily="var(--font-body)"
                  fontSize="0.84rem"
                  color="var(--color-text-muted)"
                >
                  {detalhesExame.preparo}
                </Text>
              </Box>
            )}
          </Box>

          {/* 3. Data e Horário */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={700}
              fontSize="0.95rem"
              color="var(--color-text)"
              mb={3}
            >
              3. Data e Horário
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Data do atendimento
                </Text>
                <Input
                  type="date"
                  value={dataISO}
                  min={obterDataAmanhaISO()}
                  onChange={(e) => setDataISO(e.target.value)}
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                  borderRadius="var(--radius-md)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Horários disponíveis
                </Text>
                <Flex gap={2} flexWrap="wrap">
                  {clinicaSelecionada.horarios.map((hora) => {
                    const ativo = hora === horario;
                    return (
                      <Box
                        key={hora}
                        as="button"
                        type="button"
                        px={3.5}
                        minH="38px"
                        borderRadius="var(--radius-md)"
                        bg={
                          ativo
                            ? "var(--color-primary)"
                            : "var(--color-bg)"
                        }
                        color={
                          ativo
                            ? "var(--color-text-on-primary)"
                            : "var(--color-text)"
                        }
                        border="1px solid"
                        borderColor={
                          ativo
                            ? "var(--color-primary)"
                            : "var(--color-border-soft)"
                        }
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.84rem"
                        cursor="pointer"
                        onClick={() => setHorario(hora)}
                      >
                        {hora}
                      </Box>
                    );
                  })}
                </Flex>
              </Box>
            </SimpleGrid>
          </Box>

          <Flex justify="flex-end" gap={3}>
            <Button
              type="button"
              variant="outline"
              borderColor="var(--color-border-soft)"
              color="var(--color-text)"
              minH="46px"
              px={5}
              onClick={() => navegar(-1)}
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
              minH="46px"
              px={6}
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
            >
              Confirmar agendamento
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
}