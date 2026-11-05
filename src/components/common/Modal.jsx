import { useEffect } from 'react';

// Modal de Bootstrap controlado por React (sin el JavaScript de Bootstrap)
export default function Modal({ titulo, abierto, onCerrar, children, tamano = '' }) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" onClick={onCerrar}>
        <div
          className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${tamano}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button type="button" className="btn-close" onClick={onCerrar} aria-label="Cerrar"></button>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}
