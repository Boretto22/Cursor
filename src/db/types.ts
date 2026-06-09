export type Modalidad =
  | "boulder_indoor"
  | "boulder_outdoor"
  | "deportiva_indoor"
  | "deportiva_outdoor";

export type ResultadoVia =
  | "flash"
  | "redpoint"
  | "top"
  | "caida"
  | "proyecto";

export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type TipoEntrenamiento =
  | "boulder"
  | "deportiva"
  | "fuerza"
  | "tecnica"
  | "resistencia"
  | "descanso"
  | "outdoor";

export type CategoriaTecnica =
  | "pies"
  | "manos"
  | "equilibrio"
  | "fuerza"
  | "coordinacion";

export type ZonaCorporal =
  | "dedos"
  | "munecas"
  | "antebrazo"
  | "codo"
  | "hombro"
  | "espalda"
  | "core"
  | "cadera"
  | "rodilla"
  | "tobillo"
  | "pie";

export type SeveridadLesion = "leve" | "moderada" | "grave";

export type TipoEstiramiento = "pre" | "post" | "recuperacion";

export interface Via {
  id?: number;
  sessionId: number;
  nombre?: string;
  grado: string; // grado francés: 4a, 5b+, 6a, 7c+, etc. o boulder V0-V16
  resultado: ResultadoVia;
  intentos: number;
  fotoBase64?: string;
  notas?: string;
  orden: number;
}

export interface Sesion {
  id?: number;
  fecha: string; // ISO YYYY-MM-DDTHH:mm
  fechaDia: string; // YYYY-MM-DD (para indexación rápida del heatmap)
  modalidad: Modalidad;
  nombreLugar?: string;
  duracionMin?: number;
  sensacion: number; // 1-10
  fatiga: number; // 1-10
  tecnicasTrabajadasIds: string[];
  estiramientosSesionId?: number;
  notas?: string;
  zonaOutdoorId?: number;
  proyectosIds?: number[];
  esBorrador?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Proyecto {
  id?: number;
  nombre: string;
  grado: string;
  modalidad: Modalidad;
  zonaOutdoorId?: number;
  descripcion?: string;
  fotoBase64?: string;
  enviado: boolean;
  fechaInicio: string; // ISO date
  fechaEnviado?: string;
  intentosTotales: number;
  notas?: string;
  createdAt: string;
}

export interface IntentoProyecto {
  id?: number;
  proyectoId: number;
  sessionId?: number;
  fecha: string;
  resultado: ResultadoVia;
  notas?: string;
}

export interface EstiramientoEjercicio {
  id: string;
  nombre: string;
  duracionSeg: number;
  descripcion?: string;
  zonaCorporal?: ZonaCorporal[];
}

export interface RutinaEstiramiento {
  id: string;
  nombre: string;
  tipo: TipoEstiramiento;
  ejercicios: EstiramientoEjercicio[];
}

export interface EstiramientoSesion {
  id?: number;
  rutinaId: string;
  fecha: string;
  tipo: TipoEstiramiento;
  ejerciciosCompletados: number;
  ejerciciosTotal: number;
  duracionTotalSeg: number;
  completado: boolean;
}

export interface EjercicioTecnica {
  id?: number;
  fecha: string; // YYYY-MM-DD
  ejercicioId: string;
  categoria: CategoriaTecnica;
  series?: number;
  repeticiones?: number;
  duracionMin?: number;
  notas?: string;
}

export interface ObjetivoSemanal {
  id?: number;
  semanaISO: string; // YYYY-W##
  texto: string;
  categoria?: CategoriaTecnica;
  completado: boolean;
  fechaCreacion: string;
}

export interface Lesion {
  id?: number;
  zona: ZonaCorporal;
  lado?: "izquierda" | "derecha" | "ambos";
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD - undefined si sigue activa
  severidad: SeveridadLesion;
  descripcion?: string;
  tratamiento?: string;
  activa: boolean;
}

export interface ZonaOutdoor {
  id?: number;
  nombre: string;
  pais?: string;
  region?: string;
  lat: number;
  lng: number;
  modalidades: Modalidad[];
  notas?: string;
  fechaPrimeraVisita: string;
  visitas: number;
}

export interface SesionPlanificada {
  id?: number;
  semanaISO: string;
  dia: DiaSemana;
  tipo: TipoEntrenamiento;
  titulo?: string;
  notas?: string;
  completado: boolean;
  duracionMin?: number;
}

export interface PerfilUsuario {
  id?: number;
  nombre?: string;
  fechaInicio?: string;
  gradoMaxBoulder?: string;
  gradoMaxDeportiva?: string;
  pesoKg?: number;
  altura?: number;
  modoOscuro: boolean;
  notificacionesActivas: boolean;
}

export interface TimerPreset {
  id?: number;
  nombre: string;
  series: number;
  repeticiones: number;
  duracionRep: number;    // segundos
  descansoRep: number;    // segundos entre repeticiones
  descansoSeries: number; // segundos entre series
  creadoEn: string;
}
