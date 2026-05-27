import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Activity, TrendingUp, Zap, Frown } from "lucide-react";
import { db } from "../db/database";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardTitle } from "../components/ui/Card";
import { Heatmap } from "../components/charts/Heatmap";
import { Chip } from "../components/ui/Chip";
import { gradosPorModalidad, indiceGrado } from "../data/grados";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Modalidad } from "../db/types";
import { ZONAS_CORPORALES } from "../data/zonasCorporales";

const COLORS = {
  flash: "#D9A441",
  redpoint: "#4A7C59",
  top: "#3B82F6",
  caida: "#F97316",
  proyecto: "#A855F7",
};

const FILTROS_MODALIDAD: { id: Modalidad | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "boulder_indoor", label: "Boulder indoor" },
  { id: "boulder_outdoor", label: "Boulder outdoor" },
  { id: "deportiva_indoor", label: "Deportiva indoor" },
  { id: "deportiva_outdoor", label: "Deportiva outdoor" },
];

export function Progreso() {
  const [modalidadFiltro, setModalidadFiltro] = useState<Modalidad | "todas">(
    "deportiva_indoor"
  );

  const sesiones = useLiveQuery(async () =>
    (await db.sesiones.toArray()).filter((s) => !s.esBorrador)
  );
  const vias = useLiveQuery(async () => await db.vias.toArray());
  const lesiones = useLiveQuery(async () =>
    (await db.lesiones.toArray()).filter((l) => l.activa)
  );

  const fechasConteo = useMemo(() => {
    const acc: Record<string, number> = {};
    sesiones?.forEach((s) => {
      acc[s.fechaDia] = (acc[s.fechaDia] || 0) + 1;
    });
    return acc;
  }, [sesiones]);

  const { evolucionGrado, distribucionResultado, zonasDebiles, statsResumen } = useMemo(() => {
    if (!sesiones || !vias) {
      return {
        evolucionGrado: [],
        distribucionResultado: [],
        zonasDebiles: [],
        statsResumen: { total: 0, flashPct: 0, redpointPct: 0, gradoMax: "—" },
      };
    }

    const modActual: Modalidad =
      modalidadFiltro === "todas" ? "deportiva_indoor" : modalidadFiltro;
    const gradosArr = gradosPorModalidad(modActual);

    const sesionesFiltradas =
      modalidadFiltro === "todas"
        ? sesiones
        : sesiones.filter((s) => s.modalidad === modalidadFiltro);

    const idsSesionesFiltradas = new Set(sesionesFiltradas.map((s) => s.id));
    const viasFiltradas = vias.filter((v) => idsSesionesFiltradas.has(v.sessionId));

    const porMes: Record<string, string[]> = {};
    sesionesFiltradas.forEach((s) => {
      const mesKey = format(parseISO(s.fecha), "yyyy-MM");
      const viasS = vias.filter(
        (v) => v.sessionId === s.id && (v.resultado === "flash" || v.resultado === "redpoint")
      );
      viasS.forEach((v) => {
        if (!porMes[mesKey]) porMes[mesKey] = [];
        porMes[mesKey].push(v.grado);
      });
    });

    const evolucionGrado = Object.keys(porMes)
      .sort()
      .map((m) => {
        const indices = porMes[m]
          .map((g) => indiceGrado(g, modActual))
          .filter((i) => i >= 0);
        const maxIdx = indices.length ? Math.max(...indices) : null;
        return {
          mes: format(parseISO(m + "-01"), "MMM yy", { locale: es }),
          gradoIdx: maxIdx,
          grado: maxIdx !== null ? gradosArr[maxIdx] : null,
        };
      });

    const resultados = viasFiltradas.reduce<Record<string, number>>((acc, v) => {
      acc[v.resultado] = (acc[v.resultado] || 0) + 1;
      return acc;
    }, {});
    const totalVias = viasFiltradas.length || 1;
    const distribucionResultado = Object.entries(resultados).map(([k, v]) => ({
      name: k,
      value: v,
      porcentaje: Math.round((v / totalVias) * 100),
    }));

    // Zonas débiles (a partir de lesiones recientes y técnicas con poca frecuencia)
    const conteoZonas: Record<string, number> = {};
    (lesiones || []).forEach((l) => {
      conteoZonas[l.zona] = (conteoZonas[l.zona] || 0) + 1;
    });
    const zonasDebiles = ZONAS_CORPORALES.map((z) => ({
      zona: z.nombre,
      emoji: z.emoji,
      lesiones: conteoZonas[z.id] || 0,
    }))
      .filter((z) => z.lesiones > 0)
      .sort((a, b) => b.lesiones - a.lesiones);

    const total = viasFiltradas.length;
    const flashCount = viasFiltradas.filter((v) => v.resultado === "flash").length;
    const redpointCount = viasFiltradas.filter((v) => v.resultado === "redpoint").length;
    const gradoMaxRedpoint = viasFiltradas
      .filter((v) => v.resultado === "redpoint" || v.resultado === "flash")
      .reduce<string | null>((max, v) => {
        if (!max) return v.grado;
        return indiceGrado(v.grado, modActual) > indiceGrado(max, modActual) ? v.grado : max;
      }, null);

    return {
      evolucionGrado,
      distribucionResultado,
      zonasDebiles,
      statsResumen: {
        total,
        flashPct: total ? Math.round((flashCount / total) * 100) : 0,
        redpointPct: total ? Math.round((redpointCount / total) * 100) : 0,
        gradoMax: gradoMaxRedpoint || "—",
      },
    };
  }, [sesiones, vias, lesiones, modalidadFiltro]);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader titulo="Progreso" subtitulo="Tu evolución a lo largo del tiempo" />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {FILTROS_MODALIDAD.map((f) => (
          <Chip
            key={f.id}
            activo={modalidadFiltro === f.id}
            onClick={() => setModalidadFiltro(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Grado máximo</span>
          </div>
          <p className="text-2xl font-bold text-crux-primary">{statsResumen.gradoMax}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs">Total vías</span>
          </div>
          <p className="text-2xl font-bold">{statsResumen.total}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs">% A vista</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{statsResumen.flashPct}%</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <span className="text-xs">% Encadenadas</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{statsResumen.redpointPct}%</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Evolución del grado máximo</CardTitle>
        {evolucionGrado.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolucionGrado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DA" />
              <XAxis dataKey="mes" fontSize={11} stroke="#6B6B6B" />
              <YAxis
                fontSize={11}
                stroke="#6B6B6B"
                domain={[0, "dataMax + 1"]}
                tickFormatter={(idx) => {
                  const arr = gradosPorModalidad(
                    modalidadFiltro === "todas" ? "deportiva_indoor" : modalidadFiltro
                  );
                  return arr[idx] || "";
                }}
              />
              <Tooltip
                formatter={(val: any, _: any, p: any) => [p.payload?.grado || "—", "Grado"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E8E4DA",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="gradoIdx"
                stroke="#4A7C59"
                strokeWidth={3}
                dot={{ fill: "#4A7C59", r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-stone-500 py-8">
            Aún no hay vías suficientes. Registra tu primera sesión.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Actividad (12 meses)</CardTitle>
        <Heatmap fechasConteo={fechasConteo} meses={12} />
      </Card>

      <Card>
        <CardTitle>Distribución de resultados</CardTitle>
        {distribucionResultado.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distribucionResultado}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {distribucionResultado.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={(COLORS as Record<string, string>)[entry.name] || "#999"}
                  />
                ))}
              </Pie>
              <Legend
                formatter={(value: string, entry: any) =>
                  `${value} (${entry?.payload?.porcentaje}%)`
                }
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-sm text-stone-500 py-8">Sin datos aún</p>
        )}
      </Card>

      <Card>
        <CardTitle>Zonas corporales débiles</CardTitle>
        {zonasDebiles.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zonasDebiles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DA" />
              <XAxis type="number" fontSize={11} stroke="#6B6B6B" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="zona"
                fontSize={11}
                stroke="#6B6B6B"
                width={80}
              />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="lesiones" fill="#8B6914" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center gap-3 py-4 text-stone-500 dark:text-stone-400">
            <Frown className="w-5 h-5" />
            <p className="text-sm">
              No hay lesiones registradas. ¡Bien! Sigue cuidándote.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
