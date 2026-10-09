import { useEffect, useState } from "react"
import { obtenerLeaderboard, type LeaderboardItem } from "@/services/n8n"
import { TablaPuntajes } from "@/components/TablaPuntajes"

export function Puntajes() {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function cargarLeaderboard() {
      try {
        setLoading(true)
        const response = await obtenerLeaderboard(10)
        if (!active) {
          return
        }

        setItems(response.leaderboard ?? [])
        setError("")
      } catch (catchError) {
        if (!active) {
          return
        }

        setError(catchError instanceof Error ? catchError.message : "No se pudo obtener el leaderboard.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void cargarLeaderboard()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <TablaPuntajes items={items} loading={loading} error={error} />
    </div>
  )
}
