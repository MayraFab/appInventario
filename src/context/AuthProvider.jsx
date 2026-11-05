import { useCallback, useEffect, useState } from 'react';
import api, { CLAVE_SESION, leerSesion } from '../services/api';
import { AuthContext } from './AuthContext';

// Guarda quién inició sesión y lo comparte con toda la aplicación
export default function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const nueva = { token: data.token, usuario: data.usuario };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    setSesion(nueva);
    return data.usuario;
  };

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_SESION);
    setSesion(null);
  }, []);

  // Si el backend responde 401 (token vencido o usuario desactivado), se cierra la sesión
  useEffect(() => {
    window.addEventListener('sesion-expirada', logout);
    return () => window.removeEventListener('sesion-expirada', logout);
  }, [logout]);

  const usuario = sesion?.usuario ?? null;
  const tieneRol = (...roles) => Boolean(usuario && roles.includes(usuario.rol));

  return (
    <AuthContext.Provider value={{ usuario, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
}
