import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import LogoAutenticacao from "./LogoAutenticacao";
import {
  listarConvenios,
  registrarClinica,
  registrarPaciente,
} from "@/services/autenticacaoService";

const LIMITE_CONVENIOS_PACIENTE = 5;

function formatarCPF(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarCNPJ(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);
  return digitos
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digitos
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

const ESTADO_INICIAL_FORM = {
  // Paciente
  nomeCompleto: "",
  cpf: "",
  dataNascimento: "",
  // Clínica
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  bairro: "",
  fotoArquivo: null,
  fotoPreview: "",
  // Preferências / Convênios (IDs vindos da API)
  conveniosIds: [],
  // Comuns
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  aceiteTermos: false,
};

export default function PaginaCadastro() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navegar = useNavigate();

  const [perfil, setPerfil] = useState(() =>
    searchParams.get("perfil") === "clinica" ? "clinica" : "paciente"
  );
  const [conveniosDisponiveis, setConveniosDisponiveis] = useState([]);
  const [dados, setDados] = useState(ESTADO_INICIAL_FORM);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarConvenios().then((lista) => {
      if (ativo) setConveniosDisponiveis(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const paramPerfil = searchParams.get("perfil");
    setPerfil(paramPerfil === "clinica" ? "clinica" : "paciente");
    setErros({});
    setCadastroConcluido(false);
  }, [searchParams]);

  function alternarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    setErros({});
    setCadastroConcluido(false);
    setDados((anterior) => ({ ...anterior, conveniosIds: [] }));
    if (novoPerfil === "clinica") {
      setSearchParams({ perfil: "clinica" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function atualizarCampo(campo, valor) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }));
    if (erros[campo]) {
      setErros((anterior) => {
        const copia = { ...anterior };
        delete copia[campo];
        return copia;
      });
    }
  }

  function alternarConvenio(idConvenio) {
    setDados((anterior) => {
      const jaSelecionado = anterior.conveniosIds.includes(idConvenio);
      if (jaSelecionado) {
        return {
          ...anterior,
          conveniosIds: anterior.conveniosIds.filter((id) => id !== idConvenio),
        };
      }
      if (
        perfil === "paciente" &&
        anterior.conveniosIds.length >= LIMITE_CONVENIOS_PACIENTE
      ) {
        return anterior;
      }
      return {
        ...anterior,
        conveniosIds: [...anterior.conveniosIds, idConvenio],
      };
    });
  }

  function lidarComFotoClinica(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const previewUrl = URL.createObjectURL(arquivo);
    setDados((anterior) => ({
      ...anterior,
      fotoArquivo: arquivo,
      fotoPreview: previewUrl,
    }));
  }

  function validarFormulario() {
    const novosErros = {};

    if (perfil === "paciente") {
      if (
        !dados.nomeCompleto.trim() ||
        dados.nomeCompleto.trim().split(" ").length < 2
      ) {
        novosErros.nomeCompleto = "Informe seu nome e sobrenome.";
      }
      if (dados.cpf.replace(/\D/g, "").length !== 11) {
        novosErros.cpf = "Informe um CPF válido com 11 dígitos.";
      }
      if (!dados.dataNascimento) {
        novosErros.dataNascimento = "Informe sua data de nascimento.";
      }
    } else {
      if (!dados.nomeFantasia.trim()) {
        novosErros.nomeFantasia = "Informe o nome fantasia da unidade.";
      }
      if (!dados.razaoSocial.trim()) {
        novosErros.razaoSocial = "Informe a razão social.";
      }
      if (dados.cnpj.replace(/\D/g, "").length !== 14) {
        novosErros.cnpj = "Informe um CNPJ válido com 14 dígitos.";
      }
      if (!dados.bairro.trim()) {
        novosErros.bairro = "Informe o bairro ou endereço de atendimento.";
      }
    }

    if (dados.telefone.replace(/\D/g, "").length < 10) {
      novosErros.telefone = "Informe um número de telefone/WhatsApp válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
      novosErros.email = "Informe um endereço de e-mail válido.";
    }

    if (dados.senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (dados.confirmarSenha !== dados.senha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    if (!dados.aceiteTermos) {
      novosErros.aceiteTermos = "Você precisa aceitar os termos para continuar.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      if (perfil === "clinica") {
        await registrarClinica({
          nomeFantasia: dados.nomeFantasia.trim(),
          razaoSocial: dados.razaoSocial.trim(),
          cnpj: dados.cnpj.replace(/\D/g, ""),
          bairro: dados.bairro.trim(),
          telefone: dados.telefone.replace(/\D/g, ""),
          email: dados.email.trim(),
          senha: dados.senha,
          conveniosIds: dados.conveniosIds,
          fotoArquivo: dados.fotoArquivo,
        });
      } else {
        await registrarPaciente({
          nomeCompleto: dados.nomeCompleto.trim(),
          cpf: dados.cpf.replace(/\D/g, ""),
          dataNascimento: dados.dataNascimento,
          telefone: dados.telefone.replace(/\D/g, ""),
          email: dados.email.trim(),
          senha: dados.senha,
          conveniosIds: dados.conveniosIds,
        });
      }
      setCadastroConcluido(true);
    } finally {
      setEnviando(false);
    }
  }

  const ehClinica = perfil === "clinica";
  const atingiuLimitePaciente =
    !ehClinica && dados.conveniosIds.length >= LIMITE_CONVENIOS_PACIENTE;

  return (
    <Container
      maxW="680px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
      className="animar-entrada"
    >
      <LogoAutenticacao />

      {/* Seletor de Perfil */}
      <Flex
        p={1.5}
        mb={6}
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-sm)"
        gap={1.5}
      >
        <Box
          as="button"
          type="button"
          flex="1"
          minH="44px"
          px={{ base: 2.5, sm: 4 }}
          borderRadius="var(--radius-md)"
          bg={!ehClinica ? "var(--color-primary)" : "transparent"}
          color={
            !ehClinica ? "var(--color-text-on-primary)" : "var(--color-text-muted)"
          }
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "0.84rem", sm: "0.95rem" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          onClick={() => alternarPerfil("paciente")}
        >
          Sou Paciente
        </Box>

        <Box
          as="button"
          type="button"
          flex="1"
          minH="44px"
          px={{ base: 2.5, sm: 4 }}
          borderRadius="var(--radius-md)"
          bg={ehClinica ? "var(--color-accent)" : "transparent"}
          color={ehClinica ? "#ffffff" : "var(--color-text-muted)"}
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "0.84rem", sm: "0.95rem" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          onClick={() => alternarPerfil("clinica")}
        >
          Sou Clínica ou Laboratório
        </Box>
      </Flex>

      {/* Card Principal */}
      <Box
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="24px"
        p={{ base: 5, sm: 8 }}
        boxShadow="var(--shadow-md)"
      >
        {cadastroConcluido ? (
          <VStack align="center" textAlign="center" gap={4} py={4}>
            <Flex
              align="center"
              justify="center"
              boxSize="56px"
              borderRadius="var(--radius-full)"
              bg="var(--color-success-soft)"
              color="var(--color-success)"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Flex>

            {ehClinica && (
              <Badge
                px={3}
                py={1}
                borderRadius="var(--radius-full)"
                bg="var(--color-accent-soft)"
                color="var(--color-accent)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.76rem"
              >
                Status da conta: Pendente de aprovação
              </Badge>
            )}

            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "1.4rem", md: "1.7rem" }}
              color="var(--color-text)"
            >
              {ehClinica
                ? "Solicitação enviada para análise!"
                : "Conta criada com sucesso!"}
            </Heading>

            <Text
              fontFamily="var(--font-body)"
              fontSize="0.92rem"
              color="var(--color-text-muted)"
              maxW="470px"
            >
              {ehClinica
                ? `O cadastro da unidade ${dados.nomeFantasia} está com status pendente. Você já pode acessar o painel para visualizar os dados enviados enquanto validamos sua unidade.`
                : `Tudo pronto, ${dados.nomeCompleto.split(" ")[0]}! Suas preferências foram salvas e você já pode acessar sua conta.`}
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={3}
              pt={2}
              w="100%"
              justify="center"
            >
              <Button
                type="button"
                onClick={() =>
                  navegar(ehClinica ? "/login?perfil=clinica" : "/login")
                }
                bg={ehClinica ? "var(--color-accent)" : "var(--color-primary)"}
                _hover={{
                  bg: ehClinica
                    ? "var(--color-accent-hover)"
                    : "var(--color-primary-hover)",
                }}
                color={ehClinica ? "#ffffff" : "var(--color-text-on-primary)"}
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                px={7}
                minH="46px"
                borderRadius="var(--radius-md)"
              >
                Ir para o login
              </Button>

              {!ehClinica && (
                <Button
                  asChild
                  variant="outline"
                  borderColor="var(--color-border-soft)"
                  color="var(--color-text)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  px={6}
                  minH="46px"
                  borderRadius="var(--radius-md)"
                >
                  <RouterLink to="/busca">Explorar exames</RouterLink>
                </Button>
              )}
            </Flex>
          </VStack>
        ) : (
          <>
            <Box mb={6}>
              <Badge
                mb={2.5}
                px={3}
                py={1}
                borderRadius="var(--radius-full)"
                bg={
                  ehClinica
                    ? "var(--color-accent-soft)"
                    : "var(--color-primary-soft)"
                }
                color={
                  ehClinica ? "var(--color-accent)" : "var(--color-primary)"
                }
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="0.75rem"
              >
                {ehClinica
                  ? "Cadastro de Parceiro • B2B"
                  : "Cadastro Gratuito • Paciente"}
              </Badge>

              <Heading
                as="h1"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize={{ base: "1.45rem", md: "1.8rem" }}
                color="var(--color-text)"
                mb={1.5}
              >
                {ehClinica
                  ? "Credencie sua clínica no Exame Já"
                  : "Crie sua conta gratuita"}
              </Heading>

              <Text
                fontFamily="var(--font-body)"
                fontSize="0.88rem"
                color="var(--color-text-muted)"
              >
                {ehClinica
                  ? "Após o envio, sua clínica inicia como pendente e exibe apenas foto, nome, contato e convênios."
                  : "Salve até 5 convênios nas suas preferências para comparar preços mais rápido."}
              </Text>
            </Box>

            <Box as="form" onSubmit={lidarComEnvio} noValidate>
              <VStack align="stretch" gap={4}>
                {!ehClinica ? (
                  <>
                    <CampoTexto
                      id="nomeCompleto"
                      rotulo="Nome completo"
                      placeholder="Ex: Maria Clara Souza"
                      valor={dados.nomeCompleto}
                      aoMudar={(v) => atualizarCampo("nomeCompleto", v)}
                      erro={erros.nomeCompleto}
                    />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      <CampoTexto
                        id="cpf"
                        rotulo="CPF"
                        placeholder="000.000.000-00"
                        valor={dados.cpf}
                        aoMudar={(v) => atualizarCampo("cpf", formatarCPF(v))}
                        erro={erros.cpf}
                        inputMode="numeric"
                      />

                      <CampoTexto
                        id="dataNascimento"
                        rotulo="Data de nascimento"
                        tipo="date"
                        valor={dados.dataNascimento}
                        aoMudar={(v) => atualizarCampo("dataNascimento", v)}
                        erro={erros.dataNascimento}
                      />
                    </SimpleGrid>

                    <CampoTexto
                      id="telefone"
                      rotulo="WhatsApp (para alertas de preparo)"
                      placeholder="(91) 98888-0000"
                      valor={dados.telefone}
                      aoMudar={(v) =>
                        atualizarCampo("telefone", formatarTelefone(v))
                      }
                      erro={erros.telefone}
                      inputMode="tel"
                    />
                  </>
                ) : (
                  <>
                    {/* Foto / Logo da Clínica (dado público visível) */}
                    <Box>
                      <Text
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.88rem"
                        color="var(--color-text)"
                        mb={1.5}
                      >
                        Foto ou logo da clínica (visível para pacientes)
                      </Text>

                      <Flex
                        align="center"
                        gap={3.5}
                        p={3}
                        borderRadius="var(--radius-md)"
                        border="1px dashed var(--color-border-soft)"
                        bg="var(--color-bg)"
                      >
                        {dados.fotoPreview ? (
                          <Image
                            src={dados.fotoPreview}
                            alt="Pré-visualização da clínica"
                            boxSize="52px"
                            borderRadius="var(--radius-md)"
                            objectFit="cover"
                          />
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            boxSize="52px"
                            borderRadius="var(--radius-md)"
                            bg="var(--color-accent-soft)"
                            color="var(--color-accent)"
                            fontFamily="var(--font-heading)"
                            fontWeight="var(--weight-bold)"
                            fontSize="0.75rem"
                            flexShrink={0}
                          >
                            LOGO
                          </Flex>
                        )}

                        <Box flex="1" minW={0}>
                          <Text
                            fontFamily="var(--font-body)"
                            fontSize="0.82rem"
                            color="var(--color-text)"
                            truncate
                          >
                            {dados.fotoArquivo
                              ? dados.fotoArquivo.name
                              : "Nenhuma imagem selecionada"}
                          </Text>
                          <Text
                            fontFamily="var(--font-body)"
                            fontSize="0.75rem"
                            color="var(--color-text-muted)"
                          >
                            PNG ou JPG até 2MB
                          </Text>
                        </Box>

                        <Box
                          as="label"
                          htmlFor="fotoClinica"
                          px={3.5}
                          py={2}
                          borderRadius="var(--radius-md)"
                          border="1px solid var(--color-border-soft)"
                          bg="var(--color-surface)"
                          color="var(--color-text)"
                          fontFamily="var(--font-heading)"
                          fontWeight={600}
                          fontSize="0.8rem"
                          cursor="pointer"
                          flexShrink={0}
                        >
                          {dados.fotoPreview ? "Trocar" : "Escolher"}
                          <input
                            id="fotoClinica"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={lidarComFotoClinica}
                            hidden
                          />
                        </Box>
                      </Flex>
                    </Box>

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      <CampoTexto
                        id="nomeFantasia"
                        rotulo="Nome fantasia da clínica"
                        placeholder="Ex: LabVida Diagnósticos"
                        valor={dados.nomeFantasia}
                        aoMudar={(v) => atualizarCampo("nomeFantasia", v)}
                        erro={erros.nomeFantasia}
                      />

                      <CampoTexto
                        id="cnpj"
                        rotulo="CNPJ"
                        placeholder="00.000.000/0000-00"
                        valor={dados.cnpj}
                        aoMudar={(v) => atualizarCampo("cnpj", formatarCNPJ(v))}
                        erro={erros.cnpj}
                        inputMode="numeric"
                      />
                    </SimpleGrid>

                    <CampoTexto
                      id="razaoSocial"
                      rotulo="Razão social"
                      placeholder="Ex: LabVida Serviços Médicos Ltda"
                      valor={dados.razaoSocial}
                      aoMudar={(v) => atualizarCampo("razaoSocial", v)}
                      erro={erros.razaoSocial}
                    />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      <CampoTexto
                        id="telefone"
                        rotulo="Telefone / WhatsApp de contato"
                        placeholder="(91) 3222-0000"
                        valor={dados.telefone}
                        aoMudar={(v) =>
                          atualizarCampo("telefone", formatarTelefone(v))
                        }
                        erro={erros.telefone}
                        inputMode="tel"
                      />

                      <CampoTexto
                        id="bairro"
                        rotulo="Bairro / Cidade"
                        placeholder="Ex: Umarizal, Belém - PA"
                        valor={dados.bairro}
                        aoMudar={(v) => atualizarCampo("bairro", v)}
                        erro={erros.bairro}
                      />
                    </SimpleGrid>
                  </>
                )}

                {/* Seletor de Convênios por ID (até 5 para Paciente; livre para Clínica) */}
                <Box>
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text
                      fontFamily="var(--font-heading)"
                      fontWeight={600}
                      fontSize="0.88rem"
                      color="var(--color-text)"
                    >
                      {ehClinica
                        ? "Convênios atendidos (opcional)"
                        : "Seus convênios (opcional • até 5)"}
                    </Text>

                    {!ehClinica && (
                      <Text
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.78rem"
                        color={
                          atingiuLimitePaciente
                            ? "var(--color-accent)"
                            : "var(--color-text-muted)"
                        }
                      >
                        {dados.conveniosIds.length}/{LIMITE_CONVENIOS_PACIENTE}{" "}
                        selecionados
                      </Text>
                    )}
                  </Flex>

                  <Flex wrap="wrap" gap={2}>
                    {conveniosDisponiveis.map((convenio) => {
                      const selecionado = dados.conveniosIds.includes(
                        convenio.id
                      );
                      const bloqueado = !selecionado && atingiuLimitePaciente;

                      return (
                        <Box
                          key={convenio.id}
                          as="button"
                          type="button"
                          disabled={bloqueado}
                          onClick={() => alternarConvenio(convenio.id)}
                          px={3.5}
                          py={1.5}
                          minH="36px"
                          borderRadius="var(--radius-full)"
                          border="1px solid"
                          borderColor={
                            selecionado
                              ? ehClinica
                                ? "var(--color-accent)"
                                : "var(--color-primary)"
                              : "var(--color-border-soft)"
                          }
                          bg={
                            selecionado
                              ? ehClinica
                                ? "var(--color-accent-soft)"
                                : "var(--color-primary-soft)"
                              : "var(--color-bg)"
                          }
                          color={
                            selecionado
                              ? ehClinica
                                ? "var(--color-accent)"
                                : "var(--color-primary)"
                              : "var(--color-text-muted)"
                          }
                          fontFamily="var(--font-heading)"
                          fontWeight={selecionado ? 700 : 500}
                          fontSize="0.82rem"
                          opacity={bloqueado ? 0.45 : 1}
                          cursor={bloqueado ? "not-allowed" : "pointer"}
                          transition="all var(--duration-fast) var(--ease-standard)"
                        >
                          {selecionado ? `✓ ${convenio.nome}` : convenio.nome}
                        </Box>
                      );
                    })}
                  </Flex>

                  <Text
                    fontFamily="var(--font-body)"
                    fontSize="0.76rem"
                    color="var(--color-text-muted)"
                    mt={1.5}
                  >
                    {ehClinica
                      ? "Selecione os planos aceitos pela unidade para aparecer nos filtros de busca."
                      : "Caso não possua plano, deixe desmarcado para buscar valores particulares."}
                  </Text>
                </Box>

                <CampoTexto
                  id="email"
                  rotulo={ehClinica ? "E-mail corporativo" : "E-mail"}
                  tipo="email"
                  placeholder={
                    ehClinica ? "contato@suaclinica.com.br" : "voce@email.com"
                  }
                  valor={dados.email}
                  aoMudar={(v) => atualizarCampo("email", v)}
                  erro={erros.email}
                />

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  <Box>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Box
                        as="label"
                        htmlFor="senha"
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.88rem"
                        color="var(--color-text)"
                      >
                        Senha
                      </Box>
                      <Box
                        as="button"
                        type="button"
                        onClick={() => setMostrarSenha((s) => !s)}
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="0.78rem"
                        color="var(--color-primary)"
                        cursor="pointer"
                      >
                        {mostrarSenha ? "Ocultar" : "Mostrar"}
                      </Box>
                    </Flex>
                    <Input
                      id="senha"
                      type={mostrarSenha ? "text" : "password"}
                      value={dados.senha}
                      onChange={(e) => atualizarCampo("senha", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minH="46px"
                      bg="var(--color-bg)"
                      color="var(--color-text)"
                      borderColor={
                        erros.senha
                          ? "var(--color-error)"
                          : "var(--color-border-soft)"
                      }
                      borderRadius="var(--radius-md)"
                    />
                    {erros.senha && (
                      <Text fontSize="0.78rem" color="var(--color-error)" mt={1}>
                        {erros.senha}
                      </Text>
                    )}
                  </Box>

                  <CampoTexto
                    id="confirmarSenha"
                    rotulo="Confirmar senha"
                    tipo={mostrarSenha ? "text" : "password"}
                    placeholder="Repita a senha"
                    valor={dados.confirmarSenha}
                    aoMudar={(v) => atualizarCampo("confirmarSenha", v)}
                    erro={erros.confirmarSenha}
                  />
                </SimpleGrid>

                {/* Aceite de Termos */}
                <Box pt={1}>
                  <HStack align="flex-start" gap={2.5}>
                    <Box
                      as="input"
                      id="aceiteTermos"
                      type="checkbox"
                      checked={dados.aceiteTermos}
                      onChange={(e) =>
                        atualizarCampo("aceiteTermos", e.target.checked)
                      }
                      mt={1}
                      w="18px"
                      h="18px"
                      cursor="pointer"
                    />
                    <Box
                      as="label"
                      htmlFor="aceiteTermos"
                      fontFamily="var(--font-body)"
                      fontSize="0.82rem"
                      color="var(--color-text-muted)"
                      cursor="pointer"
                    >
                      Li e concordo com os Termos de Uso e a Política de
                      Privacidade (LGPD) do Exame Já.
                    </Box>
                  </HStack>
                  {erros.aceiteTermos && (
                    <Text fontSize="0.78rem" color="var(--color-error)" mt={1}>
                      {erros.aceiteTermos}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  disabled={enviando}
                  bg={
                    ehClinica ? "var(--color-accent)" : "var(--color-primary)"
                  }
                  _hover={{
                    bg: ehClinica
                      ? "var(--color-accent-hover)"
                      : "var(--color-primary-hover)",
                  }}
                  color={ehClinica ? "#ffffff" : "var(--color-text-on-primary)"}
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="1rem"
                  minH="48px"
                  w="100%"
                  mt={2}
                  borderRadius="var(--radius-md)"
                  boxShadow="var(--shadow-sm)"
                >
                  {enviando
                    ? "Processando cadastro..."
                    : ehClinica
                    ? "Solicitar credenciamento"
                    : "Criar minha conta gratuita"}
                </Button>
              </VStack>
            </Box>

            <Text
              mt={6}
              pt={5}
              borderTop="1px solid var(--color-border-soft)"
              textAlign="center"
              fontFamily="var(--font-body)"
              fontSize="0.88rem"
              color="var(--color-text-muted)"
            >
              Já possui cadastro?{" "}
              <RouterLink
                to={ehClinica ? "/login?perfil=clinica" : "/login"}
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Entrar na conta
              </RouterLink>
            </Text>
          </>
        )}
      </Box>
    </Container>
  );
}

function CampoTexto({
  id,
  rotulo,
  tipo = "text",
  placeholder,
  valor,
  aoMudar,
  erro,
  inputMode,
}) {
  return (
    <Box>
      <Box
        as="label"
        htmlFor={id}
        display="block"
        fontFamily="var(--font-heading)"
        fontWeight={600}
        fontSize="0.88rem"
        color="var(--color-text)"
        mb={1.5}
      >
        {rotulo}
      </Box>
      <Input
        id={id}
        type={tipo}
        inputMode={inputMode}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(erro)}
        minH="46px"
        bg="var(--color-bg)"
        color="var(--color-text)"
        _placeholder={{ color: "var(--color-text-muted)" }}
        borderColor={erro ? "var(--color-error)" : "var(--color-border-soft)"}
        borderRadius="var(--radius-md)"
      />
      {erro && (
        <Text fontSize="0.78rem" color="var(--color-error)" mt={1}>
          {erro}
        </Text>
      )}
    </Box>
  );
}