import { Route, Routes } from "react-router-dom"
import { Menu } from "@/components/Menu"
import { PartidaProvider } from "@/context/PartidaContext"
import { Home } from "@/pages/Home"
import { Jugar } from "@/pages/Jugar"
import { Partida } from "@/pages/Partida"
import { Puntajes } from "@/pages/Puntajes"
import { JugadorDetalle } from "@/pages/JugadorDetalle"

export default function App() {
  return (
    <PartidaProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Menu />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jugar" element={<Jugar />} />
            <Route path="/partida" element={<Partida />} />
            <Route path="/puntajes" element={<Puntajes />} />
            <Route path="/jugador/:id" element={<JugadorDetalle />} />
          </Routes>
        </div>
      </div>
    </PartidaProvider>
  )
}
