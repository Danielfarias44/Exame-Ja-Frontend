import { useCallback, useEffect, useRef, useState } from "react";

function chaveDoItem(item) {
  return item.uid ?? item.id;
}

const SEM_RESULTADO = { fonte: null, tentativa: -1, itens: [], proximoCursor: null, erro: "" };

export function useListaPaginada(buscarPagina) {
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState(SEM_RESULTADO);
  const [erroMais, setErroMais] = useState("");
  const [carregandoMais, setCarregandoMais] = useState(false);
  const fonteAtual = useRef(buscarPagina);

  useEffect(() => {
    fonteAtual.current = buscarPagina;
    let ativo = true;
    buscarPagina({})
      .then((pagina) => {
        if (ativo) setResultado({ fonte: buscarPagina, tentativa, itens: pagina.itens, proximoCursor: pagina.proximoCursor, erro: "" });
      })
      .catch((falha) => {
        if (ativo) setResultado({ fonte: buscarPagina, tentativa, itens: [], proximoCursor: null, erro: falha.message || "Não foi possível carregar a lista." });
      });
    return () => { ativo = false; };
  }, [buscarPagina, tentativa]);

  const atualizado = resultado.fonte === buscarPagina && resultado.tentativa === tentativa;
  const status = !atualizado ? "loading" : resultado.erro ? "error" : "ready";

  const recarregar = useCallback(() => {
    setErroMais("");
    setTentativa((atual) => atual + 1);
  }, []);

  async function carregarMais() {
    if (!resultado.proximoCursor || carregandoMais) return;
    const fonte = buscarPagina;
    setCarregandoMais(true);
    setErroMais("");
    try {
      const pagina = await fonte({ cursor: resultado.proximoCursor });
      if (fonteAtual.current !== fonte) return;
      setResultado((atual) => {
        const chaves = new Set(atual.itens.map(chaveDoItem));
        return {
          ...atual,
          itens: [...atual.itens, ...pagina.itens.filter((item) => !chaves.has(chaveDoItem(item)))],
          proximoCursor: pagina.proximoCursor,
        };
      });
    } catch (falha) {
      setErroMais(falha.message || "Não foi possível carregar mais itens.");
    } finally {
      setCarregandoMais(false);
    }
  }

  function atualizarItem(chave, alterar) {
    setResultado((atual) => ({
      ...atual,
      itens: atual.itens.map((item) => (chaveDoItem(item) === chave ? alterar(item) : item)),
    }));
  }

  function removerItem(chave) {
    setResultado((atual) => ({ ...atual, itens: atual.itens.filter((item) => chaveDoItem(item) !== chave) }));
  }

  return {
    itens: atualizado ? resultado.itens : [],
    status,
    erro: resultado.erro,
    erroMais,
    proximoCursor: atualizado ? resultado.proximoCursor : null,
    carregandoMais,
    recarregar,
    carregarMais,
    atualizarItem,
    removerItem,
  };
}
