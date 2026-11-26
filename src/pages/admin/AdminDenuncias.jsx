import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Flex, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { decidirDenuncia, listarDenuncias } from "@/services/adminService";
import { formatarData } from "@/utils/formatarData";
import ConteudoLista from "./ConteudoLista";
import FormularioDecisao from "./FormularioDecisao";
import ListaDados from "./ListaDados";
import { ALVO_DENUNCIA, CATEGORIA_DENUNCIA, STATUS_DENUNCIA, opcoesDe } from "./rotulosAdmin";
import { useListaPaginada } from "./useListaPaginada";

const OPCOES_STATUS = opcoesDe(STATUS_DENUNCIA, "Todas as situações");
const OPCOES_ALVO = opcoesDe(ALVO_DENUNCIA, "Todos os tipos");

const ACOES_DENUNCIA = [
  { valor: "resolver", rotulo: "Marcar como resolvida", rotuloEnviando: "Salvando…", exigeTexto: false },
  { valor: "descartar", rotulo: "Descartar denúncia", rotuloEnviando: "Descartando…", variante: "outline", exigeTexto: false },
];

function descreverAlvo(denuncia) {
  const tipo = ALVO_DENUNCIA[denuncia.alvoTipo] || denuncia.alvoTipo;
  if (denuncia.alvoTipo === "clinica") {
    return (
      <>
        {`${tipo}: `}
        <Link to={`/estabelecimento/${encodeURIComponent(denuncia.alvoId)}`}>ver página pública</Link>
      </>
    );
  }
  return `${tipo} (identificador ${denuncia.alvoId})`;
}

export default function AdminDenuncias() {
  const [status, setStatus] = useState("aberta");
  const [alvoTipo, setAlvoTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const buscarPagina = useCallback(({ cursor }) => listarDenuncias({ status, alvoTipo, cursor }), [status, alvoTipo]);
  const lista = useListaPaginada(buscarPagina);

  async function decidir(denuncia, acao, nota) {
    setMensagem("");
    const atualizada = await decidirDenuncia(denuncia.id, { acao, nota });
    lista.atualizarItem(denuncia.id, (item) => ({ ...item, ...atualizada }));
    setMensagem(acao === "resolver" ? "Denúncia marcada como resolvida." : "Denúncia descartada.");
  }

  return (
    <Container maxW="960px" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <PageHeader
        title="Denúncias"
        description="Avaliações, mensagens e clínicas denunciadas por pacientes e clínicas, das mais novas para as mais antigas."
      />
      <Stack gap="var(--space-4)">
        <Alert status="info" title="O que a decisão faz hoje">
          Resolver ou descartar só fecha a denúncia e registra a nota. O back ainda não tem como ocultar a
          avaliação ou a mensagem denunciada. Para uma clínica, use a suspensão na tela Clínicas.
        </Alert>
        <Flex as="fieldset" gap="var(--space-4)" wrap="wrap" border="none" p={0} m={0}>
          <legend className="sr-only">Filtrar denúncias</legend>
          <Flex flex="1" minW="220px" maxW="320px">
            <Select label="Situação" options={OPCOES_STATUS} value={status} onChange={(evento) => { setMensagem(""); setStatus(evento.target.value); }} />
          </Flex>
          <Flex flex="1" minW="220px" maxW="320px">
            <Select label="O que foi denunciado" options={OPCOES_ALVO} value={alvoTipo} onChange={(evento) => { setMensagem(""); setAlvoTipo(evento.target.value); }} />
          </Flex>
        </Flex>
        {mensagem && <Alert status="success" role="status">{mensagem}</Alert>}
        <ConteudoLista
          lista={lista}
          tituloErro="Lista de denúncias indisponível"
          vazio={{ title: "Nenhuma denúncia com estes filtros", description: "Quando alguém denunciar uma avaliação, mensagem ou clínica, ela aparece aqui." }}
          rotuloMais="Carregar mais denúncias"
        >
          {(denuncia) => {
            const situacao = STATUS_DENUNCIA[denuncia.status] ?? { rotulo: denuncia.status, tom: "neutral" };
            const tituloId = `denuncia-${denuncia.id}`;
            return (
              <Card key={denuncia.id} as="section" aria-labelledby={tituloId}>
                <Stack gap="var(--space-4)">
                  <Flex justify="space-between" align="center" gap="var(--space-3)" wrap="wrap">
                    <SectionTitle id={tituloId}>
                      {CATEGORIA_DENUNCIA[denuncia.categoria] || denuncia.categoria}
                    </SectionTitle>
                    <StatusBadge tone={situacao.tom}>{situacao.rotulo}</StatusBadge>
                  </Flex>
                  <Text fontSize="var(--text-sm)" whiteSpace="pre-wrap">{denuncia.descricao}</Text>
                  <ListaDados
                    linhas={[
                      ["Alvo", descreverAlvo(denuncia)],
                      ["Denunciado por", denuncia.denuncianteUid],
                      ["Enviada em", formatarData(denuncia.criadoEm)],
                      ["Nota da decisão", denuncia.status !== "aberta" ? denuncia.nota || "Sem nota" : null],
                      ["Decidida por", denuncia.resolvidaPorUid],
                      ["Atualizada em", denuncia.status !== "aberta" ? formatarData(denuncia.atualizadoEm) : null],
                    ]}
                  />
                  {denuncia.status === "aberta" && (
                    <FormularioDecisao
                      rotulo="Nota da decisão (opcional)"
                      ajuda="Até 300 caracteres. Fica registrada junto com a denúncia."
                      minimo={0}
                      maximo={300}
                      acoes={ACOES_DENUNCIA}
                      aoConfirmar={(acao, nota) => decidir(denuncia, acao, nota)}
                    />
                  )}
                </Stack>
              </Card>
            );
          }}
        </ConteudoLista>
      </Stack>
    </Container>
  );
}
