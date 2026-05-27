export const GRADOS_DEPORTIVA: string[] = [
  "3", "3+", "4a", "4b", "4c", "5a", "5b", "5c",
  "6a", "6a+", "6b", "6b+", "6c", "6c+",
  "7a", "7a+", "7b", "7b+", "7c", "7c+",
  "8a", "8a+", "8b", "8b+", "8c", "8c+",
  "9a", "9a+", "9b", "9b+", "9c",
];

export const GRADOS_BOULDER: string[] = [
  "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
  "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17",
];

export function gradosPorModalidad(modalidad: string): string[] {
  if (modalidad.startsWith("boulder")) return GRADOS_BOULDER;
  return GRADOS_DEPORTIVA;
}

export function indiceGrado(grado: string, modalidad: string): number {
  const arr = gradosPorModalidad(modalidad);
  return arr.indexOf(grado);
}

export function compararGrados(a: string, b: string, modalidad: string): number {
  return indiceGrado(a, modalidad) - indiceGrado(b, modalidad);
}

export function maxGrado(grados: string[], modalidad: string): string | null {
  if (!grados.length) return null;
  const arr = gradosPorModalidad(modalidad);
  let max = grados[0];
  for (const g of grados) {
    if (arr.indexOf(g) > arr.indexOf(max)) max = g;
  }
  return max;
}
