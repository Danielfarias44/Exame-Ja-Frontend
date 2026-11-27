import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Flex, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Button from "@/components/ui/Button";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { getClinicAvailability, getExamCatalog, listAppointments, publishClinicAvailability, removeClinicAvailability, updateAppointment } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import CampoTexto from "@/components/ui/CampoTexto";
import Select from "@/components/ui/Select";
import ConfirmacaoInline from "@/components/ui/ConfirmacaoInline";
import SeletorConvenios from "@/components/ui/SeletorConvenios";
import { rotuloStatusAgendamento, tomStatusAgendamento } from "@/utils/statusAgendamento";
import { formatarData } from "@/utils/formatarData";
import ChecklistVisibilidade from "./ChecklistVisibilidade";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import FeedbackErro from "@/components/ui/FeedbackErro";
import Alert from "@/components/ui/Alert";
import StatusBadge from "@/components/ui/StatusBadge";
import ListSkeleton from "@/components/ui/Skeleton";
import SecaoPainel from "./SecaoPainel";
import ResumoPainel from "./ResumoPainel";

const ORDEM_STATUS = { pendente: 0, confirmado: 1 };
const ESPACO_PAGINA = {
  px: { base: "var(--space-4)", md: "var(--space-6)" },
  py: { base: "var(--space-6)", md: "var(--space-8)" },
};
const LINHA = {
  p: "var(--space-4)",
  borderWidth: "var(--border-width)",
  borderStyle: "solid",
  borderColor: "var(--color-border-soft)",
  borderRadius: "var(--radius-md)",
};
const MENSAGEM_ACAO = {
  confirmar: "Solicitação confirmada.",
  recusar: "Solicitação recusada. O paciente verá o motivo.",
  concluir: "Atendimento marcado como concluído.",
};
const ROTULO_STATUS_CLINICA = {
  aprovada: { rotulo: "Cadastro aprovado", tom: "success" },
  pendente: { rotulo: "Em análise", tom: "warning" },
  rejeitada: { rotulo: "Precisa de correções", tom: "error" },
  suspensa: { rotulo: "Suspensa", tom: "error" },
};

