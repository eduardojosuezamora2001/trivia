import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Marcador } from "@/components/Marcador"
import { TarjetaPregunta } from "@/components/TarjetaPregunta"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePartida, type Jugador } from "@/context/PartidaContext"
import { generarPreguntas, obtenerPersonajesPorTematicas } from "@/services/api"
import { guardarPuntaje, type FalloPartida } from "@/services/n8n"

const PREGUNTA_TIEMPO = 18
const PAUSA_ENTRE_PREGUNTAS = 1200

type FinLocal = {
  jugador: Jugador
  puntaje: number
  vidas: number
}

export function Partida() {
  const navigate = useNavigate()
  const {
    jugador,
    tematicas,
    cantidadPreguntas,
    preguntas,
    indiceActual,
    puntaje,
    vidas,
    estadoPartida,
    setPuntaje,
    setVidas,
    setIndiceActual,
    iniciarPartida,
  } = usePartida()
  const [tiempoRestante, setTiempoRestante] = useState(PREGUNTA_TIEMPO)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [fin, setFin] = useState<FinLocal | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [replayLoading, setReplayLoading] = useState(false)
  const timerRef = useRef<number | null>(null)
  const avanceRef = useRef<number | null>(null)
  const scoredQuestionRef = useRef<string | null>(null)
  const endedRef = useRef(false)
  const savedRef = useRef(false)
  const puntajeRef = useRef(puntaje)
  const vidasRef = useRef(vidas)
  const jugadorRef = useRef(jugador)
  const fallosRef = useRef<FalloPartida[]>([])
  const indiceRef = useRef(indiceActual)
  const preguntasRef = useRef(preguntas)

  puntajeRef.current = puntaje
  vidasRef.current = vidas
  jugadorRef.current = jugador
  indiceRef.current = indiceActual
  preguntasRef.current = preguntas

  const preguntaActual = useMemo(() => preguntas[indiceActual], [indiceActual, preguntas])

  const limpiarTemporizadores = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (avanceRef.current) {
      window.clearTimeout(avanceRef.current)
      avanceRef.current = null
    }
  }

  const terminarPartida = (puntajeFinal: number, vidasFinales: number) => {
    if (endedRef.current) {
      return
    }

    const jugadorActual = jugadorRef.current

    if (!jugadorActual) {
      return
    }

    endedRef.current = true
    limpiarTemporizadores()
    setFin({ jugador: jugadorActual, puntaje: puntajeFinal, vidas: vidasFinales })

    if (savedRef.current) {
      return
    }

    savedRef.current = true
    setSaving(true)
    setError("")

    void guardarPuntaje({
      nombre: jugadorActual.nombre,
      apellido: jugadorActual.apellido,
      edad: jugadorActual.edad,
      puntaje: puntajeFinal,
      tematicas,
      fecha: new Date().toISOString(),
      fallos: fallosRef.current,
    })
      .catch((catchError) => {
        savedRef.current = false
        setError(catchError instanceof Error ? catchError.message : "Error guardando el resultado.")
      })
      .finally(() => {
        setSaving(false)
      })
  }

  const programarSiguientePaso = (vidasRestantes: number, puntajeActual: number) => {
    if (avanceRef.current) {
      window.clearTimeout(avanceRef.current)
    }

    avanceRef.current = window.setTimeout(() => {
      const esUltima = indiceRef.current >= preguntasRef.current.length - 1

      if (vidasRestantes <= 0 || esUltima) {
        terminarPartida(puntajeActual, vidasRestantes)
        return
      }

      scoredQuestionRef.current = null
      setRespuestaSeleccionada(null)
      setShowResult(false)
      setTiempoRestante(PREGUNTA_TIEMPO)
      setIndiceActual(indiceRef.current + 1)
    }, PAUSA_ENTRE_PREGUNTAS)
  }

  const registrarRespuesta = (opcion: string) => {
    if (endedRef.current || !preguntaActual || scoredQuestionRef.current === preguntaActual.id) {
      return
    }

    scoredQuestionRef.current = preguntaActual.id
    limpiarTemporizadores()
    setRespuestaSeleccionada(opcion)
    setShowResult(true)

    const esCorrecta = opcion === preguntaActual.personajeCorrecto.nombre
    let siguientePuntaje = puntajeRef.current
    let siguientesVidas = vidasRef.current

    if (esCorrecta) {
      siguientePuntaje += 10
      puntajeRef.current = siguientePuntaje
      setPuntaje(siguientePuntaje)
    } else {
      siguientesVidas = Math.max(0, siguientesVidas - 1)
      vidasRef.current = siguientesVidas
      setVidas(siguientesVidas)
      fallosRef.current = [
        ...fallosRef.current,
        {
          tematica: preguntaActual.tematica,
          nombreCorrecto: preguntaActual.personajeCorrecto.nombre,
          imagen: preguntaActual.imagen,
          respuesta: opcion,
        },
      ]
    }

    programarSiguientePaso(siguientesVidas, siguientePuntaje)
  }

  const registrarRespuestaRef = useRef(registrarRespuesta)
  registrarRespuestaRef.current = registrarRespuesta

  useEffect(() => {
    if (endedRef.current || fin || !jugador || !preguntaActual || estadoPartida === "idle") {
      return
    }

    setTiempoRestante(PREGUNTA_TIEMPO)
    setRespuestaSeleccionada(null)
    setShowResult(false)

    timerRef.current = window.setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [estadoPartida, fin, indiceActual, jugador, preguntaActual])

  useEffect(() => {
    if (endedRef.current || fin || tiempoRestante > 0 || !preguntaActual || scoredQuestionRef.current) {
      return
    }

    registrarRespuestaRef.current("timeout")
  }, [fin, preguntaActual, tiempoRestante])

  const jugarDeNuevo = async () => {
    const jugadorActual = fin?.jugador ?? jugador

    if (!jugadorActual) {
      return
    }

    setReplayLoading(true)
    setError("")

    try {
      const pool = await obtenerPersonajesPorTematicas(tematicas)
      const nuevasPreguntas = generarPreguntas(tematicas, cantidadPreguntas, pool)

      if (!nuevasPreguntas.length) {
        throw new Error("No se pudieron generar nuevas preguntas.")
      }

      endedRef.current = false
      savedRef.current = false
      scoredQuestionRef.current = null
      fallosRef.current = []
      setFin(null)
      iniciarPartida({
        jugador: jugadorActual,
        tematicas,
        cantidadPreguntas,
        preguntas: nuevasPreguntas,
      })
    } catch (catchError) {
      setError(catchError instanceof Error ? catchError.message : "No se pudo reiniciar la partida.")
    } finally {
      setReplayLoading(false)
    }
  }

  if (fin) {
    return (
      <Card className="retro-panel border-green-500/70 bg-slate-950/80">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Fin de partida</p>
            <h2 className="text-3xl font-black uppercase text-green-300">Resultado final</h2>
            <p className="text-xl text-white">
              {fin.jugador.nombre} {fin.jugador.apellido}, tu puntaje es{" "}
              <span className="font-black text-lime-300">{fin.puntaje}</span>
            </p>
            <p className="text-slate-300">
              {fin.vidas <= 0 ? "Te quedaste sin vidas." : `Vidas restantes: ${fin.vidas}`}
            </p>
            {saving && <p className="text-sm text-cyan-300">Guardando puntaje...</p>}
            {error && <p className="text-red-300">{error}</p>}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              type="button"
              disabled={replayLoading}
              onClick={() => void jugarDeNuevo()}
              className="bg-violet-500 text-white hover:bg-violet-400"
            >
              {replayLoading ? "Cargando..." : "Jugar de nuevo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/puntajes")}
              className="border-cyan-400 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            >
              Tabla de puntuaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!jugador || !preguntaActual) {
    return (
      <Card className="retro-panel border-red-500/70 bg-slate-950/80">
        <CardContent className="p-6 text-lg text-red-200">No hay una partida activa.</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Marcador puntaje={puntaje} vidas={vidas} preguntaActual={indiceActual} total={preguntas.length} />

      <TarjetaPregunta
        pregunta={preguntaActual}
        numero={indiceActual}
        total={preguntas.length}
        onSeleccionar={(opcion) => {
          if (respuestaSeleccionada || endedRef.current) {
            return
          }

          registrarRespuesta(opcion)
        }}
        respuestaSeleccionada={respuestaSeleccionada ?? undefined}
        tiempoRestante={tiempoRestante}
      />

      {showResult && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200">
          {respuestaSeleccionada === "timeout"
            ? `Se acabó el tiempo. La respuesta correcta era ${preguntaActual.personajeCorrecto.nombre}.`
            : respuestaSeleccionada === preguntaActual.personajeCorrecto.nombre
              ? "¡Correcto!"
              : `Incorrecto. La respuesta correcta era ${preguntaActual.personajeCorrecto.nombre}.`}
        </div>
      )}
    </div>
  )
}
