# AGENTS.md — Trivia Multiverso

## Arquitectura objetivo

- Frontend: React + Vite + React Router.
- UI: shadcn/ui como base + 8bitcn/ui para componentes retro.
- Estilos: Tailwind CSS.
- Persistencia simulada: `json-server` con `db.json`.
- Backend/orquestación: n8n.
- El frontend **no accede directamente a `db.json`** y no implementa ninguna base de datos.
- n8n es la única capa que interactúa con json-server para usuarios y puntajes.
- APIs de preguntas: Rick and Morty, Dragon Ball, Pokémon y Los Simpson.

## Flujo de datos

```text
React
  │
  ├── APIs públicas ───────────────► personajes/preguntas
  │
  └── n8n webhooks
        │
        ├── POST /guardar-puntaje
        │       ├── valida datos
        │       ├── POST /users
        │       └── POST /scores
        │
        └── GET /leaderboard
                └── GET /scores + GET /users
                         │
                         └── JSON combinado para React

n8n ─────────────► json-server ─────────────► db.json
```

## 1. UI retro

La interfaz debe combinar:

1. **shadcn/ui** para primitives accesibles y composición.
2. **8bitcn/ui** para la estética retro/pixel.

Configuración esperada en `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@8bitcn": "https://8bitcn.com/r/{name}.json"
  }
}
```

Instalación de referencia:

```bash
npx shadcn@latest init
npx shadcn@latest add button card input checkbox progress badge
npx shadcn@latest add @8bitcn/button
```

Usar componentes 8bitcn cuando exista una variante adecuada; mantener shadcn/ui para formularios, estructura, accesibilidad y primitives sin variante retro.

### Dirección visual

- Pixel/arcade, bordes gruesos y sombras duras.
- Tipografía monoespaciada/pixel.
- Paleta base oscura con acentos vivos por temática.
- Estados `hover`, `active`, `disabled` claramente visibles.
- Evitar gradientes suaves, glassmorphism y sombras difusas.
- El fondo de `TarjetaPregunta` cambia según `pregunta.tematica`.

## 2. Flujo de usuario

1. `/` — Home.
2. `/jugar` — nombre, apellido, edad y configuración.
3. `/partida` — preguntas, 4 opciones, puntaje y vidas/tiempo.
4. Resultado — envío del resultado a n8n.
5. `/puntajes` — leaderboard obtenido exclusivamente desde n8n.
6. `/jugador/:id` — detalle de usuario/partida.

## 3. Datos

### `db.json`

La persistencia local simulada tiene dos colecciones:

```json
{
  "users": [],
  "scores": []
}
```

Un usuario:

```json
{
  "id": "uuid",
  "nombre": "Mario",
  "apellido": "García",
  "edad": 24,
  "createdAt": "2026-09-21T15:00:00.000Z"
}
```

Un puntaje:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "puntaje": 80,
  "tematicas": ["pokemon", "dragonball"],
  "fecha": "2026-09-21T15:05:00.000Z"
}
```

No agregar SQLite, Prisma, MongoDB, Firebase, Supabase, Google Sheets ni otra base de datos.

## 4. n8n

n8n expone dos webhooks:

- `POST /webhook/guardar-puntaje`
- `GET /webhook/leaderboard`

n8n debe comunicarse con json-server mediante HTTP Request.

### Guardar

`POST /guardar-puntaje` recibe:

```json
{
  "nombre": "",
  "apellido": "",
  "edad": 0,
  "puntaje": 0,
  "tematicas": [],
  "fecha": ""
}
```

Flujo:

```text
Webhook
→ Validar/normalizar
→ IF válido
→ POST json-server /users
→ POST json-server /scores
→ GET json-server /scores
→ calcular posición
→ Respond to Webhook
```

Si es inválido, responder HTTP 400.

### Leaderboard

```text
Webhook GET
→ GET json-server /scores
→ GET json-server /users
→ combinar usuario + score
→ filtrar ?tematica= opcional
→ ordenar por puntaje DESC
→ aplicar ?limit= (10 por defecto)
→ Respond to Webhook
```

La respuesta debe tener una forma estable:

```json
{
  "ok": true,
  "total": 2,
  "leaderboard": [
    {
      "posicion": 1,
      "id": "score-id",
      "userId": "user-id",
      "nombre": "Mario",
      "apellido": "García",
      "edad": 24,
      "puntaje": 100,
      "tematicas": ["pokemon"],
      "fecha": "2026-09-21T15:05:00.000Z"
    }
  ]
}
```

## 5. Frontend

Variables de entorno:

```env
VITE_N8N_SAVE_SCORE_URL=http://localhost:5678/webhook/guardar-puntaje
VITE_N8N_LEADERBOARD_URL=http://localhost:5678/webhook/leaderboard
```

No crear `VITE_JSON_SERVER_URL` para el frontend.

Las llamadas a n8n viven en:

```text
src/services/n8n.js
```

Las llamadas a las APIs de personajes viven en:

```text
src/services/api.js
```

Nunca hacer `fetch()` a json-server desde React.

## 6. Componentes mínimos

- `Menu`
- `FormularioJugador`
- `SelectorTematicas`
- `TarjetaPregunta`
- `Marcador`
- `TablaPuntajes`

Preferir componentes shadcn/8bitcn dentro de estos componentes en lugar de HTML con estilos repetidos.

## 7. Reglas React

- `useState` para jugador/configuración/partida.
- `useEffect` para cargas y temporizador.
- Hook adicional: `useContext` con `PartidaContext`.
- Nunca mutar estado.
- No usar índices de array como `key`.
- Extraer `fetch` a `/src/services`.
- `useEffect` async mediante función interna y cleanup.
- Mostrar loading/error en peticiones de APIs y n8n.

## 8. Scripts esperados

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "json-server": "json-server --watch db.json --port 3001",
    "dev:all": "concurrently \"npm run dev\" \"npm run json-server\""
  }
}
```

Si se usa `concurrently`, debe estar en `devDependencies`.

## 9. Criterios de aceptación

- La interfaz tiene estética retro basada en shadcn + 8bitcn.
- No existe implementación de base de datos en el frontend.
- `db.json` es la única persistencia simulada.
- Solo n8n accede a json-server.
- n8n almacena usuarios y puntajes.
- n8n consulta scores/users y construye el leaderboard.
- React consume únicamente los webhooks de n8n para usuarios/puntajes.
- Las APIs públicas continúan siendo la fuente de personajes.
