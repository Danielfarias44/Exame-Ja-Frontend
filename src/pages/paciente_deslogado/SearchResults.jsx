import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Container, Grid, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { cacheSearchResults, getExamCatalog, getInsurances, searchExamOffers } from "@/services/api";
import { obterSessaoAtual } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ListSkeleton from "@/components/ui/Skeleton";
import EstablishmentCard from "@/components/establishment/EstablishmentCard";
import EstablishmentMap from "@/components/establishment/EstablishmentMap";
import OfferActions from "@/components/establishment/OfferActions";
import LoginPrompt from "@/components/LoginPrompt";

const opcoesOrdenar = [
  { value: "distancia", label: "Mais perto" },
  { value: "preco", label: "Menor preço" },
];

function normalizar(texto = "") {
  return texto.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const codigoExame = searchParams.get("codigoExame") ?? "";
  const convenioId = searchParams.get("convenioId") ?? "";
  const ordenar = searchParams.get("ordenar") === "preco" ? "preco" : "distancia";
  const enderecoUrl = searchParams.get("endereco") ?? "";
  const latitudeUrl = searchParams.get("latitude");
  const longitudeUrl = searchParams.get("longitude");
  const [catalogo, setCatalogo] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [termoExame, setTermoExame] = useState(searchParams.get("q") ?? "");
  const [endereco, setEndereco] = useState(enderecoUrl);
  const [ofertas, setOfertas] = useState([]);
  const [total, setTotal] = useState(0);
  const [proximoOffset, setProximoOffset] = useState(null);
  const [carregandoMaisResultados, setCarregandoMaisResultados] = useState(false);
  const [erroMaisResultados, setErroMaisResultados] = useState("");
  const [status, setStatus] = useState("idle");
  const [statusCatalogo, setStatusCatalogo] = useState("loading");
  const [erroCatalogo, setErroCatalogo] = useState("");
  const [erroConvenios, setErroConvenios] = useState("");
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [tentativaCatalogo, setTentativaCatalogo] = useState(0);
  const [paginaCatalogo, setPaginaCatalogo] = useState(1);
  const [temMaisExames, setTemMaisExames] = useState(false);
  const [carregandoMaisExames, setCarregandoMaisExames] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [localizacao, setLocalizacao] = useState(() => latitudeUrl && longitudeUrl
    ? { latitude: Number(latitudeUrl), longitude: Number(longitudeUrl) }
    : null);
  const estaLogado = Boolean(obterSessaoAtual()?.autenticado);
  const chaveBusca = JSON.stringify({ codigoExame, convenioId, ordenar, enderecoUrl, localizacao });
  const chaveBuscaAtual = useRef(chaveBusca);

  useEffect(() => {
    chaveBuscaAtual.current = chaveBusca;
  }, [chaveBusca]);

  useEffect(() => {
    let ativo = true;
    Promise.allSettled([getExamCatalog({ page: 1, limit: 100 }), getInsurances()]).then(([resultadoCatalogo, resultadoConvenios]) => {
      if (!ativo) return;
      if (resultadoCatalogo.status === "rejected") {
        setErroCatalogo(resultadoCatalogo.reason.message || "Não foi possível carregar o catálogo TUSS.");
        setStatusCatalogo("error");
        return;
      }
      const pagina = resultadoCatalogo.value;
      setCatalogo(pagina.exams);
      setPaginaCatalogo(pagina.currentPage);
      setTemMaisExames(pagina.pages !== null
        ? pagina.currentPage < pagina.pages
        : pagina.total !== null
          ? pagina.currentPage * 100 < pagina.total
          : pagina.exams.length === 100);
      if (resultadoConvenios.status === "fulfilled") {
        setConvenios(resultadoConvenios.value);
        setErroConvenios("");
      } else {
        setConvenios([]);
        setErroConvenios(resultadoConvenios.reason.message || "Não foi possível carregar os convênios. A busca ainda pode ser feita sem esse filtro.");
      }
      setStatusCatalogo("ready");
    });
    return () => { ativo = false; };
  }, [tentativaCatalogo]);

  async function carregarMaisExames() {
    if (carregandoMaisExames || !temMaisExames) return;
    setCarregandoMaisExames(true);
    setErroCatalogo("");
    try {
      const proximaPagina = paginaCatalogo + 1;
      const resultado = await getExamCatalog({ page: proximaPagina, limit: 100 });
      setCatalogo((atuais) => {
        const codigos = new Set(atuais.map((exame) => exame.codigo));
        return [...atuais, ...resultado.exams.filter((exame) => !codigos.has(exame.codigo))];
      });
      setPaginaCatalogo(resultado.currentPage);
      setTemMaisExames(resultado.pages !== null
        ? resultado.currentPage < resultado.pages
        : resultado.total !== null
          ? resultado.currentPage * 100 < resultado.total
          : resultado.exams.length === 100);
    } catch (falha) {
      setErroCatalogo(falha.message || "Não foi possível carregar mais exames do catálogo.");
    } finally {
      setCarregandoMaisExames(false);
    }
  }

  useEffect(() => {
    if (!codigoExame || (!enderecoUrl && !localizacao)) {
      setOfertas([]);
      setTotal(0);
      setProximoOffset(null);
      setStatus("idle");
      return;
    }
    let ativo = true;
    const criterioLocal = enderecoUrl ? { endereco: enderecoUrl } : localizacao;
    setOfertas([]);
    setTotal(0);
    setProximoOffset(null);
    setErroMaisResultados("");
    setCarregandoMaisResultados(false);
    setStatus("loading");
    setErro("");
    (async () => {
      const primeira = await searchExamOffers({ codigoExame, ...criterioLocal, convenioId, ordenar, limit: 100, offset: 0 });
      if (ativo) {
        cacheSearchResults(primeira.offers);
        setOfertas(primeira.offers);
        setTotal(primeira.total);
        setProximoOffset(primeira.offset + primeira.limit < primeira.total
          ? primeira.offset + primeira.limit
          : null);
        setStatus("success");
      }
    })().catch((falha) => {
      if (ativo) {
        setErro(falha.message);
        setStatus("error");
      }
    });
    return () => { ativo = false; };
  }, [codigoExame, convenioId, ordenar, enderecoUrl, localizacao, tentativa]);

  async function carregarMaisResultados() {
    if (proximoOffset === null || carregandoMaisResultados) return;
    const chaveDaRequisicao = chaveBusca;
    setCarregandoMaisResultados(true);
    setErroMaisResultados("");
    try {
      const criterioLocal = enderecoUrl ? { endereco: enderecoUrl } : localizacao;
      const pagina = await searchExamOffers({
        codigoExame,
        ...criterioLocal,
        convenioId,
        ordenar,
        limit: 100,
        offset: proximoOffset,
      });
      if (chaveBuscaAtual.current !== chaveDaRequisicao) return;
      const ids = new Set(ofertas.map((oferta) => oferta.id));
      const novas = pagina.offers.filter((oferta) => !ids.has(oferta.id));
      const atualizadas = [...ofertas, ...novas];
      setOfertas(atualizadas);
      cacheSearchResults(atualizadas);
      setTotal(pagina.total);
      setProximoOffset(pagina.offset + pagina.limit < pagina.total
        ? pagina.offset + pagina.limit
        : null);
    } catch (falha) {
      if (chaveBuscaAtual.current === chaveDaRequisicao) {
        setErroMaisResultados(falha.message || "Não foi possível carregar mais resultados.");
      }
    } finally {
      if (chaveBuscaAtual.current === chaveDaRequisicao) setCarregandoMaisResultados(false);
    }
  }

  const examesFiltrados = useMemo(() => {
    const termo = normalizar(termoExame.trim());
    return termo ? catalogo.filter((exame) => normalizar(`${exame.nome} ${exame.codigo}`).includes(termo)) : catalogo;
  }, [catalogo, termoExame]);
  const clinicasNoMapa = useMemo(() => {
    const porClinica = new Map();
    ofertas.forEach((oferta) => {
      const anterior = porClinica.get(oferta.clinicId);
      if (!anterior || oferta.price < anterior.price) porClinica.set(oferta.clinicId, { ...oferta, id: oferta.clinicId });
    });
    return [...porClinica.values()];
  }, [ofertas]);
  const exameSelecionado = catalogo.find((exame) => exame.codigo === codigoExame);

  function atualizarBusca(mudancas) {
    const proximos = new URLSearchParams(searchParams);
    Object.entries(mudancas).forEach(([chave, valor]) => {
      if (valor !== "" && valor !== null && valor !== undefined) {
        proximos.set(chave, String(valor));
      } else {
        proximos.delete(chave);
      }
    });
    proximos.delete("offset");
    setSearchParams(proximos);
  }

  function buscarComEndereco(evento) {
    evento.preventDefault();
    setLocalizacao(null);
    atualizarBusca({ endereco: endereco.trim(), latitude: "", longitude: "" });
  }

  function buscarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErro("Este navegador não oferece acesso à localização. Informe um endereço.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const posicao = { latitude: coords.latitude, longitude: coords.longitude };
      setEndereco("");
      setLocalizacao(posicao);
      atualizarBusca({ endereco: "", latitude: posicao.latitude, longitude: posicao.longitude });
      setLocalizando(false);
    }, () => {
      setErro("Não foi possível obter sua localização. Informe um endereço para continuar.");
      setLocalizando(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }

  return (
    <Container maxW="var(--container-max)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py={{ base: "var(--space-6)", md: "var(--space-8)" }}>
      <PageHeader title={exameSelecionado ? `Clínicas para ${exameSelecionado.nome}` : "Buscar clínicas e exames"} description="Selecione um exame do catálogo TUSS e informe sua localização para encontrar clínicas próximas." />
      <Stack gap="var(--space-6)">
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="var(--space-4)">
          <Stack gap="var(--space-2)">
            <Text as="label" htmlFor="buscaExame" fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">Buscar exame no catálogo TUSS</Text>
            <Input id="buscaExame" value={termoExame} onChange={(event) => setTermoExame(event.target.value)} placeholder="Digite o nome ou código TUSS" />
            <Select name="codigoExame" label="Exame" placeholder="Selecione o exame" options={examesFiltrados.map((exame) => ({ value: exame.codigo, label: `${exame.nome} (${exame.codigo})` }))} value={codigoExame} onChange={(event) => atualizarBusca({ codigoExame: event.target.value })} />
            {termoExame.trim() && examesFiltrados.length === 0 && temMaisExames && <Text fontSize="var(--text-xs)" color="var(--color-text-muted)">Este termo não está nas páginas carregadas. Carregue mais exames para continuar procurando.</Text>}
            {statusCatalogo === "ready" && temMaisExames && <Button type="button" size="sm" variant="outline" onClick={carregarMaisExames} disabled={carregandoMaisExames}>{carregandoMaisExames ? "Carregando exames..." : `Carregar mais exames (página ${paginaCatalogo + 1})`}</Button>}
          </Stack>
          <Stack as="form" onSubmit={buscarComEndereco} gap="var(--space-2)">
            <Text as="label" htmlFor="enderecoBusca" fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">Localização (necessária)</Text>
            <Input id="enderecoBusca" value={endereco} onChange={(event) => setEndereco(event.target.value)} placeholder="Rua, bairro, cidade ou CEP" />
            <Stack direction={{ base: "column", sm: "row" }}>
              <Button type="submit" disabled={!endereco.trim()}>Buscar por endereço</Button>
              <Button type="button" variant="outline" onClick={buscarMinhaLocalizacao} disabled={localizando}>{localizando ? "Localizando..." : "Usar minha localização"}</Button>
            </Stack>
          </Stack>
        </SimpleGrid>
        {statusCatalogo === "error" && <ErrorState title="Não foi possível carregar exames e convênios" description={erroCatalogo} onRetry={() => { setErroCatalogo(""); setCatalogo([]); setStatusCatalogo("loading"); setTentativaCatalogo((atual) => atual + 1); }} />}
        {statusCatalogo === "ready" && erroCatalogo && <Text role="alert" color="var(--color-error)">{erroCatalogo}</Text>}
        {erroConvenios && <Text role="status" fontSize="var(--text-sm)" color="var(--color-text-muted)">{erroConvenios}</Text>}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-4)" maxW="40rem">
          <Select name="convenioId" label="Convênio" placeholder="Qualquer convênio" options={convenios.map((item) => ({ value: item.id, label: item.name }))} value={convenioId} onChange={(event) => atualizarBusca({ convenioId: event.target.value })} />
          <Select name="ordenar" label="Ordenar por" options={opcoesOrdenar} value={ordenar} onChange={(event) => atualizarBusca({ ordenar: event.target.value })} />
        </SimpleGrid>

        {!estaLogado && <LoginPrompt action="conversar com uma clínica" />}
        <Text aria-live="polite" color="var(--color-text-muted)" fontSize="var(--text-sm)">
          {statusCatalogo === "loading" ? "Carregando exames e convênios..." : status === "loading" ? "Buscando clínicas..." : status === "success" ? `${total} ${total === 1 ? "resultado encontrado" : "resultados encontrados"}` : "Selecione um exame e informe um endereço ou sua localização para buscar."}
        </Text>
        {erro && status !== "error" && <Text role="alert" color="var(--color-error)">{erro}</Text>}
        {status === "loading" && <ListSkeleton />}
        {status === "error" && <ErrorState title="Não foi possível realizar a busca" description={erro} onRetry={() => setTentativa((atual) => atual + 1)} />}
        {status === "success" && ofertas.length === 0 && <EmptyState description="Nenhuma clínica com oferta para este exame foi encontrada nessa localização e nos filtros escolhidos." />}
        {status === "success" && ofertas.length > 0 && (
          <Stack gap="var(--space-4)">
            <Text color="var(--color-text-muted)" fontSize="var(--text-xs)">Exibindo {ofertas.length} de {total} ofertas. O mapa acompanha os resultados carregados.</Text>
            <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }} gap="var(--space-6)" alignItems="start">
              <Stack gap="var(--space-4)" gridColumn={{ lg: "2" }} gridRow={{ lg: "1" }}><EstablishmentMap establishments={clinicasNoMapa} zoom={13} label="Mapa das clínicas encontradas" /></Stack>
              <Stack as="ul" role="list" gap="var(--space-4)" m={0} p={0} listStyleType="none" gridColumn={{ lg: "1" }} gridRow={{ lg: "1" }}>
                {ofertas.map((oferta) => <li key={oferta.id}><EstablishmentCard establishment={oferta} actions={<OfferActions oferta={oferta} estaLogado={estaLogado} />} /></li>)}
              </Stack>
            </Grid>
            {erroMaisResultados && <Text role="alert" color="var(--color-error)">{erroMaisResultados}</Text>}
            {proximoOffset !== null && <Button type="button" variant="outline" onClick={carregarMaisResultados} disabled={carregandoMaisResultados}>{carregandoMaisResultados ? "Carregando clínicas..." : "Carregar mais resultados"}</Button>}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
