import { useState } from 'react';
import api, { mensajeError } from '../services/api';
import useRecurso from '../hooks/useRecurso';
import useTabla from '../hooks/useTabla';
import useAlerta from '../hooks/useAlerta';
import Modal from '../components/common/Modal';
import { Encabezado, Buscador, FilaVacia, Paginacion, Alerta, ErrorCarga } from '../components/common/UI';
import { codigo } from '../utils/formato';
import useAuth from '../hooks/useAuth';

const FORM_VACIO = { id: null, nombre: '', email: '', password: '', rol: 'Almacenero' };
const ROLES = ['Administrador', 'Almacenero', 'Supervisor'];
const COLOR_ROL = { Administrador: 'primary', Almacenero: 'info', Supervisor: 'secondary' };

export default function Usuarios() {
  const { datos: usuarios, cargando, error: errorCarga, recargar } = useRecurso('/usuarios');
  const tabla = useTabla(usuarios, (u) => `${u.nombre} ${u.email} ${u.rol}`);
  const { alerta, exito, error, cerrar } = useAlerta();
  const { usuario: yo } = useAuth();

  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const abrirNuevo = () => { setForm(FORM_VACIO); setModalAbierto(true); };
  const abrirEditar = (u) => { setForm({ id: u.id, nombre: u.nombre, email: u.email, password: '', rol: u.rol }); setModalAbierto(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (form.id) await api.put(`/usuarios/${form.id}`, form);
      else await api.post('/usuarios', form);
      exito(form.id ? 'Usuario actualizado' : 'Usuario registrado');
      setModalAbierto(false);
      recargar();
    } catch (err) {
      error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  // En lugar de borrar, se desactiva (conserva el historial del Kardex)
  const cambiarEstado = async (u) => {
    try {
      await api.patch(`/usuarios/${u.id}/estado`);
      exito(u.activo ? `${u.nombre} fue desactivado` : `${u.nombre} fue activado`);
      recargar();
    } catch (err) {
      error(mensajeError(err));
    }
  };

  return (
    <>
      <Alerta alerta={alerta} onCerrar={cerrar} />
      <Encabezado titulo="Usuarios" descripcion="Personal con acceso al panel administrativo" textoBoton="Nuevo Usuario" onNuevo={abrirNuevo} />
      <ErrorCarga mensaje={errorCarga} />

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span className="fw-semibold">Lista de Usuarios</span>
          <Buscador valor={tabla.busqueda} onChange={tabla.setBusqueda} placeholder="Buscar por nombre o email..." />
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {tabla.visibles.map((u) => (
                <tr key={u.id}>
                  <td className="text-secondary">{codigo(u.id)}</td>
                  <td className="fw-semibold">{u.nombre}{u.id === yo.id && <span className="badge text-bg-light border ms-2">Tú</span>}</td>
                  <td className="small">{u.email}</td>
                  <td><span className={`badge text-bg-${COLOR_ROL[u.rol]}`}>{u.rol}</span></td>
                  <td>
                    <span className={`badge rounded-pill ${u.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-warning btn-sm me-2" onClick={() => abrirEditar(u)}><i className="bi bi-pencil-square me-1"></i>Editar</button>
                    <button
                      className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => cambiarEstado(u)}
                      disabled={u.id === yo.id}
                      title={u.id === yo.id ? 'No puede desactivar su propia cuenta' : undefined}
                    >
                      <i className={`bi ${u.activo ? 'bi-person-x' : 'bi-person-check'} me-1`}></i>{u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {tabla.visibles.length === 0 && <FilaVacia cargando={cargando} columnas={6} />}
            </tbody>
          </table>
        </div>
        <Paginacion tabla={tabla} etiqueta="usuarios" />
      </div>

      <Modal titulo={form.id ? 'Editar Usuario' : 'Nuevo Usuario'} abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre completo *</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label">Contraseña {!form.id && '*'}</label>
                <input
                  name="password" type="password" minLength={6} className="form-control"
                  value={form.password} onChange={handleChange} required={!form.id}
                  placeholder={form.id ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  autoComplete="new-password"
                />
              </div>
              <div className="col-sm-6">
                <label className="form-label">Rol *</label>
                <select name="rol" className="form-select" value={form.rol} onChange={handleChange}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-text mt-2"><i className="bi bi-shield-lock me-1"></i>La contraseña se guarda encriptada con bcrypt.</div>
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
