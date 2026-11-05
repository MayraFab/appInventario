import { useState } from 'react';
import api, { mensajeError } from '../services/api';
import useRecurso from '../hooks/useRecurso';
import useTabla from '../hooks/useTabla';
import useAlerta from '../hooks/useAlerta';
import Modal from '../components/common/Modal';
import { Encabezado, Buscador, FilaVacia, Paginacion, Alerta, ErrorCarga } from '../components/common/UI';
import { codigo, fechaHora, colorTipo, cantidadConSigno } from '../utils/formato';

const FORM_VACIO = { producto_id: '', tipo_movimiento: 'Entrada', cantidad: '', usuario_id: '', observaciones: '' };
const TIPOS = ['Entrada', 'Salida', 'Ajuste'];

export default function Kardex() {
  const { datos: movimientos, cargando, error: errorCarga, recargar } = useRecurso('/movimientos');
  const { datos: productos, recargar: recargarProductos } = useRecurso('/productos');
  const { datos: usuarios } = useRecurso('/usuarios');
  const { alerta, exito, error, cerrar } = useAlerta();

  const [filtroTipo, setFiltroTipo] = useState('');
  const movimientosFiltrados = filtroTipo ? movimientos.filter((m) => m.tipo_movimiento === filtroTipo) : movimientos;
  const tabla = useTabla(movimientosFiltrados, (m) => `${m.producto?.nombre} ${m.tipo_movimiento} ${m.usuario?.nombre}`);

  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Vista previa: cómo quedará el stock antes de guardar
  const producto = productos.find((p) => String(p.id) === String(form.producto_id));
  const cantidad = Number(form.cantidad) || 0;
  const variacion = form.tipo_movimiento === 'Salida' ? -cantidad : cantidad;
  const stockResultante = producto ? producto.stock + variacion : null;
  const stockInvalido = stockResultante !== null && stockResultante < 0;

  const abrirNuevo = () => { setForm(FORM_VACIO); setModalAbierto(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.post('/movimientos', form); // El backend usa una TRANSACCIÓN
      exito(`${form.tipo_movimiento} registrada. Nuevo stock de "${producto.nombre}": ${stockResultante}`);
      setModalAbierto(false);
      recargar();
      recargarProductos();
    } catch (err) {
      error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async (m) => {
    if (!window.confirm(`¿Anular el movimiento ${codigo(m.id)}? El stock de "${m.producto?.nombre}" se revertirá.`)) return;
    try {
      await api.patch(`/movimientos/${m.id}/anular`);
      exito('Movimiento anulado y stock revertido');
      setDetalle(null);
      recargar();
      recargarProductos();
    } catch (err) {
      error(mensajeError(err));
    }
  };

  return (
    <>
      <Alerta alerta={alerta} onCerrar={cerrar} />
      <Encabezado titulo="Kardex / Movimientos" descripcion="Historial de entradas, salidas y ajustes de stock" textoBoton="Registrar Movimiento" onNuevo={abrirNuevo} />
      <ErrorCarga mensaje={errorCarga} />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-semibold">Lista de Movimientos (Kardex)</span>
          <div className="d-flex flex-wrap gap-2">
            <select className="form-select filtro" value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); tabla.setPagina(1); }}>
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Buscador valor={tabla.busqueda} onChange={tabla.setBusqueda} placeholder="Buscar por producto, tipo o usuario..." />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>ID</th><th>Fecha / Hora</th><th>Producto</th><th>Tipo</th><th className="text-center">Cantidad</th><th className="text-center">Stock</th><th>Usuario</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {tabla.visibles.map((m) => (
                <tr key={m.id} className={m.estado === 'Anulado' ? 'fila-anulada' : ''}>
                  <td className="text-secondary">{codigo(m.id)}</td>
                  <td className="small text-nowrap">{fechaHora(m.fecha_hora)}</td>
                  <td>{m.producto?.nombre}</td>
                  <td>
                    <span className={`badge text-bg-${colorTipo[m.tipo_movimiento]}`}>{m.tipo_movimiento}</span>
                    {m.estado === 'Anulado' && <span className="badge text-bg-secondary ms-1">Anulado</span>}
                  </td>
                  <td className={`text-center fw-semibold text-${colorTipo[m.tipo_movimiento]}`}>{cantidadConSigno(m.tipo_movimiento, m.cantidad)}</td>
                  <td className="text-center small text-nowrap">{m.stock_anterior} → <strong>{m.stock_nuevo}</strong></td>
                  <td>
                    <div>{m.usuario?.nombre}</div>
                    <small className="text-secondary">{m.usuario?.rol}</small>
                  </td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-primary btn-sm me-2" onClick={() => setDetalle(m)}><i className="bi bi-eye me-1"></i>Ver</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleAnular(m)} disabled={m.estado === 'Anulado'}>
                      <i className="bi bi-x-circle me-1"></i>Anular
                    </button>
                  </td>
                </tr>
              ))}
              {tabla.visibles.length === 0 && <FilaVacia cargando={cargando} columnas={8} />}
            </tbody>
          </table>
        </div>
        <Paginacion tabla={tabla} etiqueta="movimientos" />
      </div>

      {/* Registrar movimiento */}
      <Modal titulo="Registrar Movimiento" abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Producto *</label>
              <select name="producto_id" className="form-select" value={form.producto_id} onChange={handleChange} required autoFocus>
                <option value="">-- Seleccione un producto --</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
              </select>
            </div>

            <label className="form-label">Tipo de movimiento *</label>
            <div className="btn-group w-100 mb-3" role="group">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn ${form.tipo_movimiento === t ? `btn-${colorTipo[t]}` : `btn-outline-${colorTipo[t]}`}`}
                  onClick={() => setForm({ ...form, tipo_movimiento: t })}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-sm-5">
                <label className="form-label">Cantidad *</label>
                <input
                  name="cantidad" type="number" step="1" className="form-control" required
                  min={form.tipo_movimiento === 'Ajuste' ? undefined : 1}
                  value={form.cantidad} onChange={handleChange}
                />
                {form.tipo_movimiento === 'Ajuste' && <div className="form-text">Use negativo para restar (ej. -2).</div>}
              </div>
              <div className="col-sm-7">
                <label className="form-label">Usuario *</label>
                <select name="usuario_id" className="form-select" value={form.usuario_id} onChange={handleChange} required>
                  <option value="">-- Quién registra --</option>
                  {usuarios.filter((u) => u.activo).map((u) => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea name="observaciones" rows="2" className="form-control" value={form.observaciones} onChange={handleChange} placeholder="Ej. Compra según factura F001-123"></textarea>
            </div>

            {producto && (
              <div className={`alert ${stockInvalido ? 'alert-danger' : 'alert-light border'} mb-0`}>
                Stock actual: <strong>{producto.stock}</strong> → Stock resultante: <strong>{stockResultante}</strong>
                {stockInvalido && <div className="small">No hay stock suficiente para esta salida.</div>}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando || stockInvalido || cantidad === 0}>Registrar</button>
          </div>
        </form>
      </Modal>

      {/* Detalle de un movimiento */}
      <Modal titulo={detalle ? `Movimiento ${codigo(detalle.id)}` : ''} abierto={Boolean(detalle)} onCerrar={() => setDetalle(null)}>
        {detalle && (
          <>
            <div className="modal-body">
              <dl className="row mb-0">
                <dt className="col-5">Fecha / hora</dt><dd className="col-7">{fechaHora(detalle.fecha_hora)}</dd>
                <dt className="col-5">Producto</dt><dd className="col-7">{detalle.producto?.nombre}</dd>
                <dt className="col-5">Tipo</dt><dd className="col-7"><span className={`badge text-bg-${colorTipo[detalle.tipo_movimiento]}`}>{detalle.tipo_movimiento}</span></dd>
                <dt className="col-5">Cantidad</dt><dd className="col-7">{cantidadConSigno(detalle.tipo_movimiento, detalle.cantidad)}</dd>
                <dt className="col-5">Stock</dt><dd className="col-7">{detalle.stock_anterior} → {detalle.stock_nuevo}</dd>
                <dt className="col-5">Registrado por</dt><dd className="col-7">{detalle.usuario?.nombre} ({detalle.usuario?.rol})</dd>
                <dt className="col-5">Estado</dt><dd className="col-7">{detalle.estado}</dd>
                <dt className="col-5">Observaciones</dt><dd className="col-7">{detalle.observaciones || '—'}</dd>
              </dl>
            </div>
            <div className="modal-footer">
              {detalle.estado === 'Activo' && (
                <button className="btn btn-outline-danger me-auto" onClick={() => handleAnular(detalle)}>Anular movimiento</button>
              )}
              <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