export default function ClinicaDashboard() {
  const [perfil, setPerfil] = useState(null);
  const [exames, setExames] = useState([]);
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);
  const [paginaCatalogo, setPaginaCatalogo] = useState(0);
  const [totalPaginasCatalogo, setTotalPaginasCatalogo] = useState(null);
  const [temMaisExames, setTemMaisExames] = useState(false);
  const catalogoIniciado = useRef(false);
  const [ofertas, setOfertas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [proximoHorarioCursor, setProximoHorarioCursor] = useState(null);
  const [carregandoMaisHorarios, setCarregandoMaisHorarios] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);
  const [proximoAgendamentoCursor, setProximoAgendamentoCursor] = useState(null);
  const [carregandoMaisAgendamentos, setCarregandoMaisAgendamentos] = useState(false);
  const [novoHorario, setNovoHorario] = useState("");
  const [convenios, setConvenios] = useState([]);
  const [conveniosSelecionados, setConveniosSelecionados] = useState([]);
  const [codigoExame, setCodigoExame] = useState("");
  const [preco, setPreco] = useState("");
  const [status, setStatus] = useState("loading");
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState("");
  const [confirmando, setConfirmando] = useState("");
  const [localizada, setLocalizada] = useState(null);
  const [retorno, setRetorno] = useState(null);
  const [erro, setErro] = useState("");
  const precoRef = useRef(null);
  const [tentativa, setTentativa] = useState(0);
  const saudacao = obterSessaoAtual()?.nome || "Clínica";
  const clinicUid = obterSessaoAtual()?.id;

  const conveniosSalvos = perfil?.conveniosAceitos?.length ?? 0;
  const examesPorCodigo = useMemo(() => new Map(exames.map((exame) => [exame.codigo, exame])), [exames]);
  const erroCodigoExame = codigoExame && !/^[A-Za-z0-9._-]{1,80}$/.test(codigoExame)
    ? "Use só números e letras, sem espaços. Exemplo: 40304361."
    : "";
  const nomeExameEscolhido = examesPorCodigo.get(codigoExame)?.nome
    || ofertas.find((oferta) => oferta.codigoExame === codigoExame)?.nomeExame;
  const ajudaCodigoExame = !codigoExame
    ? "Digite o código (por exemplo, 40304361 para hemograma) ou escolha na lista abaixo."
    : nomeExameEscolhido
      ? `Exame escolhido: ${nomeExameEscolhido}.`
      : "O nome oficial do exame é conferido na ANS quando você salvar.";

  const carregarCatalogo = useCallback(async (pagina) => {
    setCarregandoCatalogo(true);
    setErroCatalogo("");
    try {
      const resultado = await getExamCatalog({ page: pagina, limit: 100 });
      setExames((atuais) => {
        const base = pagina === 1 ? [] : atuais;
        const codigos = new Set(base.map((exame) => exame.codigo));
        const novos = resultado.exams
          .filter((exame) => !codigos.has(exame.codigo))
          .map((exame) => ({ codigo: exame.codigo, nome: exame.nome }));
        return [...base, ...novos];
      });
      setPaginaCatalogo(resultado.currentPage);
      setTotalPaginasCatalogo(resultado.pages);
      setTemMaisExames(resultado.pages !== null ? resultado.currentPage < resultado.pages : resultado.exams.length > 0);
    } catch (falha) {
      setErroCatalogo(falha.message || "Não foi possível carregar o catálogo TUSS.");
    } finally {
      setCarregandoCatalogo(false);
    }
  }, []);

  const carregarDados = useCallback(async () => {
    const perfilData = await apiRequest("/api/users/me");
    const usuario = perfilData.usuario;
    setPerfil(usuario);
    if (usuario.status !== "aprovada") {
      setStatus("restricted");
      return;
    }

    const inicio = new Date((Math.floor(Date.now() / 60000) + 1) * 60000);
    const intervalo = { inicio: inicio.toISOString(), fim: new Date(inicio.getTime() + 30 * 86400000).toISOString() };
    const [ofertasData, conveniosData, disponibilidadeData, primeiraPaginaAgendamentos, detalhesPublicos] = await Promise.all([
      apiRequest("/api/clinics/me/exams"),
      apiRequest("/api/convenios"),
      getClinicAvailability(clinicUid, intervalo),
      listAppointments(),
      apiRequest(`/api/clinics/${encodeURIComponent(clinicUid)}`).catch(() => null),
    ]);
    const clinicaPublica = detalhesPublicos?.clinica;
    setLocalizada(clinicaPublica ? Number.isFinite(clinicaPublica.latitude) && Number.isFinite(clinicaPublica.longitude) : null);
    setConvenios(conveniosData.convenios ?? []);
    setConveniosSelecionados(usuario.conveniosAceitos ?? []);
    setOfertas(ofertasData.ofertas ?? []);
    setHorarios(disponibilidadeData.horarios ?? []);
    setProximoHorarioCursor(disponibilidadeData.proximoCursor ?? null);
    setAgendamentos(primeiraPaginaAgendamentos.agendamentos ?? []);
    setProximoAgendamentoCursor(primeiraPaginaAgendamentos.proximoCursor ?? null);
    setStatus("ready");

    if (!catalogoIniciado.current) {
      catalogoIniciado.current = true;
      carregarCatalogo(1);
    }
  }, [clinicUid, carregarCatalogo]);

  useEffect(() => {
    let ativo = true;
    carregarDados().catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível carregar os dados da clínica.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [carregarDados, tentativa]);

  async function salvarOferta(evento) {
    evento.preventDefault();
    setRetorno(null);
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf(
        `/api/clinics/me/exams/${encodeURIComponent(codigoExame)}`,
        "PUT",
        { preco: Number(preco) },
      );
      await carregarDados();
      setRetorno({ secao: "ofertas", tipo: "sucesso", texto: `Oferta de ${resultado.oferta?.nomeExame || examesPorCodigo.get(codigoExame)?.nome || "exame"} salva e publicada na busca.` });
      setPreco("");
    } catch (falha) {
      setRetorno({ secao: "ofertas", tipo: "erro", texto: falha.message || "Não foi possível salvar a oferta." });
    } finally {
      setSalvando(false);
    }
  }

  async function desativarOferta(oferta) {
    setRetorno(null);
    setRemovendo(oferta.codigoExame);
    try {
      await apiRequestWithCsrf(
        `/api/clinics/me/exams/${encodeURIComponent(oferta.codigoExame)}`,
        "DELETE",
        {},
      );
      setConfirmando("");
      await carregarDados();
      setRetorno({ secao: "ofertas", tipo: "sucesso", texto: "Oferta desativada." });
    } catch (falha) {
      setRetorno({ secao: "ofertas", tipo: "erro", texto: falha.message || "Não foi possível desativar a oferta." });
    } finally {
      setRemovendo("");
    }
  }

  async function salvarConvenios() {
    if (conveniosSelecionados.length < 5 || conveniosSelecionados.length > 10) {
      setRetorno({ secao: "convenios", tipo: "erro", texto: "Escolha de 5 a 10 convênios para salvar." });
      return;
    }
    setRetorno(null);
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf("/api/users/me", "PATCH", {
        conveniosAceitos: conveniosSelecionados,
      });
      const salvos = resultado?.usuario?.conveniosAceitos ?? conveniosSelecionados;
      setPerfil((atual) => ({ ...atual, conveniosAceitos: salvos }));
      setConveniosSelecionados(salvos);
      setRetorno({ secao: "convenios", tipo: "sucesso", texto: `${salvos.length} convênios salvos.` });
    } catch (falha) {
      setRetorno({ secao: "convenios", tipo: "erro", texto: falha.message || "Não foi possível salvar os convênios." });
    } finally {
      setSalvando(false);
    }
  }

  async function publicarHorario(evento) {
    evento.preventDefault();
    setRetorno(null);
    setSalvando(true);
    try {
      await publishClinicAvailability([new Date(novoHorario).toISOString()]);
      await carregarDados();
      setNovoHorario("");
      setRetorno({ secao: "horarios", tipo: "sucesso", texto: "Horário publicado para solicitação de pacientes." });
    } catch (falha) {
      setRetorno({ secao: "horarios", tipo: "erro", texto: falha.message || "Não foi possível publicar este horário." });
    } finally {
      setSalvando(false);
    }
  }

  async function removerHorario(dataHora) {
    setRetorno(null);
    setRemovendo(dataHora);
    try {
      await removeClinicAvailability(dataHora);
      await carregarDados();
      setRetorno({ secao: "horarios", tipo: "sucesso", texto: "Horário removido." });
    } catch (falha) {
      setRetorno({ secao: "horarios", tipo: "erro", texto: falha.message || "Não foi possível remover este horário." });
    } finally {
      setRemovendo("");
    }
  }

  async function carregarMaisHorarios() {
    if (!proximoHorarioCursor || carregandoMaisHorarios) return;
    setCarregandoMaisHorarios(true);
    setRetorno(null);
    const inicio = new Date((Math.floor(Date.now() / 60000) + 1) * 60000);
    const intervalo = { inicio: inicio.toISOString(), fim: new Date(inicio.getTime() + 30 * 86400000).toISOString() };
    try {
      const pagina = await getClinicAvailability(clinicUid, { ...intervalo, cursor: proximoHorarioCursor });
      setHorarios((atuais) => [...atuais, ...(pagina.horarios ?? [])]);
      setProximoHorarioCursor(pagina.proximoCursor ?? null);
    } catch (falha) {
      setRetorno({ secao: "horarios", tipo: "erro", texto: falha.message || "Não foi possível carregar mais horários." });
    } finally {
      setCarregandoMaisHorarios(false);
    }
  }

  async function alterarAgendamento(id, acao, motivo) {
    setRetorno(null);
    setRemovendo(id);
    try {
      await updateAppointment(id, { acao, ...(motivo ? { motivo: motivo.trim() } : {}) });
      setConfirmando("");
      await carregarDados();
      setRetorno({ secao: "agendamentos", tipo: "sucesso", texto: MENSAGEM_ACAO[acao] || "Solicitação atualizada." });
    } catch (falha) {
      setRetorno({ secao: "agendamentos", tipo: "erro", texto: falha.message || "Não foi possível atualizar o agendamento." });
    } finally {
      setRemovendo("");
    }
  }

  async function carregarMaisAgendamentos() {
    if (!proximoAgendamentoCursor || carregandoMaisAgendamentos) return;
    setCarregandoMaisAgendamentos(true);
    setRetorno(null);
    try {
      const pagina = await listAppointments({ cursor: proximoAgendamentoCursor });
      setAgendamentos((atuais) => [...atuais, ...(pagina.agendamentos ?? [])]);
      setProximoAgendamentoCursor(pagina.proximoCursor ?? null);
    } catch (falha) {
      setRetorno({ secao: "agendamentos", tipo: "erro", texto: falha.message || "Não foi possível carregar mais solicitações." });
    } finally {
      setCarregandoMaisAgendamentos(false);
    }
  }

  async function corrigirEReenviarCadastro(evento) {
    evento.preventDefault();
    setRetorno(null);
    setSalvando(true);
    try {
      await apiRequestWithCsrf("/api/users/me", "PATCH", {
        nomeFantasia: (perfil.nomeFantasia || "").trim(),
        telefone: (perfil.telefone || "").trim(),
        endereco: (perfil.endereco || "").trim(),
      });
      const resultado = await apiRequestWithCsrf("/api/clinics/me/resubmit", "POST", {});
      setPerfil((atual) => ({ ...atual, status: "pendente", motivoRejeicao: null }));
      setRetorno({ secao: "cadastro", tipo: "sucesso", texto: resultado.message || "Cadastro reenviado para análise." });
    } catch (falha) {
      setRetorno({ secao: "cadastro", tipo: "erro", texto: falha.message || "Não foi possível corrigir e reenviar o cadastro." });
    } finally {
      setSalvando(false);
    }
  }

  function retornoDe(secao, tituloErro) {
    if (retorno?.secao !== secao) return null;
    return retorno.tipo === "erro"
      ? <FeedbackErro mensagem={retorno.texto} titulo={tituloErro} />
      : <Alert status="success" role="status">{retorno.texto}</Alert>;
  }

  function editarOferta(oferta) {
    setCodigoExame(oferta.codigoExame);
    setPreco(String(oferta.preco));
    setRetorno(null);
    const reduzirMovimento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("secao-ofertas")?.scrollIntoView?.({ behavior: reduzirMovimento ? "auto" : "smooth", block: "start" });
    precoRef.current?.focus({ preventScroll: true });
  }

  const situacao = ROTULO_STATUS_CLINICA[perfil?.status];
  const seloSituacao = situacao && <StatusBadge tone={situacao.tom}>{situacao.rotulo}</StatusBadge>;
  const titulo = `Olá, ${perfil?.nomeFantasia || saudacao}`;

  if (status === "loading") return <Container maxW="var(--container-md)" {...ESPACO_PAGINA}><ListSkeleton count={3} /></Container>;
  if (status === "error") return <Container maxW="var(--container-md)" {...ESPACO_PAGINA}><ErrorState title="Área da clínica indisponível" description={erro} onRetry={() => { setErro(""); setStatus("loading"); setTentativa((atual) => atual + 1); }} /></Container>;
  if (status === "restricted") {
    const statusClinica = perfil?.status;
    const tituloStatus = statusClinica === "pendente" ? "Cadastro em análise"
      : statusClinica === "rejeitada" ? "Cadastro precisa de correções"
        : statusClinica === "suspensa" ? "Acesso suspenso"
          : "Acesso à área da clínica indisponível";
    const descricaoStatus = statusClinica === "pendente"
      ? "A equipe do Exame Já está analisando o cadastro. As ferramentas da clínica são liberadas depois da aprovação."
      : statusClinica === "suspensa"
        ? `As ferramentas da clínica estão suspensas.${perfil?.motivoSuspensao ? ` Motivo: ${perfil.motivoSuspensao}` : " Entre em contato com o suporte para obter orientação."}`
        : statusClinica === "rejeitada"
          ? "Corrija os dados abaixo e reenvie o cadastro para uma nova análise."
          : "Não foi possível saber a situação cadastral da unidade. Entre em contato com o suporte.";

    return (
      <Container maxW="var(--container-sm)" {...ESPACO_PAGINA}>
        <PageHeader title={titulo} description="Área da clínica" badge={seloSituacao} />
        <Card>
          <Stack gap="var(--space-4)">
            <SectionTitle>{tituloStatus}</SectionTitle>
            <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">{descricaoStatus}</Text>
            {statusClinica === "rejeitada" && perfil?.motivoRejeicao && (
              <Alert status="error" title="Motivo informado pela equipe">{perfil.motivoRejeicao}</Alert>
            )}
            {statusClinica === "rejeitada" && (
              <Stack as="form" onSubmit={corrigirEReenviarCadastro} gap="var(--space-4)">
                <CampoTexto label="Nome fantasia" value={perfil.nomeFantasia || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, nomeFantasia: evento.target.value }))} maxLength={200} required />
                <CampoTexto label="Telefone com DDD" type="tel" autoComplete="tel" value={perfil.telefone || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, telefone: evento.target.value }))} maxLength={30} required />
                <CampoTexto label="Endereço completo" autoComplete="street-address" value={perfil.endereco || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, endereco: evento.target.value }))} maxLength={500} required helperText="Rua, número, bairro, cidade e UF. Ele é usado para mostrar a clínica no mapa." />
                <Box>
                  <Button type="submit" disabled={salvando}>{salvando ? "Reenviando cadastro…" : "Salvar correções e reenviar"}</Button>
                </Box>
              </Stack>
            )}
            {retornoDe("cadastro", "Não foi possível reenviar o cadastro")}
          </Stack>
        </Card>
      </Container>
    );
  }

  const pendentes = agendamentos.filter((agendamento) => agendamento.status === "pendente").length;
  const agendamentosOrdenados = [...agendamentos].sort((a, b) => (ORDEM_STATUS[a.status] ?? 2) - (ORDEM_STATUS[b.status] ?? 2));

  return (
    <Container maxW="var(--container-md)" {...ESPACO_PAGINA}>
      <PageHeader title={titulo} description="Responda aos pedidos, publique exames e horários e mantenha os convênios em dia." badge={seloSituacao} />
      <Stack gap="var(--space-6)">
        <ResumoPainel
          itens={[
            { alvo: "secao-agendamentos", valor: pendentes, rotulo: pendentes === 1 ? "pedido aguardando resposta" : "pedidos aguardando resposta", destaque: pendentes > 0 },
            { alvo: "secao-ofertas", valor: ofertas.length, rotulo: ofertas.length === 1 ? "exame publicado" : "exames publicados" },
            { alvo: "secao-horarios", valor: `${horarios.length}${proximoHorarioCursor ? "+" : ""}`, rotulo: "horários livres em 30 dias" },
            { alvo: "secao-convenios", valor: conveniosSalvos, rotulo: "convênios aceitos (mínimo 5)" },
          ]}
        />

        <ChecklistVisibilidade
          itens={[
            { feito: true, texto: "Cadastro aprovado pela administração" },
            { feito: localizada === true, texto: localizada === null ? "Não foi possível conferir se o endereço está no mapa" : "Endereço localizado no mapa", ajuda: localizada === false ? "Sem localização a clínica não aparece na busca. Peça à equipe do Exame Já para localizar o endereço." : undefined },
            { feito: conveniosSalvos >= 5, texto: `Pelo menos 5 convênios salvos (${conveniosSalvos} agora)` },
            { feito: ofertas.length > 0, texto: "Pelo menos 1 exame com preço publicado" },
            { feito: horarios.length > 0, texto: "Horários livres publicados, para o paciente poder agendar" },
          ]}
        />

        <SecaoPainel
          id="secao-agendamentos"
          titulo="Pedidos de agendamento"
          descricao="Confirme ou recuse os pedidos dos pacientes. Pedidos sem resposta expiram."
          selo={pendentes > 0 && <StatusBadge tone="warning">{pendentes} {pendentes === 1 ? "novo" : "novos"}</StatusBadge>}
        >
          {agendamentos.length === 0 ? (
            <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">Nenhum pedido por enquanto. Eles aparecem aqui quando um paciente escolhe um dos seus horários.</Text>
          ) : (
            <Stack as="ul" listStyle="none" p={0} m={0} gap="var(--space-3)">
              {agendamentosOrdenados.map((agendamento) => (
                <Box as="li" key={agendamento.id} {...LINHA}>
                  <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="var(--space-3)">
                    <Stack gap="var(--space-1)">
                      <Flex align="center" gap="var(--space-2)" wrap="wrap">
                        <Text fontWeight="var(--weight-bold)" color="var(--color-text)">{agendamento.nomeExame}</Text>
                        <StatusBadge tone={tomStatusAgendamento(agendamento.status)}>{rotuloStatusAgendamento(agendamento.status)}</StatusBadge>
                      </Flex>
                      <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
                        {formatarData(agendamento.dataHora)} · Paciente: {agendamento.clienteNome || agendamento.nomeCliente || agendamento.cliente?.nome || agendamento.clienteUid}
                      </Text>
                    </Stack>
                    <Flex gap="var(--space-2)" wrap="wrap" flexShrink={0}>
                      {agendamento.status === "pendente" && (
                        <>
                          <Button type="button" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "confirmar")}>Confirmar</Button>
                          <Button type="button" variant="outline" disabled={removendo === agendamento.id} onClick={() => setConfirmando(`recusar:${agendamento.id}`)}>Recusar</Button>
                        </>
                      )}
                      {agendamento.status === "confirmado" && (
                        <Button type="button" variant="outline" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "concluir")}>Marcar como concluído</Button>
                      )}
                    </Flex>
                  </Flex>
                  {confirmando === `recusar:${agendamento.id}` && (
                    <Box mt="var(--space-4)">
                      <ConfirmacaoInline pergunta={`Recusar o pedido de ${agendamento.nomeExame}? O paciente verá o motivo.`} rotuloConfirmar="Recusar pedido" rotuloEnviando="Recusando…" motivo={{ rotulo: "Motivo da recusa", ajuda: "De 3 a 300 caracteres.", minimo: 3, maximo: 300 }} ocupado={removendo === agendamento.id} onConfirmar={(motivo) => alterarAgendamento(agendamento.id, "recusar", motivo)} onCancelar={() => setConfirmando("")} />
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
          {proximoAgendamentoCursor && (
            <Box>
              <Button type="button" variant="outline" onClick={carregarMaisAgendamentos} disabled={carregandoMaisAgendamentos}>{carregandoMaisAgendamentos ? "Carregando…" : "Carregar mais pedidos"}</Button>
            </Box>
          )}
          {retornoDe("agendamentos", "Não foi possível atualizar o pedido")}
        </SecaoPainel>

        <SecaoPainel id="secao-ofertas" titulo="Exames e preços" descricao="Publique o preço particular de cada exame. Só exames publicados aparecem na busca.">
          <Stack as="form" onSubmit={salvarOferta} gap="var(--space-4)" aria-label="Publicar ou atualizar um exame">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="var(--space-4)">
              <Stack gap="var(--space-3)">
                <CampoTexto
                  label="Código TUSS do exame"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={80}
                  value={codigoExame}
                  onChange={(evento) => setCodigoExame(evento.target.value.trim())}
                  error={erroCodigoExame}
                  helperText={ajudaCodigoExame}
                  required
                />
                <Select
                  label="Ou escolha no catálogo TUSS"
                  placeholder={exames.length ? "Escolha um exame da lista" : "Carregando catálogo…"}
                  options={exames.map((exame) => ({ value: exame.codigo, label: `${exame.nome} (${exame.codigo})` }))}
                  value={examesPorCodigo.has(codigoExame) ? codigoExame : ""}
                  onChange={(evento) => setCodigoExame(evento.target.value)}
                  helperText={`${exames.length} exames carregados${totalPaginasCatalogo ? `, página ${paginaCatalogo} de ${totalPaginasCatalogo}` : ""}. A ANS envia o catálogo aos poucos.`}
                />
                {temMaisExames && !erroCatalogo && (
                  <Box>
                    <Button type="button" variant="ghost" onClick={() => carregarCatalogo(paginaCatalogo + 1)} disabled={carregandoCatalogo}>
                      {carregandoCatalogo ? "Carregando…" : "Carregar mais exames"}
                    </Button>
                  </Box>
                )}
                {erroCatalogo && (
                  <Flex align="center" gap="var(--space-2)" wrap="wrap">
                    <Text role="alert" fontSize="var(--text-sm)" color="var(--color-error)">{erroCatalogo}</Text>
                    <Button type="button" variant="outline" onClick={() => carregarCatalogo(paginaCatalogo + 1)} disabled={carregandoCatalogo}>Tentar novamente</Button>
                  </Flex>
                )}
              </Stack>
              <CampoTexto ref={precoRef} label="Preço particular (R$)" type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={preco} onChange={(evento) => setPreco(evento.target.value)} helperText="Valor cobrado sem convênio. Exemplo: 45,90." required />
            </SimpleGrid>
            <Box>
              <Button type="submit" disabled={salvando || !codigoExame || Boolean(erroCodigoExame) || !preco}>{salvando ? "Salvando…" : "Salvar e publicar"}</Button>
            </Box>
          </Stack>
          {retornoDe("ofertas", "Não foi possível salvar o exame")}
          <Stack gap="var(--space-3)" pt="var(--space-4)" borderTopWidth="var(--border-width)" borderTopStyle="solid" borderTopColor="var(--color-border-soft)">
            <SectionTitle as="h3">Publicados ({ofertas.length})</SectionTitle>
            {ofertas.length === 0 ? (
              <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">Nenhum exame publicado ainda. Use o formulário acima para publicar o primeiro.</Text>
            ) : (
              <Stack as="ul" listStyle="none" p={0} m={0} gap="var(--space-3)">
                {ofertas.map((oferta) => (
                  <Box as="li" key={oferta.codigoExame} {...LINHA}>
                    <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap="var(--space-3)">
                      <Stack gap="var(--space-1)">
                        <Text fontWeight="var(--weight-bold)" color="var(--color-text)">{oferta.nomeExame || examesPorCodigo.get(oferta.codigoExame)?.nome || "Exame"}</Text>
                        <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">
                          TUSS {oferta.codigoExame} · <Text as="span" fontWeight="var(--weight-bold)" color="var(--color-text)">{Number(oferta.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
                        </Text>
                      </Stack>
                      <Flex gap="var(--space-2)" wrap="wrap" flexShrink={0}>
                        <Button type="button" variant="outline" onClick={() => editarOferta(oferta)}>Editar preço</Button>
                        <Button type="button" variant="outline" disabled={removendo === oferta.codigoExame} onClick={() => setConfirmando(`oferta:${oferta.codigoExame}`)}>Desativar</Button>
                      </Flex>
                    </Flex>
                    {confirmando === `oferta:${oferta.codigoExame}` && (
                      <Box mt="var(--space-4)">
                        <ConfirmacaoInline pergunta={`Desativar ${oferta.nomeExame || "este exame"}? Ele deixa de aparecer na busca.`} rotuloConfirmar="Sim, desativar" rotuloEnviando="Desativando…" ocupado={removendo === oferta.codigoExame} onConfirmar={() => desativarOferta(oferta)} onCancelar={() => setConfirmando("")} />
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </SecaoPainel>

        <SecaoPainel id="secao-horarios" titulo="Horários livres" descricao="Publique horários futuros. O paciente escolhe um deles ao pedir o agendamento.">
          <Flex as="form" onSubmit={publicarHorario} direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "flex-end" }} gap="var(--space-3)">
            <Box flex="1">
              <CampoTexto label="Novo horário" type="datetime-local" value={novoHorario} onChange={(evento) => setNovoHorario(evento.target.value)} required />
            </Box>
            <Button type="submit" disabled={salvando || !novoHorario}>{salvando ? "Publicando…" : "Publicar horário"}</Button>
          </Flex>
          {retornoDe("horarios", "Não foi possível atualizar os horários")}
          {horarios.length === 0 ? (
            <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">Nenhum horário livre nos próximos 30 dias.</Text>
          ) : (
            <SimpleGrid as="ul" listStyle="none" p={0} m={0} columns={{ base: 1, md: 2 }} gap="var(--space-2)">
              {horarios.map(({ dataHora }) => (
                <Flex as="li" key={dataHora} justify="space-between" align="center" gap="var(--space-3)" {...LINHA} py="var(--space-2)">
                  <Text fontSize="var(--text-sm)" color="var(--color-text)">{formatarData(dataHora)}</Text>
                  <Button type="button" variant="ghost" disabled={removendo === dataHora} onClick={() => removerHorario(dataHora)} aria-label={`Remover o horário de ${formatarData(dataHora)}`}>
                    {removendo === dataHora ? "Removendo…" : "Remover"}
                  </Button>
                </Flex>
              ))}
            </SimpleGrid>
          )}
          {proximoHorarioCursor && (
            <Box>
              <Button type="button" variant="outline" onClick={carregarMaisHorarios} disabled={carregandoMaisHorarios}>{carregandoMaisHorarios ? "Carregando…" : "Carregar mais horários"}</Button>
            </Box>
          )}
        </SecaoPainel>

        <SecaoPainel id="secao-convenios" titulo="Convênios aceitos" descricao="Os pacientes filtram a busca pelo convênio. A clínica precisa aceitar de 5 a 10.">
          <Stack gap="var(--space-4)">
            <SeletorConvenios
              legenda="Convênios que a clínica atende"
              convenios={convenios}
              selecionados={conveniosSelecionados}
              onChange={(ids) => {
                setConveniosSelecionados(ids);
                if (retorno?.secao === "convenios") setRetorno(null);
              }}
            />
            {retornoDe("convenios", "Os convênios não foram salvos")}
            <Box>
              <Button type="button" disabled={salvando || conveniosSelecionados.length < 5} onClick={salvarConvenios}>{salvando ? "Salvando…" : "Salvar convênios"}</Button>
            </Box>
          </Stack>
        </SecaoPainel>
      </Stack>
    </Container>
  );
}
