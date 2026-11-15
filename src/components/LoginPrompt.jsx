import { Link } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
// Aviso para que a pessoa entre na conta (geralmente para colocar no lugar de opções que precisam de conta para serem utilizadas)
export default function LoginPrompt({ action = "continuar" }) {
  return (
    <Alert
      status="info"
      title={`Entre na sua conta para ${action}`}
      actions={
        <>
          <Button asChild size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/cadastro">Criar conta</Link>
          </Button>
        </>
      }
    />
  );
}
