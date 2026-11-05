import { useState } from 'react';
import api, { mensajeError } from '../services/api';
import useRecurso from '../hooks/useRecurso';
import useTabla from '../hooks/useTabla';
import useAlerta from '../hooks/useAlerta';
import Modal from '../components/common/Modal';
import { Encabezado, Buscador, FilaVacia, Paginacion, Alerta, ErrorCarga } from '../components/common/UI';
import { codigo } from '../utils/formato';
import useAuth from '../hooks/useAuth';
import { ADMIN, ALMACENERO } from '../utils/roles';

const FORM_VACIO = { id: null, nombre: '', descripcion: '' };

export default function Categorias() {
  const { datos: categorias, cargando, error: errorCarga, recargar } = useRecurso('/categorias');
  const tabla = useTabla(categorias, (c) => `${c.nombre} ${c.descripcion ?? ''}`);
  const { alerta, exito, error, cerrar } = useAlerta();
  const { tieneRol } = useAuth();
  const puedeEditar = tieneRol(ADMIN, ALMACENERO); // Supervisor: solo lectura
  const puedeEliminar = tieneRol(ADMIN);

  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => { setForm(FORM_VACIO); setModalAbierto(true); };
  const abrirEditar = (c) => { setForm({ id: c.id, nombre: c.nombre, descripcion: c.descripcion ?? '' }); setModalAbierto(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (form.id) await api.put(`/categorias/${form.id}`, form);
      else await api.post('/categorias', form);
      exito(form.id ? 'Categoría actualizada' : 'Categoría registrada');
      setModalAbierto(false);
      recargar();
    } catch (err) {
      error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await api.delete(`/categorias/${c.id}`);
      exito('Categoría eliminada');
      recargar();
    } catch (err) {
      error(mensajeError(err)); // Ej: tiene productos asociados (llave foránea)
    }
  };

  return (
    <>
      <Alerta alerta={alerta} onCerrar={cerrar} />
      <Encabezado titulo="Categorías" descripcion="Clasificación del catálogo de productos" textoBoton={puedeEditar ? 'Nueva Categoría' : null} onNuevo={abrirNuevo} />
      <ErrorCarga mensaje={errorCarga} />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-semibold">Lista de Categorías</span>
          <Buscador valor={tabla.busqueda} onChange={tabla.setBusqueda} placeholder="Buscar por nombre..." />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th className="text-center">Cant. Productos</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {tabla.visibles.map((c) => (
                <tr key={c.id}>
                  <td className="text-secondary">{codigo(c.id)}</td>
                  <td className="fw-semibold">{c.nombre}</td>
                  <td className="small text-secondary">{c.descripcion}</td>
                  <td className="text-center"><span className="badge rounded-pill text-bg-light border">{c.total_productos}</span></td>
                  <td className="text-end text-nowrap">
                    {puedeEditar && <button className="btn btn-warning btn-sm me-2" onClick={() => abrirEditar(c)}><i className="bi bi-pencil-square me-1"></i>Editar</button>}
                    {puedeEliminar && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}><i className="bi bi-trash me-1"></i>Eliminar</button>}
                  </td>
                </tr>
              ))}
              {tabla.visibles.length === 0 && <FilaVacia cargando={cargando} columnas={5} />}
            </tbody>
          </table>
        </div>
        <Paginacion tabla={tabla} etiqueta="categorías" />
      </div>

      <Modal titulo={form.id ? 'Editar Categoría' : 'Nueva Categoría'} abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea name="descripcion" rows="3" className="form-control" value={form.descripcion} onChange={handleChange}></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>{form.id ? 'Actualizar' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
