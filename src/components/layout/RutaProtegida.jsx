import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Sin sesión → redirige al login.
 * Con "roles" → además exige uno de esos roles (si no, vuelve al Dashboard).
 */
export default function RutaProtegida({ roles }) {
  const { usuario, tieneRol } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (roles && !tieneRol(...roles)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
