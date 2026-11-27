import { useState } from "react";
import { Box, Container, Flex, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import StatusBadge from "@/components/ui/StatusBadge";
import { aprovarClinica, listarClinicasPendentes, rejeitarClinica } from "@/services/adminService";
import { formatarData } from "@/utils/formatarData";
import ConteudoLista from "./ConteudoLista";
import FormularioDecisao from "./FormularioDecisao";
import ListaDados from "./ListaDados";
import { formatarCnpj } from "./rotulosAdmin";
import { useListaPaginada } from "./useListaPaginada";

const ACOES_FILA = [
  { valor: "aprovar", rotulo: "Aprovar clínica", rotuloEnviando: "Aprovando…", exigeTexto: false },
  { valor: "rejeitar", rotulo: "Rejeitar cadastro", rotuloEnviando: "Rejeitando…", variante: "outline", exigeTexto: true, verbo: "rejeitar" },
];

function nomeDaClinica(clinica) {
  return clinica.nomeFantasia || clinica.razaoSocial || "Clínica sem nome";
}

export default function AdminClinicas() {
  const lista = useListaPaginada(listarClinicasPendentes);
  const [mensagem, setMensagem] = useState("");

  async function decidir(clinica, acao, motivo) {
    setMensagem("");
    if (acao === "aprovar") await aprovarClinica(clinica.uid);
    else await rejeitarClinica(clinica.uid, motivo);
    lista.removerItem(clinica.uid);
    setMensagem(acao === "aprovar"
      ? `${nomeDaClinica(clinica)} foi aprovada e já pode usar o painel da clínica.`
      : `${nomeDaClinica(clinica)} foi rejeitada. A clínica vê o motivo e pode corrigir e reenviar.`);
  }

  return (
    <Container maxW="var(--container-md)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <PageHeader
        title="Fila de aprovação"
        description="Cadastros de clínicas aguardando análise, do mais antigo para o mais novo. Só clínicas aprovadas aparecem na busca."
      />
      <Stack gap="var(--space-4)">
        {mensagem && <Alert status="success" role="status">{mensagem}</Alert>}
        <ConteudoLista
          lista={lista}
          tituloErro="Fila de aprovação indisponível"
          vazio={{ title: "Nenhum cadastro aguardando análise", description: "Quando uma clínica se cadastrar ou reenviar correções, ela aparece aqui." }}
          rotuloMais="Carregar mais cadastros"
        >
          {(clinica) => {
            const tituloId = `fila-${clinica.uid}`;
            const consulta = clinica.consultaCnpj;
            return (
              <Card key={clinica.uid} as="section" aria-labelledby={tituloId}>
                <Stack gap="var(--space-4)">
                  <Flex justify="space-between" align="center" gap="var(--space-3)" wrap="wrap">
                    <SectionTitle id={tituloId}>{nomeDaClinica(clinica)}</SectionTitle>
                    <StatusBadge tone="warning">Em análise</StatusBadge>
                  </Flex>
                  <ListaDados
                    linhas={[
                      ["Razão social", clinica.razaoSocial],
                      ["CNPJ", formatarCnpj(clinica.cnpj)],
                      ["Consulta do CNPJ", consulta
                        ? `${consulta.razaoSocial} (${consulta.fonte || "consulta cadastral"}${consulta.consultadoEm ? `, ${formatarData(consulta.consultadoEm)}` : ""})`
                        : "Sem registro da consulta"],
                      ["CNES", clinica.cnes],
                      ["E-mail", clinica.email],
                      ["Domínio corporativo", clinica.dominioCorporativo],
                      ["Telefone", clinica.telefone],
                      ["Endereço", clinica.endereco],
                      ["Enviado em", formatarData(clinica.criadoEm)],
                    ]}
                  />
                  {clinica.declaracaoVinculo && (
                    <Box
                      as="figure"
                      m={0}
                      p="var(--space-3)"
                      bg="var(--color-bg)"
                      borderRadius="var(--radius-md)"
                      borderLeftWidth="var(--border-width-strong)"
                      borderLeftStyle="solid"
                      borderLeftColor="var(--color-border)"
                    >
                      <Text as="figcaption" fontSize="var(--text-xs)" fontWeight="var(--weight-bold)" mb="var(--space-1)">
                        Declaração de vínculo
                      </Text>
                      <Text as="blockquote" fontSize="var(--text-sm)" whiteSpace="pre-wrap">{clinica.declaracaoVinculo}</Text>
                    </Box>
                  )}
                  <FormularioDecisao
                    rotulo="Motivo da rejeição"
                    ajuda="Obrigatório só para rejeitar, de 10 a 500 caracteres. A clínica vê este texto."
                    acoes={ACOES_FILA}
                    aoConfirmar={(acao, motivo) => decidir(clinica, acao, motivo)}
                  />
                </Stack>
              </Card>
            );
          }}
        </ConteudoLista>
      </Stack>
    </Container>
  );
}
