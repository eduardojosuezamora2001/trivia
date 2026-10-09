import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { obtenerPartida, type LeaderboardItem } from "@/services/n8n"

function formatearFecha(fecha: string) {
  const parsed = new Date(fecha)

  if (Number.isNaN(parsed.getTime())) {
    return fecha
  }

  return parsed.toLocaleString()
}

export function JugadorDetalle() {
  const { id } = useParams()
  const [partida, setPartida] = useState<LeaderboardItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function cargarDetalle() {
      if (!id) {
        setError("No se indicó una partida.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await obtenerPartida(id)

        if (!active) {
          return
        }

        setPartida(data)
        setError("")
      } catch (catchError) {
        if (!active) {
          return
        }

        setError(catchError instanceof Error ? catchError.message : "No se pudo cargar el detalle.")
        setPartida(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void cargarDetalle()

    return () => {
      active = false
    }
  }, [id])

  return (
    <Card className="retro-panel border-violet-500/70 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-2xl uppercase text-violet-300">Detalle de la partida</CardTitle>
        <CardDescription className="text-slate-300">
          {partida ? `${partida.nombre} ${partida.apellido}` : "Consulta el resultado guardado en n8n."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-slate-200">
        {loading && <p className="text-sm text-cyan-200">Cargando detalle...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {partida && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <p><span className="text-slate-400">Posición:</span> {partida.posicion}</p>
              <p><span className="text-slate-400">Puntaje:</span> <span className="font-black text-green-300">{partida.puntaje}</span></p>
              <p><span className="text-slate-400">Edad:</span> {partida.edad}</p>
              <p><span className="text-slate-400">Fecha:</span> {formatearFecha(partida.fecha)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {partida.tematicas.map((tema) => (
                <Badge key={`${partida.id}-${tema}`} className="bg-violet-500 text-white">{tema}</Badge>
              ))}
            </div>
          </>
        )}

        <Link
          to="/puntajes"
          className="inline-flex items-center rounded-md border border-cyan-400 px-3 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/10"
        >
          Volver al leaderboard
        </Link>
      </CardContent>
    </Card>
  )
}
