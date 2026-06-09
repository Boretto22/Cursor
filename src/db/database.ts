import Dexie, { Table } from "dexie";
import type {
  Sesion,
  Via,
  Proyecto,
  IntentoProyecto,
  EstiramientoSesion,
  EjercicioTecnica,
  ObjetivoSemanal,
  Lesion,
  ZonaOutdoor,
  SesionPlanificada,
  PerfilUsuario,
  TimerPreset,
} from "./types";

export class CruxTrackerDB extends Dexie {
  sesiones!: Table<Sesion, number>;
  vias!: Table<Via, number>;
  proyectos!: Table<Proyecto, number>;
  intentosProyecto!: Table<IntentoProyecto, number>;
  estiramientosSesion!: Table<EstiramientoSesion, number>;
  ejerciciosTecnica!: Table<EjercicioTecnica, number>;
  objetivosSemanales!: Table<ObjetivoSemanal, number>;
  lesiones!: Table<Lesion, number>;
  zonasOutdoor!: Table<ZonaOutdoor, number>;
  sesionesPlanificadas!: Table<SesionPlanificada, number>;
  perfil!: Table<PerfilUsuario, number>;
  temporizadorPresets!: Table<TimerPreset, number>;

  constructor() {
    super("CruxTrackerDB");

    this.version(1).stores({
      sesiones:
        "++id, fecha, fechaDia, modalidad, esBorrador, [fechaDia+modalidad]",
      vias: "++id, sessionId, grado, resultado",
      proyectos: "++id, nombre, modalidad, enviado, fechaInicio",
      intentosProyecto: "++id, proyectoId, sessionId, fecha",
      estiramientosSesion: "++id, fecha, tipo, completado",
      ejerciciosTecnica: "++id, fecha, ejercicioId, categoria",
      objetivosSemanales: "++id, semanaISO, categoria, completado",
      lesiones: "++id, zona, fechaInicio, activa",
      zonasOutdoor: "++id, nombre, fechaPrimeraVisita",
      sesionesPlanificadas: "++id, semanaISO, dia, tipo, completado",
      perfil: "++id",
    });

    this.version(2).stores({
      temporizadorPresets: "++id, nombre, creadoEn",
    });
  }
}

export const db = new CruxTrackerDB();

export async function ensurePerfil(): Promise<PerfilUsuario> {
  const existente = await db.perfil.toCollection().first();
  if (existente) return existente;
  const perfilInicial: PerfilUsuario = {
    modoOscuro: false,
    notificacionesActivas: true,
  };
  const id = await db.perfil.add(perfilInicial);
  return { ...perfilInicial, id };
}
