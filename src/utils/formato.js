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
export const COLORES = ['#4a7c59', '#c9a66b', '#8fb07a', '#a0522d', '#6b8f8a', '#d4b483', '#2f4a3a', '#b5a27a'];
