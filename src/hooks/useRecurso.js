import { useCallback, useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';

/**
 * Carga datos de un endpoint (GET) y permite volver a cargarlos.
 * Ej: const { datos, cargando, error, recargar } = useRecurso('/categorias');
 */
export default function useRecurso(ruta, valorInicial = []) {
  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0); // Cambia para forzar una nueva carga

  useEffect(() => {
    let vigente = true; // Evita actualizar el estado si el componente ya se desmontó
    api.get(ruta)
      .then(({ data }) => {
        if (!vigente) return;
        setDatos(data);
        setError(null);
      })
      .catch((e) => vigente && setError(mensajeError(e)))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [ruta, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { datos, cargando, error, recargar };
}
