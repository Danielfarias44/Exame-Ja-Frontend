import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Container, Flex, Input, NativeSelect, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { getClinicAvailability, listAppointments, publishClinicAvailability, removeClinicAvailability, updateAppointment } from "@/services/api";
import { encerrarSessao, obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import ErrorState from "@/components/ui/ErrorState";
import FeedbackErro from "@/components/ui/FeedbackErro";

export default function ClinicaDashboard() {
  const [perfil, setPerfil] = useState(null);
  const [exames, setExames] = useState([]);
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);
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
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const saudacao = obterSessaoAtual()?.nome || "Clínica";
  const clinicUid = obterSessaoAtual()?.id;
  const navegar = useNavigate();

  const examesPorCodigo = useMemo(() => new Map(exames.map((exame) => [exame.codigo, exame])), [exames]);

  const carregarCatalogo = useCallback(async () => {
    setCarregandoCatalogo(true);
    setErroCatalogo("");
    try {
      const todos = [];
      let pagina = 1;
      let totalPaginas = null;
      let quantidade = 0;
      while (pagina <= 500) {
        const catalogoData = await apiRequest(`/api/exams?page=${pagina}&limit=100`);
        const examesPagina = catalogoData.dados ?? [];
        todos.push(...examesPagina);
        quantidade = examesPagina.length;
        totalPaginas = Number(catalogoData.paginas) || null;
        const paginaRetornada = Number(catalogoData.paginaAtual) || pagina;
        if (paginaRetornada < pagina) throw new Error("A paginação do catálogo não avançou corretamente.");
        pagina = paginaRetornada + 1;
        if (totalPaginas !== null ? pagina > totalPaginas : quantidade < 100) break;
      }
      if (pagina > 500 && quantidade === 100) throw new Error("O catálogo excedeu o limite de 500 páginas.");
      setExames(todos.map((exame) => ({ codigo: String(exame.codigo), nome: exame.nome ?? exame.descricao })));
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
    const [ofertasData, conveniosData, disponibilidadeData, primeiraPaginaAgendamentos] = await Promise.all([
      apiRequest("/api/clinics/me/exams"),
      apiRequest("/api/convenios"),
      getClinicAvailability(clinicUid, intervalo),
      listAppointments(),
    ]);
    setConvenios(conveniosData.convenios ?? []);
    setConveniosSelecionados(usuario.conveniosAceitos ?? []);
    setOfertas(ofertasData.ofertas ?? []);
    setHorarios(disponibilidadeData.horarios ?? []);
    setProximoHorarioCursor(disponibilidadeData.proximoCursor ?? null);
    setAgendamentos(primeiraPaginaAgendamentos.agendamentos ?? []);
    setProximoAgendamentoCursor(primeiraPaginaAgendamentos.proximoCursor ?? null);
    setStatus("ready");

    // A falha no catálogo não bloqueia o restante do painel.
    carregarCatalogo();
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
    if (!window.confirm(`Desativar a oferta de ${oferta.nomeExame}? Ela deixará de aparecer nas buscas.`)) return;
    setErro("");
    setMensagem("");
    setRemovendo(oferta.codigoExame);
    try {
      await apiRequestWithCsrf(
        `/api/clinics/me/exams/${encodeURIComponent(oferta.codigoExame)}`,
        "DELETE",
        {},
      );
      await carregarDados();
      setMensagem("Oferta desativada.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível desativar a oferta.");
    } finally {
      setRemovendo("");
    }
  }

  async function salvarConvenios() {
    if (conveniosSelecionados.length < 5) {
      setErro("Selecione pelo menos cinco convênios aceitos para salvar.");
      setMensagem("");
      return;
    }
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf("/api/users/me", "PATCH", {
        conveniosAceitos: conveniosSelecionados,
      });
      setMensagem(resultado.message || "Convênios aceitos atualizados.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar os convênios.");
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

  async function alterarAgendamento(id, acao) {
    const motivo = acao === "recusar" ? window.prompt("Informe o motivo da recusa (obrigatório):") : undefined;
    if (acao === "recusar" && (!motivo || motivo.trim().length < 3)) return;
    setErro("");
    setMensagem("");
    setRemovendo(id);
    try {
      await updateAppointment(id, { acao, ...(motivo ? { motivo: motivo.trim() } : {}) });
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

  function alternarConvenio(id) {
    setConveniosSelecionados((atuais) => atuais.includes(id)
      ? atuais.filter((selecionado) => selecionado !== id)
      : atuais.length < 10 ? [...atuais, id] : atuais);
  }

  async function sair() {
    setErro("");
    try {
      await encerrarSessao();
      navegar("/", { replace: true });
    } catch (falha) {
      setErro(falha.message || "Não foi possível encerrar a sessão.");
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
        <PageHeader title={`Olá, ${perfil?.nomeFantasia || saudacao}`} description={tituloStatus} actions={<Button variant="outline" onClick={sair}>Sair</Button>} />
        {erro && <Box mb={4}><FeedbackErro mensagem={erro} /></Box>}
        {mensagem && <Text role="status" mb={4} color="var(--color-success)">{mensagem}</Text>}
        <Card>
          <Stack gap={4}>
            <Text fontWeight="bold">{tituloStatus}</Text>
            <Text color="var(--color-text-muted)">{descricaoStatus}</Text>
            {statusClinica === "rejeitada" && perfil?.motivoRejeicao && <Text role="alert"><strong>Motivo informado:</strong> {perfil.motivoRejeicao}</Text>}
            {statusClinica === "rejeitada" && (
              <Stack as="form" onSubmit={corrigirEReenviarCadastro} gap={3}>
                <label>Nome fantasia<Input value={perfil.nomeFantasia || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, nomeFantasia: evento.target.value }))} maxLength={200} required /></label>
                <label>Telefone<Input type="tel" value={perfil.telefone || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, telefone: evento.target.value }))} maxLength={30} required /></label>
                <label>Endereço<Input value={perfil.endereco || ""} onChange={(evento) => setPerfil((atual) => ({ ...atual, endereco: evento.target.value }))} maxLength={500} required /></label>
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
      <PageHeader title={`Olá, ${perfil?.nomeFantasia || saudacao}`} description="Gerencie as ofertas de exames publicadas para pacientes." actions={<Flex gap={2}><Button asChild variant="outline"><Link to="/clinica/chat">Conversas</Link></Button><Button variant="outline" onClick={sair}>Sair</Button></Flex>} />
      {perfil?.status && <Text mb={4} fontSize="sm" color="var(--color-text-muted)">Situação cadastral: {perfil.status}</Text>}
      {erro && <Box mb={4}><FeedbackErro mensagem={erro} /></Box>}
      {mensagem && <Text role="status" mb={4} color="var(--color-success)">{mensagem}</Text>}

      <Card>
        <Box as="form" onSubmit={salvarOferta}>
          <Stack gap={4}>
            <Text as="h2" fontWeight="bold" fontSize="lg">Publicar ou atualizar uma oferta</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <label>Exame do catálogo TUSS
                <NativeSelect.Root mt={1}>
                  <NativeSelect.Field value={codigoExame} onChange={(evento) => setCodigoExame(evento.target.value)} required>
                    <option value="">Selecione um exame</option>
                    {exames.map((exame) => <option key={exame.codigo} value={exame.codigo}>{exame.nome} ({exame.codigo})</option>)}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                {carregandoCatalogo && <Text mt={1} fontSize="sm" color="var(--color-text-muted)">Carregando catálogo completo...</Text>}
                {erroCatalogo && <Flex mt={1} align="center" gap={2}><Text role="alert" fontSize="sm" color="var(--color-error)">{erroCatalogo}</Text><Button type="button" size="sm" variant="outline" onClick={carregarCatalogo}>Tentar novamente</Button></Flex>}
              </label>
              <label>Preço particular (R$)
                <Input mt={1} type="number" min="0.01" max="1000000" step="0.01" value={preco} onChange={(evento) => setPreco(evento.target.value)} required />
              </label>
            </SimpleGrid>
            <Button type="submit" disabled={salvando || !codigoExame || !preco}>{salvando ? "Salvando oferta..." : "Salvar oferta"}</Button>
          </Stack>
        </Box>
      </Card>

      <Card>
        <Stack gap={4}>
          <Box>
            <Text as="h2" fontWeight="bold" fontSize="lg">Convênios aceitos ({conveniosSelecionados.length}/10 selecionados · mínimo 5)</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">Selecione pelo menos cinco convênios. Os IDs do catálogo são usados para recomendar ofertas a pacientes compatíveis.</Text>
          </Box>
          <Flex wrap="wrap" gap={2}>
            {convenios.map((convenio) => {
              const selecionado = conveniosSelecionados.includes(convenio.id);
              const bloqueado = !selecionado && conveniosSelecionados.length >= 10;
              return <Button key={convenio.id} type="button" size="sm" variant={selecionado ? "solid" : "outline"} disabled={bloqueado} onClick={() => alternarConvenio(convenio.id)}>{convenio.nome}</Button>;
            })}
          </Flex>
          <Button type="button" variant="outline" disabled={salvando || conveniosSelecionados.length < 5} onClick={salvarConvenios}>{salvando ? "Salvando..." : "Salvar convênios"}</Button>
        </Stack>
      </Card>

      <Card>
        <Stack as="form" onSubmit={publicarHorario} gap={4}>
          <Box>
            <Text as="h2" fontWeight="bold" fontSize="lg">Disponibilidade de horários</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">Publique horários futuros para que pacientes possam solicitar agendamento.</Text>
          </Box>
          <Flex direction={{ base: "column", sm: "row" }} gap={3}>
            <Input aria-label="Novo horário disponível" type="datetime-local" value={novoHorario} onChange={(evento) => setNovoHorario(evento.target.value)} required />
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
        <Text as="h2" id="titulo-agendamentos-clinica" fontSize="lg" fontWeight="bold">Solicitações de agendamento ({agendamentos.length})</Text>
        {agendamentos.length === 0 && <Text color="var(--color-text-muted)">Nenhuma solicitação recebida.</Text>}
        {agendamentos.map((agendamento) => {
          const dataHora = agendamento.dataHora?._seconds != null
            ? new Date(agendamento.dataHora._seconds * 1000)
            : new Date(agendamento.dataHora);
          return <Card key={agendamento.id}><Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
            <Stack gap={1}><Text fontWeight="bold">{agendamento.nomeExame}</Text><Text fontSize="sm" color="var(--color-text-muted)">{dataHora.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })} · Paciente {agendamento.clienteNome || agendamento.nomeCliente || agendamento.cliente?.nome || agendamento.clienteUid}</Text><Text fontSize="sm">Status: {agendamento.status}</Text></Stack>
            <Flex gap={2} wrap="wrap">
              {agendamento.status === "pendente" && <><Button type="button" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "confirmar")}>Confirmar</Button><Button type="button" variant="outline" colorPalette="red" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "recusar")}>Recusar</Button></>}
              {agendamento.status === "confirmado" && <Button type="button" disabled={removendo === agendamento.id} onClick={() => alterarAgendamento(agendamento.id, "concluir")}>Marcar como concluído</Button>}
            </Flex>
          </Flex></Card>;
        })}
        {proximoAgendamentoCursor && <Button type="button" variant="outline" onClick={carregarMaisAgendamentos} disabled={carregandoMaisAgendamentos}>{carregandoMaisAgendamentos ? "Carregando..." : "Carregar mais solicitações"}</Button>}
      </Stack>

      <Stack as="section" mt={7} gap={3} aria-labelledby="titulo-ofertas-clinica">
        <Text as="h2" id="titulo-ofertas-clinica" fontSize="lg" fontWeight="bold">Ofertas ativas ({ofertas.length})</Text>
        {ofertas.length === 0 && <Text color="var(--color-text-muted)">Você ainda não publicou ofertas.</Text>}
        {ofertas.map((oferta) => (
          <Card key={oferta.codigoExame}>
            <Flex justify="space-between" align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
              <Stack gap={1}>
                <Text fontWeight="bold">{oferta.nomeExame || examesPorCodigo.get(oferta.codigoExame)?.nome || "Exame"}</Text>
                <Text fontSize="sm" color="var(--color-text-muted)">TUSS {oferta.codigoExame} · {Number(oferta.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
              </Stack>
              <Flex gap={2}>
                <Button type="button" variant="outline" onClick={() => { setCodigoExame(oferta.codigoExame); setPreco(String(oferta.preco)); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar preço</Button>
                <Button type="button" variant="outline" colorPalette="red" disabled={removendo === oferta.codigoExame} onClick={() => desativarOferta(oferta)}>{removendo === oferta.codigoExame ? "Desativando..." : "Desativar"}</Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
