import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Categorias from './pages/Categorias'
import Proveedores from './pages/Proveedores'
import Kardex from './pages/Kardex'
import Usuarios from './pages/Usuarios'

function App() {
  return (
    <Routes>
      {/* Layout = menú lateral + barra superior; cada vista se dibuja en su <Outlet /> */}
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="kardex" element={<Kardex />} />
        <Route path="usuarios" element={<Usuarios />} />
        {/* Cualquier ruta desconocida vuelve al Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
