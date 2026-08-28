# Frontend - Proyecto Construcción de Software

Aplicación web del frontend del proyecto. La comunicación con el backend se realiza
exclusivamente mediante **APIs REST** que el equipo de backend expone; este repositorio
no contiene lógica de servidor ni acceso directo a base de datos.

## Herramientas y tecnologías

| Herramienta | Uso |
|---|---|
| [Vite](https://vitejs.dev/) 8 | Bundler y servidor de desarrollo |
| [Vue 3](https://vuejs.org/) | Framework de UI (SFC con `<script setup>`) |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático en todo el código |
| [Bootstrap 5](https://getbootstrap.com/) | Estilos y componentes de UI (CSS + JS, con `@popperjs/core`) |
| [Axios](https://axios-http.com/) | Cliente HTTP para consumir las APIs del backend |
| [vue-tsc](https://github.com/vuejs/language-tools) | Type-check de los `.vue` durante el build |

## Requisitos previos

- Node.js 20+ (probado con Node 24)
- npm 10+

## Puesta en marcha

```bash
npm install                 # instalar dependencias
cp .env.example .env         # crear configuración local (ver más abajo)
npm run dev                  # servidor de desarrollo -> http://localhost:5173
```

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Type-check (`vue-tsc`) + build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de producción |

## Comunicación con el backend

- El backend expone las APIs REST; el frontend solo las consume.
- La URL base se configura con la variable de entorno `VITE_API_BASE_URL`
  (ver `.env.example`). Por defecto: `http://localhost:8080/api`.
- Todas las llamadas HTTP deben pasar por el cliente centralizado en
  [`src/lib/api.ts`](src/lib/api.ts), que ya define `baseURL`, timeout e
  interceptores de error. **No usar `axios` ni `fetch` directamente** en los
  componentes.
- Las variables de entorno de Vite deben tener el prefijo `VITE_` para estar
  disponibles en el cliente.

Ejemplo de uso:

```ts
import api from '@/lib/api' // o ruta relativa: '../lib/api'

const { data } = await api.get('/usuarios')
```

## Flujo de trabajo con Git

- La rama `main` es estable y protegida; **no se commitea directamente sobre `main`**.
- Cada tarea se desarrolla en una rama propia con el formato:

  ```
  feature/<nombre-de-la-historia-de-usuario>
  ```

  Ejemplos: `feature/login-de-usuario`, `feature/listado-de-proyectos`.

- Para trabajar:

  ```bash
  git checkout main
  git pull
  git checkout -b feature/nombre-de-la-historia
  # ... commits ...
  git push -u origin feature/nombre-de-la-historia
  ```

- Al terminar, abrir un **Pull Request** hacia `main` y solicitar revisión antes de
  hacer merge.
- Mensajes de commit claros y en un solo idioma, describiendo el "qué" y el "por qué".

### Convenciones adicionales

- No commitear `node_modules/`, `dist/` ni archivos `.env` (ya están en `.gitignore`).
- Mantener el código formateado y sin errores de TypeScript: `npm run build` debe
  pasar antes de abrir un PR.
- Componentes en `src/components/`, vistas en `src/views/` (crear la carpeta cuando
  se necesite), utilidades y clientes en `src/lib/`.

## Estructura del proyecto

```
src/
  assets/        Recursos estáticos importados
  components/     Componentes Vue reutilizables
  lib/
    api.ts       Cliente Axios centralizado
  App.vue        Componente raíz
  main.ts        Punto de entrada (monta la app, importa Bootstrap)
  style.css      Estilos globales
public/          Archivos servidos tal cual
.env.example     Plantilla de variables de entorno
```
