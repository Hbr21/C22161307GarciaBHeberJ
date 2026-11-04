# frontend_base &middot; Control Panel

**Número de Control:** C22161307  
**Alumno:** Heber J. García Benítez  
**Proyecto:** Interfaz Frontend moderna en Vue 3 + Vite para la administración y consumo de la API REST `backend_base`.

---

## 🌟 Características y Novedades de la Interfaz

- **Diseño Moderno & Responsivo:** Construido con una estética inspirada en sistemas de gestión empresarial modernos (Glassmorphism sutil, variables CSS personalizadas, tarjetas KPI y avatares dinámicos).
- **Soporte de Tema Oscuro y Claro:** Conmutador persistente en `localStorage` con adaptación fluida de contraste y colores.
- **Monitor de Estado en Tiempo Real (Backend Health):** Ping automático y manual a `/api/v1/health` con indicador de conexión tipo beacon (verde/rojo).
- **CRUD Completo:**
  - **Roles:** Creación, edición, eliminación y listado de roles con control de permisos.
  - **Usuarios:** Gestión de cuentas, contraseñas seguras, asignación de roles y estados activo/inactivo.
  - **Empleados:** Directorio con vinculación a cuenta de usuario, puestos, teléfonos, domicilios y fechas de ingreso.
- **Búsqueda Avanzada Multi-término:** Búsqueda en vivo por ID o texto general, admitiendo filtros múltiples separados por coma (ej. `admin, juan, 3`).
- **Validaciones & Feedback Visual:** Modales con estados de carga (`spinner`), switches animados para atributos booleanos, alertas contextuales y notificaciones flotantes (`toast`).

---

## 🚀 Puesta en Marcha

### 1. Iniciar el Backend
Asegúrate de que la base de datos PostgreSQL esté corriendo y ejecuta el backend desde la carpeta `backend_base`:

```sh
cd backend_base
npm install
npm run dev
```

El servidor backend iniciará en `http://localhost:3000`.

### 2. Iniciar el Frontend
En otra terminal, accede a la carpeta `frontend_base`:

```sh
cd frontend_base
npm install
npm run dev
```

Abre en tu navegador la URL que indique Vite (normalmente `http://localhost:5173`).  
Vite cuenta con un proxy preconfigurado en `vite.config.js` que reenvía las peticiones `/api` hacia `http://localhost:3000`.

---

## 📦 Construcción para Producción

Para compilar los archivos estáticos optimizados:

```sh
npm run build
```

Si el backend corre en otra dirección o dominio en producción:

```sh
VITE_API_URL=https://api-produccion.ejemplo.com/api/v2 npm run build
```
