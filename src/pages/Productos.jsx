import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import useRecurso from '../hooks/useRecurso';
import useTabla from '../hooks/useTabla';
import useAlerta from '../hooks/useAlerta';
import Modal from '../components/common/Modal';
import { Encabezado, Buscador, FilaVacia, Paginacion, Alerta, ErrorCarga } from '../components/common/UI';
import { codigo, moneda } from '../utils/formato';
import useAuth from '../hooks/useAuth';
import { ADMIN, ALMACENERO } from '../utils/roles';

const FORM_VACIO = {
  id: null, nombre: '', descripcion: '', precio: '', stock_minimo: 5,
  categoria_id: '', proveedor_id: '', stock_inicial: '', stock: 0
};

export default function Productos() {
  const { datos: productos, cargando, error: errorCarga, recargar } = useRecurso('/productos');
  // Listas para llenar los <select> del formulario (formularios relacionales)
  const { datos: categorias } = useRecurso('/categorias');
  const { datos: proveedores } = useRecurso('/proveedores');
  const { alerta, exito, error, cerrar } = useAlerta();
  const { tieneRol } = useAuth();
  const puedeEditar = tieneRol(ADMIN, ALMACENERO); // Supervisor: solo lectura
  const puedeEliminar = tieneRol(ADMIN);

  const [filtroCategoria, setFiltroCategoria] = useState('');
  const productosFiltrados = filtroCategoria
    ? productos.filter((p) => String(p.categoria_id) === filtroCategoria)
    : productos;
  const tabla = useTabla(productosFiltrados, (p) => `${p.nombre} ${p.categoria?.nombre ?? ''} ${p.proveedor?.razon_social ?? ''}`);

  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const sinCategorias = categorias.length === 0;

  const abrirNuevo = () => { setForm(FORM_VACIO); setModalAbierto(true); };
  const abrirEditar = (p) => {
    setForm({
      ...FORM_VACIO,
      id: p.id, nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio,
      stock_minimo: p.stock_minimo, categoria_id: p.categoria_id, proveedor_id: p.proveedor_id ?? '', stock: p.stock
    });
    setModalAbierto(true);
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    // eslint-disable-next-line no-unused-vars
    const { id, stock, ...datos } = form; // el stock no se envía
    try {
      if (id) await api.put(`/productos/${id}`, datos);
      else await api.post('/productos', datos);
      exito(id ? 'Producto actualizado' : 'Producto registrado');
      setModalAbierto(false);
      recargar();
    } catch (err) {
      error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    try {
      await api.delete(`/productos/${p.id}`);
      exito('Producto eliminado');
      recargar();
    } catch (err) {
      error(mensajeError(err)); // Ej: tiene movimientos en el Kardex
    }
  };

  return (
    <>
      <Alerta alerta={alerta} onCerrar={cerrar} />
      <Encabezado titulo="Productos" descripcion="Catálogo con su categoría, proveedor y stock" textoBoton={puedeEditar ? 'Nuevo Producto' : null} onNuevo={abrirNuevo} />
      <ErrorCarga mensaje={errorCarga} />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-semibold">Lista de Productos</span>
          <div className="d-flex flex-wrap gap-2">
            <select
              className="form-select filtro"
              value={filtroCategoria}
              onChange={(e) => { setFiltroCategoria(e.target.value); tabla.setPagina(1); }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <Buscador valor={tabla.busqueda} onChange={tabla.setBusqueda} placeholder="Buscar por nombre o categoría..." />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Proveedor</th><th>Precio</th><th className="text-center">Stock</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {tabla.visibles.map((p) => {
                const bajoStock = p.stock <= p.stock_minimo;
                return (
                  <tr key={p.id}>
                    <td className="text-secondary">{codigo(p.id)}</td>
                    <td>
                      <div className="fw-semibold">{p.nombre}</div>
                      <small className="text-secondary">{p.descripcion}</small>
                    </td>
                    <td><span className="badge text-bg-light border">{p.categoria?.nombre}</span></td>
                    <td className="small">{p.proveedor?.razon_social ?? <span className="text-secondary">—</span>}</td>
                    <td className="text-nowrap">{moneda(p.precio)}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${bajoStock ? 'text-bg-danger' : 'text-bg-success'}`}
                        title={bajoStock ? `Bajo el mínimo (${p.stock_minimo})` : `Mínimo: ${p.stock_minimo}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      {puedeEditar && <button className="btn btn-warning btn-sm me-2" onClick={() => abrirEditar(p)}><i className="bi bi-pencil-square me-1"></i>Editar</button>}
                      {puedeEliminar && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><i className="bi bi-trash me-1"></i>Eliminar</button>}
                    </td>
                  </tr>
                );
              })}
              {tabla.visibles.length === 0 && <FilaVacia cargando={cargando} columnas={7} />}
            </tbody>
          </table>
        </div>
        <Paginacion tabla={tabla} etiqueta="productos" />
      </div>

      <Modal titulo={form.id ? 'Editar Producto' : 'Nuevo Producto'} abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} tamano="modal-lg">
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Regla relacional: no hay producto sin categoría */}
            {sinCategorias && (
              <div className="alert alert-warning">
                No hay categorías registradas. <Link to="/categorias">Registra una categoría</Link> antes de crear productos.
              </div>
            )}
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Nombre *</label>
                <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required autoFocus />
              </div>
              <div className="col-md-4">
                <label className="form-label">Precio (S/) *</label>
                <input name="precio" type="number" step="0.01" min="0" className="form-control" value={form.precio} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <input name="descripcion" className="form-control" value={form.descripcion} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Categoría *</label>
                <select name="categoria_id" className="form-select" value={form.categoria_id} onChange={handleChange} required>
                  <option value="">-- Seleccione una categoría --</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Proveedor</label>
                <select name="proveedor_id" className="form-select" value={form.proveedor_id} onChange={handleChange}>
                  <option value="">-- Sin proveedor --</option>
                  {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Stock mínimo *</label>
                <input name="stock_minimo" type="number" min="0" className="form-control" value={form.stock_minimo} onChange={handleChange} required />
                <div className="form-text">Debajo de este valor se genera una alerta.</div>
              </div>

              {form.id ? (
                <div className="col-md-8">
                  <label className="form-label">Stock actual</label>
                  <input className="form-control" value={form.stock} disabled />
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>El stock solo cambia desde <Link to="/kardex">Kardex / Movimientos</Link>, para dejar historial.
                  </div>
                </div>
              ) : (
                <>
                  <div className="col-md-8">
                    <label className="form-label">Stock inicial</label>
                    <input name="stock_inicial" type="number" min="0" className="form-control" value={form.stock_inicial} onChange={handleChange} placeholder="0" />
                    <div className="form-text">Se registra como Entrada en el Kardex a nombre del usuario que inició sesión.</div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando || sinCategorias}>{form.id ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
