<script setup lang="ts">
interface Accion {
  titulo: string
  descripcion: string
}

interface Props {
  accion1: Accion
  accion2: Accion
  subVistaActiva?: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'seleccionar-accion', opcion: 'opcion1' | 'opcion2'): void
}>()
</script>

<template>
  <aside class="sidebar-custom d-flex flex-column flex-shrink-0 p-3 text-white">
    <span class="fs-6 fw-bold text-uppercase mb-3 px-2 text-warning letter-spacing">
      Acciones Rápidas
    </span>

    <div class="d-flex flex-column gap-3">
      <!-- Tarjeta Acción 1 -->
      <div 
        class="card card-action border-0 p-3 text-start"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion1' }"
        style="cursor: pointer;"
        @click="emit('seleccionar-accion', 'opcion1')"
      >
        <div class="d-flex align-items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-warning" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <strong class="text-white fs-6">{{ accion1.titulo }}</strong>
        </div>
        <small class="text-white-50">{{ accion1.descripcion }}</small>
      </div>

      <!-- Tarjeta Acción 2 -->
      <div 
        class="card card-action border-0 p-3 text-start"
        :class="{ 'tarjeta-activa': subVistaActiva === 'opcion2' }"
        style="cursor: pointer;"
        @click="emit('seleccionar-accion', 'opcion2')"
      >
        <div class="d-flex align-items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-warning" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <strong class="text-white fs-6">{{ accion2.titulo }}</strong>
        </div>
        <small class="text-white-50">{{ accion2.descripcion }}</small>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-custom {
  width: 280px;
  min-height: calc(100vh - 65px);
  background-color: #231f1d;
  border-right: 2px solid #332d2a;
}

.letter-spacing {
  letter-spacing: 0.8px;
}

.card-action {
  background-color: #2f2a27;
  border-left: 4px solid transparent !important;
  transition: all 0.2s ease-in-out;
}

.card-action:hover {
  background-color: #3d3733;
  border-left-color: #c9881e !important;
}

.tarjeta-activa {
  background-color: #3d3733 !important;
  border-left-color: #b33e14 !important;
}
</style>