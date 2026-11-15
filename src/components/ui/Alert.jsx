import { Alert as ChakraAlert, Flex } from "@chakra-ui/react";
// É usado para entregar feedback de Sucesso, Erro, Aviso e Info (que é o valor padrão)
// Exemplo:
// import { Button } from "@chakra-ui/react";
// import Alert from "./components/Alert";

// function FalhaUpload() {
//   return (
//     <Alert
//       status="error"
//       title="Falha ao enviar arquivo"
//       actions={
//         <>
//           <Button size="xs" variant="solid">Tentar novamente</Button>
//           <Button size="xs" variant="ghost">Cancelar</Button>
//         </>
//       }
//     >
//       Não foi possível conectar ao servidor. Verifique sua internet.
//     </Alert>
//   );
// }
const palette = {
  info: { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
  success: { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
  warning: { bg: "var(--color-warning-soft)", fg: "var(--color-warning)" },
  error: { bg: "var(--color-error-soft)", fg: "var(--color-error)" },
};

export default function Alert({ status = "info", title, children, actions, ...props }) {
  const colors = palette[status] ?? palette.info;

  return (
    <ChakraAlert.Root
      status={status}
      bg={colors.bg}
      color="var(--color-text)"
      borderRadius="var(--radius-md)"
      p="var(--space-4)"
      alignItems="center"
      flexWrap="wrap"
      gap="var(--space-3)"
      {...props}
    >
      <ChakraAlert.Indicator color={colors.fg} />
      <ChakraAlert.Content>
        {title && (
          <ChakraAlert.Title fontWeight="var(--weight-bold)" fontSize="var(--text-sm)">
            {title}
          </ChakraAlert.Title>
        )}
        {children && (
          <ChakraAlert.Description fontSize="var(--text-sm)">{children}</ChakraAlert.Description>
        )}
      </ChakraAlert.Content>
      {actions && <Flex gap="var(--space-2)" flexWrap="wrap">{actions}</Flex>}
    </ChakraAlert.Root>
  );
}
