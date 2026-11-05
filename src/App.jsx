import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RutaProtegida from './components/layout/RutaProtegida'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Proveedores from './pages/Proveedores'
import Kardex from './pages/Kardex'
import Usuarios from './pages/Usuarios'
import { ADMIN } from './utils/roles'

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Privadas: requieren sesión iniciada */}
      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="kardex" element={<Kardex />} />
          {/* Solo Administrador */}
          <Route element={<RutaProtegida roles={[ADMIN]} />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      {/* Cualquier ruta desconocida vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
