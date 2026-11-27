import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Badge, Box, Container, Flex, Heading, HStack, Input, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import LogoAutenticacao from "./LogoAutenticacao";
import FeedbackErro from "@/components/ui/FeedbackErro";
import {
  registrarClinica,
  registrarPaciente,
  listarConvenios,
} from "@/services/autenticacaoService";
import Select from "@/components/ui/Select";
import SeletorConvenios from "@/components/ui/SeletorConvenios";

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

function validarCPF(valor) {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcularDigito = (base) => {
    const soma = [...base].reduce((total, numero, indice) => total + Number(numero) * (base.length + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calcularDigito(cpf.slice(0, 9)) === Number(cpf[9]) && calcularDigito(cpf.slice(0, 10)) === Number(cpf[10]);
}

function validarCNPJ(valor) {
  const cnpj = valor.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calcularDigito = (base, pesos) => {
    const soma = [...base].reduce((total, numero, indice) => total + Number(numero) * pesos[indice], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calcularDigito(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[12])
    && calcularDigito(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[13]);
}

const ESTADO_INICIAL_FORM = {
  // Paciente
  nomeCompleto: "",
  cpf: "",
  // Clínica
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  endereco: "",
  // Comuns
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  aceiteTermos: false,
  declaracaoVinculoAceita: false,
  convenioId: "",
  conveniosAceitos: [],
};

export default function PaginaCadastro() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navegar = useNavigate();

  const [perfil, setPerfil] = useState(() =>
    searchParams.get("perfil") === "clinica" ? "clinica" : "paciente"
  );
  const [dados, setDados] = useState(ESTADO_INICIAL_FORM);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [convenios, setConvenios] = useState([]);
  const [erroConvenios, setErroConvenios] = useState("");
  const [tentativaConvenios, setTentativaConvenios] = useState(0);

  useEffect(() => {
    const paramPerfil = searchParams.get("perfil");
    setPerfil(paramPerfil === "clinica" ? "clinica" : "paciente");
    setErros({});
    setCadastroConcluido(false);
    setErroEnvio("");
  }, [searchParams]);

  useEffect(() => {
    let ativo = true;
    listarConvenios()
      .then((lista) => {
        if (!ativo) return;
        setConvenios(lista);
        setErroConvenios("");
      })
      .catch((falha) => {
        if (!ativo) return;
        setConvenios([]);
        setErroConvenios(falha.message || "Não foi possível carregar a lista de convênios.");
      });
    return () => { ativo = false; };
  }, [tentativaConvenios]);

  function alternarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    setErros({});
    setCadastroConcluido(false);
    const proximos = new URLSearchParams(searchParams);
    if (novoPerfil === "clinica") proximos.set("perfil", "clinica");
    else proximos.delete("perfil");
    setSearchParams(proximos, { replace: true });
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

  function focarPrimeiroErro(errosEncontrados) {
    const campos = Object.keys(errosEncontrados)
      .map((campo) => document.getElementById(campo) || document.querySelector(`[name="${campo}"]`))
      .filter(Boolean)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    campos[0]?.focus();
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
      } else if (!validarCPF(dados.cpf)) {
        novosErros.cpf = "Informe um CPF válido.";
      }
      if (!dados.convenioId) novosErros.convenioId = "Selecione um convênio para continuar.";
    } else {
      if (!dados.nomeFantasia.trim()) {
        novosErros.nomeFantasia = "Informe o nome fantasia da unidade.";
      }
      if (!dados.razaoSocial.trim()) {
        novosErros.razaoSocial = "Informe a razão social.";
      }
      if (dados.cnpj.replace(/\D/g, "").length !== 14) {
        novosErros.cnpj = "Informe um CNPJ válido com 14 dígitos.";
      } else if (!validarCNPJ(dados.cnpj)) {
        novosErros.cnpj = "Informe um CNPJ válido.";
      }
      if (!dados.endereco.trim()) {
        novosErros.endereco = "Informe o endereço completo da unidade.";
      }
      if (dados.conveniosAceitos.length < 5 || dados.conveniosAceitos.length > 10) {
        novosErros.conveniosAceitos = "Escolha de 5 a 10 convênios aceitos pela clínica.";
      }
      if (!dados.declaracaoVinculoAceita) {
        novosErros.declaracaoVinculoAceita = "Confirme sua relação com a clínica.";
      }
    }

    if (dados.telefone.replace(/\D/g, "").length < 10) {
      novosErros.telefone = "Informe um número de telefone/WhatsApp válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
      novosErros.email = "Informe um endereço de e-mail válido.";
    }

    if (dados.senha.length < 8) {
      novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
    }

    if (dados.confirmarSenha !== dados.senha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    if (!dados.aceiteTermos) {
      novosErros.aceiteTermos = "Você precisa aceitar os termos para continuar.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) focarPrimeiroErro(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    if (!validarFormulario()) return;

    setErroEnvio("");
    setEnviando(true);
    try {
      if (perfil === "clinica") {
        await registrarClinica({
          nomeFantasia: dados.nomeFantasia.trim(),
          razaoSocial: dados.razaoSocial.trim(),
          cnpj: dados.cnpj.replace(/\D/g, ""),
          endereco: dados.endereco.trim(),
          telefone: dados.telefone.replace(/\D/g, ""),
          email: dados.email.trim(),
          senha: dados.senha,
          declaracaoVinculo: "Declaro que sou responsável e tenho vínculo autorizado com esta clínica.",
          conveniosAceitos: dados.conveniosAceitos,
        });
      } else {
        await registrarPaciente({
          nomeCompleto: dados.nomeCompleto.trim(),
          cpf: dados.cpf.replace(/\D/g, ""),
          convenioId: dados.convenioId,
          telefone: dados.telefone.replace(/\D/g, ""),
          email: dados.email.trim(),
          senha: dados.senha,
        });
      }
      setCadastroConcluido(true);
    } catch (erro) {
      setErroEnvio(erro.message || "Não foi possível concluir o cadastro. Revise os dados e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  const ehClinica = perfil === "clinica";
  return (
    <Container
      maxW="var(--container-sm)"
      px={{ base: "var(--space-4)", md: "var(--space-6)" }}
      py={{ base: "var(--space-6)", md: "var(--space-12)" }}
      className="animar-entrada"
    >
      <LogoAutenticacao />

      {/* Seletor de Perfil */}
      <Flex
        p="var(--space-2)"
        mb="var(--space-6)"
        bg="var(--color-surface)"
        border="var(--border-width) solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        boxShadow="var(--shadow-sm)"
        gap="var(--space-2)"
      >
        <Box
          as="button"
          type="button"
          flex="1"
          minH="var(--touch-target-min)"
          px={{ base: "var(--space-3)", sm: "var(--space-4)" }}
          borderRadius="var(--radius-md)"
          bg={!ehClinica ? "var(--color-primary)" : "transparent"}
          color={
            !ehClinica ? "var(--color-text-on-primary)" : "var(--color-text-muted)"
          }
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "var(--text-xs)", sm: "var(--text-sm)" }}
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
          minH="var(--touch-target-min)"
          px={{ base: "var(--space-3)", sm: "var(--space-4)" }}
          borderRadius="var(--radius-md)"
          bg={ehClinica ? "var(--color-accent)" : "transparent"}
          color={ehClinica ? "var(--color-text-on-accent)" : "var(--color-text-muted)"}
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "var(--text-xs)", sm: "var(--text-sm)" }}
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
        border="var(--border-width) solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        p={{ base: "var(--space-6)", sm: "var(--space-8)" }}
        boxShadow="var(--shadow-md)"
      >
        {cadastroConcluido ? (
          <VStack align="center" textAlign="center" gap="var(--space-4)" py="var(--space-4)">
            <Flex
              align="center"
              justify="center"
              boxSize="var(--icon-lg)"
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
                px="var(--space-3)"
                py="var(--space-1)"
                borderRadius="var(--radius-full)"
                bg="var(--color-accent-soft)"
                color="var(--color-accent)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-xs)"
              >
                Status da conta: Pendente de aprovação
              </Badge>
            )}

            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
              color="var(--color-text)"
            >
              {ehClinica
                ? "Solicitação enviada para análise!"
                : "Conta criada com sucesso!"}
            </Heading>

            <Text
              fontFamily="var(--font-body)"
              fontSize="var(--text-sm)"
              color="var(--color-text-muted)"
              maxW="var(--width-text)"
            >
              {ehClinica
                ? `O cadastro da unidade ${dados.nomeFantasia} foi enviado. Verifique o e-mail corporativo e aguarde a análise antes de acessar as funções de clínica.`
                : `Enviamos as instruções de verificação para ${dados.email}. Confirme seu e-mail antes de entrar.`}
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap="var(--space-3)"
              pt="var(--space-2)"
              w="100%"
              justify="center"
            >
              <Button
                type="button"
                onClick={() => navegar(ehClinica
                  ? `/login?perfil=clinica${searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`
                  : `/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`)}
                bg={ehClinica ? "var(--color-accent)" : "var(--color-primary)"}
                _hover={{
                  bg: ehClinica
                    ? "var(--color-accent-hover)"
                    : "var(--color-primary-hover)",
                }}
                color={ehClinica ? "var(--color-text-on-accent)" : "var(--color-text-on-primary)"}
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                px="var(--space-8)"
                minH="var(--touch-target-min)"
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
                  px="var(--space-6)"
                  minH="var(--touch-target-min)"
                  borderRadius="var(--radius-md)"
                >
                  <RouterLink to="/busca">Explorar exames</RouterLink>
                </Button>
              )}
            </Flex>
          </VStack>
        ) : (
          <>
            <Box mb="var(--space-6)">
              <Badge
                mb="var(--space-3)"
                px="var(--space-3)"
                py="var(--space-1)"
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
                fontSize="var(--text-xs)"
              >
                {ehClinica
                  ? "Cadastro de Parceiro • B2B"
                  : "Cadastro Gratuito • Paciente"}
              </Badge>

              <Heading
                as="h1"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
                color="var(--color-text)"
                mb="var(--space-2)"
              >
                {ehClinica
                  ? "Credencie sua clínica no Exame Já"
                  : "Crie sua conta gratuita"}
              </Heading>

              <Text
                fontFamily="var(--font-body)"
                fontSize="var(--text-xs)"
                color="var(--color-text-muted)"
              >
              {ehClinica
                ? "Informe os dados da unidade e use um e-mail do domínio corporativo. O acesso depende da verificação do e-mail e da análise cadastral."
                : "Crie sua conta e confirme o e-mail para acessar o Exame Já."}
              </Text>
            </Box>

            <Box as="form" onSubmit={lidarComEnvio} noValidate>
              <VStack align="stretch" gap="var(--space-4)">
                <FeedbackErro mensagem={erroEnvio} titulo="Não foi possível criar a conta" />
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

                    <CampoTexto
                      id="cpf"
                      rotulo="CPF"
                      placeholder="000.000.000-00"
                      valor={dados.cpf}
                      aoMudar={(v) => atualizarCampo("cpf", formatarCPF(v))}
                      erro={erros.cpf}
                      inputMode="numeric"
                    />

                    <Box>
                      <Select name="convenioId" label="Convênio obrigatório" placeholder={erroConvenios ? "Lista indisponível" : "Selecione seu convênio"} value={dados.convenioId} onChange={(evento) => atualizarCampo("convenioId", evento.target.value)} options={convenios.map((convenio) => ({ value: convenio.id, label: convenio.nome }))} error={erros.convenioId} helperText="Ele fica salvo no seu perfil e você pode trocar depois." required />
                      {erroConvenios && (
                        <Flex role="alert" mt="var(--space-2)" gap="var(--space-2)" align="center" wrap="wrap">
                          <Text fontSize="var(--text-sm)" color="var(--color-error)">{erroConvenios}</Text>
                          <Button type="button" variant="outline" size="sm" onClick={() => setTentativaConvenios((atual) => atual + 1)}>Tentar novamente</Button>
                        </Flex>
                      )}
                    </Box>

                    <CampoTexto
                      id="telefone"
                      rotulo="WhatsApp para contato"
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
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)">
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

                    <Box>
                      <SeletorConvenios
                        legenda="Convênios aceitos pela clínica"
                        convenios={convenios}
                        selecionados={dados.conveniosAceitos}
                        onChange={(ids) => atualizarCampo("conveniosAceitos", ids)}
                        erro={erros.conveniosAceitos}
                        idPrimeiro="conveniosAceitos"
                      />
                      {convenios.length === 0 && !erroConvenios && (
                        <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Carregando convênios…</Text>
                      )}
                      {erroConvenios && (
                        <Flex role="alert" mt="var(--space-2)" gap="var(--space-2)" align="center" wrap="wrap">
                          <Text fontSize="var(--text-sm)" color="var(--color-error)">{erroConvenios}</Text>
                          <Button type="button" variant="outline" size="sm" onClick={() => setTentativaConvenios((atual) => atual + 1)}>Tentar novamente</Button>
                        </Flex>
                      )}
                    </Box>

                    <CampoTexto
                      id="razaoSocial"
                      rotulo="Razão social"
                      placeholder="Ex: LabVida Serviços Médicos Ltda"
                      valor={dados.razaoSocial}
                      aoMudar={(v) => atualizarCampo("razaoSocial", v)}
                      erro={erros.razaoSocial}
                    />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)">
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
                        id="endereco"
                        rotulo="Endereço completo da unidade"
                        placeholder="Rua, número, bairro, cidade e CEP"
                        valor={dados.endereco}
                        aoMudar={(v) => atualizarCampo("endereco", v)}
                        erro={erros.endereco}
                      />
                    </SimpleGrid>
                  </>
                )}

                {ehClinica && (
                  <Box>
                    <HStack align="flex-start" gap="var(--space-3)">
                      <Box as="input" id="declaracaoVinculoAceita" type="checkbox" checked={dados.declaracaoVinculoAceita} onChange={(e) => atualizarCampo("declaracaoVinculoAceita", e.target.checked)} mt="var(--space-1)" w="var(--icon-sm)" h="var(--icon-sm)" />
                      <Box as="label" htmlFor="declaracaoVinculoAceita" fontSize="var(--text-xs)" color="var(--color-text-muted)">Declaro que sou responsável e tenho vínculo autorizado com esta clínica.</Box>
                    </HStack>
                    {erros.declaracaoVinculoAceita && <Text fontSize="var(--text-xs)" color="var(--color-error)" mt="var(--space-1)">{erros.declaracaoVinculoAceita}</Text>}
                  </Box>
                )}

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

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)">
                  <Box>
                    <Flex justify="space-between" align="center" mb="var(--space-2)">
                      <Box
                        as="label"
                        htmlFor="senha"
                        fontFamily="var(--font-heading)"
                        fontWeight={600}
                        fontSize="var(--text-xs)"
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
                        fontSize="var(--text-xs)"
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
                      placeholder="Mínimo 8 caracteres"
                      minH="var(--touch-target-min)"
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
                      <Text fontSize="var(--text-xs)" color="var(--color-error)" mt="var(--space-1)">
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
                <Box pt="var(--space-1)">
                  <HStack align="flex-start" gap="var(--space-3)">
                    <Box
                      as="input"
                      id="aceiteTermos"
                      type="checkbox"
                      checked={dados.aceiteTermos}
                      onChange={(e) =>
                        atualizarCampo("aceiteTermos", e.target.checked)
                      }
                      mt="var(--space-1)"
                      w="var(--icon-sm)"
                      h="var(--icon-sm)"
                      cursor="pointer"
                    />
                    <Box
                      as="label"
                      htmlFor="aceiteTermos"
                      fontFamily="var(--font-body)"
                      fontSize="var(--text-xs)"
                      color="var(--color-text-muted)"
                      cursor="pointer"
                    >
                      Li e concordo com os Termos de Uso e a Política de
                      Privacidade (LGPD) do Exame Já.
                    </Box>
                  </HStack>
                  {erros.aceiteTermos && (
                    <Text fontSize="var(--text-xs)" color="var(--color-error)" mt="var(--space-1)">
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
                  color={ehClinica ? "var(--color-text-on-accent)" : "var(--color-text-on-primary)"}
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  fontSize="var(--text-sm)"
                  minH="var(--touch-target-min)"
                  w="100%"
                  mt="var(--space-2)"
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
              mt="var(--space-6)"
              pt="var(--space-6)"
              borderTop="var(--border-width) solid var(--color-border-soft)"
              textAlign="center"
              fontFamily="var(--font-body)"
              fontSize="var(--text-xs)"
              color="var(--color-text-muted)"
            >
              Já possui cadastro?{" "}
              <RouterLink
                to={ehClinica
                  ? `/login?perfil=clinica${searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`
                  : `/login${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`}
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
        fontSize="var(--text-xs)"
        color="var(--color-text)"
        mb="var(--space-2)"
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
        minH="var(--touch-target-min)"
        bg="var(--color-bg)"
        color="var(--color-text)"
        _placeholder={{ color: "var(--color-text-muted)" }}
        borderColor={erro ? "var(--color-error)" : "var(--color-border-soft)"}
        borderRadius="var(--radius-md)"
      />
      {erro && (
        <Text fontSize="var(--text-xs)" color="var(--color-error)" mt="var(--space-1)">
          {erro}
        </Text>
      )}
    </Box>
  );
}
