<script setup lang="ts">
export interface AccionSidebar {
  titulo: string
  descripcion: string
}

withDefaults(
  defineProps<{
    accion1?: AccionSidebar
    accion2?: AccionSidebar
    subVistaActiva?: 'opcion1' | 'opcion2'
  }>(),
  {
    accion1: () => ({
      titulo: 'Facturar Órdenes',
      descripcion: 'Emisión de comprobantes contables',
    }),
    accion2: () => ({
      titulo: 'Cierre y Libro Diario',
      descripcion: 'Cierre mensual y asientos contables',
    }),
    subVistaActiva: 'opcion1'
  }
)

const emit = defineEmits<{
  (e: 'seleccionar-accion', opcion: 'opcion1' | 'opcion2'): void
}>()
</script>

<template>
  <aside class="custom-sidebar p-3">
    <h6 class="sidebar-title text-uppercase mb-3">Acciones del módulo</h6>

    <div class="d-flex flex-column gap-2">
      <!-- Tarjeta 1 -->
      <a 
        href="#" 
        class="accion-card d-flex align-items-start gap-2 p-3 text-decoration-none rounded"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion1' }"
        @click.prevent="emit('seleccionar-accion', 'opcion1')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" class="icono mt-1">
          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
        </svg>
        <div>
          <div class="accion-titulo fw-bold">{{ accion1.titulo }}</div>
          <div class="accion-descripcion">{{ accion1.descripcion }}</div>
        </div>
      </a>

      <!-- Tarjeta 2 -->
      <a 
        href="#" 
        class="accion-card d-flex align-items-start gap-2 p-3 text-decoration-none rounded"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion2' }"
        @click.prevent="emit('seleccionar-accion', 'opcion2')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" class="icono mt-1">
          <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a1 1 0 0 1-1.6.8L8 12.25l-4.4 2.55A1 1 0 0 1 2 14z"/>
        </svg>
        <div>
          <div class="accion-titulo fw-bold">{{ accion2.titulo }}</div>
          <div class="accion-descripcion">{{ accion2.descripcion }}</div>
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