import { useEffect, useState } from 'react';

// Mensajes flotantes de éxito / error que se ocultan solos a los 4 segundos
export default function useAlerta() {
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    if (!alerta) return;
    const temporizador = setTimeout(() => setAlerta(null), 4000);
    return () => clearTimeout(temporizador);
  }, [alerta]);

  return {
    alerta,
    exito: (texto) => setAlerta({ tipo: 'success', texto }),
    error: (texto) => setAlerta({ tipo: 'danger', texto }),
    cerrar: () => setAlerta(null)
  };
}
