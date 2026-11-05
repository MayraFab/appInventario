import axios from 'axios';

// Todas las rutas del backend cuelgan de /api (ver miApi/routes/index.js)
const api = axios.create({
  baseURL: 'http://localhost:3006/api'
});

// Devuelve un mensaje entendible a partir de un error de Axios
export const mensajeError = (error) =>
  error.response?.data?.error ||
  'No se pudo conectar con el servidor. ¿Está encendido el backend (npm run dev en miApi)?';

export default api;
