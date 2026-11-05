// Funciones para mostrar datos con formato peruano

// 1500 → "S/ 1,500.00"
export const moneda = (valor) =>
  `S/ ${Number(valor || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Fecha ISO → "05 nov 2026, 10:35"
export const fechaHora = (valor) =>
  new Date(valor).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

// 7 → "007"
export const codigo = (id) => String(id).padStart(3, '0');

// Colores de Bootstrap para cada tipo de movimiento
export const colorTipo = { Entrada: 'success', Salida: 'danger', Ajuste: 'warning' };

// Cantidad con signo según el tipo: Entrada +5, Salida -2, Ajuste ±n
export const cantidadConSigno = (tipo, cantidad) => {
  const valor = tipo === 'Salida' ? -cantidad : cantidad;
  return valor > 0 ? `+${valor}` : `${valor}`;
};

// Paleta para gráficos (una por categoría)
export const COLORES = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
