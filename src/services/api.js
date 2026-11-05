import axios from 'axios';

export const CLAVE_SESION = 'inventario_sesion';

// Todas las rutas del backend cuelgan de /api (ver appApi/routes/index.js)
const api = axios.create({
  baseURL: 'http://localhost:3006/api'
});

// Lee la sesión guardada en el navegador (token + datos del usuario)
export const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
};

// ANTES de cada petición: agrega el token JWT en el encabezado Authorization
api.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }
  return config;
});

// DESPUÉS de cada respuesta: si el token venció o es inválido (401), se cierra la sesión
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      window.dispatchEvent(new Event('sesion-expirada'));
    }
    return Promise.reject(error);
  }
);

// Devuelve un mensaje entendible a partir de un error de Axios
export const mensajeError = (error) =>
  error.response?.data?.error ||
  'No se pudo conectar con el servidor. ¿Está encendido el backend (npm run dev en appApi)?';

export default api;
