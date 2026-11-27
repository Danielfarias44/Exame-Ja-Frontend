import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackErro from "@/components/ui/FeedbackErro";
import PageHeader from "@/components/ui/PageHeader";
import { PERFIS, ROTA_INICIAL_PERFIL } from "@/constants/perfis";
import { useSessao } from "@/hooks/useSessao";
import {
  encerrarSessao,
  entrarComEmailESenha,
  limparSessaoLocal,
  reenviarVerificacaoEmail,
} from "@/services/autenticacaoService";
import { CONTAS_TESTE } from "@/services/contasTeste";
import NavegacaoTeste from "./NavegacaoTeste";
import { useEstadoTeste } from "./useEstadoTeste";

const ROTULO_ENTRAR = {
  [PERFIS.PACIENTE]: "Entrar como paciente",
  [PERFIS.CLINICA]: "Entrar como clínica",
  [PERFIS.ADMIN]: "Entrar como admin",
};

const NOME_PERFIL = {
  [PERFIS.PACIENTE]: "paciente",
  [PERFIS.CLINICA]: "clínica",
  [PERFIS.ADMIN]: "admin",
};

export default function TesteLogin() {
  const [estado] = useEstadoTeste();
  const sessao = useSessao();
  const navegar = useNavigate();
  const [ocupada, setOcupada] = useState("");
  const [retornos, setRetornos] = useState({});
  const cadastradas = CONTAS_TESTE.filter((conta) => estado.contas[conta.id]);

  function registrarRetorno(id, retorno) {
    setRetornos((atuais) => ({ ...atuais, [id]: retorno }));
  }

  async function entrar(conta) {
    const dados = estado.contas[conta.id];
    setOcupada(conta.id);
    registrarRetorno(conta.id, null);
    try {
      await entrarComEmailESenha({ email: dados.email, senha: dados.senha, perfil: conta.perfil });
      navegar(ROTA_INICIAL_PERFIL[conta.perfil], { replace: true });
    } catch (falha) {
      registrarRetorno(conta.id, {
        tipo: "erro",
        texto: falha.message || "Não foi possível entrar com esta conta.",
        naoConfirmada: falha.code === "EMAIL_NOT_VERIFIED",
      });
      setOcupada("");
    }
  }

  async function reenviar(conta) {
    setOcupada(conta.id);
    try {
      await reenviarVerificacaoEmail(estado.contas[conta.id].email);
      registrarRetorno(conta.id, { tipo: "sucesso", texto: "Novo link de confirmação pedido. Confira a caixa de entrada e o spam." });
    } catch (falha) {
      registrarRetorno(conta.id, { tipo: "erro", texto: falha.message || "Não foi possível reenviar o e-mail." });
    } finally {
      setOcupada("");
    }
  }

  async function sair() {
    await encerrarSessao().catch(() => limparSessaoLocal());
  }

  return (
    <Container maxW="var(--container-md)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <NavegacaoTeste />
      <PageHeader
        title="Entrar com uma conta de teste"
        description="Usa o login real do back com o e-mail e a senha guardados neste navegador."
      />

      <Stack gap="var(--space-6)">
        {sessao?.autenticado && (
          <Alert
            status="info"
            title="Há uma sessão aberta neste navegador"
            actions={(
              <>
                <Button asChild variant="outline"><Link to={ROTA_INICIAL_PERFIL[sessao.perfil] || "/"}>Ir para o painel</Link></Button>
                <Button variant="outline" onClick={sair}>Sair</Button>
              </>
            )}
          >
            {`${sessao.nome || sessao.email || "Conta"} (${NOME_PERFIL[sessao.perfil] || sessao.perfil}). Entrar com outra conta substitui esta sessão.`}
          </Alert>
        )}

        {cadastradas.length === 0 && (
          <Alert
            status="info"
            title="Nenhuma conta de teste neste navegador"
            actions={<Button asChild><Link to="/teste/cadastro">Cadastrar contas</Link></Button>}
          >
            As contas ficam guardadas no navegador em que foram cadastradas.
          </Alert>
        )}

        {cadastradas.map((conta) => {
          const dados = estado.contas[conta.id];
          const retorno = retornos[conta.id];
          const tituloId = `titulo-login-${conta.id}`;
          return (
            <Card key={conta.id} as="section" aria-labelledby={tituloId}>
              <Stack gap="var(--space-3)">
                <Heading as="h2" id={tituloId} fontSize="var(--text-lg)">{conta.titulo}</Heading>
                <Text fontSize="var(--text-sm)" overflowWrap="anywhere">{dados.email}</Text>
                {retorno?.tipo === "erro" && <FeedbackErro mensagem={retorno.texto} titulo="Não foi possível entrar" />}
                {retorno?.tipo === "sucesso" && <Alert status="success" role="status">{retorno.texto}</Alert>}
                {conta.perfil === PERFIS.ADMIN && retorno?.tipo === "erro" && !retorno.naoConfirmada && (
                  <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
                    Se a mensagem fala em acesso de administrador, falta rodar o script de "2. Preparar o admin".
                  </Text>
                )}
                <Flex gap="var(--space-2)" wrap="wrap">
                  <Button onClick={() => entrar(conta)} disabled={Boolean(ocupada)}>
                    {ocupada === conta.id ? "Aguarde…" : ROTULO_ENTRAR[conta.perfil]}
                  </Button>
                  {retorno?.naoConfirmada && (
                    <Button variant="outline" onClick={() => reenviar(conta)} disabled={Boolean(ocupada)}>
                      Reenviar e-mail de confirmação
                    </Button>
                  )}
                </Flex>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}
