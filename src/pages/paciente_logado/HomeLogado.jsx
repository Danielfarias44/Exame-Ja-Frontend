import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import {
  buscarOfertasExames,
  CATEGORIAS_EXAMES,
  CLINICAS_PARCEIRAS,
  CONVENIOS_DISPONIVEIS,
  obterDadosPacienteLogado,
} from "@/services/pacienteLogadoService";

export default function HomeLogado() {
  const navegar = useNavigate();
  const { paciente, agendamentos } = useMemo(
    () => obterDadosPacienteLogado(),
    []
  );

  const primeiroNome = paciente.nome.split(" ")[0];
  const proximoAgendamento = agendamentos.find(
    (ag) => ag.status === "Confirmado"
  );

  // Estados da busca e filtros
  const [termoBusca, setTermoBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [convenioFiltro, setConvenioFiltro] = useState("todos");
  const [precoMaximo, setPrecoMaximo] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("relevancia");

  // Seleção para comparação (até 3 ofertas)
  const [idsComparacao, setIdsComparacao] = useState([]);
  const [mostrarPreparo, setMostrarPreparo] = useState(false);

  const ofertasFiltradas = useMemo(
    () =>
      buscarOfertasExames({
        termo: termoBusca,
        categoria: categoriaAtiva,
        convenioFiltro,
        precoMaximo: precoMaximo ? Number(precoMaximo) : null,
        ordenarPor,
      }),
    [termoBusca, categoriaAtiva, convenioFiltro, precoMaximo, ordenarPor]
  );

  const qtdFiltrosAtivos = [
    convenioFiltro !== "todos",
    Boolean(precoMaximo),
    ordenarPor !== "relevancia",
  ].filter(Boolean).length;

  function alternarComparacao(ofertaId) {
    setIdsComparacao((atual) => {
      if (atual.includes(ofertaId)) {
        return atual.filter((id) => id !== ofertaId);
      }
      if (atual.length >= 3) {
        return atual;
      }
      return [...atual, ofertaId];
    });
  }

  function limparFiltros() {
    setTermoBusca("");
    setCategoriaAtiva("todos");
    setConvenioFiltro("todos");
    setPrecoMaximo("");
    setOrdenarPor("relevancia");
  }

  function irParaComparacao() {
    const params = new URLSearchParams();
    if (idsComparacao.length > 0) {
      params.set("ids", idsComparacao.join(","));
    }
    navegar(`/paciente/comparar?${params.toString()}`);
  }

  return (
    <Container
      maxW="1120px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      {/* Cabeçalho limpo sem emojis */}
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
            fontSize={{ base: "1.6rem", md: "2rem" }}
            color="var(--color-text)"
            mb={1}
          >
            Olá, {primeiroNome}
          </Heading>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.94rem"
            color="var(--color-text-muted)"
          >
            Busque, filtre e compare exames nas clínicas parceiras perto de você.
          </Text>
        </Box>

        <Button
          type="button"
          variant="outline"
          onClick={() => navegar("/paciente/comparar")}
          borderColor="var(--color-border-soft)"
          bg="var(--color-surface)"
          color="var(--color-text)"
          _hover={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
          }}
          fontFamily="var(--font-heading)"
          fontWeight={600}
          fontSize="0.86rem"
          minH="42px"
          px={4}
          borderRadius="var(--radius-md)"
        >
          Comparar exames
        </Button>
      </Flex>

      {/* Barra de Busca + Botão de Filtros */}
      <Box mb={4}>
        <Flex gap={2.5} align="center">
          <Flex
            flex="1"
            align="center"
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
            px={4}
            minH="52px"
            boxShadow="var(--shadow-sm)"
            _focusWithin={{
              borderColor: "var(--color-primary)",
            }}
          >
            <Box
              as="svg"
              w="18px"
              h="18px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              mr={3}
              flexShrink={0}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Box>

            <Input
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar exame, clínica ou bairro..."
              border="none"
              outline="none"
              _focusVisible={{ boxShadow: "none" }}
              px={0}
              bg="transparent"
              color="var(--color-text)"
              fontFamily="var(--font-body)"
              fontSize="0.94rem"
            />

            {termoBusca && (
              <Box
                as="button"
                type="button"
                onClick={() => setTermoBusca("")}
                fontSize="0.8rem"
                fontFamily="var(--font-heading)"
                fontWeight={600}
                color="var(--color-text-muted)"
                cursor="pointer"
                ml={2}
              >
                Limpar
              </Box>
            )}
          </Flex>

          <Button
            type="button"
            onClick={() => setMostrarFiltros((prev) => !prev)}
            bg={
              mostrarFiltros || qtdFiltrosAtivos > 0
                ? "var(--color-primary-soft)"
                : "var(--color-surface)"
            }
            color={
              mostrarFiltros || qtdFiltrosAtivos > 0
                ? "var(--color-primary)"
                : "var(--color-text)"
            }
            border="1px solid"
            borderColor={
              mostrarFiltros || qtdFiltrosAtivos > 0
                ? "var(--color-primary)"
                : "var(--color-border-soft)"
            }
            minH="52px"
            px={4}
            borderRadius="var(--radius-lg)"
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.88rem"
            gap={2}
          >
            <Box
              as="svg"
              w="17px"
              h="17px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </Box>
            <Text display={{ base: "none", sm: "inline" }}>Filtros</Text>
            {qtdFiltrosAtivos > 0 && (
              <Badge
                bg="var(--color-primary)"
                color="var(--color-text-on-primary)"
                borderRadius="var(--radius-full)"
                px={2}
                fontSize="0.72rem"
              >
                {qtdFiltrosAtivos}
              </Badge>
            )}
          </Button>
        </Flex>

        {/* Painel Expansível de Filtros */}
        {mostrarFiltros && (
          <Box
            mt={3}
            p={{ base: 4, md: 5 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
            boxShadow="var(--shadow-sm)"
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Convênio ou Pagamento
                </Text>
                <Box
                  as="select"
                  value={convenioFiltro}
                  onChange={(e) => setConvenioFiltro(e.target.value)}
                  w="100%"
                  minH="42px"
                  px={3}
                  borderRadius="var(--radius-md)"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  border="1px solid var(--color-border-soft)"
                  fontFamily="var(--font-body)"
                  fontSize="0.88rem"
                >
                  <option value="todos">Todos os convênios e particular</option>
                  <option value="meus_convenios">
                    Apenas meus convênios salvos ({paciente.conveniosIds.length})
                  </option>
                  <option value="particular">Somente Particular</option>
                  {CONVENIOS_DISPONIVEIS.map((conv) => (
                    <option key={conv.id} value={conv.id}>
                      {conv.nome}
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
                  Valor máximo (Particular)
                </Text>
                <Box
                  as="select"
                  value={precoMaximo}
                  onChange={(e) => setPrecoMaximo(e.target.value)}
                  w="100%"
                  minH="42px"
                  px={3}
                  borderRadius="var(--radius-md)"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  border="1px solid var(--color-border-soft)"
                  fontFamily="var(--font-body)"
                  fontSize="0.88rem"
                >
                  <option value="">Qualquer valor</option>
                  <option value="50">Até R$ 50,00</option>
                  <option value="100">Até R$ 100,00</option>
                  <option value="150">Até R$ 150,00</option>
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
                  Ordenar resultados por
                </Text>
                <Box
                  as="select"
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  w="100%"
                  minH="42px"
                  px={3}
                  borderRadius="var(--radius-md)"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  border="1px solid var(--color-border-soft)"
                  fontFamily="var(--font-body)"
                  fontSize="0.88rem"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="menor_preco">Menor preço particular</option>
                  <option value="menor_distancia">Mais próximo de mim</option>
                  <option value="melhor_avaliacao">Melhor avaliação</option>
                </Box>
              </Box>
            </SimpleGrid>

            <Flex justify="flex-end" mt={4}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                color="var(--color-text-muted)"
                fontFamily="var(--font-heading)"
                fontWeight={600}
              >
                Resetar filtros
              </Button>
            </Flex>
          </Box>
        )}
      </Box>

      {/* Pílulas de Categoria sem emojis */}
      <Flex gap={2} flexWrap="wrap" mb={7}>
        {CATEGORIAS_EXAMES.map((cat) => {
          const ativa = categoriaAtiva === cat.id;
          return (
            <Box
              key={cat.id}
              as="button"
              type="button"
              onClick={() => setCategoriaAtiva(cat.id)}
              px={4}
              minH="38px"
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
              fontSize="0.85rem"
              cursor="pointer"
              transition="all var(--duration-fast) var(--ease-standard)"
            >
              {cat.label}
            </Box>
          );
        })}
      </Flex>

      {/* Resultados da Busca + Seleção para Comparação */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={3.5}
          flexWrap="wrap"
          gap={2}
        >
          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="1.15rem"
            color="var(--color-text)"
          >
            Exames disponíveis ({ofertasFiltradas.length})
          </Heading>
          <Text
            fontFamily="var(--font-body)"
            fontSize="0.82rem"
            color="var(--color-text-muted)"
          >
            Selecione até 3 opções para comparar preços, prazos e convênios
          </Text>
        </Flex>

        {ofertasFiltradas.length === 0 ? (
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
              Nenhum exame encontrado com esses filtros
            </Text>
            <Text
              fontFamily="var(--font-body)"
              fontSize="0.86rem"
              color="var(--color-text-muted)"
              mb={4}
            >
              Tente remover algum filtro ou buscar por outro termo.
            </Text>
            <Button
              type="button"
              onClick={limparFiltros}
              bg="var(--color-primary)"
              color="var(--color-text-on-primary)"
              fontFamily="var(--font-heading)"
              fontWeight={600}
              size="sm"
            >
              Limpar filtros
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {ofertasFiltradas.map((oferta) => {
              const selecionado = idsComparacao.includes(oferta.id);
              const atendeMeuConvenio = oferta.conveniosAceitos.some((id) =>
                paciente.conveniosIds.includes(id)
              );

              return (
                <Flex
                  key={oferta.id}
                  direction="column"
                  justify="space-between"
                  p={5}
                  bg="var(--color-surface)"
                  border="1.5px solid"
                  borderColor={
                    selecionado
                      ? "var(--color-primary)"
                      : "var(--color-border-soft)"
                  }
                  borderRadius="var(--radius-lg)"
                  boxShadow="var(--shadow-sm)"
                  transition="all var(--duration-fast) var(--ease-standard)"
                >
                  <Box>
                    <Flex justify="space-between" align="center" mb={2.5} gap={2}>
                      <Badge
                        px={2.5}
                        py={0.5}
                        borderRadius="var(--radius-full)"
                        bg="var(--color-primary-soft)"
                        color="var(--color-primary)"
                        fontFamily="var(--font-heading)"
                        fontWeight={700}
                        fontSize="0.72rem"
                        textTransform="capitalize"
                      >
                        {oferta.categoria}
                      </Badge>

                      {atendeMeuConvenio && (
                        <Badge
                          px={2.5}
                          py={0.5}
                          borderRadius="var(--radius-full)"
                          bg="var(--color-success-soft)"
                          color="var(--color-success)"
                          fontFamily="var(--font-heading)"
                          fontWeight={600}
                          fontSize="0.72rem"
                        >
                          Aceita seu convênio
                        </Badge>
                      )}
                    </Flex>

                    <Heading
                      as="h3"
                      fontFamily="var(--font-heading)"
                      fontWeight="var(--weight-bold)"
                      fontSize="1.02rem"
                      color="var(--color-text)"
                      mb={1}
                    >
                      {oferta.exameNome}
                    </Heading>

                    <Text
                      fontFamily="var(--font-body)"
                      fontWeight={600}
                      fontSize="0.86rem"
                      color="var(--color-text)"
                    >
                      {oferta.clinicaNome}
                    </Text>
                    <Text
                      fontFamily="var(--font-body)"
                      fontSize="0.8rem"
                      color="var(--color-text-muted)"
                      mb={3}
                    >
                      {oferta.bairro} • {oferta.distanciaKm} km • Nota{" "}
                      {oferta.avaliacao}
                    </Text>

                    <Box
                      p={3}
                      mb={4}
                      borderRadius="var(--radius-md)"
                      bg="var(--color-bg)"
                      border="1px solid var(--color-border-soft)"
                    >
                      <Flex justify="space-between" align="baseline" mb={1}>
                        <Text
                          fontFamily="var(--font-body)"
                          fontSize="0.78rem"
                          color="var(--color-text-muted)"
                        >
                          Particular
                        </Text>
                        <Text
                          fontFamily="var(--font-heading)"
                          fontWeight="var(--weight-bold)"
                          fontSize="1.05rem"
                          color="var(--color-text)"
                        >
                          R$ {oferta.precoParticular.toFixed(2).replace(".", ",")}
                        </Text>
                      </Flex>
                      <Text
                        fontFamily="var(--font-body)"
                        fontSize="0.78rem"
                        color="var(--color-text-muted)"
                      >
                        Resultado: {oferta.prazoResultado}
                      </Text>
                    </Box>
                  </Box>

                  <Flex gap={2}>
                    <Button
                      type="button"
                      flex="1"
                      size="sm"
                      minH="38px"
                      variant={selecionado ? "solid" : "outline"}
                      bg={selecionado ? "var(--color-primary-soft)" : "transparent"}
                      color={
                        selecionado
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)"
                      }
                      borderColor={
                        selecionado
                          ? "var(--color-primary)"
                          : "var(--color-border-soft)"
                      }
                      disabled={!selecionado && idsComparacao.length >= 3}
                      onClick={() => alternarComparacao(oferta.id)}
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      {selecionado ? "Selecionado" : "+ Comparar"}
                    </Button>

                    <Button
                      type="button"
                      flex="1"
                      size="sm"
                      minH="38px"
                      bg="var(--color-primary)"
                      _hover={{ bg: "var(--color-primary-hover)" }}
                      color="var(--color-text-on-primary)"
                      onClick={() =>
                        navegar(
                          `/paciente/agendar?clinicaId=${oferta.clinicaId}&exame=${encodeURIComponent(
                            oferta.exameNome
                          )}`
                        )
                      }
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.8rem"
                    >
                      Agendar
                    </Button>
                  </Flex>
                </Flex>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      {/* Próximo Agendamento (sem emojis) */}
      {proximoAgendamento && (
        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="1.15rem"
              color="var(--color-text)"
            >
              Próximo Agendamento
            </Heading>
            <Box
              as="button"
              type="button"
              onClick={() => navegar("/paciente/agendamentos")}
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.84rem"
              color="var(--color-primary)"
              cursor="pointer"
            >
              Ver todos
            </Box>
          </Flex>

          <Box
            p={{ base: 5, md: 6 }}
            borderRadius="20px"
            bg="var(--color-primary)"
            color="var(--color-text-on-primary)"
            boxShadow="var(--shadow-md)"
          >
            <Flex
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={3}
              pb={4}
              borderBottom="1px solid rgba(255,255,255,0.2)"
            >
              <Box>
                <Heading
                  as="h3"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize={{ base: "1.1rem", md: "1.25rem" }}
                  mb={1}
                >
                  {proximoAgendamento.exameNome}
                </Heading>
                <Text fontFamily="var(--font-body)" fontSize="0.88rem" opacity={0.9}>
                  {proximoAgendamento.clinicaNome} — {proximoAgendamento.unidade}
                </Text>
              </Box>

              <Badge
                px={3}
                py={1}
                borderRadius="var(--radius-full)"
                bg="rgba(255,255,255,0.2)"
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight={600}
                fontSize="0.78rem"
              >
                {proximoAgendamento.status}
              </Badge>
            </Flex>

            <Flex
              justify="space-between"
              align={{ base: "flex-start", sm: "center" }}
              direction={{ base: "column", sm: "row" }}
              gap={3}
              pt={4}
            >
              <Flex align="center" gap={2} fontSize="0.88rem" fontWeight={600}>
                <Box
                  as="svg"
                  w="16px"
                  h="16px"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </Box>
                <Text>
                  {proximoAgendamento.data} • {proximoAgendamento.horario}
                </Text>
              </Flex>

              <Button
                type="button"
                size="sm"
                onClick={() => setMostrarPreparo((p) => !p)}
                bg="rgba(255,255,255,0.18)"
                _hover={{ bg: "rgba(255,255,255,0.28)" }}
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight={600}
                fontSize="0.8rem"
                borderRadius="var(--radius-full)"
                px={4}
              >
                {mostrarPreparo ? "Ocultar preparo" : "Ver preparo"}
              </Button>
            </Flex>

            {mostrarPreparo && (
              <Box
                mt={3}
                p={3.5}
                borderRadius="var(--radius-md)"
                bg="rgba(0,0,0,0.18)"
                fontFamily="var(--font-body)"
                fontSize="0.85rem"
              >
                {proximoAgendamento.preparo}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Laboratórios Próximos (sem emojis) */}
      <Box>
        <Flex justify="space-between" align="center" mb={3.5}>
          <Heading
            as="h2"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="1.15rem"
            color="var(--color-text)"
          >
            Laboratórios Próximos
          </Heading>
          <Box
            as="button"
            type="button"
            onClick={() => navegar("/paciente/mapa")}
            fontFamily="var(--font-heading)"
            fontWeight={600}
            fontSize="0.84rem"
            color="var(--color-primary)"
            cursor="pointer"
          >
            Ver no mapa
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {CLINICAS_PARCEIRAS.map((clinica) => (
            <Box
              key={clinica.id}
              bg="var(--color-surface)"
              border="1px solid var(--color-border-soft)"
              borderRadius="var(--radius-lg)"
              overflow="hidden"
              boxShadow="var(--shadow-sm)"
            >
              <Box h="130px" overflow="hidden">
                <Box
                  as="img"
                  src={clinica.imagem}
                  alt={clinica.nome}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              </Box>
              <Box p={4}>
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
                  fontSize="0.82rem"
                  color="var(--color-text-muted)"
                  mb={3}
                >
                  {clinica.bairro} • {clinica.distanciaKm} km • Nota{" "}
                  {clinica.avaliacao}
                </Text>
                <Button
                  type="button"
                  size="sm"
                  w="100%"
                  variant="outline"
                  borderColor="var(--color-border-soft)"
                  color="var(--color-text)"
                  _hover={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                  onClick={() =>
                    navegar(`/paciente/agendar?clinicaId=${clinica.id}`)
                  }
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                >
                  Agendar nesta unidade
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Barra Flutuante de Comparação */}
      {idsComparacao.length > 0 && (
        <Box
          position="fixed"
          bottom={{ base: "76px", md: "24px" }}
          left="50%"
          transform="translateX(-50%)"
          zIndex={40}
          w={{ base: "calc(100% - 32px)", sm: "auto" }}
          minW={{ sm: "440px" }}
          p={3.5}
          px={5}
          borderRadius="var(--radius-lg)"
          bg="var(--color-surface)"
          border="1.5px solid var(--color-primary)"
          boxShadow="var(--shadow-md)"
        >
          <Flex justify="space-between" align="center" gap={4}>
            <Text
              fontFamily="var(--font-heading)"
              fontWeight={600}
              fontSize="0.88rem"
              color="var(--color-text)"
            >
              {idsComparacao.length} de 3 opções selecionadas
            </Text>

            <Flex gap={2}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIdsComparacao([])}
                fontFamily="var(--font-heading)"
                fontSize="0.8rem"
                color="var(--color-text-muted)"
              >
                Limpar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={idsComparacao.length < 2}
                onClick={irParaComparacao}
                bg="var(--color-primary)"
                _hover={{ bg: "var(--color-primary-hover)" }}
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight={600}
                fontSize="0.82rem"
                px={4}
              >
                Comparar agora
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}
    </Container>
  );
}