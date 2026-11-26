import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Container, Grid, Heading, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, cacheSearchResults, getExamCatalog, getInsurances, searchExamOffers } from "@/services/api";
import { ehPaciente } from "@/services/autenticacaoService";
import { useSessao } from "@/hooks/useSessao";
import Button from "@/components/ui/Button";
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
const TAMANHO_PAGINA = 20;

const estiloCampo = {
  minH: "var(--touch-target-min)",
  bg: "var(--color-surface)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  borderWidth: "var(--border-width-strong)",
  borderColor: "var(--color-border)",
  borderRadius: "var(--radius-md)",
  _focusVisible: {
    outline: "var(--border-width-strong) solid var(--color-focus)",
    outlineOffset: "2px",
    borderColor: "var(--color-focus)",
  },
};

const estiloRotulo = {
  display: "block",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-bold)",
  mb: "var(--space-1)",
};

function lerLocalizacaoDaUrl(searchParams) {
  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));
  return searchParams.get("latitude") && searchParams.get("longitude")
    && Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
}

function calcularProximoOffset(pagina) {
  return pagina.offset + pagina.limit < pagina.total ? pagina.offset + pagina.limit : null;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessao = useSessao();
  const paciente = ehPaciente(sessao);
  const estaLogado = Boolean(sessao?.autenticado);
  const idEndereco = useId();
  const idPrecoMinimo = useId();
  const idPrecoMaximo = useId();
  const campoExameRef = useRef(null);
  const botaoLocalizacaoRef = useRef(null);
  const campoPrecoMinimoRef = useRef(null);
  const convenioVeioDaUrl = useRef(Boolean(searchParams.get("convenioId")));

  const [catalogo, setCatalogo] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [codigoExame, setCodigoExame] = useState(searchParams.get("codigoExame") || "");
  const [convenioId, setConvenioId] = useState(searchParams.get("convenioId") || "");
  const [ordenar, setOrdenar] = useState(searchParams.get("ordenar") || "distancia");
  const [raioKm, setRaioKm] = useState(searchParams.get("raioKm") || "10");
  const [precoMinimo, setPrecoMinimo] = useState(searchParams.get("precoMinimo") || "");
  const [precoMaximo, setPrecoMaximo] = useState(searchParams.get("precoMaximo") || "");
  const [endereco, setEndereco] = useState("");
  const [localizacao, setLocalizacao] = useState(() => lerLocalizacaoDaUrl(searchParams));
  const [rotuloLocalizacao, setRotuloLocalizacao] = useState(() => (lerLocalizacaoDaUrl(searchParams) ? "Local da última busca" : ""));
  const [centroMapa, setCentroMapa] = useState(localizacao);
  const [ofertas, setOfertas] = useState([]);
  const [total, setTotal] = useState(0);
  const [clinicasSemCoordenadas, setClinicasSemCoordenadas] = useState(0);
  const [erro, setErro] = useState("");
  const [erroBusca, setErroBusca] = useState("");
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [erroConvenios, setErroConvenios] = useState("");
  const [erroLocalizacao, setErroLocalizacao] = useState("");
  const [status, setStatus] = useState(() => (searchParams.get("codigoExame") && lerLocalizacaoDaUrl(searchParams) ? "loading" : "idle"));
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(true);
  const [localizando, setLocalizando] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);
  const [paginaCatalogo, setPaginaCatalogo] = useState(1);
  const [temMaisExames, setTemMaisExames] = useState(false);
  const [carregandoMaisExames, setCarregandoMaisExames] = useState(false);
  const [proximoOffset, setProximoOffset] = useState(null);
  const [carregandoMaisResultados, setCarregandoMaisResultados] = useState(false);
  const [tentativaBusca, setTentativaBusca] = useState(0);

  const codigoUrl = searchParams.get("codigoExame") || "";
  const convenioUrl = searchParams.get("convenioId") || "";
  const ordenarUrl = searchParams.get("ordenar") || "distancia";
  const raioUrl = searchParams.get("raioKm") || "10";
  const latitudeUrl = searchParams.get("latitude");
  const longitudeUrl = searchParams.get("longitude");
  const precoMinimoUrl = searchParams.get("precoMinimo") || "";
  const precoMaximoUrl = searchParams.get("precoMaximo") || "";
  const buscaAtiva = Boolean(codigoUrl && latitudeUrl && longitudeUrl);

  useEffect(() => {
    let ativo = true;
    getInsurances().then((resultado) => { if (ativo) setConvenios(resultado); })
      .catch((falha) => { if (ativo) setErroConvenios(falha.message || "Não foi possível carregar os convênios."); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
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
    if (!paciente || convenioVeioDaUrl.current) return undefined;
    let ativo = true;
    apiRequest("/api/users/me").then(({ usuario }) => {
      const planoDoPaciente = usuario?.convenios?.[0];
      if (ativo && planoDoPaciente) setConvenioId((atual) => atual || planoDoPaciente);
    }).catch(() => {});
    return () => { ativo = false; };
  }, [paciente]);

  useEffect(() => {
    if (!buscaAtiva) return undefined;
    let ativo = true;
    searchExamOffers({
      codigoExame: codigoUrl,
      latitude: Number(latitudeUrl),
      longitude: Number(longitudeUrl),
      convenioId: convenioUrl,
      ordenar: ordenarUrl,
      raioKm: raioUrl,
      precoMinimo: precoMinimoUrl,
      precoMaximo: precoMaximoUrl,
      limit: TAMANHO_PAGINA,
      offset: 0,
    }).then((resultado) => {
      if (!ativo) return;
      cacheSearchResults(resultado.offers);
      setOfertas(resultado.offers);
      setTotal(resultado.total);
      setClinicasSemCoordenadas(Number(resultado.raw?.clinicasSemCoordenadas) || 0);
      setProximoOffset(calcularProximoOffset(resultado));
      if (resultado.location) {
        setCentroMapa({ latitude: resultado.location.latitude, longitude: resultado.location.longitude });
      }
      setStatus("success");
    }).catch((falha) => {
      if (!ativo) return;
      setErroBusca(falha.message || "Não foi possível buscar clínicas.");
      setStatus("error");
    });
    return () => { ativo = false; };
  }, [buscaAtiva, codigoUrl, convenioUrl, ordenarUrl, raioUrl, latitudeUrl, longitudeUrl, precoMinimoUrl, precoMaximoUrl, tentativaBusca]);

  const clinicasNoMapa = useMemo(() => {
    const porClinica = new Map();
    ofertas.forEach((oferta) => {
      const anterior = porClinica.get(oferta.clinicId);
      const maisBarata = Number.isFinite(oferta.price)
        && (!anterior || !Number.isFinite(anterior.price) || oferta.price < anterior.price);
      if (!anterior || maisBarata) porClinica.set(oferta.clinicId, { ...oferta, id: oferta.clinicId });
    });
    return [...porClinica.values()];
  }, [ofertas]);

  function executarBusca(alteracoes = {}) {
    const valores = { codigoExame, convenioId, ordenar, raioKm, precoMinimo, precoMaximo, localizacao, ...alteracoes };
    setErro("");
    if (!valores.codigoExame) {
      setErro("Selecione o exame que deseja encontrar.");
      campoExameRef.current?.focus();
      return;
    }
    if (!valores.localizacao) {
      setErroLocalizacao("Use sua localização ou informe um endereço antes de buscar.");
      botaoLocalizacaoRef.current?.focus();
      return;
    }
    if (valores.precoMinimo && valores.precoMaximo && Number(valores.precoMinimo) > Number(valores.precoMaximo)) {
      setErro("O preço mínimo não pode ser maior que o preço máximo.");
      campoPrecoMinimoRef.current?.focus();
      return;
    }
    const params = new URLSearchParams({
      codigoExame: valores.codigoExame,
      latitude: String(valores.localizacao.latitude),
      longitude: String(valores.localizacao.longitude),
      ordenar: valores.ordenar,
      raioKm: valores.raioKm,
    });
    if (valores.convenioId) params.set("convenioId", valores.convenioId);
    if (valores.precoMinimo) params.set("precoMinimo", valores.precoMinimo);
    if (valores.precoMaximo) params.set("precoMaximo", valores.precoMaximo);
    setErroBusca("");
    setStatus("loading");
    setSearchParams(params);
    setTentativaBusca((atual) => atual + 1);
  }

  function alterarFiltro(definir, chave) {
    return (evento) => {
      const valor = evento.target.value;
      definir(valor);
      if (buscaAtiva && (chave !== "codigoExame" || valor)) executarBusca({ [chave]: valor });
    };
  }

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
    } catch (falha) { setErroCatalogo(falha.message || "Não foi possível carregar mais exames."); }
    finally { setCarregandoMaisExames(false); }
  }

  function aplicarLocalizacao(coordenadas, rotulo) {
    setLocalizacao(coordenadas);
    setCentroMapa(coordenadas);
    setRotuloLocalizacao(rotulo);
    setErroLocalizacao("");
    if (codigoExame) executarBusca({ localizacao: coordenadas });
  }

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErroLocalizacao("Este navegador não oferece acesso à localização. Informe um endereço.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setEndereco("");
      aplicarLocalizacao({ latitude: coords.latitude, longitude: coords.longitude }, "Sua localização atual");
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
        limit: TAMANHO_PAGINA,
        offset: proximoOffset,
      });
      setOfertas((atuais) => {
        const ids = new Set(atuais.map((oferta) => oferta.id));
        const atualizadas = [...atuais, ...pagina.offers.filter((oferta) => !ids.has(oferta.id))];
        cacheSearchResults(atualizadas);
        return atualizadas;
      });
      setClinicasSemCoordenadas((atual) => Number(pagina.raw?.clinicasSemCoordenadas) || atual);
      setProximoOffset(calcularProximoOffset(pagina));
    } catch (falha) { setErro(falha.message || "Não foi possível carregar mais clínicas."); }
    finally { setCarregandoMaisResultados(false); }
  }

  const exameSelecionado = catalogo.find((exame) => exame.codigo === codigoUrl);
  const nomeExameBuscado = exameSelecionado?.nome || ofertas[0]?.exam;
  const opcoesExame = catalogo.map((exame) => ({ value: exame.codigo, label: `${exame.nome} (${exame.codigo})` }));
  if (codigoExame && !catalogo.some((exame) => exame.codigo === codigoExame)) {
    const nome = ofertas.find((oferta) => oferta.examCode === codigoExame)?.exam;
    opcoesExame.unshift({ value: codigoExame, label: nome ? `${nome} (${codigoExame})` : `Exame ${codigoExame}` });
  }
  const statusVisivel = buscaAtiva ? status : "idle";

  return (
    <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py={{ base: "var(--space-6)", md: "var(--space-8)" }}>
      <PageHeader title="Encontre clínicas perto de você" description="Escolha um exame, informe onde procurar e compare opções por distância, preço e convênio." />

      <Grid templateColumns={{ base: "1fr", xl: "minmax(20rem, 0.85fr) minmax(0, 1.5fr)" }} gap={{ base: "var(--space-4)", xl: "var(--space-6)" }} mt="var(--space-6)" alignItems="start">
        <Stack gap="var(--space-4)" p={{ base: "var(--space-4)", md: "var(--space-6)" }} bg="var(--color-surface)" borderWidth="var(--border-width)" borderStyle="solid" borderColor="var(--color-border-soft)" borderRadius="var(--radius-lg)" boxShadow="var(--shadow-sm)">
          <Box>
            <Heading as="h2" fontSize="var(--text-lg)">O que você precisa?</Heading>
            <Text fontSize="var(--text-sm)" color="var(--color-text-muted)" mt="var(--space-1)">A busca usa ofertas publicadas pelas clínicas.</Text>
          </Box>
          <Stack gap="var(--space-2)">
            <Select ref={campoExameRef} name="codigoExame" label="Exame do catálogo TUSS" placeholder={carregandoCatalogo ? "Carregando exames…" : "Selecione um exame"} options={opcoesExame} value={codigoExame} onChange={alterarFiltro(setCodigoExame, "codigoExame")} disabled={carregandoCatalogo} required />
            {temMaisExames && <Button type="button" variant="outline" onClick={carregarMaisExames} disabled={carregandoMaisExames}>{carregandoMaisExames ? "Carregando…" : "Carregar mais exames"}</Button>}
            {erroCatalogo && <Text role="alert" fontSize="var(--text-sm)" color="var(--color-error)">{erroCatalogo}</Text>}
          </Stack>

          <Box h="var(--border-width)" bg="var(--color-border-soft)" />
          <Stack gap="var(--space-2)">
            <Text fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">Onde procurar?</Text>
            <Button ref={botaoLocalizacaoRef} type="button" variant="outline" onClick={usarMinhaLocalizacao} disabled={localizando}>{localizando ? "Obtendo localização…" : "Usar minha localização"}</Button>
            <Stack as="form" onSubmit={localizarEndereco} gap="var(--space-2)">
              <Text as="label" htmlFor={idEndereco} {...estiloRotulo}>Ou informe um endereço</Text>
              <Stack direction={{ base: "column", sm: "row" }} gap="var(--space-2)">
                <Input id={idEndereco} {...estiloCampo} value={endereco} onChange={(evento) => setEndereco(evento.target.value)} placeholder="Rua, bairro, cidade ou CEP" autoComplete="street-address" />
                <Button type="submit" variant="outline" disabled={geocodificando || !endereco.trim()}>{geocodificando ? "Localizando…" : "Usar endereço"}</Button>
              </Stack>
            </Stack>
            {localizacao && <Text fontSize="var(--text-sm)" color="var(--color-text)" aria-live="polite"><Text as="span" aria-hidden="true">✓ </Text>Buscando perto de: {rotuloLocalizacao || "local definido"}</Text>}
            {erroLocalizacao && <Text role="alert" fontSize="var(--text-sm)" color="var(--color-error)">{erroLocalizacao}</Text>}
          </Stack>

          <Box h="var(--border-width)" bg="var(--color-border-soft)" />
          <Heading as="h3" fontSize="var(--text-sm)">Filtros da busca</Heading>
          <Select name="convenioId" label="Convênio" placeholder="Todos os convênios" options={convenios.map((item) => ({ value: item.id, label: item.name }))} value={convenioId} onChange={alterarFiltro(setConvenioId, "convenioId")} helperText={paciente ? "Preenchido com o convênio do seu perfil. Você pode trocar só nesta busca." : undefined} />
          {erroConvenios && <Text role="alert" fontSize="var(--text-sm)" color="var(--color-error)">{erroConvenios}</Text>}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-3)">
            <Select name="raioKm" label="Distância máxima" options={raios} value={raioKm} onChange={alterarFiltro(setRaioKm, "raioKm")} />
            <Select name="ordenar" label="Ordenar por" options={ordenacoes} value={ordenar} onChange={alterarFiltro(setOrdenar, "ordenar")} />
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-3)">
            <Box>
              <Text as="label" htmlFor={idPrecoMinimo} {...estiloRotulo}>Preço mínimo (R$)</Text>
              <Input ref={campoPrecoMinimoRef} id={idPrecoMinimo} {...estiloCampo} type="number" inputMode="decimal" min="0" step="0.01" value={precoMinimo} onChange={(evento) => setPrecoMinimo(evento.target.value)} />
            </Box>
            <Box>
              <Text as="label" htmlFor={idPrecoMaximo} {...estiloRotulo}>Preço máximo (R$)</Text>
              <Input id={idPrecoMaximo} {...estiloCampo} type="number" inputMode="decimal" min="0" step="0.01" value={precoMaximo} onChange={(evento) => setPrecoMaximo(evento.target.value)} placeholder="Sem limite" />
            </Box>
          </SimpleGrid>
          {erro && <Text role="alert" color="var(--color-error)" fontSize="var(--text-sm)">{erro}</Text>}
          <Button type="button" onClick={() => executarBusca()} disabled={carregandoCatalogo || statusVisivel === "loading"}>{statusVisivel === "loading" ? "Buscando clínicas…" : buscaAtiva ? "Atualizar busca" : "Buscar clínicas"}</Button>
        </Stack>

        <Stack gap="var(--space-4)">
          <Box bg="var(--color-surface)" borderWidth="var(--border-width)" borderStyle="solid" borderColor="var(--color-border-soft)" borderRadius="var(--radius-lg)" overflow="hidden" boxShadow="var(--shadow-sm)">
            {centroMapa ? <EstablishmentMap key={`${centroMapa.latitude}-${centroMapa.longitude}`} establishments={clinicasNoMapa} center={centroMapa} zoom={13} label="Mapa de clínicas próximas" /> : <MapaVazio />}
          </Box>
          <Box>
            <Heading as="h2" fontSize="var(--text-lg)">{nomeExameBuscado ? `Ofertas de ${nomeExameBuscado}` : "Clínicas recomendadas"}</Heading>
            <Text fontSize="var(--text-sm)" color="var(--color-text-muted)" mt="var(--space-1)" aria-live="polite">
              {statusVisivel === "loading" ? "Buscando ofertas…" : statusVisivel === "success" ? `${total} ${total === 1 ? "oferta encontrada" : "ofertas encontradas"}` : "Informe localização e exame para ver clínicas no mapa."}
            </Text>
            {statusVisivel === "success" && ofertas.length > 0 && clinicasSemCoordenadas > 0 && (
              <Text fontSize="var(--text-sm)" color="var(--color-text-muted)" mt="var(--space-1)">
                {clinicasSemCoordenadas === 1
                  ? "1 clínica com este exame não aparece no mapa porque ainda não tem o endereço localizado."
                  : `${clinicasSemCoordenadas} clínicas com este exame não aparecem no mapa porque ainda não têm o endereço localizado.`}
              </Text>
            )}
          </Box>
          {statusVisivel === "loading" && <ListSkeleton count={3} />}
          {statusVisivel === "error" && <ErrorState title="A busca não foi concluída" description={erroBusca} onRetry={() => executarBusca()} />}
          {statusVisivel === "success" && ofertas.length === 0 && <EmptyState title="Nenhuma oferta compatível encontrada" description={clinicasSemCoordenadas > 0 ? `${clinicasSemCoordenadas} clínicas não aparecem porque ainda não têm o endereço localizado. Também pode não haver ofertas publicadas para este exame e convênio; tente ampliar a distância ou alterar os filtros.` : "Não há ofertas publicadas para este exame e localização com os filtros escolhidos. Tente ampliar a distância, alterar o convênio ou buscar outro exame."} />}
          {statusVisivel === "success" && ofertas.map((oferta) => <EstablishmentCard key={oferta.id} establishment={oferta} actions={<OfferActions oferta={oferta} ehPaciente={paciente} estaLogado={estaLogado} />} />)}
          {statusVisivel === "success" && proximoOffset !== null && <Button type="button" variant="outline" onClick={carregarMaisResultados} disabled={carregandoMaisResultados}>{carregandoMaisResultados ? "Carregando clínicas…" : "Carregar mais clínicas"}</Button>}
        </Stack>
      </Grid>
    </Container>
  );
}

function MapaVazio() {
  return (
    <Box minH="var(--map-height)" display="grid" placeItems="center" px="var(--space-6)" py="var(--space-8)" textAlign="center" bg="var(--color-bg)">
      <Stack maxW="48ch" gap="var(--space-2)">
        <Text fontSize="var(--text-2xl)" aria-hidden="true">⌖</Text>
        <Heading as="h3" fontSize="var(--text-base)">Seu mapa de clínicas</Heading>
        <Text fontSize="var(--text-sm)" color="var(--color-text-muted)">Use sua localização ou informe um endereço para centralizar a busca e ver as opções mais próximas.</Text>
      </Stack>
    </Box>
  );
}
