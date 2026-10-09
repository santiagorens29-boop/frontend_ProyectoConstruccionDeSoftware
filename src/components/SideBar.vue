<script setup lang="ts">
export interface AccionSidebar {
  titulo: string
  descripcion: string
}

withDefaults(
  defineProps<{
    accion1?: AccionSidebar
    accion2?: AccionSidebar
    accion3?: AccionSidebar
    subVistaActiva?: 'opcion1' | 'opcion2' | 'opcion3'
  }>(),
  {
    accion1: () => ({
      titulo: 'Catálogo de Productos',
      descripcion: 'Gestión de artículos, precios y stock mínimo',
    }),
    accion2: () => ({
      titulo: 'Cargar Stock',
      descripcion: 'Ingreso manual de mercadería a inventario',
    }),
    accion3: undefined,
    subVistaActiva: 'opcion1'
  }
)

const emit = defineEmits<{
  (e: 'seleccionar-accion', opcion: 'opcion1' | 'opcion2' | 'opcion3'): void
}>()
</script>

<template>
  <aside class="custom-sidebar p-3">
    <h6 class="sidebar-title text-uppercase mb-3 fw-bold">Acciones del módulo</h6>

    <div class="d-flex flex-column gap-2">
      <!-- Tarjeta 1: Catálogo de Productos (Ícono: Caja de Inventario) -->
      <a 
        v-if="accion1"
        href="#" 
        class="accion-card d-flex align-items-start gap-2 p-3 text-decoration-none rounded"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion1' }"
        @click.prevent="emit('seleccionar-accion', 'opcion1')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="icono mt-1">
          <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2zm3.564 1.428L5.838 5 8 5.865 13.854 3.5zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.761V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a1.5 1.5 0 0 1-1.143 0L.014 13.09A1 1 0 0 1 0 12.162V3.5a.5.5 0 0 1 .314-.464z"/>
        </svg>
        <div>
          <div class="accion-titulo fw-bold">{{ accion1.titulo }}</div>
          <div class="accion-descripcion">{{ accion1.descripcion }}</div>
        </div>
      </a>

      <!-- Tarjeta 2: Cargar Stock (Ícono: Ingreso de Mercadería) -->
      <a 
        v-if="accion2"
        href="#" 
        class="accion-card d-flex align-items-start gap-2 p-3 text-decoration-none rounded"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion2' }"
        @click.prevent="emit('seleccionar-accion', 'opcion2')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="icono mt-1">
          <path fill-rule="evenodd" d="M3.5 6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2A1.5 1.5 0 0 1 14 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5h2a.5.5 0 0 1 0 1z"/>
          <path fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
        </svg>
        <div>
          <div class="accion-titulo fw-bold">{{ accion2.titulo }}</div>
          <div class="accion-descripcion">{{ accion2.descripcion }}</div>
        </div>
      </a>

      <!-- Tarjeta 3 (Opcional) -->
      <a 
        v-if="accion3"
        href="#" 
        class="accion-card d-flex align-items-start gap-2 p-3 text-decoration-none rounded"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion3' }"
        @click.prevent="emit('seleccionar-accion', 'opcion3')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="icono mt-1">
          <path d="M11 2a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM5 1a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z"/>
          <path d="M4 11a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>
        </svg>
        <div>
          <div class="accion-titulo fw-bold">{{ accion3.titulo }}</div>
          <div class="accion-descripcion">{{ accion3.descripcion }}</div>
        </div>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.custom-sidebar {
  width: 260px;
  min-height: 100vh;
  background-color: #231f1d;
  border-right: 1px solid #332d2a;
}

/* Reglas responsive para evitar que achique el contenido principal en pantallas chicas */
@media (max-width: 991.98px) {
  .custom-sidebar {
    width: 100% !important;
    min-height: auto !important;
    border-right: none;
    border-bottom: 1px solid #332d2a;
  }
}

.sidebar-title {
  color: #b0ada8;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.accion-card {
  background-color: #2c2724;
  border: 1px solid #3d3733;
  color: #ffffff;
  transition: background-color 0.15s, border-color 0.15s;
}

.accion-card:hover {
  background-color: #332d2a;
  border-color: #c9881e;
}

.tarjeta-activa {
  background-color: #332d2a !important;
  border-color: #b33e14 !important;
  border-left: 4px solid #b33e14 !important;
}

.icono {
  color: #c9881e;
  flex-shrink: 0;
}

.accion-titulo {
  font-size: 0.95rem;
  line-height: 1.2;
  color: #ffffff;
}

.accion-descripcion {
  font-size: 0.8rem;
  color: #b0ada8;
}
</style>