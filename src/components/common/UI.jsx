// Componentes pequeños reutilizados en todas las vistas

// Título de la vista + botón "Nuevo ..."
export function Encabezado({ titulo, descripcion, textoBoton, onNuevo }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <div>
        <h1 className="h3 fw-bold mb-0">{titulo}</h1>
        {descripcion && <p className="text-secondary mb-0">{descripcion}</p>}
      </div>
      {textoBoton && (
        <button className="btn btn-primary" onClick={onNuevo}>
          <i className="bi bi-plus-lg me-1"></i>{textoBoton}
        </button>
      )}
    </div>
  );
}

// Caja de búsqueda con ícono
export function Buscador({ valor, onChange, placeholder }) {
  return (
    <div className="input-group buscador">
      <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Fila que se muestra mientras carga o cuando la tabla está vacía
export function FilaVacia({ cargando, columnas, texto = 'No hay registros para mostrar' }) {
  return (
    <tr>
      <td colSpan={columnas} className="text-center text-secondary py-4">
        {cargando
          ? <><span className="spinner-border spinner-border-sm me-2"></span>Cargando...</>
          : texto}
      </td>
    </tr>
  );
}

// Pie de tabla: "Mostrando 1-5 de 12" + botones de página
export function Paginacion({ tabla, etiqueta }) {
  const { pagina, setPagina, totalPaginas, desde, hasta, total } = tabla;
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-2 border-top">
      <small className="text-secondary">Mostrando {desde}-{hasta} de {total} {etiqueta}</small>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPagina(pagina - 1)} aria-label="Anterior">
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
          <li key={n} className={`page-item ${n === pagina ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setPagina(n)}>{n}</button>
          </li>
        ))}
        <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPagina(pagina + 1)} aria-label="Siguiente">
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </div>
  );
}

// Mensaje flotante de éxito o error (ver hooks/useAlerta.js)
export function Alerta({ alerta, onCerrar }) {
  if (!alerta) return null;
  const icono = alerta.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
  return (
    <div className={`alert alert-${alerta.tipo} alert-dismissible shadow alerta-flotante`} role="alert">
      <i className={`bi ${icono} me-2`}></i>{alerta.texto}
      <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
    </div>
  );
}

// Aviso cuando el backend no responde
export function ErrorCarga({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="alert alert-warning d-flex align-items-center gap-2">
      <i className="bi bi-wifi-off"></i>{mensaje}
    </div>
  );
}
