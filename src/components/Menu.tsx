import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/jugar", label: "Jugar" },
  { to: "/partida", label: "Partida" },
  { to: "/puntajes", label: "Puntajes" },
]

export function Menu() {
  return (
    <header className="retro-panel sticky top-0 z-20 mb-6">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-fuchsia-400 bg-fuchsia-500/20 font-black text-fuchsia-200">M</div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Trivia</p>
            <h1 className="text-lg font-black uppercase text-white">Multiverso</h1>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {({ isActive }) => (
                <Button variant={isActive ? "default" : "outline"} size="sm" className={isActive ? "bg-violet-500 text-white" : ""}>
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
