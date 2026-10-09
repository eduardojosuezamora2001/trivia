import { createContext, useContext, useMemo, useState } from "react"

export type Jugador = {
  nombre: string
  apellido: string
  edad: number
}

export type TemaKey = "pokemon" | "dragonball" | "simpsons" | "rickandmorty"

export type Personaje = {
  id: string
  nombre: string
  imagen: string
  tematica: TemaKey
}

export type Pregunta = {
  id: string
  tematica: TemaKey
  personajeCorrecto: Personaje
  opciones: string[]
  imagen: string
}

type PartidaStatus = "idle" | "jugando" | "finalizada"

export type PreguntaFallida = {
  pregunta: Pregunta
  respuesta: string
}

export type ResultadoPartida = {
  jugador: Jugador
  puntaje: number
  vidas: number
  fallos: PreguntaFallida[]
}

type PartidaContextValue = {
  jugador: Jugador | null
  tematicas: TemaKey[]
  cantidadPreguntas: number
  preguntas: Pregunta[]
  indiceActual: number
  puntaje: number
  vidas: number
  estadoPartida: PartidaStatus
  fallos: PreguntaFallida[]
  resultado: ResultadoPartida | null
  setJugador: (jugador: Jugador | null) => void
  setTematicas: (tematicas: TemaKey[]) => void
  setCantidadPreguntas: (cantidad: number) => void
  setPreguntas: (preguntas: Pregunta[]) => void
  setIndiceActual: (indice: number) => void
  setPuntaje: (puntaje: number) => void
  setVidas: (vidas: number) => void
  setEstadoPartida: (estado: PartidaStatus) => void
  iniciarPartida: (config: { jugador: Jugador; tematicas: TemaKey[]; cantidadPreguntas: number; preguntas: Pregunta[] }) => void
  avanzarPregunta: () => void
  registrarFallo: (fallo: PreguntaFallida) => void
  finalizarPartida: (resultado: ResultadoPartida) => void
  resetPartida: () => void
}

const PartidaContext = createContext<PartidaContextValue | undefined>(undefined)

const initialState: {
  jugador: Jugador | null
  tematicas: TemaKey[]
  cantidadPreguntas: number
  preguntas: Pregunta[]
  indiceActual: number
  puntaje: number
  vidas: number
  estadoPartida: PartidaStatus
} = {
  jugador: null,
  tematicas: ["pokemon"],
  cantidadPreguntas: 5,
  preguntas: [],
  indiceActual: 0,
  puntaje: 0,
  vidas: 3,
  estadoPartida: "idle",
}

export function PartidaProvider({ children }: { children: React.ReactNode }) {
  const [jugador, setJugador] = useState<Jugador | null>(initialState.jugador)
  const [tematicas, setTematicas] = useState<TemaKey[]>(initialState.tematicas)
  const [cantidadPreguntas, setCantidadPreguntas] = useState<number>(initialState.cantidadPreguntas)
  const [preguntas, setPreguntas] = useState<Pregunta[]>(initialState.preguntas)
  const [indiceActual, setIndiceActual] = useState<number>(initialState.indiceActual)
  const [puntaje, setPuntaje] = useState<number>(initialState.puntaje)
  const [vidas, setVidas] = useState<number>(initialState.vidas)
  const [estadoPartida, setEstadoPartida] = useState<PartidaStatus>(initialState.estadoPartida)
  const [fallos, setFallos] = useState<PreguntaFallida[]>([])
  const [resultado, setResultado] = useState<ResultadoPartida | null>(null)

  const iniciarPartida = (config: { jugador: Jugador; tematicas: TemaKey[]; cantidadPreguntas: number; preguntas: Pregunta[] }) => {
    setJugador(config.jugador)
    setTematicas(config.tematicas)
    setCantidadPreguntas(config.cantidadPreguntas)
    setPreguntas(config.preguntas)
    setIndiceActual(0)
    setPuntaje(0)
    setVidas(3)
    setFallos([])
    setResultado(null)
    setEstadoPartida("jugando")
  }

  const avanzarPregunta = () => {
    setIndiceActual((prev) => prev + 1)
  }

  const registrarFallo = (fallo: PreguntaFallida) => {
    setFallos((prev) => {
      if (prev.some((item) => item.pregunta.id === fallo.pregunta.id)) {
        return prev
      }

      return [...prev, fallo]
    })
  }

  const finalizarPartida = (siguienteResultado: ResultadoPartida) => {
    setResultado(siguienteResultado)
    setEstadoPartida("finalizada")
  }

  const resetPartida = () => {
    setJugador(null)
    setTematicas(["pokemon"])
    setCantidadPreguntas(5)
    setPreguntas([])
    setIndiceActual(0)
    setPuntaje(0)
    setVidas(3)
    setFallos([])
    setResultado(null)
    setEstadoPartida("idle")
  }

  const value = useMemo<PartidaContextValue>(
    () => ({
      jugador,
      tematicas,
      cantidadPreguntas,
      preguntas,
      indiceActual,
      puntaje,
      vidas,
      estadoPartida,
      fallos,
      resultado,
      setJugador,
      setTematicas,
      setCantidadPreguntas,
      setPreguntas,
      setIndiceActual,
      setPuntaje,
      setVidas,
      setEstadoPartida,
      iniciarPartida,
      avanzarPregunta,
      registrarFallo,
      finalizarPartida,
      resetPartida,
    }),
    [cantidadPreguntas, estadoPartida, fallos, indiceActual, jugador, puntaje, preguntas, resultado, tematicas, vidas]
  )

  return <PartidaContext.Provider value={value}>{children}</PartidaContext.Provider>
}

export function usePartida() {
  const context = useContext(PartidaContext)

  if (!context) {
    throw new Error("usePartida debe usarse dentro de PartidaProvider")
  }

  return context
}
