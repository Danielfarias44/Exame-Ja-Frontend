import { Flex, Stack } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

const ETAPAS = [
  { rota: "/teste/cadastro", rotulo: "1. Cadastrar contas" },
  { rota: "/teste/admin", rotulo: "2. Preparar o admin" },
  { rota: "/teste/login", rotulo: "3. Entrar com uma conta" },
];

export default function NavegacaoTeste() {
  const { pathname } = useLocation();

  return (
    <Stack gap="var(--space-4)" mb="var(--space-6)">
      <Alert status="warning" title="Modo de teste">
        Estas telas criam contas de verdade no back, com dados fictícios. Elas só existem com
        VITE_MODO_TESTE=true e não substituem o cadastro e o login reais.
      </Alert>
      <Flex as="nav" aria-label="Etapas do modo de teste" gap="var(--space-2)" wrap="wrap">
        {ETAPAS.map(({ rota, rotulo }) => (
          <Button key={rota} asChild variant={pathname === rota ? "primary" : "outline"}>
            <Link to={rota} aria-current={pathname === rota ? "page" : undefined}>{rotulo}</Link>
          </Button>
        ))}
      </Flex>
    </Stack>
  );
}
