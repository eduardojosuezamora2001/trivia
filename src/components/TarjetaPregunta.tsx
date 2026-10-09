import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Pregunta } from "@/services/api"

const TEMATICA_STYLES = {
  pokemon: {
    panel: "border-yellow-400/70 bg-gradient-to-br from-yellow-500/15 via-slate-950 to-amber-500/10",
    badge: "bg-yellow-500 text-slate-950",
    accent: "text-yellow-300",
  },
  dragonball: {
    panel: "border-orange-500/70 bg-gradient-to-br from-orange-500/15 via-slate-950 to-red-500/10",
    badge: "bg-orange-500 text-white",
    accent: "text-orange-300",
  },
  simpsons: {
    panel: "border-emerald-500/70 bg-gradient-to-br from-emerald-500/15 via-slate-950 to-cyan-500/10",
    badge: "bg-emerald-500 text-slate-950",
    accent: "text-emerald-300",
  },
  rickandmorty: {
    panel: "border-sky-500/70 bg-gradient-to-br from-sky-500/15 via-slate-950 to-indigo-500/10",
    badge: "bg-sky-500 text-slate-950",
    accent: "text-sky-300",
  },
} as const

type TarjetaPreguntaProps = {
  pregunta: Pregunta
  numero: number
  total: number
  onSeleccionar: (opcion: string) => void
  respuestaSeleccionada?: string
  tiempoRestante: number
}

export function TarjetaPregunta({ pregunta, numero, total, onSeleccionar, respuestaSeleccionada, tiempoRestante }: TarjetaPreguntaProps) {
  const style = TEMATICA_STYLES[pregunta.tematica]

  return (
    <Card className={`retro-panel ${style.panel}`}>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pregunta {numero + 1}/{total}</p>
            <h2 className={`mt-2 text-2xl font-black uppercase ${style.accent}`}>¿Quién es este personaje?</h2>
          </div>
          <Badge className={style.badge}>{pregunta.tematica}</Badge>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/50 p-3">
          <div className="flex items-center justify-center rounded-xl bg-slate-950/70 p-4">
            {pregunta.imagen ? (
              <img src={pregunta.imagen} alt={pregunta.personajeCorrecto.nombre} className="max-h-52 rounded-lg object-contain" />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm uppercase text-slate-400">Sin imagen</div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {pregunta.opciones.map((opcion) => {
            const isSelected = respuestaSeleccionada === opcion
            return (
              <button
                key={opcion}
                type="button"
                onClick={() => onSeleccionar(opcion)}
                disabled={Boolean(respuestaSeleccionada)}
                className={`rounded-xl border-2 p-3 text-left text-base font-bold transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-100 hover:border-violet-400 hover:bg-violet-500/10"
                } disabled:cursor-not-allowed disabled:opacity-90`}
              >
                {opcion}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300">
          <span>Tiempo</span>
          <span className="text-2xl font-black text-lime-300">{tiempoRestante}s</span>
        </div>
      </CardContent>
    </Card>
  )
}
