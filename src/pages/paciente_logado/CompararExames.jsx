import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  CONVENIOS_DISPONIVEIS,
  obterDadosPacienteLogado,
  obterOfertasPorIds,
  OFERTAS_EXAMES,
} from "@/services/pacienteLogadoService";

export default function CompararExames() {
  const [searchParams] = useSearchParams();
  const navegar = useNavigate();
  const { paciente } = useMemo(() => obterDadosPacienteLogado(), []);

  const idsIniciais = useMemo(() => {
    const param = searchParams.get("ids");
    if (param) {
      const validos = param
        .split(",")
        .filter((id) => OFERTAS_EXAMES.some((o) => o.id === id))
        .slice(0, 3);
      if (validos.length >= 2) return validos;
    }
    // Padrão inicial: compara Hemograma Completo nas 3 clínicas parceiras
    return ["of-hemo-labvida", "of-hemo-belem", "of-hemo-diag"];
  }, [searchParams]);

  const [idsSelecionados, setIdsSelecionados] = useState(idsIniciais);
  const [exameFiltro, setExameFiltro] = useState("todos");

  const ofertasComparadas = useMemo(
    () => obterOfertasPorIds(idsSelecionados),
    [idsSelecionados]
  );

  const examesUnicos = useMemo(() => {
    const mapa = new Map();
    OFERTAS_EXAMES.forEach((o) => {
      if (!mapa.has(o.exameId)) {
        mapa.set(o.exameId, o.exameNome);
      }
    });
    return Array.from(mapa.entries());
  }, []);

  const ofertasDisponiveisParaAdicionar = useMemo(() => {
    return OFERTAS_EXAMES.filter((o) => {
      if (idsSelecionados.includes(o.id)) return false;
      if (exameFiltro !== "todos" && o.exameId !== exameFiltro) return false;
      return true;
    });
  }, [idsSelecionados, exameFiltro]);

  // Destaques automáticos
  const menorPreco = useMemo(() => {
    if (ofertasComparadas.length === 0) return null;
    return Math.min(...ofertasComparadas.map((o) => o.precoParticular));
  }, [ofertasComparadas]);

  const menorDistancia = useMemo(() => {
    if (ofertasComparadas.length === 0) return null;
    return Math.min(...ofertasComparadas.map((o) => o.distanciaKm));
  }, [ofertasComparadas]);

  const maiorAvaliacao = useMemo(() => {
    if (ofertasComparadas.length === 0) return null;
    return Math.max(...ofertasComparadas.map((o) => o.avaliacao));
  }, [ofertasComparadas]);

  function removerItem(id) {
    setIdsSelecionados((prev) => prev.filter((item) => item !== id));
  }

  function adicionarItem(id) {
    setIdsSelecionados((prev) => (prev.length < 3 ? [...prev, id] : prev));
  }

  function selecionarPorExame(exameId) {
    setExameFiltro(exameId);
    if (exameId !== "todos") {
      const correspondentes = OFERTAS_EXAMES.filter(
        (o) => o.exameId === exameId
      )
        .slice(0, 3)
        .map((o) => o.id);
      if (correspondentes.length > 0) {
        setIdsSelecionados(correspondentes);
      }
    }
  }

  function formatarConvenios(ids) {
    return ids
      .map(
        (id) =>
          CONVENIOS_DISPONIVEIS.find((c) => c.id === id)?.nome || id
      )
      .join(", ");
  }

  return (
    <Container
      maxW="1120px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "100px", md: 12 }}
      className="animar-entrada"
    >
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
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
            Comparador de Exames e Clínicas
          </Heading>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.92rem"
            color="var(--color-text-muted)"
          >
            Compare até 3 opções lado a lado por preço particular, convênios aceitos, prazo e localização.
          </Text>
        </Box>

        <Box minW={{ base: "100%", md: "280px" }}>
          <Box
            as="select"
            value={exameFiltro}
            onChange={(e) => selecionarPorExame(e.target.value)}
            w="100%"
            minH="44px"
            px={3.5}
            borderRadius="var(--radius-md)"
            bg="var(--color-surface)"
            color="var(--color-text)"
            border="1px solid var(--color-border-soft)"
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.86rem"
          >
            <option value="todos">Comparação personalizada</option>
            {examesUnicos.map(([id, nome]) => (
              <option key={id} value={id}>
                Comparar: {nome}
              </option>
            ))}
          </Box>
        </Box>
      </Flex>

      {/* Tabela / Grade Comparativa */}
      {ofertasComparadas.length === 0 ? (
        <Box
          p={8}
          mb={6}
          textAlign="center"
          bg="var(--color-surface)"
          border="1px solid var(--color-border-soft)"
          borderRadius="var(--radius-lg)"
        >
          <Text
            fontFamily="var(--font-heading)"
            fontWeight={600}
            color="var(--color-text)"
            mb={2}
          >
            Nenhuma clínica selecionada para comparação
          </Text>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.88rem"
            color="var(--color-text-muted)"
          >
            Escolha até 3 opções abaixo para visualizar o comparativo completo.
          </Text>
        </Box>
      ) : (
        <Box
          overflowX="auto"
          mb={8}
          bg="var(--color-surface)"
          border="1px solid var(--color-border-soft)"
          borderRadius="var(--radius-lg)"
          boxShadow="var(--shadow-sm)"
        >
          <Box as="table" w="100%" minW="720px" borderCollapse="collapse">
            <Box as="thead">
              <Box
                as="tr"
                borderBottom="1px solid var(--color-border-soft)"
                bg="var(--color-bg)"
              >
                <Box
                  as="th"
                  textAlign="left"
                  p={4}
                  w="22%"
                  fontFamily="var(--font-heading)"
                  fontWeight={700}
                  fontSize="0.84rem"
                  color="var(--color-text-muted)"
                >
                  Critério
                </Box>

                {ofertasComparadas.map((oferta) => (
                  <Box
                    key={oferta.id}
                    as="th"
                    textAlign="left"
                    p={4}
                    verticalAlign="top"
                    borderLeft="1px solid var(--color-border-soft)"
                  >
                    <Flex justify="space-between" align="flex-start" gap={2} mb={1.5}>
                      <Text
                        fontFamily="var(--font-heading)"
                        fontWeight="var(--weight-bold)"
                        fontSize="1rem"
                        color="var(--color-text)"
                      >
                        {oferta.clinicaNome}
                      </Text>
                      <Box
                        as="button"
                        type="button"
                        onClick={() => removerItem(oferta.id)}
                        fontSize="0.76rem"
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        color="var(--color-text-muted)"
                        _hover={{ color: "var(--color-error)" }}
                        cursor="pointer"
                      >
                        Remover
                      </Box>
                    </Flex>
                    <Text
                      fontFamily="var(--font-body)"
                      fontWeight={500}
                      fontSize="0.82rem"
                      color="var(--color-primary)"
                    >
                      {oferta.exameNome}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box as="tbody" fontFamily="var(--font-body)" fontSize="0.88rem">
              {/* Valor Particular */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Valor Particular
                </Box>
                {ofertasComparadas.map((oferta) => {
                  const ehMelhor =
                    ofertasComparadas.length > 1 &&
                    oferta.precoParticular === menorPreco;
                  return (
                    <Box
                      key={oferta.id}
                      as="td"
                      p={4}
                      borderLeft="1px solid var(--color-border-soft)"
                    >
                      <Flex align="center" gap={2} flexWrap="wrap">
                        <Text
                          fontFamily="var(--font-heading)"
                          fontWeight="var(--weight-bold)"
                          fontSize="1.05rem"
                          color="var(--color-text)"
                        >
                          R$ {oferta.precoParticular.toFixed(2).replace(".", ",")}
                        </Text>
                        {ehMelhor && (
                          <Badge
                            bg="var(--color-success-soft)"
                            color="var(--color-success)"
                            borderRadius="var(--radius-full)"
                            px={2.5}
                            py={0.5}
                            fontSize="0.72rem"
                          >
                            Menor preço
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </Box>

              {/* Cobertura Convênio */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Seus convênios
                </Box>
                {ofertasComparadas.map((oferta) => {
                  const atende = oferta.conveniosAceitos.some((id) =>
                    paciente.conveniosIds.includes(id)
                  );
                  return (
                    <Box
                      key={oferta.id}
                      as="td"
                      p={4}
                      borderLeft="1px solid var(--color-border-soft)"
                    >
                      <Badge
                        bg={
                          atende
                            ? "var(--color-success-soft)"
                            : "var(--color-bg)"
                        }
                        color={
                          atende
                            ? "var(--color-success)"
                            : "var(--color-text-muted)"
                        }
                        borderRadius="var(--radius-full)"
                        px={2.5}
                        py={0.5}
                        fontSize="0.75rem"
                        mb={1.5}
                      >
                        {atende
                          ? "Coberto pelo seu convênio"
                          : "Não cobre seus convênios"}
                      </Badge>
                      <Text fontSize="0.8rem" color="var(--color-text-muted)">
                        Aceita: {formatarConvenios(oferta.conveniosAceitos)}
                      </Text>
                    </Box>
                  );
                })}
              </Box>

              {/* Prazo de Resultado */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Prazo do resultado
                </Box>
                {ofertasComparadas.map((oferta) => (
                  <Box
                    key={oferta.id}
                    as="td"
                    p={4}
                    borderLeft="1px solid var(--color-border-soft)"
                    color="var(--color-text)"
                  >
                    {oferta.prazoResultado}
                  </Box>
                ))}
              </Box>

              {/* Próximo horário */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Próximo horário
                </Box>
                {ofertasComparadas.map((oferta) => (
                  <Box
                    key={oferta.id}
                    as="td"
                    p={4}
                    borderLeft="1px solid var(--color-border-soft)"
                    color="var(--color-text)"
                  >
                    {oferta.proximoHorario}
                  </Box>
                ))}
              </Box>

              {/* Avaliação */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Avaliação
                </Box>
                {ofertasComparadas.map((oferta) => {
                  const ehMelhor =
                    ofertasComparadas.length > 1 &&
                    oferta.avaliacao === maiorAvaliacao;
                  return (
                    <Box
                      key={oferta.id}
                      as="td"
                      p={4}
                      borderLeft="1px solid var(--color-border-soft)"
                    >
                      <Flex align="center" gap={2}>
                        <Text fontWeight={600} color="var(--color-text)">
                          {oferta.avaliacao} / 5.0
                        </Text>
                        {ehMelhor && (
                          <Badge
                            bg="var(--color-primary-soft)"
                            color="var(--color-primary)"
                            borderRadius="var(--radius-full)"
                            px={2.5}
                            py={0.5}
                            fontSize="0.72rem"
                          >
                            Melhor avaliada
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  );
                })}
              </Box>

              {/* Distância */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Localização e distância
                </Box>
                {ofertasComparadas.map((oferta) => {
                  const ehMaisPerto =
                    ofertasComparadas.length > 1 &&
                    oferta.distanciaKm === menorDistancia;
                  return (
                    <Box
                      key={oferta.id}
                      as="td"
                      p={4}
                      borderLeft="1px solid var(--color-border-soft)"
                    >
                      <Text color="var(--color-text)" mb={1}>
                        {oferta.bairro} ({oferta.distanciaKm} km)
                      </Text>
                      {ehMaisPerto && (
                        <Badge
                          bg="var(--color-success-soft)"
                          color="var(--color-success)"
                          borderRadius="var(--radius-full)"
                          px={2.5}
                          py={0.5}
                          fontSize="0.72rem"
                        >
                          Mais próxima
                        </Badge>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Preparo */}
              <Box as="tr" borderBottom="1px solid var(--color-border-soft)">
                <Box as="td" p={4} fontWeight={600} color="var(--color-text)">
                  Preparo necessário
                </Box>
                {ofertasComparadas.map((oferta) => (
                  <Box
                    key={oferta.id}
                    as="td"
                    p={4}
                    borderLeft="1px solid var(--color-border-soft)"
                    fontSize="0.82rem"
                    color="var(--color-text-muted)"
                  >
                    {oferta.preparo}
                  </Box>
                ))}
              </Box>

              {/* Ação */}
              <Box as="tr">
                <Box as="td" p={4} />
                {ofertasComparadas.map((oferta) => (
                  <Box
                    key={oferta.id}
                    as="td"
                    p={4}
                    borderLeft="1px solid var(--color-border-soft)"
                  >
                    <Button
                      type="button"
                      w="100%"
                      minH="42px"
                      bg="var(--color-primary)"
                      _hover={{ bg: "var(--color-primary-hover)" }}
                      color="var(--color-text-on-primary)"
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.84rem"
                      onClick={() =>
                        navegar(
                          `/paciente/agendar?clinicaId=${oferta.clinicaId}&exame=${encodeURIComponent(
                            oferta.exameNome
                          )}`
                        )
                      }
                    >
                      Agendar nesta clínica
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Adicionar mais opções à comparação */}
      {idsSelecionados.length < 3 && (
        <Box>
          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="1.05rem"
            color="var(--color-text)"
            mb={3}
          >
            Adicionar opção à comparação ({3 - idsSelecionados.length} vaga
            {3 - idsSelecionados.length > 1 ? "s" : ""})
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={3.5}>
            {ofertasDisponiveisParaAdicionar.slice(0, 6).map((oferta) => (
              <Flex
                key={oferta.id}
                justify="space-between"
                align="center"
                p={4}
                bg="var(--color-surface)"
                border="1px solid var(--color-border-soft)"
                borderRadius="var(--radius-md)"
                gap={3}
              >
                <Box>
                  <Text
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.9rem"
                    color="var(--color-text)"
                  >
                    {oferta.exameNome}
                  </Text>
                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.8rem"
                    color="var(--color-text-muted)"
                  >
                    {oferta.clinicaNome} • R${" "}
                    {oferta.precoParticular.toFixed(2).replace(".", ",")}
                  </Text>
                </Box>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  borderColor="var(--color-primary)"
                  color="var(--color-primary)"
                  onClick={() => adicionarItem(oferta.id)}
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.8rem"
                  flexShrink={0}
                >
                  Adicionar
                </Button>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Container>
  );
}