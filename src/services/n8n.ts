export type FalloPartida = {
  tematica: string
  nombreCorrecto: string
  imagen: string
  respuesta: string
}

type ScorePayload = {
  nombre: string
  apellido: string
  edad: number
  puntaje: number
  tematicas: string[]
  fecha: string
  fallos?: FalloPartida[]
}

export type LeaderboardItem = {
  posicion: number
  id: string
  userId: string
  nombre: string
  apellido: string
  edad: number
  puntaje: number
  tematicas: string[]
  fecha: string
  fallos?: FalloPartida[]
}

type LeaderboardResponse = {
  ok: boolean
  total: number
  leaderboard: LeaderboardItem[]
}

const saveScoreUrl = import.meta.env.VITE_N8N_SAVE_SCORE_URL || "http://localhost:5678/webhook/guardar-puntaje"
const leaderboardUrl = import.meta.env.VITE_N8N_LEADERBOARD_URL || "http://localhost:5678/webhook/leaderboard"

export async function guardarPuntaje(payload: ScorePayload) {
  const response = await fetch(saveScoreUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.message ||
      (Array.isArray(data?.errores) ? data.errores.join(", ") : null) ||
      "No se pudo guardar el puntaje"
    throw new Error(message)
  }

  return data
}

export async function obtenerLeaderboard(limit = 10, tematica?: string) {
  const params = new URLSearchParams({ limit: String(limit) })

  if (tematica) {
    params.set("tematica", tematica)
  }

  const response = await fetch(`${leaderboardUrl}?${params.toString()}`)
  const data = (await response.json().catch(() => null)) as LeaderboardResponse | null

  if (!response.ok || !data || !data.ok) {
    const message = data?.message || "No se pudo cargar el leaderboard"
    throw new Error(message)
  }

  return data
}

export async function obtenerPartida(id: string) {
  const data = await obtenerLeaderboard(100)
  const partida = data.leaderboard.find((item) => String(item.id) === String(id) || String(item.userId) === String(id))

  if (!partida) {
    throw new Error("No se encontró el detalle de esa partida.")
  }

  return partida
}
