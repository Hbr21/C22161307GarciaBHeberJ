# C22161307GarciaBHeberJ &middot; backend_for_students + frontend_base

**Estudiante:** Heber J. García Benítez  
**No. Control:** C22161307  
**Repositorio Base:** [BanderoChinoZF/backend_for_students (Rama BFS-0002)](https://github.com/BanderoChinoZF/backend_for_students/tree/BFS-0002)  
**Referencia Frontend:** [RayHava/21160819_frontend_for_students](https://github.com/RayHava/21160819_frontend_for_students) (Rediseñado completamente)

---

## 📁 Estructura del Repositorio

El proyecto contiene tanto la API backend como la interfaz web cliente:

```text
C22161307GarciaBHeberJ/
├── backend_base/       # Servidor REST con NodeJS, Express y PostgreSQL
│   ├── src/
│   │   ├── auth/           # Servicios de autenticación JWT
│   │   ├── config/         # Variables de entorno y configuración
│   │   ├── controllers/    # Controladores CRUD (roles, usuarios, empleados)
│   │   ├── database/       # Conexión y scripts PostgreSQL
│   │   ├── middlewares/    # Middlewares de seguridad y validación
│   │   ├── routes/         # Endpoints de la API v1 y v2
│   │   ├── scripts/        # Scripts auxiliares (create-admin)
│   │   ├── app.js          # Configuración de Express, CORS y Swagger UI
│   │   └── server.js       # Punto de entrada del backend (puerto 3000)
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend_base/      # Aplicación web moderna en Vue 3 + Vite
    ├── src/
    │   ├── api/            # Cliente HTTP y monitor de estado del backend
    │   ├── assets/         # Sistema de diseño, temas claro/oscuro y estilos
    │   ├── components/     # Componentes Vue (Tabla, Formularios, Diálogos)
    │   ├── App.vue         # Vista principal, navegación y barra de estado
    │   ├── main.js         # Montaje de la aplicación Vue
    │   └── resources.js    # Definición de recursos, columnas y formularios
    ├── index.html
    ├── vite.config.js      # Proxy a http://localhost:3000
    ├── package.json
    └── README.md
```

---

## 🚀 Instrucciones de Ejecución

### 1. Iniciar el Backend (`backend_base`)

```bash
cd backend_base
npm install
# Configura tus variables en .env basándote en .env.example
npm run dev
```

El servidor quedará disponible en `http://localhost:3000`.  
Documentación Swagger interactiva: `http://localhost:3000/api-docs`

### 2. Iniciar el Frontend (`frontend_base`)

En otra terminal:

```bash
cd frontend_base
npm install
npm run dev
```

Abre en tu navegador la dirección indicada por Vite (normalmente `http://localhost:5173`).

---

## ✨ Novedades y Mejoras en la Interfaz (Frontend)

A diferencia de la interfaz de referencia original, este repositorio incorpora:
1. **Diseño Visual Renovado:** Interfaz moderna con tarjetas KPI, badges inteligentes, avatares dinámicos y sombras suaves.
2. **Soporte Dark Mode / Light Mode:** Conmutación instantánea guardada en el navegador.
3. **Monitor de Backend en Vivo:** Detección en tiempo real del estado de la API `/api/v1/health`.
4. **Búsqueda Avanzada Multi-término:** Permite filtrar registros por ID, texto o múltiples valores separados por comas.
5. **Modales & Notificaciones Flotantes:** Experiencia de usuario pulida con alertas y confirmaciones seguras.
