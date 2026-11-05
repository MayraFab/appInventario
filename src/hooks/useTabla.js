import { useState } from 'react';

/**
 * Búsqueda + paginación en el navegador para cualquier lista.
 * textoDe(item) devuelve el texto en el que se busca.
 */
export default function useTabla(items, textoDe, porPagina = 5) {
  const [busqueda, setBusquedaInterna] = useState('');
  const [pagina, setPagina] = useState(1);

  const texto = busqueda.trim().toLowerCase();
  const filtrados = texto
    ? items.filter((item) => textoDe(item).toLowerCase().includes(texto))
    : items;

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  const visibles = filtrados.slice(inicio, inicio + porPagina);

  // Al escribir en el buscador se vuelve a la página 1
  const setBusqueda = (valor) => {
    setBusquedaInterna(valor);
    setPagina(1);
  };

  return {
    busqueda, setBusqueda,
    pagina: paginaActual, setPagina, totalPaginas,
    visibles,
    total: filtrados.length,
    desde: filtrados.length ? inicio + 1 : 0,
    hasta: inicio + visibles.length
  };
}
