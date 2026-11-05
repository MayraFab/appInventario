import { Link } from 'react-router-dom';
import useRecurso from '../hooks/useRecurso';
import GraficoDona from '../components/common/GraficoDona';
import { ErrorCarga } from '../components/common/UI';
import { moneda, fechaHora, colorTipo, cantidadConSigno, COLORES } from '../utils/formato';

// Tarjeta de indicador (KPI)
function TarjetaKpi({ titulo, valor, icono, color, enlace }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <Link to={enlace} className="card kpi h-100 text-decoration-none">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <div className="text-secondary small">{titulo}</div>
            <div className={`fs-2 fw-bold text-${color === 'danger' ? 'danger' : 'body'}`}>{valor}</div>
          </div>
          <div className={`kpi-icono bg-${color}-subtle text-${color}`}>
            <i className={`bi ${icono}`}></i>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { datos: d, cargando, error } = useRecurso('/dashboard', null);

  if (cargando) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }
  if (!d) return <ErrorCarga mensaje={error} />;

  const stockCategorias = d.stockPorCategoria.map((c) => ({ nombre: c.nombre, valor: Number(c.stock_total) }));

  return (
    <>
      <h1 className="h3 fw-bold mb-3">Dashboard</h1>
      <ErrorCarga mensaje={error} />

      {/* 1. Indicadores KPI */}
      <div className="row g-3 mb-3">
        <TarjetaKpi titulo="Total Productos" valor={d.totalProductos} icono="bi-box-seam" color="primary" enlace="/productos" />
        <TarjetaKpi titulo="Categorías" valor={d.totalCategorias} icono="bi-tags" color="info" enlace="/categorias" />
        <TarjetaKpi titulo="Proveedores" valor={d.totalProveedores} icono="bi-truck" color="success" enlace="/proveedores" />
        <TarjetaKpi titulo="Bajo Stock (Alertas)" valor={d.bajoStock} icono="bi-exclamation-triangle" color="danger" enlace="/productos" />
      </div>

      <div className="row g-3">
        {/* 2. Últimos movimientos del Kardex */}
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Movimientos Recientes (Kardex)</span>
              <Link to="/kardex" className="small">Ver todo</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th></tr>
                </thead>
                <tbody>
                  {d.movimientosRecientes.map((m) => (
                    <tr key={m.id} className={m.estado === 'Anulado' ? 'fila-anulada' : ''}>
                      <td className="text-nowrap small">{fechaHora(m.fecha_hora)}</td>
                      <td>{m.producto?.nombre}</td>
                      <td><span className={`badge text-bg-${colorTipo[m.tipo_movimiento]}`}>{m.tipo_movimiento}</span></td>
                      <td className="fw-semibold">{cantidadConSigno(m.tipo_movimiento, m.cantidad)}</td>
                      <td>{m.usuario?.nombre}</td>
                    </tr>
                  ))}
                  {d.movimientosRecientes.length === 0 && (
                    <tr><td colSpan="5" className="text-center text-secondary py-4">Aún no hay movimientos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Gráfico: stock por categoría */}
        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header fw-semibold">Stock por Categoría</div>
            <div className="card-body d-flex flex-column align-items-center gap-3">
              <GraficoDona datos={stockCategorias} />
              <ul className="list-unstyled w-100 mb-0">
                {stockCategorias.map((c, i) => (
                  <li key={c.nombre} className="d-flex align-items-center gap-2 small py-1">
                    <span className="leyenda" style={{ background: COLORES[i % COLORES.length] }}></span>
                    <span className="flex-grow-1">{c.nombre}</span>
                    <span className="fw-semibold">{c.valor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Productos que necesitan reposición */}
        <div className="col-xl-8">
          <div className="card h-100">
            <div className="card-header fw-semibold text-danger">
              <i className="bi bi-exclamation-triangle me-1"></i>Productos con Bajo Stock
            </div>
            <ul className="list-group list-group-flush">
              {d.productosBajoStock.map((p) => (
                <li key={p.id} className="list-group-item">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{p.nombre}</span>
                    <span className="text-danger fw-semibold">{p.stock} / mín. {p.stock_minimo}</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${Math.min(100, (p.stock / Math.max(p.stock_minimo, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </li>
              ))}
              {d.productosBajoStock.length === 0 && (
                <li className="list-group-item text-success"><i className="bi bi-check-circle me-1"></i>Todo el stock está sobre el mínimo</li>
              )}
            </ul>
          </div>
        </div>

        {/* 5. Resumen general */}
        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-header fw-semibold">Resumen</div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex justify-content-between">
                <span><i className="bi bi-cash-stack me-2 text-success"></i>Valor del inventario</span>
                <span className="fw-semibold">{moneda(d.valorInventario)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span><i className="bi bi-people me-2 text-primary"></i>Usuarios activos</span>
                <span className="fw-semibold">{d.usuariosActivos}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span><i className="bi bi-box me-2 text-info"></i>Unidades en almacén</span>
                <span className="fw-semibold">{stockCategorias.reduce((s, c) => s + c.valor, 0)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
