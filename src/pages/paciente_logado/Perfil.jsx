import { useEffect, useState } from "react";
import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { apiRequest, apiRequestWithCsrf } from "@/services/httpClient";
import { atualizarNomeSessao } from "@/services/autenticacaoService";
import PageHeader from "@/components/ui/PageHeader";
import ErrorState from "@/components/ui/ErrorState";
import Card from "@/components/ui/Card";
import CampoTexto from "@/components/ui/CampoTexto";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import FeedbackErro from "@/components/ui/FeedbackErro";
import ListSkeleton from "@/components/ui/Skeleton";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [convenios, setConvenios] = useState([]);
  const [convenioId, setConvenioId] = useState("");
  const [status, setStatus] = useState("loading");
  const [tentativa, setTentativa] = useState(0);
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
        setConvenioId(Array.isArray(usuario.convenios) ? usuario.convenios[0] ?? "" : "");
        setStatus("ready");
      })
      .catch((falha) => {
        if (!ativo) return;
        setErro(falha.message);
        setStatus("error");
      });
    return () => { ativo = false; };
  }, [tentativa]);

  function tentarNovamente() {
    setErro("");
    setStatus("loading");
    setTentativa((atual) => atual + 1);
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
        convenios: convenioId ? [convenioId] : [],
      });
      if (resultado.usuario) {
        const nome = resultado.usuario.nome ?? perfil.nome;
        setPerfil((atual) => ({ ...atual, nome, telefone: resultado.usuario.telefone ?? atual.telefone }));
        if (Array.isArray(resultado.usuario.convenios)) setConvenioId(resultado.usuario.convenios[0] ?? "");
        atualizarNomeSessao(nome);
      }
      setMensagem(resultado.message || "Perfil atualizado.");
    } catch (falha) {
      setErro(falha.message || "Não foi possível salvar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  const container = (conteudo) => (
    <Container maxW="var(--container-md)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py={{ base: "var(--space-6)", md: "var(--space-8)" }} pb={{ base: "var(--bottom-nav-offset)", md: "var(--space-12)" }}>
      <PageHeader title="Meu perfil" description="Atualize seus dados de contato e o convênio usado nas buscas." />
      {conteudo}
    </Container>
  );

  if (status === "loading") return container(<ListSkeleton count={1} />);
  if (status === "error") return container(<ErrorState title="Não foi possível carregar o perfil" description={erro} onRetry={tentarNovamente} />);

  return container(
    <Card as="section" aria-labelledby="titulo-dados-perfil">
      <Stack as="form" onSubmit={salvar} gap="var(--space-6)">
        <Text as="h2" id="titulo-dados-perfil" className="sr-only">Dados do perfil</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="var(--space-4)">
          <CampoTexto label="Nome" value={perfil.nome} onChange={(evento) => setPerfil({ ...perfil, nome: evento.target.value })} maxLength={120} autoComplete="name" required />
          <CampoTexto label="E-mail" type="email" value={perfil.email} readOnly helperText="O e-mail não pode ser alterado por aqui." />
          <CampoTexto label="Telefone" type="tel" value={perfil.telefone} onChange={(evento) => setPerfil({ ...perfil, telefone: evento.target.value })} maxLength={30} autoComplete="tel" required />
          <Box>
            <Text fontSize="var(--text-sm)" fontWeight="var(--weight-bold)" color="var(--color-text)">CPF</Text>
            <Text mt="var(--space-2)" fontSize="var(--text-sm)" color="var(--color-text-muted)">
              {perfil.cpfCadastrado ? "Cadastrado (não pode ser alterado)" : "Não informado"}
            </Text>
          </Box>
        </SimpleGrid>
        <Select
          label="Convênio"
          placeholder="Selecione seu convênio"
          options={convenios.map((convenio) => ({ value: convenio.id, label: convenio.nome }))}
          value={convenioId}
          onChange={(evento) => setConvenioId(evento.target.value)}
          helperText="Ele já vem selecionado no filtro da busca. Você pode trocar quando quiser."
          required
        />
        <FeedbackErro mensagem={erro} titulo="Não foi possível salvar o perfil" />
        {mensagem && <Alert status="success" role="status">{mensagem}</Alert>}
        <Box>
          <Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</Button>
        </Box>
      </Stack>
    </Card>
  );
}
