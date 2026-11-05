import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ADMIN } from '../../utils/roles';

// Opciones del menú lateral (ruta, texto e ícono de Bootstrap Icons)
const MENU = [
  { ruta: '/', texto: 'Inicio (Dashboard)', icono: 'bi-house-door' },
  { ruta: '/productos', texto: 'Productos', icono: 'bi-box-seam' },
  { ruta: '/categorias', texto: 'Categorías', icono: 'bi-tags' },
  { ruta: '/proveedores', texto: 'Proveedores', icono: 'bi-truck' },
  { ruta: '/kardex', texto: 'Kardex / Movimientos', icono: 'bi-arrow-left-right' },
  { ruta: '/usuarios', texto: 'Usuarios', icono: 'bi-people', roles: [ADMIN] }
];

export default function Layout() {
  // En pantallas pequeñas el menú se abre/cierra con el botón ☰
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const { usuario, logout, tieneRol } = useAuth();

  // Solo se muestran las opciones permitidas para el rol del usuario
  const opciones = MENU.filter((item) => !item.roles || tieneRol(...item.roles));
  const iniciales = usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

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
          {opciones.map((item) => (
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
            <div className="avatar">{iniciales}</div>
            <div className="lh-sm d-none d-sm-block">
              <div className="fw-semibold small">{usuario.nombre}</div>
              <small className="text-secondary">{usuario.rol}</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm ms-2" onClick={logout} title="Cerrar sesión">
              <i className="bi bi-box-arrow-right"></i><span className="d-none d-md-inline ms-1">Salir</span>
            </button>
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
