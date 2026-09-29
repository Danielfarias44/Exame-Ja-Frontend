import { Outlet, Link } from "react-router-dom";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          Exame Já
        </Link>
        <nav className="app-nav">
          <Link to="/busca">Buscar exames</Link>
          <Link to="/comparar">Comparar</Link>
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Exame Já — Projeto SuperNova (Sebrae)</p>
      </footer>
    </div>
  );
}
