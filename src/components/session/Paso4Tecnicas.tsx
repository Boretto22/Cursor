import { useSessionStore } from "../../store/sessionStore";
import { CATEGORIAS_TECNICA, tecnicasPorCategoria } from "../../data/tecnicas";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";

export function Paso4Tecnicas() {
  const borrador = useSessionStore((s) => s.borrador);
  const actualizar = useSessionStore((s) => s.actualizar);
  if (!borrador) return null;

  const seleccionadas = new Set(borrador.tecnicasTrabajadasIds);

  function toggle(id: string) {
    const nuevo = new Set(seleccionadas);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    actualizar({ tecnicasTrabajadasIds: [...nuevo] });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold mb-1">Técnicas trabajadas</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Marca las que has practicado conscientemente
        </p>
      </div>

      {CATEGORIAS_TECNICA.map((cat) => {
        const tecnicas = tecnicasPorCategoria(cat.id);
        const seleccionadasCat = tecnicas.filter((t) => seleccionadas.has(t.id)).length;
        return (
          <Card key={cat.id}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {cat.emoji} {cat.nombre}
              </h3>
              {seleccionadasCat > 0 && (
                <span className="text-xs text-crux-primary font-medium">
                  {seleccionadasCat} marcadas
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tecnicas.map((t) => (
                <Chip
                  key={t.id}
                  activo={seleccionadas.has(t.id)}
                  onClick={() => toggle(t.id)}
                >
                  {t.nombre}
                </Chip>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
