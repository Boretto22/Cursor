import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { inicioSemana, finSemana, calcularRacha, diasUltimos } from "../utils/fechas";
import { format } from "date-fns";

export interface ResumenSemanal {
  sesionesSemana: number;
  diasUnicosSemana: number;
  duracionTotalMin: number;
  viasSemana: number;
  flashSemana: number;
  racha: number;
  fechasConteoUltMeses: Record<string, number>;
}

export function useResumenSemanal(meses = 3): ResumenSemanal | undefined {
  return useLiveQuery(async () => {
    const ini = format(inicioSemana(), "yyyy-MM-dd");
    const fin = format(finSemana(), "yyyy-MM-dd");
    const todas = await db.sesiones.toArray();
    const noBorradores = todas.filter((s) => !s.esBorrador);

    const semana = noBorradores.filter(
      (s) => s.fechaDia >= ini && s.fechaDia <= fin
    );
    const idsSesionSemana = semana
      .map((s) => s.id!)
      .filter((id): id is number => typeof id === "number");

    let viasSemana = 0;
    let flashSemana = 0;
    if (idsSesionSemana.length) {
      const vias = await db.vias.where("sessionId").anyOf(idsSesionSemana).toArray();
      viasSemana = vias.length;
      flashSemana = vias.filter((v) => v.resultado === "flash").length;
    }

    const duracionTotalMin = semana.reduce(
      (a, s) => a + (s.duracionMin ?? 0),
      0
    );

    const diasUnicos = new Set(semana.map((s) => s.fechaDia));

    const fechasConteo: Record<string, number> = {};
    const limite = diasUltimos(meses * 31)[0];
    for (const s of noBorradores) {
      if (s.fechaDia >= limite) {
        fechasConteo[s.fechaDia] = (fechasConteo[s.fechaDia] || 0) + 1;
      }
    }

    const fechasDias = Object.keys(fechasConteo);
    const racha = calcularRacha(fechasDias);

    return {
      sesionesSemana: semana.length,
      diasUnicosSemana: diasUnicos.size,
      duracionTotalMin,
      viasSemana,
      flashSemana,
      racha,
      fechasConteoUltMeses: fechasConteo,
    };
  }, []);
}

export function useResumenAnual(): Record<string, number> | undefined {
  return useLiveQuery(async () => {
    const sesiones = await db.sesiones.toArray();
    const out: Record<string, number> = {};
    for (const s of sesiones) {
      if (s.esBorrador) continue;
      out[s.fechaDia] = (out[s.fechaDia] || 0) + 1;
    }
    return out;
  }, []);
}

export function useUltimasSesiones(n = 5) {
  return useLiveQuery(async () => {
    const todas = await db.sesiones.orderBy("fecha").reverse().toArray();
    return todas.filter((s) => !s.esBorrador).slice(0, n);
  }, [n]);
}
