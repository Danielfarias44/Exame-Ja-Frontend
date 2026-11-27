import { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Badge, Box, Container, Flex, Heading, Input, Text, VStack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import LogoAutenticacao from "./LogoAutenticacao";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { PERFIS, ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { entrarComEmailESenha, reenviarVerificacaoEmail } from "@/services/autenticacaoService";
import { destinoInternoSeguro } from "@/utils/rotasOferta";

function obterDestinoSeguro(redirectParam, perfil) {
  return destinoInternoSeguro(redirectParam, ROTA_INICIAL_PERFIL[perfil] || "/");
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
    if (novoPerfil === PERFIS.PACIENTE) proximos.delete("perfil");
    else proximos.set("perfil", novoPerfil);
    if (novoPerfil !== PERFIS.ADMIN && proximos.get("redirect")?.startsWith("/admin")) proximos.delete("redirect");
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
      maxW="var(--width-text)"
      px={{ base: "var(--space-4)", md: "var(--space-6)" }}
      py={{ base: "var(--space-6)", md: "var(--space-12)" }}
      className="animar-entrada"
    >
      <LogoAutenticacao />

      {!ehAdmin && <Flex
        role="group"
        aria-label="Tipo de conta"
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
          px={{ base: "var(--space-3)", sm: "var(--space-3)" }}
          borderRadius="var(--radius-md)"
          bg={!ehClinica ? "var(--color-primary)" : "transparent"}
          color={
            !ehClinica
              ? "var(--color-text-on-primary)"
              : "var(--color-text-muted)"
          }
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "var(--text-xs)", sm: "var(--text-sm)" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          aria-pressed={!ehClinica}
          onClick={() => alternarPerfil(PERFIS.PACIENTE)}
        >
          Paciente
        </Box>

        <Box
          as="button"
          type="button"
          flex="1"
          minH="var(--touch-target-min)"
          px={{ base: "var(--space-3)", sm: "var(--space-3)" }}
          borderRadius="var(--radius-md)"
          bg={ehClinica ? "var(--color-accent)" : "transparent"}
          color={ehClinica ? "var(--color-text-on-accent)" : "var(--color-text-muted)"}
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "var(--text-xs)", sm: "var(--text-sm)" }}
          cursor="pointer"
          transition="all var(--duration-fast) var(--ease-standard)"
          aria-pressed={ehClinica}
          onClick={() => alternarPerfil(PERFIS.CLINICA)}
        >
          Clínica / Laboratório
        </Box>
      </Flex>}

      <Box
        bg="var(--color-surface)"
        border="var(--border-width) solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        p={{ base: "var(--space-6)", sm: "var(--space-8)" }}
        boxShadow="var(--shadow-md)"
      >
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
            color={ehClinica ? "var(--color-accent)" : "var(--color-primary)"}
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize="var(--text-xs)"
          >
            {ehAdmin ? "Área Administrativa" : ehClinica ? "Área do Parceiro" : "Área do Paciente"}
          </Badge>

          <Heading
            as="h1"
            fontFamily="var(--font-heading)"
            fontWeight="var(--weight-bold)"
            fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
            color="var(--color-text)"
            mb="var(--space-2)"
          >
            {ehAdmin ? "Acesso administrativo" : "Entrar na sua conta"}
          </Heading>

          <Text
            fontFamily="var(--font-body)"
            fontSize="var(--text-xs)"
            color="var(--color-text-muted)"
          >
            {ehAdmin ? "Acesse com uma conta administrativa autorizada."
              : ehClinica
              ? "Acesse o painel da sua unidade para acompanhar aprovação e exames."
              : "Acompanhe seus agendamentos e gerencie seus dados da conta."}
          </Text>
        </Box>

        <Box mb={erro ? "var(--space-4)" : 0}><FeedbackErro mensagem={erro} titulo="Não foi possível entrar" /></Box>
        <Box mb={erroVerificacao ? "var(--space-4)" : 0}>
          <FeedbackErro mensagem={erroVerificacao} titulo="Falha ao reenviar a verificação" />
        </Box>
        {mensagemVerificacao && (
          <Text role="status" mb="var(--space-4)" fontSize="var(--text-xs)" color="var(--color-text-muted)">
            {mensagemVerificacao}
          </Text>
        )}

        <Box as="form" onSubmit={lidarComLogin} noValidate>
          <VStack align="stretch" gap="var(--space-4)">
            <Box>
              <Box
                as="label"
                htmlFor="emailLogin"
                display="block"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-semibold)"
                fontSize="var(--text-xs)"
                color="var(--color-text)"
                mb="var(--space-2)"
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
                minH="var(--touch-target-min)"
                bg="var(--color-bg)"
                color="var(--color-text)"
                borderColor="var(--color-border-soft)"
                borderRadius="var(--radius-md)"
              />
            </Box>

            <Box>
              <Flex justify="space-between" align="center" mb="var(--space-2)">
                <Box
                  as="label"
                  htmlFor="senhaLogin"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-semibold)"
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
                  fontWeight="var(--weight-semibold)"
                  fontSize="var(--text-xs)"
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
                minH="var(--touch-target-min)"
                bg="var(--color-bg)"
                color="var(--color-text)"
                borderColor="var(--color-border-soft)"
                borderRadius="var(--radius-md)"
              />

              <Flex justify="flex-end" mt="var(--space-2)">
                <RouterLink
                  to="/recuperar-acesso"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: "var(--weight-semibold)",
                    fontSize: "var(--text-xs)",
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
              color={ehClinica ? "var(--color-text-on-accent)" : "var(--color-text-on-primary)"}
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-sm)"
              minH="var(--touch-target-min)"
              w="100%"
              mt="var(--space-1)"
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

        {ehAdmin ? (
          <Text
            mt="var(--space-6)"
            pt="var(--space-6)"
            borderTop="var(--border-width) solid var(--color-border-soft)"
            textAlign="center"
            fontFamily="var(--font-body)"
            fontSize="var(--text-xs)"
            color="var(--color-text-muted)"
          >
            Contas administrativas são criadas pela equipe do Exame Já.
          </Text>
        ) : (
          <Text
            mt="var(--space-6)"
            pt="var(--space-6)"
            borderTop="var(--border-width) solid var(--color-border-soft)"
            textAlign="center"
            fontFamily="var(--font-body)"
            fontSize="var(--text-xs)"
            color="var(--color-text-muted)"
          >
            Ainda não tem conta?{" "}
            <RouterLink
              to={ehClinica
                ? `/cadastro?perfil=${PERFIS.CLINICA}${searchParams.get("redirect") ? `&redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`
                : `/cadastro${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : ""}`}
              style={{
                color: "var(--color-primary)",
                fontWeight: "var(--weight-bold)",
                textDecoration: "none",
              }}
            >
              {ehClinica ? "Cadastrar clínica" : "Criar conta gratuita"}
            </RouterLink>
          </Text>
        )}
      </Box>

      <Flex justify="center" mt="var(--space-4)">
        <Box
          as="button"
          type="button"
          minH="var(--touch-target-min)"
          px="var(--space-3)"
          bg="transparent"
          border="none"
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-semibold)"
          fontSize="var(--text-xs)"
          color="var(--color-text-muted)"
          textDecoration="underline"
          cursor="pointer"
          _hover={{ color: "var(--color-primary)" }}
          onClick={() => alternarPerfil(ehAdmin ? PERFIS.PACIENTE : PERFIS.ADMIN)}
        >
          {ehAdmin ? "Voltar ao login de paciente ou clínica" : "Sou administrador"}
        </Box>
      </Flex>
    </Container>
  );
}
