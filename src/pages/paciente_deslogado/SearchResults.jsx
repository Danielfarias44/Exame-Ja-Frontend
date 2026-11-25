import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Container, Grid, Heading, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, cacheSearchResults, getExamCatalog, getInsurances, searchExamOffers } from "@/services/api";
import { apiRequestWithCsrf } from "@/services/httpClient";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import EstablishmentCard from "@/components/establishment/EstablishmentCard";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import OfferActions from "@/components/establishment/OfferActions";

const ordenacoes = [
  { value: "distancia", label: "Menor distância" },
  { value: "preco", label: "Menor preço" },
];
const raios = [5, 10, 20, 30, 50].map((km) => ({ value: String(km), label: `Até ${km} km` }));

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogo, setCatalogo] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [codigoExame, setCodigoExame] = useState(searchParams.get("codigoExame") || "");
  const [convenioId, setConvenioId] = useState(searchParams.get("convenioId") || "");
  const [convenioPacienteId, setConvenioPacienteId] = useState("");
  const [ordenar, setOrdenar] = useState(searchParams.get("ordenar") || "distancia");
  const [raioKm, setRaioKm] = useState(searchParams.get("raioKm") || "10");
  const [precoMinimo, setPrecoMinimo] = useState(searchParams.get("precoMinimo") || "");
  const [precoMaximo, setPrecoMaximo] = useState(searchParams.get("precoMaximo") || "");
  const [endereco, setEndereco] = useState(searchParams.get("endereco") || "");
  const [localizacao, setLocalizacao] = useState(() => {
    const latitude = Number(searchParams.get("latitude"));
    const longitude = Number(searchParams.get("longitude"));
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  });
  const [centroMapa, setCentroMapa] = useState(localizacao);
  const [ofertas, setOfertas] = useState([]);
  const [total, setTotal] = useState(0);
  const [clinicasSemCoordenadas, setClinicasSemCoordenadas] = useState(0);
  const [erro, setErro] = useState("");
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [erroConvenios, setErroConvenios] = useState("");
  const [erroLocalizacao, setErroLocalizacao] = useState("");
  const [status, setStatus] = useState("idle");
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [localizando, setLocalizando] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [paginaCatalogo, setPaginaCatalogo] = useState(1);
  const [temMaisExames, setTemMaisExames] = useState(false);
  const [carregandoMaisExames, setCarregandoMaisExames] = useState(false);
  const [proximoOffset, setProximoOffset] = useState(null);
  const [carregandoMaisResultados, setCarregandoMaisResultados] = useState(false);
  const [tentativaBusca, setTentativaBusca] = useState(0);
  const estaLogado = Boolean(obterSessaoAtual()?.autenticado);

  function limparResultados() {
    setOfertas([]);
    setTotal(0);
    setProximoOffset(null);
    setClinicasSemCoordenadas(0);
    setStatus("idle");
    setErro("");
    setBuscando(false);
  }

  function limparLocalizacaoSalva() {
    const params = new URLSearchParams(searchParams);
    ["latitude", "longitude", "endereco", "codigoExame"].forEach((chave) => params.delete(chave));
    setSearchParams(params, { replace: true });
  }

  useEffect(() => {
    let ativo = true;
    getInsurances().then((resultado) => { if (ativo) setConvenios(resultado); })
      .catch((falha) => { if (ativo) setErroConvenios(falha.message || "Não foi possível carregar os convênios."); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    setCarregandoCatalogo(true);
    getExamCatalog({ page: 1, limit: 100 }).then((pagina) => {
        if (!ativo) return;
        setErroCatalogo("");
        setCatalogo(pagina.exams);
        setPaginaCatalogo(pagina.currentPage);
        setTemMaisExames(pagina.pages !== null ? pagina.currentPage < pagina.pages : pagina.exams.length === 100);
      }).catch((falha) => { if (ativo) setErroCatalogo(falha.message || "Não foi possível carregar os exames."); })
        .finally(() => { if (ativo) setCarregandoCatalogo(false); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!estaLogado || convenioId) return;
    let ativo = true;
    apiRequest("/api/users/me").then(({ usuario }) => {
      const planoDoPaciente = usuario?.convenios?.[0];
      if (!ativo) return;
      setConvenioPacienteId(planoDoPaciente || "");
      if (planoDoPaciente) {
        setConvenioId(planoDoPaciente);
        setSearchParams((params) => { const novos = new URLSearchParams(params); novos.set("convenioId", planoDoPaciente); return novos; }, { replace: true });
      }
    }).catch(() => {});
    return () => { ativo = false; };
  }, [estaLogado, convenioId, setSearchParams]);

  const clinicasNoMapa = useMemo(() => {
    const porClinica = new Map();
    ofertas.forEach((oferta) => {
      const anterior = porClinica.get(oferta.clinicId);
      if (!anterior || oferta.price < anterior.price) porClinica.set(oferta.clinicId, { ...oferta, id: oferta.clinicId });
    });
    return [...porClinica.values()];
  }, [ofertas]);

  async function carregarMaisExames() {
    if (!temMaisExames || carregandoMaisExames) return;
    setCarregandoMaisExames(true);
    try {
      const pagina = await getExamCatalog({ page: paginaCatalogo + 1, limit: 100 });
      setCatalogo((atuais) => {
        const codigos = new Set(atuais.map((exame) => exame.codigo));
        return [...atuais, ...pagina.exams.filter((exame) => !codigos.has(exame.codigo))];
      });
      setPaginaCatalogo(pagina.currentPage);
      setTemMaisExames(pagina.pages !== null ? pagina.currentPage < pagina.pages : pagina.exams.length === 100);
    } catch (falha) { setErroCatalogo(falha.message); }
    finally { setCarregandoMaisExames(false); }
  }

  function aplicarLocalizacao(coordenadas, textoEndereco = "") {
    setLocalizacao(coordenadas);
    setCentroMapa(coordenadas);
    setEndereco(textoEndereco);
    setErroLocalizacao("");
    limparResultados();
    limparLocalizacaoSalva();
  }

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErroLocalizacao("Este navegador não oferece acesso à localização. Informe um endereço.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      aplicarLocalizacao({ latitude: coords.latitude, longitude: coords.longitude });
      setLocalizando(false);
    }, () => {
      setErroLocalizacao("Não foi possível obter sua localização. Confira a permissão do navegador ou informe um endereço.");
      setLocalizando(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }

  async function localizarEndereco(evento) {
    evento.preventDefault();
    if (!endereco.trim()) return;
    setGeocodificando(true);
    setErroLocalizacao("");
    try {
      const resultado = await apiRequest(`/api/geocoding?endereco=${encodeURIComponent(`${endereco.trim()}, Brasil`)}`);
      if (!resultado.encontrado) throw new Error("Não encontramos esse endereço. Tente incluir bairro e cidade.");
      aplicarLocalizacao({ latitude: resultado.latitude, longitude: resultado.longitude }, resultado.enderecoFormatado || endereco.trim());
    } catch (falha) { setErroLocalizacao(falha.message || "Não foi possível localizar esse endereço."); }
    finally { setGeocodificando(false); }
  }

  async function buscar(evento) {
    evento?.preventDefault?.();
    setErro("");
    if (!codigoExame) { setErro("Selecione o exame que deseja encontrar."); return; }
    if (!localizacao) { setErroLocalizacao("Use sua localização ou informe um endereço antes de buscar."); return; }
    if (estaLogado && !convenioId) { setErro("Selecione seu convênio para receber recomendações compatíveis."); return; }
    if (precoMinimo && precoMaximo && Number(precoMinimo) > Number(precoMaximo)) { setErro("O preço mínimo não pode ser maior que o preço máximo."); return; }
    setBuscando(true);
    if (estaLogado && convenioPacienteId !== convenioId) {
      try {
        await apiRequestWithCsrf("/api/users/me", "PATCH", { convenios: [convenioId] });
        setConvenioPacienteId(convenioId);
      } catch (falha) {
        setErro(falha.message || "Não foi possível salvar seu convênio no perfil.");
        setBuscando(false);
        return;
      }
    }
    const params = new URLSearchParams({
      codigoExame,
      latitude: String(localizacao.latitude),
      longitude: String(localizacao.longitude),
      ordenar,
      raioKm,
    });
    if (convenioId) params.set("convenioId", convenioId);
    if (precoMinimo) params.set("precoMinimo", precoMinimo);
    if (precoMaximo) params.set("precoMaximo", precoMaximo);
    setSearchParams(params);
    setBuscando(true);
    setStatus("loading");
    setTentativaBusca((atual) => atual + 1);
  }

  const codigoUrl = searchParams.get("codigoExame") || "";
  const convenioUrl = searchParams.get("convenioId") || "";
  const ordenarUrl = searchParams.get("ordenar") || "distancia";
  const raioUrl = searchParams.get("raioKm") || "10";
  const latitudeUrl = searchParams.get("latitude");
  const longitudeUrl = searchParams.get("longitude");
  const precoMinimoUrl = searchParams.get("precoMinimo") || "";
  const precoMaximoUrl = searchParams.get("precoMaximo") || "";

  useEffect(() => {
    if (!codigoUrl || !latitudeUrl || !longitudeUrl) {
      setOfertas([]); setTotal(0); setProximoOffset(null); setStatus("idle"); setBuscando(false);
      return;
    }
    let ativo = true;
    setStatus("loading"); setErro(""); setOfertas([]); setTotal(0);
    searchExamOffers({
      codigoExame: codigoUrl,
      latitude: Number(latitudeUrl),
      longitude: Number(longitudeUrl),
      convenioId: convenioUrl,
      ordenar: ordenarUrl,
      raioKm: raioUrl,
      precoMinimo: precoMinimoUrl,
      precoMaximo: precoMaximoUrl,
      limit: 20,
      offset: 0,
    }).then((resultado) => {
      if (!ativo) return;
      cacheSearchResults(resultado.offers);
      setOfertas(resultado.offers);
      setTotal(resultado.total);
      setClinicasSemCoordenadas(Number(resultado.raw?.clinicasSemCoordenadas) || 0);
      setProximoOffset(resultado.offset + resultado.limit < resultado.total ? resultado.offset + resultado.limit : null);
      if (resultado.location) {
        setCentroMapa({ latitude: resultado.location.latitude, longitude: resultado.location.longitude });
      }
      setStatus("success"); setBuscando(false);
    }).catch((falha) => {
      if (!ativo) return;
      setErro(falha.message || "Não foi possível buscar clínicas."); setStatus("error"); setBuscando(false);
    });
    return () => { ativo = false; };
  }, [codigoUrl, convenioUrl, ordenarUrl, raioUrl, latitudeUrl, longitudeUrl, precoMinimoUrl, precoMaximoUrl, tentativaBusca]);

  async function carregarMaisResultados() {
    if (proximoOffset === null || carregandoMaisResultados) return;
    setCarregandoMaisResultados(true);
    try {
      const pagina = await searchExamOffers({
        codigoExame: codigoUrl,
        latitude: Number(latitudeUrl),
        longitude: Number(longitudeUrl),
        convenioId: convenioUrl,
        ordenar: ordenarUrl,
        raioKm: raioUrl,
        precoMinimo: precoMinimoUrl,
        precoMaximo: precoMaximoUrl,
        limit: 20,
        offset: proximoOffset,
      });
      setOfertas((atuais) => {
        const ids = new Set(atuais.map((oferta) => oferta.id));
        const atualizadas = [...atuais, ...pagina.offers.filter((oferta) => !ids.has(oferta.id))];
        cacheSearchResults(atualizadas);
        return atualizadas;
      });
      setClinicasSemCoordenadas(Number(pagina.raw?.clinicasSemCoordenadas) || clinicasSemCoordenadas);
      setProximoOffset(pagina.offset + pagina.limit < pagina.total ? pagina.offset + pagina.limit : null);
    } catch (falha) { setErro(falha.message || "Não foi possível carregar mais clínicas."); }
    finally { setCarregandoMaisResultados(false); }
  }

  const exameSelecionado = catalogo.find((exame) => exame.codigo === codigoUrl);

  return (
    <Container maxW="var(--container-max)" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Encontre clínicas perto de você" description="Escolha um exame, informe onde procurar e compare opções por distância, preço e convênio." />

      <Grid templateColumns={{ base: "1fr", xl: "minmax(320px, 0.85fr) minmax(0, 1.5fr)" }} gap={{ base: 5, xl: 6 }} mt={6} alignItems="start">
        <Stack gap={5} p={{ base: 4, md: 6 }} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-lg)" boxShadow="var(--shadow-sm)">
          <Box>
            <Heading as="h2" fontSize="var(--text-lg)">O que você precisa?</Heading>
            <Text fontSize="sm" color="var(--color-text-muted)" mt={1}>A busca usa ofertas publicadas pelas clínicas.</Text>
          </Box>
          <Stack gap={2}>
            <Select name="codigoExame" label="Exame do catálogo TUSS" placeholder={carregandoCatalogo ? "Carregando exames…" : "Selecione um exame"} options={catalogo.map((exame) => ({ value: exame.codigo, label: `${exame.nome} (${exame.codigo})` }))} value={codigoExame} onChange={(event) => { setCodigoExame(event.target.value); limparResultados(); }} disabled={carregandoCatalogo} required />
            {temMaisExames && <Button type="button" size="sm" variant="outline" onClick={carregarMaisExames} disabled={carregandoMaisExames}>{carregandoMaisExames ? "Carregando…" : "Carregar mais exames"}</Button>}
            {erroCatalogo && <Text role="alert" fontSize="sm" color="var(--color-error)">{erroCatalogo}</Text>}
          </Stack>

          <Box h="1px" bg="var(--color-border-soft)" />
          <Stack gap={2}>
            <Text fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">Onde procurar?</Text>
            <Button type="button" variant="outline" onClick={usarMinhaLocalizacao} disabled={localizando}>{localizando ? "Obtendo localização…" : "Usar minha localização"}</Button>
            <Text textAlign="center" fontSize="xs" color="var(--color-text-muted)">ou informe um endereço</Text>
            <Stack as="form" onSubmit={localizarEndereco} direction={{ base: "column", sm: "row" }} gap={2}>
              <Input aria-label="Endereço para busca" value={endereco} onChange={(event) => { setEndereco(event.target.value); setLocalizacao(null); setCentroMapa(null); limparResultados(); limparLocalizacaoSalva(); }} placeholder="Rua, bairro, cidade ou CEP" />
              <Button type="submit" variant="outline" disabled={geocodificando || !endereco.trim()}>{geocodificando ? "Localizando…" : "Usar endereço"}</Button>
            </Stack>
            {localizacao && <Text fontSize="xs" color="var(--color-success)">{endereco || "Localização atual definida"}</Text>}
            {erroLocalizacao && <Text role="alert" fontSize="sm" color="var(--color-error)">{erroLocalizacao}</Text>}
          </Stack>

          <Box h="1px" bg="var(--color-border-soft)" />
          <Heading as="h3" fontSize="var(--text-sm)">Filtros da busca</Heading>
          <Select name="convenioId" label="Convênio" placeholder={estaLogado ? "Selecione seu convênio" : "Todas as clínicas"} options={convenios.map((item) => ({ value: item.id, label: item.name }))} value={convenioId} onChange={(event) => { setConvenioId(event.target.value); limparResultados(); }} required={estaLogado} />
          {erroConvenios && <Text role="alert" fontSize="sm" color="var(--color-error)">{erroConvenios}</Text>}
          <SimpleGrid columns={2} gap={3}>
            <Select name="raioKm" label="Distância máxima" options={raios} value={raioKm} onChange={(event) => { setRaioKm(event.target.value); limparResultados(); }} />
            <Select name="ordenar" label="Ordenar por" options={ordenacoes} value={ordenar} onChange={(event) => { setOrdenar(event.target.value); limparResultados(); }} />
          </SimpleGrid>
          <SimpleGrid columns={2} gap={3}>
            <label><Text fontSize="sm" fontWeight="var(--weight-bold)" mb={1}>Preço mínimo</Text><Input type="number" min="0" step="0.01" value={precoMinimo} onChange={(event) => { setPrecoMinimo(event.target.value); limparResultados(); }} placeholder="R$ 0" /></label>
            <label><Text fontSize="sm" fontWeight="var(--weight-bold)" mb={1}>Preço máximo</Text><Input type="number" min="0" step="0.01" value={precoMaximo} onChange={(event) => { setPrecoMaximo(event.target.value); limparResultados(); }} placeholder="Sem limite" /></label>
          </SimpleGrid>
          {erro && <Text role="alert" color="var(--color-error)" fontSize="sm">{erro}</Text>}
          <Button type="button" onClick={buscar} disabled={buscando || carregandoCatalogo}>{buscando ? "Buscando clínicas…" : "Buscar clínicas"}</Button>
        </Stack>

        <Stack gap={4}>
          <Box bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-lg)" overflow="hidden" boxShadow="var(--shadow-sm)">
            {centroMapa ? <EstablishmentMap key={`${centroMapa.latitude}-${centroMapa.longitude}`} establishments={clinicasNoMapa} center={centroMapa} zoom={13} label="Mapa de clínicas próximas" /> : (
              <FlexMapaVazio />
            )}
          </Box>
          <Box>
            <Heading as="h2" fontSize="var(--text-lg)">{exameSelecionado ? `Ofertas de ${exameSelecionado.nome}` : "Clínicas recomendadas"}</Heading>
            <Text fontSize="sm" color="var(--color-text-muted)" mt={1} aria-live="polite">
              {status === "loading" ? "Buscando ofertas…" : status === "success" ? `${total} ${total === 1 ? "oferta encontrada" : "ofertas encontradas"}` : "Informe localização e exame para ver clínicas no mapa."}
            </Text>
          </Box>
          {status === "loading" && <ListSkeleton count={3} />}
          {status === "error" && <ErrorState title="A busca não foi concluída" description={erro} onRetry={buscar} />}
          {status === "success" && ofertas.length === 0 && <EmptyState title="Nenhuma oferta compatível encontrada" description={clinicasSemCoordenadas > 0 ? `${clinicasSemCoordenadas} clínicas não aparecem porque ainda não têm coordenadas atualizadas. Também pode não haver ofertas publicadas para este exame e convênio; tente ampliar a distância ou alterar os filtros.` : "Não há ofertas publicadas para este exame e localização com os filtros escolhidos. Tente ampliar a distância, alterar o convênio ou buscar outro exame."} />}
          {ofertas.map((oferta) => <EstablishmentCard key={oferta.id} establishment={oferta} actions={<OfferActions oferta={oferta} estaLogado={estaLogado} />} />)}
          {proximoOffset !== null && <Button type="button" variant="outline" onClick={carregarMaisResultados} disabled={carregandoMaisResultados}>{carregandoMaisResultados ? "Carregando clínicas…" : "Carregar mais clínicas"}</Button>}
        </Stack>
      </Grid>
    </Container>
  );
}

function FlexMapaVazio() {
  return (
    <Box minH={{ base: "280px", md: "420px" }} display="grid" placeItems="center" px={6} py={10} textAlign="center" bg="var(--color-bg)">
      <Stack maxW="360px" gap={2}>
        <Text fontSize="2xl" aria-hidden="true">⌖</Text>
        <Heading as="h3" fontSize="md">Seu mapa de clínicas</Heading>
        <Text fontSize="sm" color="var(--color-text-muted)">Use sua localização ou informe um endereço para centralizar a busca e ver as opções mais próximas.</Text>
      </Stack>
    </Box>
  );
}
