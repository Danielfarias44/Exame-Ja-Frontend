import { useRef, useState } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import logo from "@/assets/logo.png";
import "./MainLayout.css";

const links = [
  { to: "/busca", label: "Buscar exames" },
  { to: "/comparar", label: "Comparar" },
  { to: "/login", label: "Login" },
  { to: "/cadastro", label: "Cadastro" },
];

export default function MainLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenuRef = useRef(null);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape" && menuAberto) {
      fecharMenu();
      botaoMenuRef.current?.focus();
    }
  }

  return (
    <div className="app-shell">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <header className="app-header" onKeyDown={handleKeyDown}>
        <Link to="/" className="app-logo" onClick={fecharMenu}>
          <img src={logo} alt="" width={36} height={42} />
          <span>Exame Já</span>
        </Link>

        <button
          ref={botaoMenuRef}
          type="button"
          className="app-menu-button"
          aria-expanded={menuAberto}
          aria-controls="navegacao-principal"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
          <span>{menuAberto ? "Fechar" : "Menu"}</span>
        </button>

        <nav
          id="navegacao-principal"
          className={`app-nav${menuAberto ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={fecharMenu}>
              {link.label}
            </NavLink>
          ))}
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
