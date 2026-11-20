import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  atualizarConveniosPaciente,
  atualizarPerfilPaciente,
  CONVENIOS_DISPONIVEIS,
  obterDadosPacienteLogado,
} from "@/services/pacienteLogadoService";

export default function Perfil() {
  const navegar = useNavigate();
  const pacienteInicial = obterDadosPacienteLogado().paciente;

  const [form, setForm] = useState({
    nome: pacienteInicial.nome || "",
    email: pacienteInicial.email || "",
    telefone: pacienteInicial.telefone || "",
    cpf: pacienteInicial.cpf || "",
    dataNascimento: pacienteInicial.dataNascimento || "",
    cidade: pacienteInicial.cidade || "",
  });

  const [conveniosSelecionados, setConveniosSelecionados] = useState(
    pacienteInicial.conveniosIds || []
  );
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  function alternarConvenio(id) {
    setConveniosSelecionados((atual) => {
      if (atual.includes(id)) {
        return atual.filter((item) => item !== id);
      }
      if (atual.length >= 5) {
        return atual;
      }
      return [...atual, id];
    });
  }

  function salvarAlteracoes(evento) {
    evento.preventDefault();
    atualizarPerfilPaciente(form);
    atualizarConveniosPaciente(conveniosSelecionados);
    setMensagemSucesso("Dados e convênios salvos com sucesso.");
    setTimeout(() => setMensagemSucesso(""), 3500);
  }

  return (
    <Container
      maxW="880px"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 8 }}
      pb={{ base: "110px", md: 12 }}
      className="animar-entrada"
    >
      <Box mb={6}>
        <Heading
          as="h1"
          fontFamily="var(--font-heading)"
          fontWeight="var(--weight-bold)"
          fontSize={{ base: "1.5rem", md: "1.9rem" }}
          color="var(--color-text)"
          mb={1}
        >
          Meu Perfil
        </Heading>
        <Text
          fontFamily="var(--font-body)"
          fontSize="0.92rem"
          color="var(--color-text-muted)"
        >
          Atualize seus dados cadastrais e gerencie até 5 convênios favoritos.
        </Text>
      </Box>

      {mensagemSucesso && (
        <Box
          mb={5}
          p={3.5}
          borderRadius="var(--radius-md)"
          bg="var(--color-success-soft)"
          color="var(--color-success)"
          fontFamily="var(--font-heading)"
          fontWeight={600}
          fontSize="0.86rem"
        >
          {mensagemSucesso}
        </Box>
      )}

      <Box as="form" onSubmit={salvarAlteracoes}>
        <VStack align="stretch" gap={5}>
          {/* Dados Pessoais */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Heading
              as="h2"
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
              fontSize="1.05rem"
              color="var(--color-text)"
              mb={4}
            >
              Dados Pessoais
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Nome completo
                </Text>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  E-mail
                </Text>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Telefone
                </Text>
                <Input
                  value={form.telefone}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                  }
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  CPF
                </Text>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Data de nascimento
                </Text>
                <Input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) =>
                    setForm({ ...form, dataNascimento: e.target.value })
                  }
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>

              <Box>
                <Text
                  fontFamily="var(--font-heading)"
                  fontWeight={600}
                  fontSize="0.82rem"
                  color="var(--color-text)"
                  mb={1.5}
                >
                  Cidade / Estado
                </Text>
                <Input
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  minH="44px"
                  bg="var(--color-bg)"
                  color="var(--color-text)"
                  borderColor="var(--color-border-soft)"
                />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Convênios */}
          <Box
            p={{ base: 5, md: 6 }}
            bg="var(--color-surface)"
            border="1px solid var(--color-border-soft)"
            borderRadius="var(--radius-lg)"
          >
            <Flex justify="space-between" align="center" mb={3} gap={2}>
              <Heading
                as="h2"
                fontFamily="var(--font-heading)"
                fontWeight="var(--weight-bold)"
                fontSize="1.05rem"
                color="var(--color-text)"
              >
                Meus Convênios
              </Heading>
              <Badge
                px={3}
                py={1}
                borderRadius="var(--radius-full)"
                bg="var(--color-primary-soft)"
                color="var(--color-primary)"
                fontFamily="var(--font-heading)"
                fontWeight={700}
                fontSize="0.76rem"
              >
                {conveniosSelecionados.length}/5 selecionados
              </Badge>
            </Flex>

            <Text
              fontFamily="var(--font-body)"
              fontSize="0.84rem"
              color="var(--color-text-muted)"
              mb={4}
            >
              Esses convênios são usados automaticamente para filtrar e destacar clínicas compatíveis na busca e no comparador.
            </Text>

            <Flex gap={2.5} flexWrap="wrap">
              {CONVENIOS_DISPONIVEIS.map((conv) => {
                const ativo = conveniosSelecionados.includes(conv.id);
                const bloqueado = !ativo && conveniosSelecionados.length >= 5;

                return (
                  <Box
                    key={conv.id}
                    as="button"
                    type="button"
                    disabled={bloqueado}
                    onClick={() => alternarConvenio(conv.id)}
                    px={4}
                    minH="40px"
                    borderRadius="var(--radius-full)"
                    bg={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-bg)"
                    }
                    color={
                      ativo
                        ? "var(--color-text-on-primary)"
                        : "var(--color-text)"
                    }
                    border="1px solid"
                    borderColor={
                      ativo
                        ? "var(--color-primary)"
                        : "var(--color-border-soft)"
                    }
                    opacity={bloqueado ? 0.5 : 1}
                    cursor={bloqueado ? "not-allowed" : "pointer"}
                    fontFamily="var(--font-heading)"
                    fontWeight={600}
                    fontSize="0.84rem"
                  >
                    {conv.nome}
                  </Box>
                );
              })}
            </Flex>
          </Box>

          <Flex
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            <Button
              type="button"
              variant="outline"
              borderColor="var(--color-error)"
              color="var(--color-error)"
              minH="44px"
              px={5}
              onClick={() => navegar("/login")}
              fontFamily="var(--font-heading)"
              fontWeight={600}
            >
              Sair da conta
            </Button>

            <Button
              type="submit"
              bg="var(--color-primary)"
              _hover={{ bg: "var(--color-primary-hover)" }}
              color="var(--color-text-on-primary)"
              minH="46px"
              px={6}
              fontFamily="var(--font-heading)"
              fontWeight="var(--weight-bold)"
            >
              Salvar alterações
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Container>
  );
}