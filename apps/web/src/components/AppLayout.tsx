import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/workspace", label: "Script Workspace" },
  { to: "/vault", label: "Vault" }
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Synapse Studios</p>
          <h1 className="topbar-title">Educational Story Engine</h1>
          <p className="topbar-subtitle">
            {user ? `Sesión activa: ${user.name}` : "Modo invitado"}
          </p>
        </div>

        <div className="topnav-wrap">
          <nav className="topnav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "nav-pill nav-pill--active" : "nav-pill"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="secondary-button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <Outlet />
    </main>
  );
}
