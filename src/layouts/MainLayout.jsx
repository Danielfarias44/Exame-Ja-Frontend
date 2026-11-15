import { Outlet, Link, NavLink } from "react-router-dom";
import logo from "@/assets/logo.png";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <header className="app-header">
        <Link to="/" className="app-logo">
          <img src={logo} alt="" width={36} height={42} />
          <span>Exame Já</span>
        </Link>

        <nav className="app-nav" aria-label="Navegação principal">
          <NavLink to="/busca">Buscar exames</NavLink>
          <NavLink to="/comparar">Comparar</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/cadastro">Cadastro</NavLink>
        </nav>
      </header>

      <main id="conteudo" className="app-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Exame Já </p>
      </footer>
    </div>
  );
}