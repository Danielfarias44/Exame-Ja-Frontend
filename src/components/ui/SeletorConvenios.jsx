import { useId } from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";

export default function SeletorConvenios({
  legenda,
  convenios,
  selecionados,
  onChange,
  minimo = 5,
  maximo = 10,
  erro,
  idPrimeiro,
}) {
  const idAjuda = useId();
  const idErro = useId();
  const limiteAtingido = selecionados.length >= maximo;

  function alternar(id) {
    onChange(selecionados.includes(id)
      ? selecionados.filter((item) => item !== id)
      : [...selecionados, id]);
  }

  return (
    <Box
      as="fieldset"
      border="none"
      p={0}
      m={0}
      minW={0}
      aria-describedby={erro ? `${idAjuda} ${idErro}` : idAjuda}
      aria-invalid={erro ? true : undefined}
    >
      <Box as="legend" fontFamily="var(--font-heading)" fontWeight="var(--weight-bold)" fontSize="var(--text-sm)" color="var(--color-text)" mb="var(--space-1)">
        {legenda}
      </Box>
      <Text id={idAjuda} fontSize="var(--text-xs)" color="var(--color-text-muted)" mb="var(--space-3)">
        {`Escolha de ${minimo} a ${maximo}. ${selecionados.length} selecionado${selecionados.length === 1 ? "" : "s"}.`}
        {limiteAtingido ? " Limite atingido: desmarque um para trocar." : ""}
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="var(--space-2)">
        {convenios.map((convenio, indice) => {
          const marcado = selecionados.includes(convenio.id);
          const bloqueado = !marcado && limiteAtingido;
          return (
            <Flex
              as="label"
              key={convenio.id}
              align="center"
              gap="var(--space-3)"
              minH="var(--touch-target-min)"
              px="var(--space-3)"
              borderWidth="var(--border-width)"
              borderStyle="solid"
              borderColor={marcado ? "var(--color-primary)" : "var(--color-border-soft)"}
              bg={marcado ? "var(--color-primary-soft)" : "var(--color-surface)"}
              borderRadius="var(--radius-md)"
              cursor={bloqueado ? "not-allowed" : "pointer"}
              color={bloqueado ? "var(--color-text-muted)" : "var(--color-text)"}
              fontSize="var(--text-sm)"
              _focusWithin={{ outline: "var(--border-width-strong) solid var(--color-focus)", outlineOffset: "var(--focus-offset)" }}
            >
              <input
                id={indice === 0 ? idPrimeiro : undefined}
                type="checkbox"
                checked={marcado}
                disabled={bloqueado}
                onChange={() => alternar(convenio.id)}
                style={{ width: "var(--space-6)", height: "var(--space-6)", accentColor: "var(--color-primary)", flexShrink: 0 }}
              />
              <span>{convenio.nome}</span>
            </Flex>
          );
        })}
      </SimpleGrid>
      {erro && (
        <Text id={idErro} mt="var(--space-2)" fontSize="var(--text-xs)" color="var(--color-error)">
          {erro}
        </Text>
      )}
    </Box>
  );
}
