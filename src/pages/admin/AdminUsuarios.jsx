import { useCallback, useState } from "react";
import { Container, Flex, Stack } from "@chakra-ui/react";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { listarUsuarios } from "@/services/adminService";
import { formatarData } from "@/utils/formatarData";
import ConteudoLista from "./ConteudoLista";
import ListaDados from "./ListaDados";
import { STATUS_CONTA, TIPO_USUARIO, opcoesDe, rotuloStatusConta } from "./rotulosAdmin";
import { useListaPaginada } from "./useListaPaginada";

const OPCOES_TIPO = opcoesDe(TIPO_USUARIO, "Todos os tipos");
const OPCOES_STATUS = opcoesDe(STATUS_CONTA, "Todas as situações");

function nomeDoUsuario(usuario) {
  return usuario.nome || usuario.nomeFantasia || usuario.razaoSocial || usuario.email || "Usuário sem nome";
}

export default function AdminUsuarios() {
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const buscarPagina = useCallback(({ cursor }) => listarUsuarios({ tipo, status, cursor }), [tipo, status]);
  const lista = useListaPaginada(buscarPagina);

  return (
    <Container maxW="var(--container-md)" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <PageHeader
        title="Usuários"
        description="Pacientes e clínicas cadastrados, dos mais novos para os mais antigos. Consulta apenas: as ações sobre clínicas ficam em Clínicas."
      />
      <Stack gap="var(--space-4)">
        <Flex as="fieldset" gap="var(--space-4)" wrap="wrap" border="none" p={0} m={0}>
          <legend className="sr-only">Filtrar usuários</legend>
          <Flex flex="1" minW="var(--width-field-min)" maxW="var(--width-field)">
            <Select label="Tipo de conta" options={OPCOES_TIPO} value={tipo} onChange={(evento) => setTipo(evento.target.value)} />
          </Flex>
          <Flex flex="1" minW="var(--width-field-min)" maxW="var(--width-field)">
            <Select label="Situação" options={OPCOES_STATUS} value={status} onChange={(evento) => setStatus(evento.target.value)} />
          </Flex>
        </Flex>
        <ConteudoLista
          lista={lista}
          tituloErro="Lista de usuários indisponível"
          vazio={{ title: "Nenhum usuário com estes filtros", description: "Troque o tipo de conta ou a situação." }}
          rotuloMais="Carregar mais usuários"
        >
          {(usuario) => {
            const situacao = rotuloStatusConta(usuario.status);
            const tituloId = `usuario-${usuario.uid}`;
            return (
              <Card key={usuario.uid} as="section" aria-labelledby={tituloId}>
                <Stack gap="var(--space-3)">
                  <Flex justify="space-between" align="center" gap="var(--space-3)" wrap="wrap">
                    <SectionTitle id={tituloId}>{nomeDoUsuario(usuario)}</SectionTitle>
                    <StatusBadge tone={situacao.tom}>{situacao.rotulo}</StatusBadge>
                  </Flex>
                  <ListaDados
                    linhas={[
                      ["Tipo", TIPO_USUARIO[usuario.tipo] || usuario.tipo],
                      ["E-mail", usuario.email],
                      ["Razão social", usuario.tipo === "clinica" ? usuario.razaoSocial : null],
                      ["Cadastrado em", formatarData(usuario.criadoEm)],
                      ["UID", usuario.uid],
                    ]}
                  />
                </Stack>
              </Card>
            );
          }}
        </ConteudoLista>
      </Stack>
    </Container>
  );
}
