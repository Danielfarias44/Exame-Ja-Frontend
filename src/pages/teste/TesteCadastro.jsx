import { useEffect, useState } from "react";
import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackErro from "@/components/ui/FeedbackErro";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { PERFIS } from "@/constants/perfis";
import { listarConvenios, reenviarVerificacaoEmail } from "@/services/autenticacaoService";
import { CONTAS_TESTE, cadastrarContaTeste, conveniosAceitosPeloBack, emailDaConta } from "@/services/contasTeste";
import CampoTexto from "@/components/ui/CampoTexto";
import NavegacaoTeste from "./NavegacaoTeste";
import { useEstadoTeste } from "./useEstadoTeste";

const NOME_PERFIL = {
  [PERFIS.PACIENTE]: "Paciente",
  [PERFIS.CLINICA]: "Clínica",
  [PERFIS.ADMIN]: "Admin (cadastrado como paciente)",
};

function situacaoDaConta(dados) {
  if (!dados) return { tom: "neutral", rotulo: "Não cadastrada" };
  if (dados.jaExistia) return { tom: "primary", rotulo: "Já existia no back" };
  return { tom: "warning", rotulo: "Cadastrada · confirme o e-mail" };
}

export default function TesteCadastro() {
  const [estado, atualizar] = useEstadoTeste();
  const [convenios, setConvenios] = useState([]);
  const [erroConvenios, setErroConvenios] = useState("");
  const [enviando, setEnviando] = useState("");
  const [retornos, setRetornos] = useState({});

  useEffect(() => {
    let ativo = true;
    listarConvenios()
      .then((lista) => {
        if (!ativo) return;
        setConvenios(lista);
        const validos = conveniosAceitosPeloBack(lista);
        atualizar((atual) => (validos.some(({ id }) => id === atual.convenioId) || !validos[0]
          ? atual
          : { ...atual, convenioId: validos[0].id }));
      })
      .catch((falha) => {
        if (ativo) setErroConvenios(falha.message || "Não foi possível carregar os convênios.");
      });
    return () => { ativo = false; };
  }, [atualizar]);

  function registrarRetorno(id, retorno) {
    setRetornos((atuais) => ({ ...atuais, [id]: retorno }));
  }

  async function cadastrar(conta) {
    setEnviando(conta.id);
    registrarRetorno(conta.id, null);
    try {
      const { conta: dados, cnpjsUsados } = await cadastrarContaTeste(conta, estado, convenios);
      atualizar((atual) => ({ ...atual, cnpjsUsados, contas: { ...atual.contas, [conta.id]: dados } }));
      registrarRetorno(conta.id, {
        tipo: "sucesso",
        texto: dados.jaExistia
          ? "Este e-mail já tinha conta no back. Ela foi guardada nesta lista com a senha atual; se a conta foi criada com outra senha, use \"Esqueci a senha\" no login real."
          : `Conta criada. Abra a caixa de ${dados.email} e clique no link de confirmação antes de entrar.`,
      });
    } catch (falha) {
      if (falha.cnpjsUsados) atualizar((atual) => ({ ...atual, cnpjsUsados: falha.cnpjsUsados }));
      registrarRetorno(conta.id, { tipo: "erro", texto: falha.message || "Não foi possível cadastrar esta conta." });
    } finally {
      setEnviando("");
    }
  }

  async function reenviar(conta) {
    setEnviando(conta.id);
    registrarRetorno(conta.id, null);
    try {
      await reenviarVerificacaoEmail(estado.contas[conta.id].email);
      registrarRetorno(conta.id, { tipo: "sucesso", texto: "Pedido enviado. Se a conta ainda não foi confirmada, um novo link chega em alguns minutos." });
    } catch (falha) {
      registrarRetorno(conta.id, { tipo: "erro", texto: falha.message || "Não foi possível reenviar o e-mail." });
    } finally {
      setEnviando("");
    }
  }

  function esquecer(conta) {
    atualizar((atual) => {
      const contas = { ...atual.contas };
      delete contas[conta.id];
      return { ...atual, contas };
    });
    registrarRetorno(conta.id, { tipo: "sucesso", texto: "Removida só desta lista. A conta continua existindo no Firebase." });
  }

  return (
    <Container maxW="820px" px={{ base: "var(--space-4)", md: "var(--space-6)" }} py="var(--space-8)">
      <NavegacaoTeste />
      <PageHeader
        title="Contas de teste"
        description="Cadastra paciente, admin e clínicas no back real com dados fictícios, para testar a aprovação de clínicas."
      />

      <Stack gap="var(--space-6)">
        <Card as="section" aria-labelledby="titulo-configuracao">
          <Stack gap="var(--space-4)">
            <Heading as="h2" id="titulo-configuracao" fontSize="var(--text-lg)">Configuração</Heading>
            <CampoTexto
              label="E-mail base do paciente e do admin"
              type="email"
              autoComplete="email"
              value={estado.emailBase}
              onChange={(evento) => atualizar((atual) => ({ ...atual, emailBase: evento.target.value }))}
              helperText="Use um Gmail seu. As contas recebem apelidos com +, como voce+exameja-paciente@gmail.com, e os e-mails de confirmação chegam na sua caixa."
            />
            <CampoTexto
              label="Senha das próximas contas"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={estado.senha}
              onChange={(evento) => atualizar((atual) => ({ ...atual, senha: evento.target.value }))}
              error={estado.senha.length > 0 && estado.senha.length < 8 ? "Use pelo menos 8 caracteres." : ""}
              helperText="Gerada automaticamente e salva só neste navegador. Cada conta guarda a senha com que foi criada."
            />
            <Select
              label="Convênio do paciente e do admin"
              placeholder={convenios.length ? undefined : "Carregando convênios…"}
              options={conveniosAceitosPeloBack(convenios).map(({ id, nome }) => ({ value: id, label: nome }))}
              value={estado.convenioId}
              onChange={(evento) => atualizar((atual) => ({ ...atual, convenioId: evento.target.value }))}
              error={erroConvenios}
              helperText={`Só aparecem os convênios com ID que o back aceita (${conveniosAceitosPeloBack(convenios).length} de ${convenios.length}). As clínicas de teste recebem os 5 primeiros.`}
            />
          </Stack>
        </Card>

        <Alert status="info" title="Clínicas precisam de e-mail de domínio próprio">
          O back recusa Gmail, Hotmail, Outlook, Yahoo e iCloud para clínicas. Crie uma caixa num serviço
          de e-mail temporário (como mail.tm) para cada clínica e cole o endereço no campo dela. O CNPJ é
          escolhido sozinho de uma lista de órgãos públicos, porque o back confere o CNPJ na BrasilAPI.
        </Alert>

        {CONTAS_TESTE.map((conta) => {
          const dados = estado.contas[conta.id];
          const situacao = situacaoDaConta(dados);
          const email = emailDaConta(conta, estado);
          const retorno = retornos[conta.id];
          const ocupada = enviando === conta.id;
          const tituloId = `titulo-${conta.id}`;
          const linhas = [
            ["Perfil", NOME_PERFIL[conta.perfil]],
            ["E-mail", email || "—"],
            ["Telefone", conta.telefone],
            ...(conta.endereco ? [["Endereço", conta.endereco]] : []),
            ...(dados?.razaoSocial ? [["CNPJ", dados.cnpj], ["Razão social", dados.razaoSocial]] : []),
            ...(dados?.conveniosAceitos ? [["Convênios", dados.conveniosAceitos.join(", ")]] : []),
            ...(dados?.cpf ? [["CPF gerado", dados.cpf]] : []),
            ...(dados?.senha ? [["Senha", dados.senha]] : []),
            ...(dados?.uid ? [["UID", dados.uid]] : []),
          ];

          return (
            <Card key={conta.id} as="section" aria-labelledby={tituloId}>
              <Stack gap="var(--space-4)">
                <Flex justify="space-between" align="center" gap="var(--space-3)" wrap="wrap">
                  <Heading as="h2" id={tituloId} fontSize="var(--text-lg)">{conta.titulo}</Heading>
                  <StatusBadge tone={situacao.tom}>{situacao.rotulo}</StatusBadge>
                </Flex>
                <Text color="var(--color-text-muted)" fontSize="var(--text-sm)">{conta.descricao}</Text>

                {conta.perfil === PERFIS.CLINICA && !dados && (
                  <CampoTexto
                    label="E-mail temporário da clínica"
                    type="email"
                    value={estado.emailsClinicas[conta.id] || ""}
                    onChange={(evento) => atualizar((atual) => ({
                      ...atual,
                      emailsClinicas: { ...atual.emailsClinicas, [conta.id]: evento.target.value },
                    }))}
                    helperText="O domínio deste e-mail vira o domínio corporativo da clínica."
                  />
                )}

                <Box as="dl" display="grid" gridTemplateColumns={{ base: "1fr", sm: "auto 1fr" }} columnGap="var(--space-4)" rowGap="var(--space-1)" fontSize="var(--text-sm)">
                  {linhas.map(([termo, valor]) => (
                    <Box key={termo} display="contents">
                      <Box as="dt" fontWeight="var(--weight-bold)" color="var(--color-text)">{termo}</Box>
                      <Box as="dd" color="var(--color-text)" overflowWrap="anywhere" mb={{ base: "var(--space-2)", sm: 0 }}>{valor}</Box>
                    </Box>
                  ))}
                </Box>

                {retorno?.tipo === "erro" && <FeedbackErro mensagem={retorno.texto} titulo="Não foi possível concluir" />}
                {retorno?.tipo === "sucesso" && <Alert status="success" role="status">{retorno.texto}</Alert>}

                <Flex gap="var(--space-2)" wrap="wrap">
                  {!dados && (
                    <Button onClick={() => cadastrar(conta)} disabled={ocupada || Boolean(enviando)}>
                      {ocupada ? "Cadastrando…" : "Cadastrar no back"}
                    </Button>
                  )}
                  {dados && (
                    <>
                      <Button variant="outline" onClick={() => reenviar(conta)} disabled={Boolean(enviando)}>
                        {ocupada ? "Enviando…" : "Reenviar e-mail de confirmação"}
                      </Button>
                      <Button variant="ghost" onClick={() => esquecer(conta)} disabled={Boolean(enviando)}>
                        Remover desta lista
                      </Button>
                    </>
                  )}
                </Flex>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
}
