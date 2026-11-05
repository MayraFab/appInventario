import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { mensajeError } from '../services/api';

export default function Login() {
  const { usuario, login } = useAuth();
  const ubicacion = useLocation();
  const destino = ubicacion.state?.desde || '/'; // página que se intentó abrir antes del login

  const [form, setForm] = useState({ email: '', password: '' });
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Con sesión iniciada se redirige al panel (también justo después de un login exitoso)
  if (usuario) return <Navigate to={destino} replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(form.email.trim(), form.password); // al guardar la sesión, se redirige solo
    } catch (err) {
      setError(mensajeError(err)); // Credenciales inválidas, usuario desactivado o demasiados intentos
      setEnviando(false);
    }
  };

  return (
    <div className="login-fondo">
      <div className="card login-card shadow">
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div className="login-logo"><i className="bi bi-boxes"></i></div>
            <h1 className="h4 fw-bold mb-1">SENATI · Sistema de Inventario</h1>
            <p className="text-secondary mb-0">Inicie sesión para continuar</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  name="email" type="email" className="form-control" placeholder="usuario@inventario.pe"
                  value={form.email} onChange={handleChange} required autoFocus autoComplete="username"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  name="password" type={verPassword ? 'text' : 'password'} className="form-control"
                  value={form.password} onChange={handleChange} required autoComplete="current-password"
                />
                <button
                  type="button" className="btn btn-outline-secondary"
                  onClick={() => setVerPassword(!verPassword)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${verPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={enviando}>
              {enviando
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Ingresando...</>
                : <><i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</>}
            </button>
          </form>

          <p className="text-center text-secondary small mt-4 mb-0">
            <i className="bi bi-shield-lock me-1"></i>Acceso protegido con JWT
          </p>
        </div>
      </div>
    </div>
  );
}
