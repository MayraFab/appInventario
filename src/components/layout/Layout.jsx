import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// Opciones del menú lateral (ruta, texto e ícono de Bootstrap Icons)
const MENU = [
  { ruta: '/', texto: 'Inicio (Dashboard)', icono: 'bi-house-door' },
  { ruta: '/productos', texto: 'Productos', icono: 'bi-box-seam' },
  { ruta: '/categorias', texto: 'Categorías', icono: 'bi-tags' },
  { ruta: '/proveedores', texto: 'Proveedores', icono: 'bi-truck' },
  { ruta: '/kardex', texto: 'Kardex / Movimientos', icono: 'bi-arrow-left-right' },
  { ruta: '/usuarios', texto: 'Usuarios', icono: 'bi-people' }
];

export default function Layout() {
  // En pantallas pequeñas el menú se abre/cierra con el botón ☰
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="app">
      <aside className={`app-sidebar ${menuAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-marca">
          <i className="bi bi-boxes fs-3"></i>
          <div>
            <div className="fw-bold">SENATI</div>
            <small>Sistema de Inventario</small>
          </div>
        </div>

        <nav className="sidebar-menu">
          {MENU.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.ruta === '/'}
              className="sidebar-link"
              onClick={cerrarMenu}
            >
              <i className={`bi ${item.icono}`}></i>
              <span>{item.texto}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-pie">Seminario IA 502 · 2026</div>
      </aside>

      {menuAbierto && <div className="sidebar-fondo" onClick={cerrarMenu}></div>}

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="btn btn-light d-lg-none"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <i className="bi bi-list"></i>
          </button>
          <span className="fw-semibold text-secondary d-none d-sm-inline">SENATI - Sistema de Inventario</span>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="avatar">MM</div>
            <div className="lh-sm d-none d-sm-block">
              <div className="fw-semibold small">Mayra Mallqui</div>
              <small className="text-secondary">Administrador</small>
            </div>
          </div>
        </header>

        <main className="app-contenido">
          {/* Aquí React Router dibuja la vista de la ruta actual */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
