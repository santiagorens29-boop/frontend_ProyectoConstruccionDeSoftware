<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  CIERRES_MOCK,
  DIARIO_MOCK,
  type CierreMensual,
  type AsientoDiario
} from '../types/finanzas'

// Listados reactivos
const cierres = ref<CierreMensual[]>([...CIERRES_MOCK])
const asientosDiario = ref<AsientoDiario[]>([...DIARIO_MOCK])

// Selecciones y filtros
const periodoSeleccionado = ref<CierreMensual | null>(null)
const filtroPeriodoId = ref<number | 'todos'>('todos')

// Modal de Confirmación de Cierre
const mostrarModalConfirmacion = ref(false)

// Libro Diario filtrado
const asientosFiltrados = computed(() => {
  if (filtroPeriodoId.value === 'todos') {
    return asientosDiario.value
  }
  return asientosDiario.value.filter(a => a.cierremensual_id === filtroPeriodoId.value)
})

// Totales Debe y Haber
const totalDebe = computed(() => {
  return asientosFiltrados.value.reduce((acc, curr) => acc + curr.debe, 0)
})

const totalHaber = computed(() => {
  return asientosFiltrados.value.reduce((acc, curr) => acc + curr.haber, 0)
})

function seleccionarPeriodo(cierre: CierreMensual) {
  if (periodoSeleccionado.value?.cierremensual_id === cierre.cierremensual_id) {
    periodoSeleccionado.value = null
  } else {
    periodoSeleccionado.value = cierre
  }
}

function abrirModalCierre() {
  if (periodoSeleccionado.value?.estado === 'Abierto') {
    mostrarModalConfirmacion.value = true
  }
}

