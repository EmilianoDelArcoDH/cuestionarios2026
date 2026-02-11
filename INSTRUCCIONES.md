# Instrucciones de Instalación y Uso

## Opción 1: Instalación con Docker (Recomendado)

### 1. Levantar PostgreSQL con Docker

```powershell
# Desde la raíz del proyecto
docker-compose up -d
```

Esto levantará PostgreSQL en el puerto 5432.

### 2. Instalar dependencias del Backend

```powershell
cd backend
npm install
```

### 3. Ejecutar migraciones

```powershell
npm run migrate
```

Cuando te pregunte por el nombre de la migración, escribe algo como: `init`

### 4. Ejecutar seed (poblar base de datos)

```powershell
npm run seed
```

### 5. Iniciar el servidor backend

```powershell
npm run dev
```

El backend estará corriendo en: http://localhost:3000

### 6. Instalar dependencias del Frontend (en otra terminal)

```powershell
cd frontend
npm install
```

### 7. Iniciar el servidor frontend

```powershell
npm run dev
```

El frontend estará corriendo en: http://localhost:5173

---

## Opción 2: Instalación sin Docker

### 1. Instalar PostgreSQL manualmente

Descarga e instala PostgreSQL desde: https://www.postgresql.org/download/windows/

### 2. Crear base de datos

```powershell
# Abrir psql o pgAdmin y ejecutar:
CREATE DATABASE quiz_platform;
```

### 3. Configurar archivo .env

El archivo `.env` en la carpeta `backend` ya está creado con la configuración por defecto:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quiz_platform?schema=public"
PORT=3000
NODE_ENV=development
```

**Importante:** Si tu usuario o contraseña de PostgreSQL son diferentes, edita el archivo `.env`

### 4. Continuar desde el paso 2 de la Opción 1

---

## Verificar que todo funciona

1. **Backend:** Abre http://localhost:3000/health - Deberías ver `{"status":"ok"}`

2. **Frontend:** Abre http://localhost:5173 - Deberías ver la interfaz de la plataforma

3. **Base de datos:** Ejecuta `npm run studio` en la carpeta backend para abrir Prisma Studio y ver los datos

---

## Comandos útiles

### Backend

```powershell
cd backend

# Modo desarrollo (con hot reload)
npm run dev

# Ejecutar migraciones
npm run migrate

# Poblar base de datos con datos de ejemplo
npm run seed

# Abrir Prisma Studio (GUI para ver la base de datos)
npm run studio

# Generar cliente de Prisma (después de cambios en schema.prisma)
npm run generate
```

### Frontend

```powershell
cd frontend

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview
```

---

## Solución de Problemas

### Error: "Can't reach database server"

- Verifica que PostgreSQL esté corriendo
- Si usas Docker: `docker-compose ps` (debe estar "Up")
- Si es local: verifica que el servicio PostgreSQL esté activo

### Error: "Port 3000 already in use"

- Cambia el puerto en `backend/.env`:
  ```
  PORT=3001
  ```

### Error: "Port 5173 already in use"

- Vite automáticamente usará el siguiente puerto disponible (5174, etc.)

### Error en migración de Prisma

```powershell
cd backend
npx prisma migrate reset
npm run migrate
npm run seed
```

---

## Estructura del Proyecto

```
Cuestionario/
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuración de Express
│   │   ├── server.js           # Punto de entrada
│   │   ├── controllers/        # Controladores de API
│   │   ├── routes/             # Rutas de Express
│   │   ├── services/           # Lógica de negocio
│   │   ├── validators/         # Validación con Zod
│   │   ├── middleware/         # Middleware personalizado
│   │   ├── utils/              # Utilidades (shuffle, slugify)
│   │   └── db/                 # Cliente de Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   ├── seed.js             # Datos de ejemplo
│   │   └── migrations/         # Historial de migraciones
│   ├── .env                    # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas de la aplicación
│   │   ├── services/           # Llamadas a API
│   │   ├── App.jsx             # Componente principal
│   │   └── main.jsx            # Punto de entrada
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml          # Configuración de Docker
├── .env.example                # Ejemplo de variables de entorno
└── README.md
```

---

## Datos de Ejemplo (Seed)

El seed crea 2 temas con preguntas:

1. **JavaScript Básico** - 5 preguntas (mix de single y multiple choice)
2. **React Fundamentals** - 4 preguntas (mix de single y multiple choice)

---

## Testing Manual

### 1. Crear un tema

- Ve a "Crear Tema"
- Ingresa un nombre (ej: "Python Basics")
- Haz clic en "Crear Tema"

### 2. Crear preguntas

- Ve a "Crear Pregunta"
- Selecciona el tema creado
- Escribe una pregunta
- Selecciona el tipo (single o multiple)
- Agrega respuestas y marca las correctas
- Haz clic en "Crear Pregunta"

### 3. Rendir un quiz

- Ve al "Inicio"
- Haz clic en "Iniciar Quiz" en un tema
- Responde las preguntas
- Haz clic en "Enviar Respuestas"
- Verás tu puntaje y si aprobaste

### 4. Verificar límite de intentos

- Intenta rendir el mismo quiz 3 veces
- En el 4to intento, deberías recibir un error

---

## Tecnologías Utilizadas

### Backend
- **Node.js 18+**
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Base de datos
- **Zod** - Validación de esquemas
- **CORS** - Manejo de CORS
- **dotenv** - Variables de entorno

### Frontend
- **React 18**
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **CSS Modules** - Estilos encapsulados

---

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Roles (admin/estudiante)
- [ ] Timer para cuestionarios
- [ ] Historial de intentos con detalle
- [ ] Exportar resultados a PDF
- [ ] Categorías de temas
- [ ] Búsqueda y filtros
- [ ] Tests unitarios
- [ ] Deploy a producción

