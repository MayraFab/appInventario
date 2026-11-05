import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Ej: const { usuario, logout, tieneRol } = useAuth();
export default function useAuth() {
  return useContext(AuthContext);
}
