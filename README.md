# Trivia Multiverso

Aplicación SPA de trivia retro con React, Vite, Tailwind, shadcn/ui, 8bitcn/ui, React Router y n8n.

## Descripción

Trivia Multiverso es un juego de preguntas basado en personajes de Pokémon, Dragon Ball, Los Simpson y Rick and Morty. La experiencia está pensada como una interfaz arcade estilo 8-bit con flujos de usuario, contexto compartido, temporizador por pregunta y leaderboard centralizado.

## Tecnologías

- React + Vite
- React Router
- Tailwind CSS
- shadcn/ui
- 8bitcn/ui
- json-server
- n8n

## Instalación

```bash
pnpm install
cp .env.example .env
```

## Variables de entorno

Crea un archivo `.env` a partir de `.env.example`:

```env
VITE_N8N_SAVE_SCORE_URL=http://localhost:5678/webhook/guardar-puntaje
VITE_N8N_LEADERBOARD_URL=http://localhost:5678/webhook/leaderboard
```

> React NO accede directamente a json-server. La comunicación de React con usuarios y puntajes pasa exclusivamente por n8n.

## Ejecutar React

```bash
pnpm dev
```

## Ejecutar json-server

```bash
pnpm json-server
```

## Ejecutar todo junto

```bash
pnpm dev:all
```

## Configurar n8n

1. Importa el workflow desde `n8n/flow.json`.
2. Activa el workflow (toggle Active). Si está inactivo, React no puede usar `/webhook/...`.
3. Arranca json-server (`pnpm json-server`) **antes** de guardar o consultar puntajes.
4. Si n8n corre en Docker, los nodos HTTP deben apuntar a `http://host.docker.internal:3001` (no `localhost:3001`; eso es el contenedor). Si n8n corre con `npx n8n`, usa `http://localhost:3001`.
5. Webhooks de producción:
   - `POST /webhook/guardar-puntaje`
   - `GET /webhook/leaderboard`

## Estructura

```text
src/
  components/
  context/
  pages/
  services/
  App.tsx
  main.tsx
n8n/
  flow.json
db.json
.env.example
```

## Arquitectura

```text
React → n8n → json-server → db.json
```

- React usa APIs públicas para las preguntas.
- React usa solamente los webhooks de n8n para guardar puntajes y consultar leaderboard.
- n8n es la única capa que comunica con json-server.

## Endpoints

### Guardar puntaje

```http
POST /webhook/guardar-puntaje
```

### Leaderboard

```http
GET /webhook/leaderboard?limit=10&tematica=pokemon
```

## Flujo de datos

```text
React
  ├─ APIs públicas de personajes
  └─ n8n
       ├─ POST /guardar-puntaje
       └─ GET /leaderboard
             └─ json-server
                   └─ db.json
```

## Importar workflow n8n

En n8n:

1. Abre la interfaz de n8n.
2. Haz clic en Importar workflow.
3. Selecciona `n8n/flow.json`.
4. Verifica que las credenciales HTTP y la base URL de json-server sean correctas.

## Criterios de cumplimiento

- React NO accede directamente a json-server.
- Solo n8n gestiona usuarios y puntajes.
- `db.json` es la única persistencia simulada.
- No se usan SQLite, Prisma, MongoDB, Firebase, Supabase ni Google Sheets.
