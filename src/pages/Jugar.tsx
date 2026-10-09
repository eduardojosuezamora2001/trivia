import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FormularioJugador } from "@/components/FormularioJugador"
import { SelectorTematicas } from "@/components/SelectorTematicas"
import { usePartida } from "@/context/PartidaContext"
import { generarPreguntas, obtenerPersonajesPorTematicas, obtenerTemasDisponibles } from "@/services/api"
import type { TemaKey } from "@/components/SelectorTematicas"

export function Jugar() {
    const navigate = useNavigate()
    const { setJugador, setTematicas, setCantidadPreguntas, iniciarPartida } = usePartida()
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [edad, setEdad] = useState(18)
    const [seleccionadas, setSeleccionadas] = useState<TemaKey[]>(["pokemon"])
    const [cantidad, setCantidad] = useState(5)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleToggleTema = (tema: TemaKey) => {
        setSeleccionadas((prev) => {
            if (prev.includes(tema)) {
                return prev.filter((item) => item !== tema)
            }

            return [...prev, tema]
        })
    }

    const handleEmpezar = async () => {
        if (!nombre.trim() || !apellido.trim() || edad <= 0) {
            setError("Nombre, apellido y edad son obligatorios.")
            return
        }

        if (seleccionadas.length === 0) {
            setError("Debes elegir al menos una temática.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const pool = await obtenerPersonajesPorTematicas(seleccionadas)
            const preguntas = generarPreguntas(seleccionadas, cantidad, pool)

            if (!preguntas.length) {
                throw new Error("No se pudieron generar preguntas con las temáticas seleccionadas.")
            }

            const nuevoJugador = { nombre: nombre.trim(), apellido: apellido.trim(), edad }
            setJugador(nuevoJugador)
            setTematicas(seleccionadas)
            setCantidadPreguntas(cantidad)
            iniciarPartida({ jugador: nuevoJugador, tematicas: seleccionadas, cantidadPreguntas: cantidad, preguntas })
            navigate("/partida")
        } catch (catchError) {
            setError(catchError instanceof Error ? catchError.message : "Error inesperado al cargar las preguntas.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
            <FormularioJugador
                nombre={nombre}
                apellido={apellido}
                edad={edad}
                onChange={(field, value) => {
                    if (field === "nombre") setNombre(String(value))
                    if (field === "apellido") setApellido(String(value))
                    if (field === "edad") setEdad(Number(value))
                }}
                onSubmit={handleEmpezar}
                loading={loading}
            />

            <SelectorTematicas
                seleccionadas={seleccionadas}
                cantidad={cantidad}
                onToggleTema={handleToggleTema}
                onCantidadChange={setCantidad}
                onConfirmar={handleEmpezar}
                loading={loading}
            />

            {error && <div className="lg:col-span-2 rounded-xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

            <div className="lg:col-span-2 rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
                Temas disponibles: {obtenerTemasDisponibles().join(", ")}
            </div>
        </div>
    )
}
