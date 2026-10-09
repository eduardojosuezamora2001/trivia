import { Card, CardContent } from "@/components/ui/card"

type MarcadorProps = {
  puntaje: number
  vidas: number
  preguntaActual: number
  total: number
}

export function Marcador({ puntaje, vidas, preguntaActual, total }: MarcadorProps) {
  return (
    <Card className="retro-panel border-fuchsia-500/70 bg-slate-950/80">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Puntaje</p>
          <p className="text-3xl font-black text-fuchsia-300">{puntaje}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Vidas</p>
          <div className="flex gap-2 pt-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={`vida-${index}`} className={`inline-block h-4 w-4 rounded-sm ${index < vidas ? "bg-red-500" : "bg-slate-700"}`} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ronda</p>
          <p className="text-xl font-black text-cyan-300">{Math.min(preguntaActual + 1, total)}/{total}</p>
        </div>
      </CardContent>
    </Card>
  )
}
