import { useEffect, useState } from "react";
import { Box, Button, Container, Input, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { atualizarNomeSessao } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [convenios, setConvenios] = useState([]);
  const [conveniosSelecionados, setConveniosSelecionados] = useState([]);
  const [status, setStatus] = useState("loading");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([apiRequest("/api/users/me"), apiRequest("/api/convenios")])
      .then(([perfilData, conveniosData]) => {
        if (!ativo) return;
        const usuario = perfilData.usuario;
        setPerfil({ nome: usuario.nome ?? "", telefone: usuario.telefone ?? "", email: usuario.email ?? "", cpfCadastrado: usuario.cpfCadastrado });
        setConvenios(conveniosData.convenios ?? []);
        setConveniosSelecionados(Array.isArray(usuario.convenios) ? usuario.convenios : []);
        setStatus("ready");
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha.message);
        setStatus("error");
      });
    return () => { ativo = false; };
  }, []);

  function alternarConvenio(id) {
    setConveniosSelecionados((atuais) => atuais.includes(id)
      ? atuais.filter((item) => item !== id)
      : atuais.length < 10 ? [...atuais, id] : atuais);
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      const resultado = await apiRequestWithCsrf("/api/users/me", "PATCH", {
        nome: perfil.nome.trim(),
        telefone: perfil.telefone.trim(),
        convenios: conveniosSelecionados,
      });
      if (resultado.usuario) {
        const nome = resultado.usuario.nome ?? perfil.nome;
        setPerfil((atual) => ({ ...atual, nome, telefone: resultado.usuario.telefone ?? atual.telefone }));
        setConveniosSelecionados(Array.isArray(resultado.usuario.convenios)
          ? resultado.usuario.convenios
          : conveniosSelecionados);
        atualizarNomeSessao(nome);
      }
      setMensagem(resultado.message || "Perfil atualizado.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  if (status === "loading") return <Container py={8}><Text>Carregando perfil...</Text></Container>;
  if (status === "error") return <Container py={8}><ErrorState title="Não foi possível carregar o perfil" description={erro} /></Container>;

  return (
    <Container maxW="880px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }} pb={{ base: "110px", md: 12 }}>
      <PageHeader title="Meu perfil" description="Atualize os dados que o backend permite editar e seus convênios." />
      <Box as="form" onSubmit={salvar} mt={6} p={{ base: 5, md: 6 }} bg="var(--color-surface)" border="1px solid var(--color-border-soft)" borderRadius="var(--radius-lg)">
        <Stack gap={5}>
          {erro && <Text role="alert" color="var(--color-error)">{erro}</Text>}
          {mensagem && <Text role="status" color="var(--color-success)">{mensagem}</Text>}
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <label>Nome<Input value={perfil.nome} onChange={(evento) => setPerfil({ ...perfil, nome: evento.target.value })} maxLength={120} required /></label>
            <label>E-mail<Input type="email" value={perfil.email} readOnly /></label>
            <label>Telefone<Input type="tel" value={perfil.telefone} onChange={(evento) => setPerfil({ ...perfil, telefone: evento.target.value })} maxLength={30} required /></label>
            <Box><Text fontSize="sm" fontWeight="bold">CPF</Text><Text>{perfil.cpfCadastrado ? "Cadastrado (não pode ser alterado)" : "Não informado"}</Text></Box>
          </SimpleGrid>
          <Box>
            <Text fontWeight="bold" mb={2}>Convênios ({conveniosSelecionados.length}/10)</Text>
            <Text fontSize="sm" color="var(--color-text-muted)" mb={3}>A lista é salva no perfil. A busca ainda recebe o convênio selecionado no filtro da busca.</Text>
            <Stack direction="row" wrap="wrap" gap={2}>
              {convenios.map((convenio) => {
                const selecionado = conveniosSelecionados.includes(convenio.id);
                return <Button key={convenio.id} type="button" size="sm" variant={selecionado ? "solid" : "outline"} onClick={() => alternarConvenio(convenio.id)}>{convenio.nome}</Button>;
              })}
            </Stack>
          </Box>
          <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar alterações"}</Button>
        </Stack>
      </Box>
    </Container>
  );
}
