import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LeaderboardItem } from "@/services/n8n"

type TablaPuntajesProps = {
  items: LeaderboardItem[]
  loading?: boolean
  error?: string
}

export function TablaPuntajes({ items, loading = false, error }: TablaPuntajesProps) {
  return (
    <Card className="retro-panel border-cyan-500/60 bg-slate-950/80">
      <CardHeader>
        <CardTitle className="text-2xl uppercase text-cyan-300">Leaderboard</CardTitle>
        <CardDescription className="text-slate-300">Los mejores jugadores del multiverso.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading && <p className="text-sm text-cyan-200">Cargando puntajes...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-slate-300">Todavía no hay puntajes registrados.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Jugador</th>
                <th className="py-2 pr-3">Edad</th>
                <th className="py-2 pr-3">Puntaje</th>
                <th className="py-2 pr-3">Temas</th>
                <th className="py-2 pr-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-800 last:border-0">
                  <td className="py-3 pr-3 font-black text-yellow-300">{item.posicion}</td>
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-white">{item.nombre} {item.apellido}</div>
                  </td>
                  <td className="py-3 pr-3">{item.edad}</td>
                  <td className="py-3 pr-3 font-black text-green-300">{item.puntaje}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tematicas.map((tema) => (
                        <Badge key={`${item.id}-${tema}`} variant="secondary" className="bg-slate-800 text-slate-100">
                          {tema}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <Link
                      to={`/jugador/${item.id}`}
                      className="inline-flex items-center rounded-md border border-violet-400 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-violet-200 hover:bg-violet-500/20"
                    >
                      Ver partida
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
