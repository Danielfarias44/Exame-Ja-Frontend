import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Box, Container, Flex, Heading, Input, Text, VStack } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import LogoAutenticacao from "./LogoAutenticacao";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { solicitarRecuperacaoSenha } from "@/services/autenticacaoService";

export default function RecuperacaoAcesso() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    setErro("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe o endereço de e-mail cadastrado na conta.");
      return;
    }

    setEnviando(true);
    try {
      await solicitarRecuperacaoSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(err?.message || "Não foi possível enviar as instruções agora. Tente novamente.");
    } finally {
      setEnviando(false);
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

      <Box
        bg="var(--color-surface)"
        border="var(--border-width) solid var(--color-border-soft)"
        borderRadius="var(--radius-lg)"
        p={{ base: "var(--space-6)", sm: "var(--space-8)" }}
        boxShadow="var(--shadow-md)"
      >
        {enviado ? (
          <VStack align="center" textAlign="center" gap="var(--space-4)" py="var(--space-3)">
            <Flex
              align="center"
              justify="center"
              boxSize="var(--icon-lg)"
              borderRadius="var(--radius-full)"
              bg="var(--color-success-soft)"
              color="var(--color-success)"
            >
              <svg
                width="26"
                height="26"
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

            <Heading
              as="h1"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="var(--text-xl)"
              color="var(--color-text)"
            >
              Link enviado para seu e-mail!
            </Heading>

            <Text
              fontFamily="var(--font-body)"
              fontSize="var(--text-xs)"
              color="var(--color-text-muted)"
            >
              Enviamos as instruções de redefinição de senha para{" "}
              <strong style={{ color: "var(--color-text)" }}>{email}</strong>.
              Verifique também a caixa de spam.
            </Text>

            <Flex
              direction={{ base: "column", sm: "row" }}
              gap="var(--space-3)"
              pt="var(--space-2)"
              w="100%"
              justify="center"
            >
              <Button
                asChild
                bg="var(--color-primary)"
                _hover={{ bg: "var(--color-primary-hover)" }}
                color="var(--color-text-on-primary)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                px="var(--space-8)"
                minH="var(--touch-target-min)"
                borderRadius="var(--radius-md)"
              >
                <RouterLink to="/login">Voltar para o login</RouterLink>
              </Button>

              <Button
                type="button"
                variant="outline"
                borderColor="var(--color-border-soft)"
                color="var(--color-text)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                px="var(--space-6)"
                minH="var(--touch-target-min)"
                borderRadius="var(--radius-md)"
                onClick={() => setEnviado(false)}
              >
                Usar outro e-mail
              </Button>
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
                bg="var(--color-primary-soft)"
                color="var(--color-primary)"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="var(--text-xs)"
              >
                Recuperação de acesso
              </Badge>

              <Heading
                as="h1"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize={{ base: "var(--text-xl)", md: "var(--text-2xl)" }}
                color="var(--color-text)"
                mb="var(--space-2)"
              >
                Esqueceu sua senha?
              </Heading>

              <Text
                fontFamily="var(--font-body)"
                fontSize="var(--text-xs)"
                color="var(--color-text-muted)"
              >
                Informe o e-mail cadastrado na conta para enviarmos o link de
                redefinição de senha.
              </Text>
            </Box>

            <Box mb={erro ? 4 : 0}><FeedbackErro mensagem={erro} titulo="Não foi possível enviar as instruções" /></Box>

            <Box as="form" onSubmit={lidarComEnvio} noValidate>
              <VStack align="stretch" gap="var(--space-4)">
                <Box>
                  <Box
                    as="label"
                    htmlFor="recuperarEmail"
                    display="block"
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="var(--text-xs)"
                    color="var(--color-text)"
                    mb="var(--space-2)"
                  >
                    E-mail cadastrado
                  </Box>
                  <Input
                    id="recuperarEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    minH="var(--touch-target-min)"
                    bg="var(--color-bg)"
                    color="var(--color-text)"
                    borderColor="var(--color-border-soft)"
                    borderRadius="var(--radius-md)"
                  />
                </Box>

                <Button
                  type="submit"
                  disabled={enviando}
                  bg="var(--color-primary)"
                  _hover={{ bg: "var(--color-primary-hover)" }}
                  color="var(--color-text-on-primary)"
                  fontFamily="var(--font-heading)"
                  fontWeight="var(--weight-bold)"
                  minH="var(--touch-target-min)"
                  w="100%"
                  borderRadius="var(--radius-md)"
                >
                  {enviando ? "Enviando link..." : "Enviar link de recuperação"}
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
              Lembrou a senha?{" "}
              <RouterLink
                to="/login"
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Voltar para o login
              </RouterLink>
            </Text>
          </>
        )}
      </Box>
    </Container>
  );
}
