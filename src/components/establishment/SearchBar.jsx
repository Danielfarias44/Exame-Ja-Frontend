import { useEffect, useId, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { getExamCatalog } from "@/services/api";

const TEXTO_POR_ALINHAMENTO = { "flex-start": "left", center: "center", "flex-end": "right" };

function alinhamentoDoTexto(align) {
  if (typeof align === "string") return TEXTO_POR_ALINHAMENTO[align];
  return Object.fromEntries(Object.entries(align).map(([tela, valor]) => [tela, TEXTO_POR_ALINHAMENTO[valor]]));
}

export default function SearchBar({
  onSearch,
  label = "O que você procura?",
  align = "flex-start",
}) {
  const [codigoExame, setCodigoExame] = useState("");
  const [exames, setExames] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState("");
  const idCampo = useId();

  useEffect(() => {
    let ativo = true;
    getExamCatalog({ page: 1, limit: 100 })
      .then((resultado) => {
        if (!ativo) return;
        setExames(resultado.exams);
        setPagina(resultado.currentPage);
        setTemMais(resultado.pages !== null ? resultado.currentPage < resultado.pages : resultado.exams.length === 100);
      })
      .catch((falha) => { if (ativo) setErro(falha.message || "Não foi possível carregar o catálogo de exames."); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    if (codigoExame) onSearch(codigoExame);
  }

  async function carregarMais() {
    if (!temMais || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const resultado = await getExamCatalog({ page: pagina + 1, limit: 100 });
      setExames((atuais) => {
        const codigos = new Set(atuais.map((exame) => exame.codigo));
        return [...atuais, ...resultado.exams.filter((exame) => !codigos.has(exame.codigo))];
      });
      setPagina(resultado.currentPage);
      setTemMais(resultado.pages !== null ? resultado.currentPage < resultado.pages : resultado.exams.length === 100);
    } catch (falha) {
      setErro(falha.message || "Não foi possível carregar mais exames.");
    } finally {
      setCarregandoMais(false);
    }
  }

  return (
    <Box as="form" role="search" onSubmit={handleSubmit} w="100%">
      <Text
        as="label"
        htmlFor={idCampo}
        display="block"
        mb="var(--space-2)"
        fontFamily="var(--font-heading)"
        fontWeight="var(--weight-semibold)"
        fontSize="var(--text-sm)"
        color="var(--color-text)"
        textAlign={alinhamentoDoTexto(align)}
      >
        {label}
      </Text>

      <Flex
        align="center"
        bg="var(--color-surface)"
        borderWidth="var(--border-width-strong)"
        borderStyle="solid"
        borderColor="var(--color-primary)"
        borderRadius="var(--radius-lg)"
        p="var(--space-1)"
        boxShadow="var(--shadow-md)"
        _focusWithin={{
          outline: "var(--border-width-strong) solid var(--color-focus)",
          outlineOffset: "var(--focus-offset)",
        }}
      >
        <Box color="var(--color-primary)" px="var(--space-2)" aria-hidden="true" flexShrink={0}>
          <LuSearch />
        </Box>
        <Box
          as="select"
          id={idCampo}
          aria-label={label}
          value={codigoExame}
          onChange={(event) => setCodigoExame(event.target.value)}
          disabled={carregando}
          flex="1"
          minW="0"
          minH="var(--touch-target-min)"
          px="var(--space-2)"
          border="none"
          bg="transparent"
          color="var(--color-text)"
          fontFamily="var(--font-body)"
          fontSize="var(--text-sm)"
          _focusVisible={{ boxShadow: "none", outline: "none" }}
        >
          <option value="">{carregando ? "Carregando exames…" : "Selecione um exame do catálogo"}</option>
          {exames.map((exame) => <option key={exame.codigo} value={exame.codigo}>{exame.nome} ({exame.codigo})</option>)}
        </Box>
        <Button type="submit" flexShrink={0} disabled={!codigoExame || carregando}>
          Buscar
        </Button>
      </Flex>

      {temMais && <Button type="button" variant="outline" size="sm" mt="var(--space-3)" onClick={carregarMais} disabled={carregandoMais}>{carregandoMais ? "Carregando…" : "Carregar mais exames"}</Button>}
      {erro && <Text role="alert" mt="var(--space-2)" fontSize="var(--text-sm)" color="var(--color-error)">{erro}</Text>}
    </Box>
  );
}
