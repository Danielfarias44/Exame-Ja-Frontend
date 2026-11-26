import { Link, useLocation } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { rotaCadastroComRetorno, rotaLoginComRetorno } from "@/utils/rotasOferta";
// Aviso para que a pessoa entre na conta (geralmente para colocar no lugar de opções que precisam de conta para serem utilizadas)
export default function LoginPrompt({ action = "continuar", destino }) {
  const location = useLocation();
  const retorno = destino || location.pathname + location.search;

  return (
    <Alert
      status="info"
      title={`Entre na sua conta para ${action}`}
      actions={
        <>
          <Button asChild>
            <Link to={rotaLoginComRetorno(retorno)}>Entrar</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={rotaCadastroComRetorno(retorno)}>Criar conta</Link>
          </Button>
        </>
      }
    />
  );
}
