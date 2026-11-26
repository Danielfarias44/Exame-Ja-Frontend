import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Container, Flex, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { getClinicAvailability, getExamCatalog, listAppointments, publishClinicAvailability, removeClinicAvailability, updateAppointment } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import CampoTexto from "@/components/ui/CampoTexto";
import Select from "@/components/ui/Select";
import ConfirmacaoInline from "@/components/ui/ConfirmacaoInline";
import SeletorConvenios from "@/components/ui/SeletorConvenios";
import { rotuloStatusAgendamento } from "@/utils/statusAgendamento";
import ChecklistVisibilidade from "./ChecklistVisibilidade";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import FeedbackErro from "@/components/ui/FeedbackErro";
import Alert from "@/components/ui/Alert";

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
  const [retornoConvenios, setRetornoConvenios] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
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
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf(
        `/api/clinics/me/exams/${encodeURIComponent(codigoExame)}`,
        "PUT",
        { preco: Number(preco) },
      );
      await carregarDados();
      setMensagem(`Oferta de ${resultado.oferta?.nomeExame || examesPorCodigo.get(codigoExame)?.nome || "exame"} salva e publicada na busca.`);
      setPreco("");
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar a oferta.");
    } finally {
      setSalvando(false);
    }
  }

  async function desativarOferta(oferta) {
    setErro("");
    setMensagem("");
    setRemovendo(oferta.codigoExame);
    try {
      await apiRequestWithCsrf(
        `/api/clinics/me/exams/${encodeURIComponent(oferta.codigoExame)}`,
        "DELETE",
        {},
      );
      setConfirmando("");
      await carregarDados();
      setMensagem("Oferta desativada.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível desativar a oferta.");
    } finally {
      setRemovendo("");
    }
  }

  async function salvarConvenios() {
    if (conveniosSelecionados.length < 5 || conveniosSelecionados.length > 10) {
      setRetornoConvenios({ tipo: "erro", texto: "Escolha de 5 a 10 convênios para salvar." });
      return;
    }
    setRetornoConvenios(null);
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf("/api/users/me", "PATCH", {
        conveniosAceitos: conveniosSelecionados,
      });
      const salvos = resultado?.usuario?.conveniosAceitos ?? conveniosSelecionados;
      setPerfil((atual) => ({ ...atual, conveniosAceitos: salvos }));
      setConveniosSelecionados(salvos);
      setRetornoConvenios({ tipo: "sucesso", texto: `${salvos.length} convênios salvos.` });
    } catch (falha) {
      setRetornoConvenios({ tipo: "erro", texto: falha.message || "Não foi possível salvar os convênios." });
    } finally {
      setSalvando(false);
    }
  }

  async function publicarHorario(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      await publishClinicAvailability([new Date(novoHorario).toISOString()]);
      await carregarDados();
      setNovoHorario("");
      setMensagem("Horário publicado para solicitação de pacientes.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível publicar este horário.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerHorario(dataHora) {
    setErro("");
    setMensagem("");
    setRemovendo(dataHora);
    try {
      await removeClinicAvailability(dataHora);
      await carregarDados();
      setMensagem("Horário removido.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível remover este horário.");
    } finally {
      setRemovendo("");
    }
  }

  async function carregarMaisHorarios() {
    if (!proximoHorarioCursor || carregandoMaisHorarios) return;
    setCarregandoMaisHorarios(true);
    setErro("");
    const inicio = new Date((Math.floor(Date.now() / 60000) + 1) * 60000);
    const intervalo = { inicio: inicio.toISOString(), fim: new Date(inicio.getTime() + 30 * 86400000).toISOString() };
    try {
      const pagina = await getClinicAvailability(clinicUid, { ...intervalo, cursor: proximoHorarioCursor });
      setHorarios((atuais) => [...atuais, ...(pagina.horarios ?? [])]);
      setProximoHorarioCursor(pagina.proximoCursor ?? null);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais horários.");
    } finally {
      setCarregandoMaisHorarios(false);
    }
  }

  async function alterarAgendamento(id, acao, motivo) {
    setErro("");
    setMensagem("");
    setRemovendo(id);
    try {
      await updateAppointment(id, { acao, ...(motivo ? { motivo: motivo.trim() } : {}) });
      setConfirmando("");
      await carregarDados();
      setMensagem("Solicitação de agendamento atualizada.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível atualizar o agendamento.");
    } finally {
      setRemovendo("");
    }
  }

  async function carregarMaisAgendamentos() {
    if (!proximoAgendamentoCursor || carregandoMaisAgendamentos) return;
    setCarregandoMaisAgendamentos(true);
    setErro("");
    try {
      const pagina = await listAppointments({ cursor: proximoAgendamentoCursor });
      setAgendamentos((atuais) => [...atuais, ...(pagina.agendamentos ?? [])]);
      setProximoAgendamentoCursor(pagina.proximoCursor ?? null);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais solicitações.");
    } finally {
      setCarregandoMaisAgendamentos(false);
    }
  }

  async function corrigirEReenviarCadastro(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      await apiRequestWithCsrf("/api/users/me", "PATCH", {
        nomeFantasia: (perfil.nomeFantasia || "").trim(),
        telefone: (perfil.telefone || "").trim(),
        endereco: (perfil.endereco || "").trim(),
      });
      const resultado = await apiRequestWithCsrf("/api/clinics/me/resubmit", "POST", {});
      setPerfil((atual) => ({ ...atual, status: "pendente", motivoRejeicao: null }));
      setMensagem(resultado.message || "Cadastro reenviado para análise.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível corrigir e reenviar o cadastro.");
    } finally {
      setSalvando(false);
    }
  }

  if (status === "loading") return <Container py={10}><Text>Carregando área da clínica...</Text></Container>;
  if (status === "error") return <Container py={10}><ErrorState title="Área da clínica indisponível" description={erro} onRetry={() => { setErro(""); setStatus("loading"); setTentativa((atual) => atual + 1); }} /></Container>;
  if (status === "restricted") {
    const statusClinica = perfil?.status;
    const tituloStatus = statusClinica === "pendente" ? "Cadastro em análise"
      : statusClinica === "rejeitada" ? "Cadastro precisa de correções"
        : statusClinica === "suspensa" ? "Acesso suspenso"
          : "Acesso à área da clínica indisponível";
    const descricaoStatus = statusClinica === "pendente"
      ? "O cadastro da unidade está em análise. As ferramentas da clínica serão liberadas após a aprovação."
      : statusClinica === "suspensa"
        ? `As ferramentas da clínica estão suspensas.${perfil?.motivoSuspensao ? ` Motivo: ${perfil.motivoSuspensao}` : " Entre em contato com o suporte para obter orientação."}`
        : statusClinica === "rejeitada"
          ? "Revise os dados indicados pela equipe e reenvie o cadastro para análise."
          : "Não foi possível determinar a situação cadastral da unidade. Entre em contato com o suporte.";

    return (
      <Container maxW="760px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
        <PageHeader title={`Olá, ${perfil?.nomeFantasia || saudacao}`} description={tituloStatus} />
        {erro && <Box mb={4}><FeedbackErro mensagem={erro} /></Box>}
        {mensagem && <Text role="status" mb={4} color="var(--color-success)">{mensagem}</Text>}
        <Card>
          <Stack gap={4}>
            <Text fontWeight="var(--weight-bold)">{tituloStatus}</Text>
            <Text color="var(--color-text-muted)">{descricaoStatus}</Text>
            {statusClinica === "rejeitada" && perfil?.motivoRejeicao && <Text role="alert"><strong>Motivo informado:</strong> {perfil.motivoRejeicao}</Text>}
            {statusClinica === "rejeitada" && (
              <Stack as="form" onSubmit={corrigirEReenviarCadastro} gap={3}>
                <CampoTexto label="Nome fantasia" value={perfil.nomeFantasia || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, nomeFantasia: evento.target.value }))} maxLength={200} required />
                <CampoTexto label="Telefone com DDD" type="tel" autoComplete="tel" value={perfil.telefone || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, telefone: evento.target.value }))} maxLength={30} required />
                <CampoTexto label="Endereço completo" autoComplete="street-address" value={perfil.endereco || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, endereco: evento.target.value }))} maxLength={500} required helperText="Rua, número, bairro, cidade e UF. Ele é usado para mostrar a clínica no mapa." />
                <Button type="submit" disabled={salvando}>{salvando ? "Reenviando cadastro..." : "Salvar correções e reenviar"}</Button>
              </Stack>
            )}
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="1000px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}>
      <PageHeader title={`Olá, ${perfil?.nomeFantasia || saudacao}`} description="Gerencie as ofertas de exames publicadas para pacientes." />
      {perfil?.status && <Text mb={4} fontSize="var(--text-xs)" color="var(--color-text-muted)">Situação cadastral: {perfil.status}</Text>}
      {erro && <Box mb={4}><FeedbackErro mensagem={erro} /></Box>}
      {mensagem && <Text role="status" mb={4} color="var(--color-success)">{mensagem}</Text>}

      <ChecklistVisibilidade
        itens={[
          { feito: true, texto: "Cadastro aprovado pela administração" },
          { feito: localizada === true, texto: localizada === null ? "Não foi possível conferir se o endereço está no mapa" : "Endereço localizado no mapa", ajuda: localizada === false ? "Sem localização a clínica não aparece na busca. Peça à equipe do Exame Já para localizar o endereço." : undefined },
          { feito: conveniosSalvos >= 5, texto: `Pelo menos 5 convênios salvos (${conveniosSalvos} agora)` },
          { feito: ofertas.length > 0, texto: "Pelo menos 1 exame com preço publicado" },
          { feito: horarios.length > 0, texto: "Horários livres publicados, para o paciente poder agendar" },
        ]}
      />

      <Card>
        <Box as="form" onSubmit={salvarOferta}>
          <Stack gap={4}>
            <Text as="h2" fontWeight="var(--weight-bold)" fontSize="var(--text-lg)">Publicar ou atualizar uma oferta</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Stack gap={3}>
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
                    <Button type="button" size="sm" variant="outline" minH="var(--touch-target-min)" onClick={() => carregarCatalogo(paginaCatalogo + 1)} disabled={carregandoCatalogo}>
                      {carregandoCatalogo ? "Carregando…" : "Carregar mais exames"}
                    </Button>
                  </Box>
                )}
                {erroCatalogo && (
                  <Flex align="center" gap={2} wrap="wrap">
                    <Text role="alert" fontSize="var(--text-sm)" color="var(--color-error)">{erroCatalogo}</Text>
                    <Button type="button" size="sm" variant="outline" minH="var(--touch-target-min)" onClick={() => carregarCatalogo(paginaCatalogo + 1)} disabled={carregandoCatalogo}>Tentar novamente</Button>
                  </Flex>
                )}
              </Stack>
              <CampoTexto label="Preço particular (R$)" type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={preco} onChange={(evento) => setPreco(evento.target.value)} helperText="Valor cobrado sem convênio. Exemplo: 45,90." required />
            </SimpleGrid>
            <Button type="submit" disabled={salvando || !codigoExame || Boolean(erroCodigoExame) || !preco}>{salvando ? "Salvando oferta..." : "Salvar oferta"}</Button>
          </Stack>
        </Box>
      </Card>

      <Card>
        <Stack gap={4}>
          <Text as="h2" fontWeight="var(--weight-bold)" fontSize="var(--text-lg)">Convênios aceitos</Text>
          <SeletorConvenios
            legenda="Convênios que a clínica atende"
            convenios={convenios}
            selecionados={conveniosSelecionados}
            onChange={(ids) => {
              setConveniosSelecionados(ids);
              setRetornoConvenios(null);
            }}
          />
          {retornoConvenios?.tipo === "erro" && <FeedbackErro mensagem={retornoConvenios.texto} titulo="Os convênios não foram salvos" />}
          {retornoConvenios?.tipo === "sucesso" && <Alert status="success" role="status">{retornoConvenios.texto}</Alert>}
          <Box>
            <Button type="button" disabled={salvando || conveniosSelecionados.length < 5} onClick={salvarConvenios}>{salvando ? "Salvando…" : "Salvar convênios"}</Button>
          </Box>
        </Stack>
      </Card>

      <Card>
        <Stack as="form" onSubmit={publicarHorario} gap={4}>
          <Box>
            <Text as="h2" fontWeight="var(--weight-bold)" fontSize="var(--text-lg)">Disponibilidade de horários</Text>
            <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Publique horários futuros para que pacientes possam solicitar agendamento.</Text>
          </Box>
          <Flex direction={{ base: "column", sm: "row" }} align={{ base: "stretch", sm: "flex-end" }} gap={3}>
            <CampoTexto label="Novo horário disponível" type="datetime-local" value={novoHorario} onChange={(evento) => setNovoHorario(evento.target.value)} required />
            <Button type="submit" disabled={salvando || !novoHorario}>{salvando ? "Publicando..." : "Publicar horário"}</Button>
          </Flex>
          {horarios.length === 0 && <Text color="var(--color-text-muted)">Nenhum horário livre nos próximos 30 dias.</Text>}
          {horarios.map(({ dataHora }) => <Flex key={dataHora} justify="space-between" align="center" gap={3}>
            <Text>{new Date(dataHora).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}</Text>
            <Button type="button" size="sm" variant="outline" disabled={removendo === dataHora} onClick={() => removerHorario(dataHora)}>{removendo === dataHora ? "Removendo..." : "Remover"}</Button>
          </Flex>)}
          {proximoHorarioCursor && <Button type="button" variant="outline" onClick={carregarMaisHorarios} disabled={carregandoMaisHorarios}>{carregandoMaisHorarios ? "Carregando..." : "Carregar mais horários"}</Button>}
        </Stack>
      </Card>

      <Stack as="section" gap={3} aria-labelledby="titulo-agendamentos-clinica">
        <Text as="h2" id="titulo-agendamentos-clinica" fontSize="var(--text-lg)" fontWeight="var(--weight-bold)">Solicitações de agendamento ({agendamentos.length})</Text>
        {agendamentos.length === 0 && <Text color="var(--color-text-muted)">Nenhuma solicitação recebida.</Text>}
        {agendamentos.map((agendamento) => {
          const dataHora = agendamento.dataHora?._seconds != null
            ? new Date(agendamento.dataHora._seconds * 1000)
            : new Date(agendamento.dataHora);
          return <Card key={agendamento.id}><Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
            <Stack gap={1}><Text fontWeight="var(--weight-bold)">{agendamento.nomeExame}</Text><Text fontSize="var(--text-xs)" color="var(--color-text-muted)">{dataHora.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · Paciente {agendamento.clienteNome || agendamento.nomeCliente || agendamento.cliente?.nome || agendamento.clienteUid}</Text><Text fontSize="var(--text-xs)">Situação: {rotuloStatusAgendamento(agendamento.status)}</Text></Stack>
            <Flex gap={2} wrap="wrap">
              {agendamento.status === "pendente" && <><Button type="button" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "confirmar")}>Confirmar</Button><Button type="button" variant="outline" colorPalette="red" disabled={removendo === agendamento.id} onClick={() => setConfirmando(`recusar:${agendamento.id}`)}>Recusar</Button></>}
              {agendamento.status === "confirmado" && <Button type="button" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "concluir")}>Marcar como concluído</Button>}
            </Flex>
          </Flex>
          {confirmando === `recusar:${agendamento.id}` && <Stack mt={4}><ConfirmacaoInline pergunta={`Recusar a solicitação de ${agendamento.nomeExame}? O paciente verá o motivo.`} rotuloConfirmar="Recusar solicitação" rotuloEnviando="Recusando…" motivo={{ rotulo: "Motivo da recusa", ajuda: "De 3 a 300 caracteres.", minimo: 3, maximo: 300 }} ocupado={removendo === agendamento.id} onConfirmar={(motivo) => alterarAgendamento(agendamento.id, "recusar", motivo)} onCancelar={() => setConfirmando("")} /></Stack>}
          </Card>;
        })}
        {proximoAgendamentoCursor && <Button type="button" variant="outline" onClick={carregarMaisAgendamentos} disabled={carregandoMaisAgendamentos}>{carregandoMaisAgendamentos ? "Carregando..." : "Carregar mais solicitações"}</Button>}
      </Stack>

      <Stack as="section" mt={7} gap={3} aria-labelledby="titulo-ofertas-clinica">
        <Text as="h2" id="titulo-ofertas-clinica" fontSize="var(--text-lg)" fontWeight="var(--weight-bold)">Ofertas ativas ({ofertas.length})</Text>
        {ofertas.length === 0 && <Text color="var(--color-text-muted)">Você ainda não publicou ofertas.</Text>}
        {ofertas.map((oferta) => (
          <Card key={oferta.codigoExame}>
            <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
              <Stack gap={1}>
                <Text fontWeight="var(--weight-bold)">{oferta.nomeExame || examesPorCodigo.get(oferta.codigoExame)?.nome || "Exame"}</Text>
                <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">TUSS {oferta.codigoExame} · {Number(oferta.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
              </Stack>
              <Flex gap={2}>
                <Button type="button" variant="outline" onClick={() => { setCodigoExame(oferta.codigoExame); setPreco(String(oferta.preco)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar preço</Button>
                <Button type="button" variant="outline" colorPalette="red" disabled={removendo === oferta.codigoExame} onClick={() => setConfirmando(`oferta:${oferta.codigoExame}`)}>Desativar</Button>
              </Flex>
            </Flex>
            {confirmando === `oferta:${oferta.codigoExame}` && <Stack mt={4}><ConfirmacaoInline pergunta={`Desativar a oferta de ${oferta.nomeExame || "este exame"}? Ela deixa de aparecer na busca.`} rotuloConfirmar="Sim, desativar" rotuloEnviando="Desativando…" ocupado={removendo === oferta.codigoExame} onConfirmar={() => desativarOferta(oferta)} onCancelar={() => setConfirmando("")} /></Stack>}
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
