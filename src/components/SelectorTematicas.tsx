import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type TemaKey = "pokemon" | "dragonball" | "simpsons" | "rickandmorty"

const TEMAS: Array<{ key: TemaKey; label: string; color: string }> = [
  { key: "pokemon", label: "Pokémon", color: "#facc15" },
  { key: "dragonball", label: "Dragon Ball", color: "#f97316" },
  { key: "simpsons", label: "Los Simpson", color: "#22c55e" },
  { key: "rickandmorty", label: "Rick and Morty", color: "#38bdf8" },
]

type SelectorTematicasProps = {
  seleccionadas: TemaKey[]
  cantidad: number
  onToggleTema: (tema: TemaKey) => void
  onCantidadChange: (cantidad: number) => void
  onConfirmar: () => void
  loading?: boolean
}

export function SelectorTematicas({ seleccionadas, cantidad, onToggleTema, onCantidadChange, onConfirmar, loading = false }: SelectorTematicasProps) {
  return (
    <Card className="retro-panel border-violet-500/60 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-2xl uppercase text-violet-300">Temáticas</CardTitle>
        <CardDescription className="text-slate-300">Elige una o varias franquicias y la cantidad de preguntas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMAS.map((tema) => {
            const checked = seleccionadas.includes(tema.key)

            return (
              <label
                key={tema.key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-white transition hover:border-violet-400"
              >
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tema.color }} />
                  <span>{tema.label}</span>
                </div>
                <Checkbox checked={checked} onCheckedChange={() => onToggleTema(tema.key)} />
              </label>
            )
          })}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Cantidad de preguntas</label>
          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={cantidad}
            onChange={(event) => onCantidadChange(Number(event.target.value))}
            className="w-full accent-violet-400"
          />
          <div className="text-right text-sm font-bold text-violet-200">{cantidad} preguntas</div>
        </div>

        <Button onClick={onConfirmar} disabled={loading || seleccionadas.length === 0} className="w-full bg-violet-500 text-white hover:bg-violet-400">
          {loading ? "Generando preguntas..." : "Iniciar partida"}
        </Button>
      </CardContent>
    </Card>
  )
}
