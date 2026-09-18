<script setup lang="ts">
import { ref } from 'vue'
import { PERIODOS_MOCK, type Periodo } from '../types/finanzas'
import ModalCrearPeriodo from '../components/ModalCrearPeriodo.vue'

const periodos = ref<Periodo[]>([...PERIODOS_MOCK])
const mostrarModalCrear = ref(false)
const mensajeExito = ref('')

const nombresMeses: Record<number, string> = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
}

function crearNuevoPeriodo(datos: { anio: number; mes: number }) {
  const nuevoId = periodos.value.length > 0 ? Math.max(...periodos.value.map(p => p.periodo_id)) + 1 : 1
  
  const nuevoPeriodo: Periodo = {
    periodo_id: nuevoId,
    anio: datos.anio,
    mes: datos.mes
  }

  periodos.value.unshift(nuevoPeriodo)
  mensajeExito.value = `Período ${nombresMeses[datos.mes]} ${datos.anio} creado con éxito.`
  setTimeout(() => {
    mensajeExito.value = ''
  }, 4000)
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Encabezado con Botón Crear Período -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Gestión de Períodos Contables</h3>
        <p class="text-muted small mb-0">Alta y visualización de ejercicios mensuales</p>
      </div>
      <div>
        <button
          type="button"
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold shadow-sm"
          @click="mostrarModalCrear = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <span>Crear Período</span>
        </button>
      </div>
    </div>

    <!-- Alerta de Éxito -->
    <div v-if="mensajeExito" class="alert alert-success py-2 small mb-3">
      {{ mensajeExito }}
    </div>

    <!-- Tabla Períodos -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header bg-dark-custom text-white py-3">
        <h5 class="fw-bold mb-0 fs-6">Períodos Registrados</h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3 py-2">ID Período</th>
              <th scope="col" class="py-2">Mes</th>
              <th scope="col" class="py-2">Año</th>
              <th scope="col" class="pe-3 py-2 text-end">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in periodos" :key="p.periodo_id">
              <td class="ps-3 fw-bold text-muted font-monospace">#{{ p.periodo_id }}</td>
              <td class="fw-semibold text-dark">{{ nombresMeses[p.mes] || p.mes }}</td>
              <td>{{ p.anio }}</td>
              <td class="pe-3 text-end text-muted small">{{ nombresMeses[p.mes] }} de {{ p.anio }}</td>
            </tr>
            <tr v-if="periodos.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">No hay períodos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para Crear Período -->
    <ModalCrearPeriodo
      :mostrar="mostrarModalCrear"
      :periodos-existentes="periodos"
      @cerrar="mostrarModalCrear = false"
      @crear="crearNuevoPeriodo"
    />
  </div>
</template>

<style scoped>
.bg-dark-custom {
  background-color: #231f1d;
}
.btn-coralon {
  background-color: #b33e14;
  border-color: #b33e14;
  color: #ffffff;
  transition: all 0.2s ease-in-out;
}
.btn-coralon:hover {
  background-color: #ff7a45;
  border-color: #ff7a45;
}
</style>