function confirmarCierrePeriodo() {
  if (!periodoSeleccionado.value) return

  const targetId = periodoSeleccionado.value.cierremensual_id
  const index = cierres.value.findIndex(c => c.cierremensual_id === targetId)

  if (index !== -1) {
    cierres.value[index] = {
      ...cierres.value[index],
      estado: 'Cerrado',
      fecha_cierre: new Date().toISOString().split('T')[0]
    }
    periodoSeleccionado.value = cierres.value[index]
  }

  mostrarModalConfirmacion.value = false
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Encabezado -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Cierre de Período y Libro Diario</h3>
        <p class="text-muted small mb-0">Control de períodos contables y registro de asientos por partida doble</p>
      </div>

      <!-- Botón Cierre de Período -->
      <div>
        <button
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold shadow-sm"
          :disabled="!periodoSeleccionado || periodoSeleccionado.estado !== 'Abierto'"
          @click="abrirModalCierre"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
          </svg>
          <span>Ejecutar Cierre de Período</span>
        </button>
      </div>
    </div>

    <!-- Tabla Superior: Períodos / Cierres Mensuales -->
    <div class="card shadow-sm border-0 mb-4 overflow-hidden">
      <div class="card-header bg-dark-custom text-white py-3">
        <h5 class="fw-bold mb-0 fs-6">Períodos Mensuales</h5>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3 py-2">ID</th>
              <th scope="col" class="py-2">Período / Mes</th>
              <th scope="col" class="py-2">Fecha Cierre</th>
              <th scope="col" class="py-2">Estado</th>
              <th scope="col" class="pe-3 py-2 text-end">Monto Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cierre in cierres"
              :key="cierre.cierremensual_id"
              :class="{ 'fila-seleccionada': periodoSeleccionado?.cierremensual_id === cierre.cierremensual_id }"
              style="cursor: pointer;"
              @click="seleccionarPeriodo(cierre)"
            >
              <td class="ps-3 fw-bold text-muted">#{{ cierre.cierremensual_id }}</td>
              <td class="fw-semibold">{{ cierre.mesNombre }}</td>
              <td class="text-muted small">{{ cierre.fecha_cierre }}</td>
              <td>
                <span
                  class="badge px-2 py-1"
                  :class="cierre.estado === 'Abierto' ? 'bg-success' : 'bg-secondary'"
                >
                  {{ cierre.estado }}
                </span>
              </td>
              <td class="pe-3 text-end fw-bold text-dark">
                ${{ cierre.montoTotal ? cierre.montoTotal.toLocaleString('es-AR') : '0' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tabla Inferior: Libro Diario (Partida Doble) -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header bg-dark-custom text-white d-flex justify-content-between align-items-center py-3">
        <h5 class="fw-bold mb-0 fs-6">Libro Diario (Asientos Contables)</h5>
        
        <!-- Filtro por Mes/Período -->
        <div class="d-flex align-items-center gap-2">
          <label class="small text-white-50 text-nowrap">Filtrar período:</label>
          <select v-model="filtroPeriodoId" class="form-select form-select-sm select-filtro">
            <option value="todos">Ver Histórico Completo</option>
            <option v-for="c in cierres" :key="c.cierremensual_id" :value="c.cierremensual_id">
              {{ c.mesNombre }} ({{ c.estado }})
            </option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3 py-2">ID Asiento</th>
              <th scope="col" class="py-2">Fecha</th>
              <th scope="col" class="py-2">Descripción del Movimiento</th>
              <th scope="col" class="py-2 text-end text-success">Debe ($)</th>
              <th scope="col" class="pe-3 py-2 text-end text-danger">Haber ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asiento in asientosFiltrados" :key="asiento.diario_id">
              <td class="ps-3 text-muted">#{{ asiento.diario_id }}</td>
              <td class="text-muted small">{{ asiento.fecha }}</td>
              <td class="fw-semibold text-dark">{{ asiento.descripcion }}</td>
              <td class="text-end font-monospace text-success fw-bold">
                {{ asiento.debe > 0 ? `$${asiento.debe.toLocaleString('es-AR')}` : '-' }}
              </td>
              <td class="pe-3 text-end font-monospace text-danger fw-bold">
                {{ asiento.haber > 0 ? `$${asiento.haber.toLocaleString('es-AR')}` : '-' }}
              </td>
            </tr>
            <tr v-if="asientosFiltrados.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">No se registran asientos en este período.</td>
            </tr>
          </tbody>
          <!-- Balance Footer -->
          <tfoot class="table-light fw-bold">
            <tr>
              <td colspan="3" class="ps-3 text-end text-dark">Sumas Balanceadas:</td>
              <td class="text-end text-success">${{ totalDebe.toLocaleString('es-AR') }}</td>
              <td class="pe-3 text-end text-danger">${{ totalHaber.toLocaleString('es-AR') }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal de Confirmación de Cierre -->
    <div v-if="mostrarModalConfirmacion && periodoSeleccionado">
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow border-0 overflow-hidden">
            <div class="modal-header modal-header-custom text-white px-4 py-3">
              <h5 class="modal-title fw-bold mb-0">Confirmar Cierre de Período</h5>
              <button type="button" class="btn-close btn-close-white" @click="mostrarModalConfirmacion = false"></button>
            </div>
            <div class="modal-body p-4 bg-white">
              <p class="text-dark mb-2">
                ¿Está seguro de cerrar el período <strong>{{ periodoSeleccionado.mesNombre }}</strong>?
              </p>
              <div class="alert alert-warning small mb-0">
                Una vez cerrado el período, los asientos contables quedarán bloqueados para modificaciones.
              </div>
            </div>
            <div class="modal-footer bg-light px-4 py-3 border-top">
              <button type="button" class="btn btn-secondary px-3" @click="mostrarModalConfirmacion = false">
                Cancelar
              </button>
              <button type="button" class="btn btn-coralon px-4 fw-semibold" @click="confirmarCierrePeriodo">
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-dark-custom {
  background-color: #231f1d;
}

.modal-header-custom {
  background-color: #231f1d;
  border-bottom: 3px solid #b33e14;
}

.modal-backdrop {
  opacity: 0.6;
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
  color: #ffffff;
}

.fila-seleccionada {
  background-color: #fff1eb !important;
  border-left: 4px solid #b33e14;
}

.fila-seleccionada td {
  background-color: #fff1eb !important;
}

.select-filtro {
  background-color: #332d2a;
  color: #ffffff;
  border: 1px solid #4a4440;
}

.select-filtro:focus {
  background-color: #332d2a;
  color: #ffffff;
  border-color: #b33e14;
  box-shadow: none;
}
</style>