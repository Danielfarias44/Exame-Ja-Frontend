import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackErro from "@/components/ui/FeedbackErro";
import PageHeader from "@/components/ui/PageHeader";
import { PERFIS, ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { entrarComEmailESenha } from "@/services/autenticacaoService";
import NavegacaoTeste from "./NavegacaoTeste";
import { useEstadoTeste } from "./useEstadoTeste";

const ROTEIRO = [
  "Cadastre as três clínicas em \"1. Cadastrar contas\" e confirme o e-mail de cada uma.",
  "Entre como cada clínica (\"3. Entrar com uma conta\") e confira a tela \"Cadastro em análise\".",
  "Entre como admin e aprove a \"Clínica Teste Aprovar\".",
  "Rejeite a \"Clínica Teste Rejeitar\" e a \"Clínica Teste Reenviar\", escrevendo um motivo.",
  "Entre como \"Clínica Teste Rejeitar\" e confira se o motivo aparece.",
  "Entre como \"Clínica Teste Reenviar\", corrija um dado e reenvie. Volte ao admin e veja se ela voltou para a fila.",
  "Entre como \"Clínica Teste Aprovar\" e confira se o painel completo foi liberado.",
];

export default function TesteAdmin() {
  const [estado] = useEstadoTeste();
  const navegar = useNavigate();
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState("");
  const dados = estado.contas.admin;
  const comando = `npm run admin:claim -- conceder ${dados?.uid || "<UID>"}`;

  async function copiarComando() {
    try {
      await navigator.clipboard.writeText(comando);
      setCopiado("Comando copiado.");
    } catch {
      setCopiado("Não foi possível copiar. Selecione o texto e copie manualmente.");
    }
  }

  async function entrarComoAdmin() {
    setErro("");
    setEntrando(true);
    try {
      await entrarComEmailESenha({ email: dados.email, senha: dados.senha, perfil: PERFIS.ADMIN });
      navegar(ROTA_INICIAL_PERFIL[PERFIS.ADMIN], { replace: true });
    } catch (falha) {
      setErro(falha.message || "Não foi possível entrar como administrador.");
      setEntrando(false);
    }
  }

  return (
    <Container maxW="820px" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <NavegacaoTeste />
      <PageHeader
        title="Preparar o admin de teste"
        description="O admin não tem cadastro pelo site: é uma conta comum que recebe a permissão por um script do back."
      />

      <Stack gap="var(--space-6)">
        <Card as="section" aria-labelledby="titulo-passos-admin">
          <Stack gap="var(--space-4)">
            <Heading as="h2" id="titulo-passos-admin" fontSize="var(--text-lg)">Passo a passo</Heading>
            <Box as="ol" ps="var(--space-6)" display="grid" gap="var(--space-4)" fontSize="var(--text-sm)">
              <li>
                <Text fontWeight="var(--weight-bold)">Cadastre a conta "Admin Teste" e confirme o e-mail.</Text>
                <Text color="var(--color-text-muted)">
                  {dados ? `Conta guardada: ${dados.email}.` : "Ainda não cadastrada neste navegador."}
                </Text>
                {!dados && (
                  <Button asChild variant="outline" mt="var(--space-2)">
                    <Link to="/teste/cadastro">Ir para o cadastro</Link>
                  </Button>
                )}
              </li>
              <li>
                <Text fontWeight="var(--weight-bold)">No repositório do back, com o .env do Firebase, rode:</Text>
                <Box
                  as="code"
                  display="block"
                  mt="var(--space-2)"
                  p="var(--space-3)"
                  bg="var(--color-bg)"
                  borderWidth="var(--border-width)"
                  borderStyle="solid"
                  borderColor="var(--color-border-soft)"
                  borderRadius="var(--radius-md)"
                  fontFamily="var(--font-body)"
                  overflowWrap="anywhere"
                >
                  {comando}
                </Box>
                {dados && !dados.uid && (
                  <Text mt="var(--space-2)" color="var(--color-text-muted)">
                    O UID não foi guardado porque a conta já existia. Pegue-o no Console do Firebase, em
                    Authentication → Users, na coluna "User UID", e troque o &lt;UID&gt; do comando.
                  </Text>
                )}
                <Flex mt="var(--space-2)" gap="var(--space-3)" align="center" wrap="wrap">
                  <Button variant="outline" onClick={copiarComando}>Copiar comando</Button>
                  {copiado && <Text role="status" color="var(--color-text-muted)">{copiado}</Text>}
                </Flex>
              </li>
              <li>
                <Text fontWeight="var(--weight-bold)">Entre como admin.</Text>
                <Text color="var(--color-text-muted)">
                  Se a conta já estava aberta antes do script, este botão cria uma sessão nova, que já leva a permissão.
                </Text>
                <Button mt="var(--space-2)" onClick={entrarComoAdmin} disabled={!dados || entrando}>
                  {entrando ? "Entrando…" : "Entrar como admin"}
                </Button>
              </li>
            </Box>
            <FeedbackErro mensagem={erro} titulo="Não foi possível entrar como admin" />
          </Stack>
        </Card>

        <Card as="section" aria-labelledby="titulo-roteiro">
          <Stack gap="var(--space-4)">
            <Heading as="h2" id="titulo-roteiro" fontSize="var(--text-lg)">Roteiro para testar a aprovação</Heading>
            <Box as="ol" ps="var(--space-6)" display="grid" gap="var(--space-2)" fontSize="var(--text-sm)">
              {ROTEIRO.map((passo) => <li key={passo}>{passo}</li>)}
            </Box>
            <Alert status="info">
              A clínica aprovada só aparece na busca quando tiver coordenadas, convênios e pelo menos um exame com preço.
              Isso fica fora deste roteiro.
            </Alert>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
