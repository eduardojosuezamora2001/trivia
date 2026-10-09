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

const THEME_KEYS: TemaKey[] = ["pokemon", "dragonball", "simpsons", "rickandmorty"]

function normalizeName(value: string | undefined, fallback: string) {
  return (value ?? fallback).trim() || fallback
}

function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`La petición a ${url} falló con ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function fetchPokemon(): Promise<Personaje[]> {
  const list = await fetchJson<{ results: Array<{ name: string; url: string }> }>("https://pokeapi.co/api/v2/pokemon?limit=151")
  const details = await Promise.all(
    list.results.map(async (pokemon) => {
      const info = await fetchJson<{ id: number; name: string; sprites: { front_default?: string } }>(pokemon.url)
      return {
        id: `pokemon-${info.id}`,
        nombre: normalizeName(info.name, pokemon.name),
        imagen: info.sprites?.front_default ?? "",
        tematica: "pokemon",
      }
    })
  )

  return details.map((personaje): Personaje => ({
    ...personaje,
    nombre: normalizeName(personaje.nombre, "Pokémon"),
    tematica: "pokemon",
  }))
}

async function fetchRickAndMorty(): Promise<Personaje[]> {
  const data = await fetchJson<{ results: Array<{ id: number; name: string; image: string }> }>("https://rickandmortyapi.com/api/character")

  return data.results.map((character) => ({
    id: `rickandmorty-${character.id}`,
    nombre: normalizeName(character.name, "Personaje"),
    imagen: character.image,
    tematica: "rickandmorty",
  }))
}

async function fetchDragonBall(): Promise<Personaje[]> {
  const data = await fetchJson<{ items?: Array<{ id: number; name: string; image: string }> }>("https://dragonball-api.com/api/characters?limit=58")
  const items = data.items ?? []

  return items.map((character) => ({
    id: `dragonball-${character.id}`,
    nombre: normalizeName(character.name, "Personaje"),
    imagen: character.image,
    tematica: "dragonball",
  }))
}

async function fetchSimpsons(): Promise<Personaje[]> {
  type SimpsonsCharacter = {
    id: string | number
    name?: string
    Name?: string
    portrait_path?: string
    Image?: string
    image?: string
  }

  type SimpsonsResponse = {
    results?: SimpsonsCharacter[]
  }

  const pages = await Promise.all([
    fetchJson<SimpsonsResponse | SimpsonsCharacter[]>("https://thesimpsonsapi.com/api/characters?page=1"),
    fetchJson<SimpsonsResponse | SimpsonsCharacter[]>("https://thesimpsonsapi.com/api/characters?page=2"),
  ])

  const characters = pages.flatMap((page) => {
    if (Array.isArray(page)) {
      return page
    }

    return page.results ?? []
  })

  return characters.map((character, index) => {
    const portrait = character.portrait_path ?? character.Image ?? character.image ?? ""
    const imagen = portrait.startsWith("http")
      ? portrait
      : portrait
        ? `https://cdn.thesimpsonsapi.com/500${portrait.startsWith("/") ? portrait : `/${portrait}`}`
        : ""

    return {
      id: `simpsons-${character.id ?? index}`,
      nombre: normalizeName(character.name ?? character.Name, "Personaje"),
      imagen,
      tematica: "simpsons" as const,
    }
  })
}

export async function obtenerPersonajesPorTematica(tematica: TemaKey): Promise<Personaje[]> {
  switch (tematica) {
    case "pokemon":
      return fetchPokemon()
    case "dragonball":
      return fetchDragonBall()
    case "simpsons":
      return fetchSimpsons()
    case "rickandmorty":
      return fetchRickAndMorty()
    default:
      return []
  }
}

export async function obtenerPersonajesPorTematicas(tematicas: TemaKey[]) {
  const temasUnicos = [...new Set(tematicas.filter((tema) => THEME_KEYS.includes(tema)))]
  const resultados = await Promise.all(temasUnicos.map((tema) => obtenerPersonajesPorTematica(tema)))

  return resultados.flat()
}

export function generarPreguntas(_tematicas: TemaKey[], cantidad: number, pool: Personaje[]): Pregunta[] {
  if (!pool.length) {
    return []
  }

  const personajes = shuffle(pool)
  const preguntas: Pregunta[] = []
  const total = Math.min(cantidad, personajes.length)

  for (let index = 0; index < total; index += 1) {
    const personajeCorrecto = personajes[index]
    const distractoresBase = personajes.filter((personaje) => personaje.id !== personajeCorrecto.id)
    const distractoresMismaTematica = distractoresBase.filter((personaje) => personaje.tematica === personajeCorrecto.tematica)
    const distractores = shuffle(
      distractoresMismaTematica.length >= 3
        ? distractoresMismaTematica.slice(0, 3)
        : shuffle(distractoresBase).slice(0, 3)
    )

    const opciones = shuffle([
      personajeCorrecto.nombre,
      ...distractores.map((personaje) => personaje.nombre),
    ]).slice(0, 4)

    if (new Set(opciones).size < 4) {
      const extraNames = shuffle(
        personajes
          .filter((personaje) => !opciones.includes(personaje.nombre))
          .map((personaje) => personaje.nombre)
      )

      while (opciones.length < 4 && extraNames.length) {
        opciones.push(extraNames.shift() ?? "")
      }
    }

    preguntas.push({
      id: `${personajeCorrecto.id}-${index}-${crypto.randomUUID()}`,
      tematica: personajeCorrecto.tematica,
      personajeCorrecto,
      imagen: personajeCorrecto.imagen,
      opciones: shuffle(opciones),
    })
  }

  return shuffle(preguntas)
}

export function obtenerTemasDisponibles(): TemaKey[] {
  return [...THEME_KEYS]
}
