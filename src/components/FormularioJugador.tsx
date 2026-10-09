import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FormularioJugadorProps = {
  nombre: string
  apellido: string
  edad: number
  onChange: (field: "nombre" | "apellido" | "edad", value: string | number) => void
  onSubmit: () => void
  loading?: boolean
}

export function FormularioJugador({ nombre, apellido, edad, onChange, onSubmit, loading = false }: FormularioJugadorProps) {
  return (
    <Card className="retro-panel border-cyan-500/60 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-2xl uppercase text-cyan-300">Datos del jugador</CardTitle>
        <CardDescription className="text-slate-300">Completa tus datos para arrancar la partida.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-100">
            <span>Nombre</span>
            <Input
              value={nombre}
              onChange={(event) => onChange("nombre", event.target.value)}
              placeholder="Ej: Mario"
              className="bg-slate-900 text-white"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-100">
            <span>Apellido</span>
            <Input
              value={apellido}
              onChange={(event) => onChange("apellido", event.target.value)}
              placeholder="Ej: García"
              className="bg-slate-900 text-white"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm font-medium text-slate-100">
          <span>Edad</span>
          <Input
            type="number"
            min={1}
            value={edad}
            onChange={(event) => onChange("edad", Number(event.target.value || 0))}
            className="bg-slate-900 text-white"
          />
        </label>

        <Button onClick={onSubmit} disabled={loading} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
          {loading ? "Preparando partida..." : "Continuar"}
        </Button>
      </CardContent>
    </Card>
  )
}
