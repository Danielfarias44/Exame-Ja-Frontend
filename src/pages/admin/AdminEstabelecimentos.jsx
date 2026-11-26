import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Container, Flex, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { listarEstabelecimentos, reativarClinica, suspenderClinica } from "@/services/adminService";
import { formatarData } from "@/utils/formatarData";
import ConteudoLista from "./ConteudoLista";
import FormularioDecisao from "./FormularioDecisao";
import ListaDados from "./ListaDados";
import { rotuloStatusConta } from "./rotulosAdmin";
import { useListaPaginada } from "./useListaPaginada";

const OPCOES_STATUS = [
  { value: "", label: "Todas as situações" },
  { value: "pendente", label: "Em análise" },
  { value: "aprovada", label: "Aprovadas" },
  { value: "rejeitada", label: "Rejeitadas" },
  { value: "suspensa", label: "Suspensas" },
];

const ACAO_SUSPENDER = [
  { valor: "suspender", rotulo: "Suspender clínica", rotuloEnviando: "Suspendendo…", variante: "outline", exigeTexto: true, verbo: "suspender" },
];

const ACAO_REATIVAR = [
  { valor: "reativar", rotulo: "Reativar clínica", rotuloEnviando: "Reativando…", exigeTexto: true, verbo: "reativar" },
];

function nomeDaClinica(clinica) {
  return clinica.nomeFantasia || clinica.razaoSocial || "Clínica sem nome";
}

export default function AdminEstabelecimentos() {
  const [status, setStatus] = useState("");
  const [mensagem, setMensagem] = useState("");
  const buscarPagina = useCallback(({ cursor }) => listarEstabelecimentos({ status, cursor }), [status]);
  const lista = useListaPaginada(buscarPagina);

  async function decidir(clinica, acao, motivo) {
    setMensagem("");
    const resposta = acao === "suspender"
      ? await suspenderClinica(clinica.uid, motivo)
      : await reativarClinica(clinica.uid, motivo);
    const novoStatus = resposta?.clinica?.status || (acao === "suspender" ? "suspensa" : "aprovada");
    lista.atualizarItem(clinica.uid, (item) => ({ ...item, status: novoStatus }));
    setMensagem(acao === "suspender"
      ? `${nomeDaClinica(clinica)} foi suspensa e saiu da busca. A clínica vê o motivo no painel.`
      : `${nomeDaClinica(clinica)} foi reativada e volta a aparecer na busca.`);
  }

  function acoesDaClinica(clinica) {
    if (clinica.status === "pendente") {
      return (
        <Box>
          <Button asChild variant="outline"><Link to="/admin">Analisar na fila de aprovação</Link></Button>
        </Box>
      );
    }
    if (clinica.status === "rejeitada") {
      return <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">Aguardando a clínica corrigir o cadastro e reenviar.</Text>;
    }
    if (clinica.status === "aprovada") {
      return (
        <Stack gap="var(--space-3)">
          <Box>
            <Button asChild variant="ghost"><Link to={`/estabelecimento/${encodeURIComponent(clinica.uid)}`}>Ver página pública</Link></Button>
          </Box>
          <FormularioDecisao
            key={clinica.status}
            rotulo="Motivo da suspensão"
            ajuda="De 10 a 500 caracteres. A clínica vê este texto e perde o acesso às ferramentas."
            acoes={ACAO_SUSPENDER}
            aoConfirmar={(acao, motivo) => decidir(clinica, acao, motivo)}
          />
        </Stack>
      );
    }
    if (clinica.status === "suspensa") {
      return (
        <FormularioDecisao
          key={clinica.status}
          rotulo="Motivo da reativação"
          ajuda="De 10 a 500 caracteres. Fica registrado na auditoria da clínica."
          acoes={ACAO_REATIVAR}
          aoConfirmar={(acao, motivo) => decidir(clinica, acao, motivo)}
        />
      );
    }
    return null;
  }

  return (
    <Container maxW="960px" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <PageHeader
        title="Clínicas"
        description="Todas as clínicas cadastradas, das mais novas para as mais antigas. Suspenda ou reative clínicas já aprovadas."
      />
      <Stack gap="var(--space-4)">
        <Box maxW="320px">
          <Select
            label="Situação"
            options={OPCOES_STATUS}
            value={status}
            onChange={(evento) => {
              setMensagem("");
              setStatus(evento.target.value);
            }}
          />
        </Box>
        {mensagem && <Alert status="success" role="status">{mensagem}</Alert>}
        <ConteudoLista
          lista={lista}
          tituloErro="Lista de clínicas indisponível"
          vazio={{ title: "Nenhuma clínica nesta situação", description: "Escolha outra situação no filtro acima." }}
          rotuloMais="Carregar mais clínicas"
        >
          {(clinica) => {
            const situacao = rotuloStatusConta(clinica.status);
            const tituloId = `clinica-${clinica.uid}`;
            const cidade = [clinica.cidade, clinica.uf].filter(Boolean).join(" - ");
            return (
              <Card key={clinica.uid} as="section" aria-labelledby={tituloId}>
                <Stack gap="var(--space-4)">
                  <Flex justify="space-between" align="center" gap="var(--space-3)" wrap="wrap">
                    <SectionTitle id={tituloId}>{nomeDaClinica(clinica)}</SectionTitle>
                    <StatusBadge tone={situacao.tom}>{situacao.rotulo}</StatusBadge>
                  </Flex>
                  <ListaDados
                    linhas={[
                      ["Razão social", clinica.razaoSocial],
                      ["E-mail", clinica.email],
                      ["Cidade", cidade],
                      ["Cadastrada em", formatarData(clinica.criadoEm)],
                    ]}
                  />
                  {acoesDaClinica(clinica)}
                </Stack>
              </Card>
            );
          }}
        </ConteudoLista>
      </Stack>
    </Container>
  );
}
