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

const FORM_VACIO = { id: null, razon_social: '', contacto: '', telefono: '', email: '' };

export default function Proveedores() {
  const { datos: proveedores, cargando, error: errorCarga, recargar } = useRecurso('/proveedores');
  const tabla = useTabla(proveedores, (p) => `${p.razon_social} ${p.contacto ?? ''} ${p.email ?? ''}`);
  const { alerta, exito, error, cerrar } = useAlerta();
  const { tieneRol } = useAuth();
  const puedeEditar = tieneRol(ADMIN, ALMACENERO); // Supervisor: solo lectura
  const puedeEliminar = tieneRol(ADMIN);

  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => { setForm(FORM_VACIO); setModalAbierto(true); };
  const abrirEditar = (p) => {
    setForm({ id: p.id, razon_social: p.razon_social, contacto: p.contacto ?? '', telefono: p.telefono ?? '', email: p.email ?? '' });
    setModalAbierto(true);
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (form.id) await api.put(`/proveedores/${form.id}`, form);
      else await api.post('/proveedores', form);
      exito(form.id ? 'Proveedor actualizado' : 'Proveedor registrado');
      setModalAbierto(false);
      recargar();
    } catch (err) {
      error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar al proveedor "${p.razon_social}"?`)) return;
    try {
      await api.delete(`/proveedores/${p.id}`);
      exito('Proveedor eliminado');
      recargar();
    } catch (err) {
      error(mensajeError(err));
    }
  };

  return (
    <>
      <Alerta alerta={alerta} onCerrar={cerrar} />
      <Encabezado titulo="Proveedores" descripcion="Empresas que abastecen los productos" textoBoton={puedeEditar ? 'Nuevo Proveedor' : null} onNuevo={abrirNuevo} />
      <ErrorCarga mensaje={errorCarga} />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-semibold">Lista de Proveedores</span>
          <Buscador valor={tabla.busqueda} onChange={tabla.setBusqueda} placeholder="Buscar por razón social o contacto..." />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>ID</th><th>Razón Social</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th className="text-center">Productos</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {tabla.visibles.map((p) => (
                <tr key={p.id}>
                  <td className="text-secondary">{codigo(p.id)}</td>
                  <td className="fw-semibold">{p.razon_social}</td>
                  <td>{p.contacto}</td>
                  <td>{p.telefono}</td>
                  <td className="small">{p.email}</td>
                  <td className="text-center"><span className="badge rounded-pill text-bg-light border">{p.total_productos}</span></td>
                  <td className="text-end text-nowrap">
                    {puedeEditar && <button className="btn btn-warning btn-sm me-2" onClick={() => abrirEditar(p)}><i className="bi bi-pencil-square me-1"></i>Editar</button>}
                    {puedeEliminar && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><i className="bi bi-trash me-1"></i>Eliminar</button>}
                  </td>
                </tr>
              ))}
              {tabla.visibles.length === 0 && <FilaVacia cargando={cargando} columnas={7} />}
            </tbody>
          </table>
        </div>
        <Paginacion tabla={tabla} etiqueta="proveedores" />
      </div>

      <Modal titulo={form.id ? 'Editar Proveedor' : 'Nuevo Proveedor'} abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Razón social *</label>
              <input name="razon_social" className="form-control" value={form.razon_social} onChange={handleChange} required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label">Persona de contacto</label>
              <input name="contacto" className="form-control" value={form.contacto} onChange={handleChange} />
            </div>
            <div className="row g-3">
              <div className="col-sm-5">
                <label className="form-label">Teléfono</label>
                <input name="telefono" type="tel" className="form-control" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="col-sm-7">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
              </div>
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
