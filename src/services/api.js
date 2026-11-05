import axios from 'axios';

export const CLAVE_SESION = 'inventario_sesion';

// Todas las rutas del backend cuelgan de /api (ver appApi/routes/index.js)
const api = axios.create({
  baseURL: 'http://localhost:3006/api'
});

// ¿El JWT sigue vigente? Lee el campo "exp" (en segundos) del payload del token
export const tokenVigente = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false; // token mal formado
  }
};

// Lee la sesión guardada en el navegador (token + datos del usuario).
// Si el token ya venció, la borra: así no se entra al panel con una sesión caducada
export const leerSesion = () => {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
    if (sesion?.token && tokenVigente(sesion.token)) return sesion;
  } catch {
    // dato corrupto en localStorage
  }
  localStorage.removeItem(CLAVE_SESION);
  return null;
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