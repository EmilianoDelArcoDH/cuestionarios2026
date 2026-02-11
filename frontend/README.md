# Frontend - Plataforma de Cuestionarios

Aplicación React con Vite

## Instalación

```bash
npm install
```

## Scripts

- `npm run dev` - Servidor de desarrollo (http://localhost:5173)
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

## Estructura

```
src/
├── components/             # Componentes reutilizables
│   ├── Navbar.jsx
│   └── Navbar.module.css
├── pages/                  # Páginas de la aplicación
│   ├── Home.jsx
│   ├── Home.module.css
│   ├── CreateTopic.jsx
│   ├── CreateTopic.module.css
│   ├── CreateQuestion.jsx
│   ├── CreateQuestion.module.css
│   ├── Quiz.jsx
│   └── Quiz.module.css
├── services/               # Llamadas a API
│   └── api.js
├── App.jsx                 # Componente principal
├── main.jsx                # Punto de entrada
└── index.css               # Estilos globales
```

## Rutas

- `/` - Inicio (lista de temas)
- `/create-topic` - Crear nuevo tema
- `/create-question` - Crear nueva pregunta
- `/quiz/:topicId` - Rendir cuestionario

## Características

- ✅ CSS Modules para estilos encapsulados
- ✅ React Router para navegación
- ✅ Proxy a API backend en desarrollo
- ✅ Validación de formularios
- ✅ Manejo de estados de carga y error
- ✅ UI responsive
