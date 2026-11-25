import { useCallback, useEffect, useState } from "react";
import { Box, Container, Flex, Input, Stack, Text } from "@chakra-ui/react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import FeedbackErro from "@/components/ui/FeedbackErro";
import { encerrarSessao } from "@/services/autenticacaoService";
import { aprovarClinica, listarClinicasPendentes, rejeitarClinica } from "@/services/adminService";

export default function AdminClinicas() {
  const [clinicas, setClinicas] = useState([]);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [motivos, setMotivos] = useState({});
  const [acaoAtiva, setAcaoAtiva] = useState("");
  const [proximoCursor, setProximoCursor] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);

  const carregar = useCallback(async () => {
    setStatus("loading");
    setErro("");
    try {
      const pagina = await listarClinicasPendentes();
      setClinicas(pagina.clinicas);
      setProximoCursor(pagina.proximoCursor);
      setStatus("ready");
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar os cadastros pendentes.");
      setStatus("error");
    }
  }, []);

  async function carregarMais() {
    if (!proximoCursor || carregandoMais) return;
    setCarregandoMais(true);
    setErro("");
    try {
      const pagina = await listarClinicasPendentes({ cursor: proximoCursor });
      setClinicas((atuais) => {
        const idsAtuais = new Set(atuais.map((item) => item.uid ?? item.id));
        return [...atuais, ...pagina.clinicas.filter((item) => !idsAtuais.has(item.uid ?? item.id))];
      });
      setProximoCursor(pagina.proximoCursor);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais cadastros.");
    } finally {
      setCarregandoMais(false);
    }
  }

  useEffect(() => { carregar(); }, [carregar]);

  async function decidir(clinica, acao) {
    const uid = clinica.uid ?? clinica.id;
    const motivo = (motivos[uid] || "").trim();
    if (acao === "rejeitar" && motivo.length < 10) {
      setErro("Informe um motivo de rejeição com pelo menos 10 caracteres.");
      return;
    }
    setErro("");
    setMensagem("");
    setAcaoAtiva(`${uid}:${acao}`);
    try {
      if (acao === "aprovar") await aprovarClinica(uid);
      else await rejeitarClinica(uid, motivo);
      setClinicas((atuais) => atuais.filter((item) => (item.uid ?? item.id) !== uid));
      setMensagem(acao === "aprovar" ? "Clínica aprovada." : "Clínica rejeitada e motivo registrado.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível registrar a decisão.");
    } finally {
      setAcaoAtiva("");
    }
  }

  async function sair() {
    try { await encerrarSessao(); window.location.assign("/"); }
    catch (falha) { setErro(falha.message || "Não foi possível encerrar a sessão."); }
  }

  return (
    <Container maxW="1000px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <PageHeader title="Aprovação de clínicas" description="Analise os cadastros que aguardam liberação para acessar o painel." actions={<Button variant="outline" onClick={sair}>Sair</Button>} />
      {erro && <Box mb={4}><FeedbackErro mensagem={erro} /></Box>}
      {mensagem && <Text role="status" mb={4} color="var(--color-success)">{mensagem}</Text>}
      {status === "loading" && <ListSkeleton count={3} />}
      {status === "error" && <ErrorState title="Fila de aprovação indisponível" description={erro} onRetry={carregar} />}
      {status === "ready" && clinicas.length === 0 && <Card><Text>Nenhum cadastro pendente para análise.</Text></Card>}
      {status === "ready" && <Stack gap={4}>
        {clinicas.map((clinica) => {
          const uid = clinica.uid ?? clinica.id;
          const ativo = acaoAtiva.startsWith(`${uid}:`);
          return <Card key={uid}><Stack gap={3}>
            <Box><Text fontSize="lg" fontWeight="bold">{clinica.nomeFantasia || clinica.razaoSocial || `Clínica ${uid}`}</Text><Text color="var(--color-text-muted)">CNPJ: {clinica.cnpj || "Não informado"} · E-mail: {clinica.email || "Não informado"}</Text></Box>
            <Text>{clinica.endereco || "Endereço não informado"}</Text>
            {clinica.telefone && <Text>Telefone: {clinica.telefone}</Text>}
            <label>Motivo da rejeição (obrigatório para rejeitar)
              <Input mt={1} value={motivos[uid] || ""} onChange={(evento) => setMotivos((atuais) => ({ ...atuais, [uid]: evento.target.value }))} minLength={10} maxLength={500} />
            </label>
            <Flex gap={2} wrap="wrap">
              <Button disabled={Boolean(acaoAtiva)} onClick={() => decidir(clinica, "aprovar")}>{ativo && acaoAtiva.endsWith(":aprovar") ? "Aprovando..." : "Aprovar clínica"}</Button>
              <Button variant="outline" colorPalette="red" disabled={Boolean(acaoAtiva)} onClick={() => decidir(clinica, "rejeitar")}>{ativo && acaoAtiva.endsWith(":rejeitar") ? "Rejeitando..." : "Rejeitar cadastro"}</Button>
            </Flex>
          </Stack></Card>;
        })}
      </Stack>}
      {status === "ready" && proximoCursor && <Box mt={4}><Button variant="outline" onClick={carregarMais} disabled={carregandoMais}>{carregandoMais ? "Carregando..." : "Carregar mais clínicas"}</Button></Box>}
    </Container>
  );
}
