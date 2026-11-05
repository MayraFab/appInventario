import { COLORES } from '../../utils/formato';

// Gráfico de dona hecho con SVG (sin librerías externas)

export default function GraficoDona({ datos, tamano = 190, grosor = 30 }) {
  const total = datos.reduce((suma, d) => suma + d.valor, 0);
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;

  // Largo de cada arco y en qué punto del círculo empieza
  const arcos = datos.map((d, i) => {
    const largo = total > 0 ? (d.valor / total) * circunferencia : 0;
    const inicio = datos.slice(0, i).reduce((s, x) => s + (total > 0 ? (x.valor / total) * circunferencia : 0), 0);
    return { ...d, largo, inicio, color: COLORES[i % COLORES.length] };
  });

  return (
    <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-label="Stock por categoría">
      {/* Anillo beige de fondo */}
      <circle cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" stroke="#ece3d2" strokeWidth={grosor} />

      {/* Un arco por categoría: su largo es proporcional a su stock */}
      {arcos.map((a) => (
        <circle
          key={a.nombre}
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          fill="none"
          stroke={a.color}
          strokeWidth={grosor}
          strokeDasharray={`${a.largo} ${circunferencia - a.largo}`}
          strokeDashoffset={-a.inicio}
          transform={`rotate(-90 ${tamano / 2} ${tamano / 2})`}
        >
          <title>{`${a.nombre}: ${a.valor} unidades`}</title>
        </circle>
      ))}

      <text x="50%" y="47%" textAnchor="middle" className="dona-total">{total}</text>
      <text x="50%" y="60%" textAnchor="middle" className="dona-etiqueta">unidades</text>
    </svg>
  );
}
