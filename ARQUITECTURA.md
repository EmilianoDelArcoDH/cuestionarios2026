# Arquitectura de la Plataforma de Cuestionarios

## Visión General

Sistema full-stack para administrar cuestionarios con preguntas de selección única y múltiple, con orden aleatorio y límite de intentos.

## Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Validación:** Zod
- **Autenticación:** No implementada (futuro)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Estilos:** CSS Modules
- **HTTP Client:** Fetch API

## Arquitectura del Backend

```
┌─────────────────────────────────────────────────────┐
│                    Express App                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │  Routes  │───▶│Controller│───▶│ Service  │     │
│  └──────────┘    └──────────┘    └──────────┘     │
│                                          │          │
│                                          ▼          │
│                                    ┌──────────┐    │
│                                    │ Prisma   │    │
│                                    │  Client  │    │
│                                    └──────────┘    │
│                                          │          │
└──────────────────────────────────────────┼──────────┘
                                           │
                                           ▼
                                    ┌──────────┐
                                    │PostgreSQL│
                                    └──────────┘
```

### Capas

1. **Routes** (`src/routes/`)
   - Definición de endpoints
   - Montaje de rutas en Express
   - Uso de `asyncHandler` para manejo de errores

2. **Controllers** (`src/controllers/`)
   - Recepción de requests HTTP
   - Validación de inputs con Zod
   - Llamadas a servicios
   - Formateo de respuestas

3. **Services** (`src/services/`)
   - Lógica de negocio
   - Interacción con Prisma
   - Algoritmos (shuffle, validaciones)
   - Transacciones de base de datos

4. **Validators** (`src/validators/`)
   - Schemas de Zod
   - Validaciones complejas
   - Reglas de negocio

5. **Middleware** (`src/middleware/`)
   - Error handling global
   - Not found handler
   - Async handler wrapper

6. **Utils** (`src/utils/`)
   - Funciones puras
   - Algoritmos (Fisher-Yates shuffle)
   - Helpers (slugify, arraysEqual)

## Modelo de Datos

```
┌─────────────┐
│   Topics    │
│  id (uuid)  │◀──┐
│  name       │   │
│  slug       │   │
└─────────────┘   │
                  │
         ┌────────┴─────────┐
         │                  │
┌─────────────┐    ┌─────────────────┐
│  Questions  │    │  Quiz Attempts  │
│  id (uuid)  │◀─┐ │  id (uuid)      │◀──┐
│  topic_id   │  │ │  topic_id       │   │
│  text       │  │ │  attempt_number │   │
│  type       │  │ │  score_percent  │   │
└─────────────┘  │ │  passed         │   │
       │         │ └─────────────────┘   │
       │         │                       │
       ▼         │              ┌────────┴────────┐
┌─────────────┐  │              │ Quiz Attempt    │
│   Answers   │  │              │   Answers       │
│  id (uuid)  │  │              │  id (uuid)      │
│  question_id├──┘              │  attempt_id     │
│  text       │                 │  question_id────┼──┐
│  is_correct │                 │  selected_ids   │  │
└─────────────┘                 │  is_correct     │  │
                                └─────────────────┘  │
                                         └───────────┘
```

### Relaciones

- **Topic** 1:N **Question** (CASCADE delete)
- **Question** 1:N **Answer** (CASCADE delete)
- **Topic** 1:N **QuizAttempt** (CASCADE delete)
- **QuizAttempt** 1:N **QuizAttemptAnswer** (CASCADE delete)
- **Question** 1:N **QuizAttemptAnswer**

### Constraints

- `topics.name` - UNIQUE
- `topics.slug` - UNIQUE
- `quiz_attempts.(topic_id, attempt_number)` - UNIQUE

## Flujo de Datos

### 1. Crear Tema

```
Cliente ─POST /api/topics─▶ Controller ─validate─▶ Service
                                                      │
                                                      ├── slugify(name)
                                                      ├── findFirst (slug o name)
                                                      └── create or return existing
```

### 2. Crear Pregunta

```
Cliente ─POST /api/topics/:id/questions─▶ Controller ─validate─▶ Service
                                            │                      │
                                            ├── Zod validation     ├── verify topic exists
                                            │   - type checking    ├── transaction:
                                            │   - min 2 answers    │   ├── create question
                                            │   - correct count    │   └── create answers
                                            │   - single = 1 OK    │
                                            └────────────────────────▶ return question
```

### 3. Obtener Quiz (Random)

```
Cliente ─GET /api/topics/:id/quiz─▶ Controller ──▶ Service
                                                     │
                                                     ├── get topic + questions + answers
                                                     ├── shuffle(questions) - Fisher-Yates
                                                     ├── for each question:
                                                     │   ├── shuffle(answers)
                                                     │   └── remove is_correct field
                                                     └── return quiz
```

