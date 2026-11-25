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
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import LogoAutenticacao from "./LogoAutenticacao";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { PERFIS, ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { entrarComEmailESenha, reenviarVerificacaoEmail } from "@/services/autenticacaoService";

function obterDestinoSeguro(redirectParam, perfil) {
  const rotaPadrao = ROTA_INICIAL_PERFIL[perfil] || "/";
  if (
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//") &&
    !redirectParam.startsWith("/\\")
  ) {
    return redirectParam;
  }
  return rotaPadrao;
}

export default function PaginaLogin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navegar = useNavigate();

  const [perfil, setPerfil] = useState(() => {
    if (searchParams.get("perfil") === PERFIS.ADMIN || searchParams.get("redirect")?.startsWith("/admin")) return PERFIS.ADMIN;
    return searchParams.get("perfil") === PERFIS.CLINICA ? PERFIS.CLINICA : PERFIS.PACIENTE;
  });
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [reenviandoVerificacao, setReenviandoVerificacao] = useState(false);
  const [mensagemVerificacao, setMensagemVerificacao] = useState("");
  const [erroVerificacao, setErroVerificacao] = useState("");

  const ehClinica = perfil === PERFIS.CLINICA;
  const ehAdmin = perfil === PERFIS.ADMIN;

  useEffect(() => {
    const perfilSolicitado = searchParams.get("perfil");
    setPerfil(perfilSolicitado === PERFIS.ADMIN || searchParams.get("redirect")?.startsWith("/admin")
      ? PERFIS.ADMIN
      : perfilSolicitado === PERFIS.CLINICA ? PERFIS.CLINICA : PERFIS.PACIENTE);
    setErro("");
  }, [searchParams]);

  function alternarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    setErro("");
    const proximos = new URLSearchParams(searchParams);
    if (novoPerfil === PERFIS.CLINICA) proximos.set("perfil", PERFIS.CLINICA);
    else proximos.delete("perfil");
    setSearchParams(proximos, { replace: true });
  }

  async function lidarComLogin(evento) {
    evento.preventDefault();
    setErro("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um endereço de e-mail válido.");
      return;
    }

    if (!senha.trim()) {
      setErro("Digite sua senha para entrar.");
      return;
    }

    setEntrando(true);
    try {
      const sessao = await entrarComEmailESenha({
        email: email.trim(),
        senha,
        perfil,
      });

      const perfilAutenticado = sessao?.perfil || perfil;
      const destino = obterDestinoSeguro(
        searchParams.get("redirect"),
        perfilAutenticado
      );
      navegar(destino, { replace: true });
    } catch (err) {
      setErro(
        err?.message || "Não foi possível entrar. Verifique seus dados."
      );
    } finally {
      setEntrando(false);
    }
  }

  async function reenviarEmailVerificacao() {
    setReenviandoVerificacao(true);
    setMensagemVerificacao("");
    setErroVerificacao("");
    try {
      await reenviarVerificacaoEmail(email.trim());
      setMensagemVerificacao("Se a conta existir, enviaremos novamente o link de verificação.");
    } catch (err) {
      setErroVerificacao(err?.message || "Não foi possível reenviar o e-mail agora.");
    } finally {
      setReenviandoVerificacao(false);
    }
  }

  return (
    <Container
      maxW="480px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 12 }}
      className="animar-entrada"
    >
      <LogoAutenticacao />

      {/* Seletor de Perfil */}
      { !ehAdmin && <Flex
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
          minH="42px"
          px={{ base: 2.5, sm: 3 }}
          borderRadius="var(--radius-md)"
          bg={!ehClinica ? "var(--color-primary)" : "transparent"}
          color={
            !ehClinica
              ? "var(--color-text-on-primary)"
              : "var(--color-text-muted)"
          }
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "0.84rem", sm: "0.92rem" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          onClick={() => alternarPerfil(PERFIS.PACIENTE)}
        >
          Paciente
        </Box>

        <Box
          as="button"
          type="button"
          flex="1"
          minH="42px"
          px={{ base: 2.5, sm: 3 }}
          borderRadius="var(--radius-md)"
          bg={ehClinica ? "var(--color-accent)" : "transparent"}
          color={ehClinica ? "#ffffff" : "var(--color-text-muted)"}
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "0.84rem", sm: "0.92rem" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          onClick={() => alternarPerfil(PERFIS.CLINICA)}
        >
          Clínica / Laboratório
        </Box>
      </Flex>}

      <Box
        bg="var(--color-surface)"
        border="1px solid var(--color-border-soft)"
        borderRadius="24px"
        p={{ base: 5, sm: 8 }}
        boxShadow="var(--shadow-md)"
      >
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
            color={ehClinica ? "var(--color-accent)" : "var(--color-primary)"}
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="0.75rem"
          >
            {ehAdmin ? "Área Administrativa" : ehClinica ? "Área do Parceiro" : "Área do Paciente"}
          </Badge>

          <Heading
            as="h1"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "1.45rem", md: "1.75rem" }}
            color="var(--color-text)"
            mb={1.5}
          >
            {ehAdmin ? "Acesso administrativo" : "Entrar na sua conta"}
          </Heading>

          <Text
            fontFamily="var(--font-body)"
            fontSize="0.88rem"
            color="var(--color-text-muted)"
          >
            {ehAdmin ? "Acesse com uma conta administrativa autorizada."
              : ehClinica
              ? "Acesse o painel da sua unidade para acompanhar aprovação e exames."
              : "Acompanhe seus agendamentos e gerencie seus dados da conta."}
          </Text>
        </Box>

        <Box mb={erro ? 4 : 0}><FeedbackErro mensagem={erro} titulo="Não foi possível entrar" /></Box>
        <Box mb={erroVerificacao ? 4 : 0}>
          <FeedbackErro mensagem={erroVerificacao} titulo="Falha ao reenviar a verificação" />
        </Box>
        {mensagemVerificacao && (
          <Text role="status" mb={4} fontSize="0.84rem" color="var(--color-text-muted)">
            {mensagemVerificacao}
          </Text>
        )}

        <Box as="form" onSubmit={lidarComLogin} noValidate>
          <VStack align="stretch" gap={4}>
            <Box>
              <Box
                as="label"
                htmlFor="emailLogin"
                display="block"
                fontFamily="var(--font-heading)"
                fontWeight={600}
                fontSize="0.88rem"
                color="var(--color-text)"
                mb={1.5}
              >
                {ehClinica ? "E-mail corporativo" : "E-mail"}
              </Box>
              <Input
                id="emailLogin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  ehClinica ? "contato@clinica.com.br" : "voce@email.com"
                }
                minH="46px"
                bg="var(--color-bg)"
                color="var(--color-text)"
                borderColor="var(--color-border-soft)"
                borderRadius="var(--radius-md)"
              />
            </Box>

            <Box>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Box
                  as="label"
                  htmlFor="senhaLogin"
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
                id="senhaLogin"
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                minH="46px"
                bg="var(--color-bg)"
                color="var(--color-text)"
                borderColor="var(--color-border-soft)"
                borderRadius="var(--radius-md)"
              />

              <Flex justify="flex-end" mt={1.5}>
                <RouterLink
                  to="/recuperar-acesso"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                  }}
                >
                  Esqueci minha senha
                </RouterLink>
              </Flex>
            </Box>

            <Button
              type="submit"
              disabled={entrando}
              bg={ehClinica ? "var(--color-accent)" : "var(--color-primary)"}
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
              mt={1}
              borderRadius="var(--radius-md)"
              boxShadow="var(--shadow-sm)"
            >
              {entrando ? "Entrando..." : "Entrar"}
            </Button>

            {(erro.toLowerCase().includes("verifique seu e-mail") || erro.toLowerCase().includes("verificação")) && (
              <Button type="button" variant="outline" disabled={reenviandoVerificacao || !email.trim()} onClick={reenviarEmailVerificacao}>
                {reenviandoVerificacao ? "Enviando..." : "Reenviar e-mail de verificação"}
              </Button>
            )}
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
          Ainda não tem conta?{" "}
          <RouterLink
            to={ehClinica
              ? `/cadastro?perfil=${PERFIS.CLINICA}${searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`
              : `/cadastro${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`}
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {ehClinica ? "Cadastrar clínica" : "Criar conta gratuita"}
          </RouterLink>
        </Text>
      </Box>
    </Container>
  );
}
