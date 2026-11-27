import { Box } from "@chakra-ui/react";
import { useTema } from "@/hooks/useTema";

/**
 * Botão interativo para alternar entre os modos claro e escuro da aplicação.
 */
export default function AlternadorTema() {
  const { ehEscuro, alternarTema } = useTema();

  return (
    <Box
      as="button"
      type="button"
      onClick={alternarTema}
      aria-label={ehEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={ehEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      minW="var(--touch-target-min)"
      minH="var(--touch-target-min)"
      borderRadius="var(--radius-full)"
      border="var(--border-width) solid var(--color-border-soft)"
      bg="var(--color-surface)"
      color="var(--color-text)"
      cursor="pointer"
      transition="all var(--duration-fast) var(--ease-standard)"
      _hover={{
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
        transform: "translateY(-1px)",
      }}
    >
      {ehEscuro ? (
        /* Ícone de Sol */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        /* Ícone de Lua */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </Box>
  );
}