### 4. Enviar Respuestas

```
Cliente ─POST /api/topics/:id/attempts─▶ Controller ─validate─▶ Service
                                           │                     │
                                           └── Zod validation    ├── count existing attempts
                                                                 ├── if >= 3: 403 error
                                                                 ├── for each answer:
                                                                 │   ├── get correct answers
                                                                 │   ├── single: exact match
                                                                 │   └── multiple: arraysEqual
                                                                 ├── calculate score
                                                                 ├── passed = score >= 70
                                                                 └── transaction:
                                                                     ├── create quiz_attempt
                                                                     └── create attempt_answers
```

## Algoritmos Clave

### Fisher-Yates Shuffle

```javascript
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
```

**Complejidad:** O(n)  
**Uso:** Mezclar preguntas y respuestas aleatoriamente

### Arrays Equal (para Multiple Choice)

```javascript
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
}
```

**Complejidad:** O(n log n)  
**Uso:** Comparar respuestas seleccionadas vs correctas

## Reglas de Validación

### Crear Pregunta

1. **Tipo Single:**
   - Exactamente 1 respuesta con `is_correct = true`
   - Mínimo 2 respuestas totales

2. **Tipo Multiple:**
   - Al menos 1 respuesta con `is_correct = true`
   - Mínimo 2 respuestas totales

### Evaluar Respuesta

1. **Tipo Single:**
   - Correcta si `selected_answer_ids.length === 1` Y coincide con la correcta

2. **Tipo Multiple:**
   - Correcta si el conjunto de IDs seleccionados coincide EXACTAMENTE con el conjunto de IDs correctos
   - No puede haber extras ni faltantes

### Intentos

- Máximo 3 intentos por tema
- Unique constraint en `(topic_id, attempt_number)`
- Se incrementa automáticamente

## Arquitectura del Frontend

```
┌──────────────────────────────────────┐
│             React App                │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────┐    ┌──────────┐      │
│  │  Pages   │───▶│ Services │      │
│  └──────────┘    └──────────┘      │
│       │                │             │
│       │                ▼             │
│       │          Fetch API           │
│       │                │             │
│       ▼                │             │
│  ┌──────────┐         │             │
│  │Components│         │             │
│  └──────────┘         │             │
│                       │             │
└───────────────────────┼─────────────┘
                        │
                        ▼
                  Backend API
```

### Componentes

- **Navbar** - Navegación global
- **Home** - Lista de temas
- **CreateTopic** - Formulario de tema
- **CreateQuestion** - Formulario de pregunta
- **Quiz** - Renderizado y envío de quiz

### Estado

Cada componente maneja su propio estado con `useState`:
- Loading states
- Error messages  
- Form data
- Quiz results

**Futuro:** Considerar Context API o Redux para estado global

## Seguridad

### Implementado

✅ Validación de inputs (Zod)  
✅ Sanitización de slugs  
✅ Constraints de base de datos  
✅ Error handling consistente  
✅ CORS habilitado

### No Implementado (Futuro)

❌ Autenticación  
❌ Autorización  
❌ Rate limiting  
❌ CSRF protection  
❌ SQL injection (Prisma protege por defecto)

## Performance

### Backend

- **Prisma:** ORM optimizado con lazy loading
- **Transacciones:** Usado para operaciones atómicas
- **Indexes:** UUID primary keys (automático)

### Frontend

- **Code Splitting:** Por defecto con Vite
- **CSS Modules:** Solo estilos usados
- **Lazy Loading:** No implementado (futuro)

## Testing

**No implementado** - Pendiente para v2

Recomendaciones:
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library
- E2E: Playwright

## Despliegue

### Local

- Docker Compose para PostgreSQL
- Node.js directo para dev

### Producción (No configurado)

Opciones sugeridas:
- **Backend:** Render, Railway, Fly.io
- **Frontend:** Vercel, Netlify
- **DB:** Supabase, Railway, Render

## Mejoras Futuras

### Corto Plazo
- [ ] Tests unitarios y de integración
- [ ] Paginación en listados
- [ ] Búsqueda y filtros
- [ ] Timer para quiz

### Mediano Plazo
- [ ] Autenticación (JWT)
- [ ] Roles (admin/estudiante)
- [ ] Dashboard de estadísticas
- [ ] Exportar resultados

### Largo Plazo
- [ ] Multiplayer/Competencias
- [ ] IA para generar preguntas
- [ ] Gamificación
- [ ] Mobile app (React Native)
