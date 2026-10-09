import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function Home() {
  return (
    <div className="space-y-6">
      <Card className="retro-panel border-yellow-500/70 bg-slate-950/80">
        <CardHeader>
          <CardTitle className="text-4xl uppercase tracking-[0.15em] text-yellow-300">Trivia Multiverso</CardTitle>
          <CardDescription className="text-slate-300">Un viaje arcade por Pokémon, Dragon Ball, Los Simpson y Rick and Morty.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-slate-200">
            Elige tus temáticas, responde preguntas y sube al leaderboard del multiverso.
          </p>
          <Link to="/jugar">
            <Button className="bg-yellow-400 text-slate-950 hover:bg-yellow-300">Comenzar</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
