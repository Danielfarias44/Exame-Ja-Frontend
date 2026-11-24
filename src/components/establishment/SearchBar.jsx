import { useId, useState } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import Button from "@/components/ui/Button";

const TEXTO_POR_ALINHAMENTO = { "flex-start": "left", center: "center", "flex-end": "right" };

function alinhamentoDoTexto(align) {
  if (typeof align === "string") return TEXTO_POR_ALINHAMENTO[align];
  return Object.fromEntries(
    Object.entries(align).map(([tela, valor]) => [tela, TEXTO_POR_ALINHAMENTO[valor]])
  );
}

const SUGESTOES_BUSCA = ["Hemograma", "Ultrassonografia", "Eletrocardiograma", "Unimed", "Bradesco"];

export default function SearchBar({
  defaultValue = "",
  onSearch,
  label = "O que você procura?",
  suggestions = SUGESTOES_BUSCA,
  align = "flex-start",
}) {
  const [termo, setTermo] = useState(defaultValue);
  const idCampo = useId();

  function buscar(valor) {
    setTermo(valor);
    onSearch(valor.trim());
  }

  function handleSubmit(event) {
    event.preventDefault();
    buscar(termo);
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
          outlineOffset: "2px",
        }}
      >
        <Box color="var(--color-primary)" px="var(--space-2)" aria-hidden="true">
          <LuSearch />
        </Box>
        <Input
          id={idCampo}
          type="search"
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          placeholder="Ex: Hemograma, Unimed, Clínica..."
          border="none"
          bg="transparent"
          color="var(--color-text)"
          _placeholder={{ color: "var(--color-text-muted)" }}
          fontFamily="var(--font-body)"
          fontSize="var(--text-sm)"
          minH="var(--touch-target-min)"
          minW="0"
          _focusVisible={{ boxShadow: "none", outline: "none" }}
        />
        <Button type="submit" flexShrink={0}>
          Buscar
        </Button>
      </Flex>

      {suggestions.length > 0 && (
        <Flex
          as="ul"
          role="list"
          aria-label="Sugestões de busca"
          wrap="wrap"
          justify={align}
          gap="var(--space-2)"
          mt="var(--space-3)"
          p={0}
          listStyleType="none"
        >
          {suggestions.map((sugestao) => (
            <li key={sugestao}>
              <Button
                variant="outline"
                borderRadius="var(--radius-full)"
                color="var(--color-text-muted)"
                fontSize="var(--text-xs)"
                px="var(--space-3)"
                onClick={() => buscar(sugestao)}
              >
                {sugestao}
              </Button>
            </li>
          ))}
        </Flex>
      )}
    </Box>
  );
}
