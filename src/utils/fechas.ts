import {
  format,
  startOfDay,
  startOfWeek,
  endOfWeek,
  subDays,
  differenceInCalendarDays,
  getISOWeek,
  getISOWeekYear,
  addDays,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export function hoyISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function hoyDateTimeISO(): string {
  return new Date().toISOString();
}

export function diaCorto(fecha: string): string {
  return format(parseISO(fecha), "EEE d", { locale: es });
}

export function diaLargo(fecha: string): string {
  return format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es });
}

export function semanaISOActual(): string {
  const d = new Date();
  return `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
}

export function semanaISO(fecha: Date): string {
  return `${getISOWeekYear(fecha)}-W${String(getISOWeek(fecha)).padStart(2, "0")}`;
}

export function inicioSemana(d: Date = new Date()): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

export function finSemana(d: Date = new Date()): Date {
  return endOfWeek(d, { weekStartsOn: 1 });
}

export function diasUltimos(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
  }
  return out;
}

export function calcularRacha(fechasDias: string[]): number {
  if (!fechasDias.length) return 0;
  const set = new Set(fechasDias);
  let racha = 0;
  let cursor = startOfDay(new Date());
  // tolerancia: si hoy no hay sesión pero ayer sí, también cuenta
  if (!set.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
    if (!set.has(format(cursor, "yyyy-MM-dd"))) return 0;
  }
  while (set.has(format(cursor, "yyyy-MM-dd"))) {
    racha++;
    cursor = subDays(cursor, 1);
  }
  return racha;
}

export function diasEntreFechas(inicio: string, fin?: string): number {
  const end = fin ? parseISO(fin) : new Date();
  return Math.max(1, differenceInCalendarDays(end, parseISO(inicio)) + 1);
}

export function formatearFechaCorta(fecha: string): string {
  try {
    return format(parseISO(fecha), "d MMM yyyy", { locale: es });
  } catch {
    return fecha;
  }
}

export function diasSemanaList(semIso?: string): { dia: string; fecha: string }[] {
  const ref = semIso
    ? (() => {
        const [yStr, wStr] = semIso.split("-W");
        const y = parseInt(yStr);
        const w = parseInt(wStr);
        const simple = new Date(y, 0, 1 + (w - 1) * 7);
        return startOfWeek(simple, { weekStartsOn: 1 });
      })()
    : inicioSemana();
  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  return dias.map((d, i) => ({
    dia: d,
    fecha: format(addDays(ref, i), "yyyy-MM-dd"),
  }));
}
