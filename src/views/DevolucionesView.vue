<script setup lang="ts">
import { ref, computed } from 'vue'
import { VENTAS_MOCK, DESTINOS_DEVOLUCION, type VentaHistorial } from '../types/devolucion'
import ModalAnulacion from '../components/ModalAnulacion.vue'

const ventas = ref<VentaHistorial[]>([...VENTAS_MOCK])
const busqueda = ref('')

const ventasFiltradas = computed(() => {
  const termino = busqueda.value.trim().toLowerCase()
  if (!termino) return ventas.value
  return ventas.value.filter(
    (v) => v.comprobante.toLowerCase().includes(termino) || v.cliente.toLowerCase().includes(termino)
  )
})

// --- Modal de anulación ---
const mostrarModalAnular = ref(false)
const ventaAAnular = ref<VentaHistorial | null>(null)

function abrirAnular(venta: VentaHistorial) {
  ventaAAnular.value = venta
  mostrarModalAnular.value = true
}

function cerrarModalAnular() {
  mostrarModalAnular.value = false
  ventaAAnular.value = null
}

function confirmarAnulacion(datos: { ventaId: number; motivo: string; detalle: string }) {
  const venta = ventas.value.find((v) => v.id === datos.ventaId)
  if (venta) venta.estado = 'Anulada'
  cerrarModalAnular()
}

// --- Nota de crédito (devolución) ---
const ventaParaDevolver = ref<VentaHistorial | null>(null);
const itemsSeleccionados = ref<Record<number, { seleccionado: boolean; cantidad: number; destino: string }>>({})

function iniciarDevolucion(venta: VentaHistorial) {
  ventaParaDevolver.value = venta
  itemsSeleccionados.value = {}
  venta.items.forEach((item) => {
    itemsSeleccionados.value[item.productoId] = {
      seleccionado: false,
      cantidad: 0,
      destino: DESTINOS_DEVOLUCION[0],
    }
  })
}

const dejarComoSaldo = ref(false)

const itemsSeleccionadosCount = computed(
  () => Object.values(itemsSeleccionados.value).filter((i) => i.seleccionado).length
)

// Monto a reembolsar: proporcional al precio promedio del total original
// (simplificado, sin precios unitarios reales en el historial)
const montoAReembolsar = computed(() => {
  if (!ventaParaDevolver.value) return 0
  const totalCantidadVendida = ventaParaDevolver.value.items.reduce((acc, i) => acc + i.cantidadVendida, 0)
  if (totalCantidadVendida === 0) return 0
  const precioPromedio = ventaParaDevolver.value.total / totalCantidadVendida

  return Object.values(itemsSeleccionados.value).reduce((acc, item) => {
    if (!item.seleccionado) return acc
    return acc + item.cantidad * precioPromedio
  }, 0)
})

function generarNotaCredito() {
  if (!ventaParaDevolver.value) return
  if (itemsSeleccionadosCount.value === 0) {
    alert('Seleccioná al menos un ítem para devolver')
    return
  }

  const venta = ventas.value.find((v) => v.id === ventaParaDevolver.value!.id)
  if (venta) venta.estado = 'Devolución parcial'

  alert(`Nota de crédito generada (simulada): $${montoAReembolsar.value.toLocaleString('es-AR')}`)
  ventaParaDevolver.value = null
}
</script>

<template>
  <div class="container-fluid py-2">
    <div class="mb-4">
      <h3 class="fw-bold mb-0 text-dark">Devoluciones</h3>
      <p class="text-muted small mb-0">Historial de ventas, anulaciones y notas de crédito</p>
    </div>

    <!-- Historial de ventas -->
    <div class="card shadow-sm border-0 mb-4 overflow-hidden">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <span class="fw-bold">Historial de ventas</span>
        <input
          v-model="busqueda"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="Buscar por N° o cliente"
        />
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-dark-custom">
            <tr>
              <th class="ps-3">Comprobante</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th class="pe-3 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ventasFiltradas" :key="venta.id">
              <td class="ps-3 fw-bold">{{ venta.comprobante }}</td>
              <td>{{ venta.fecha }}</td>
              <td>{{ venta.cliente }}</td>
              <td>${{ venta.total.toLocaleString('es-AR') }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'bg-success': venta.estado === 'Confirmada',
                    'bg-warning text-dark': venta.estado === 'Devolución parcial',
                    'bg-danger': venta.estado === 'Anulada',
                  }"
                >
                  {{ venta.estado }}
                </span>
              </td>
              <td class="pe-3 text-end">
                <button
                  class="btn btn-sm btn-outline-danger me-2"
                  type="button"
                  :disabled="venta.estado === 'Anulada'"
                  @click="abrirAnular(venta)"
                >
                  Anular
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  type="button"
                  :disabled="venta.estado === 'Anulada'"
                  @click="iniciarDevolucion(venta)"
                >
                  Devolver
                </button>
              </td>
            </tr>
            <tr v-if="ventasFiltradas.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No se encontraron ventas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nota de crédito -->
    <div v-if="ventaParaDevolver" class="row g-4">
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 mb-3">
          <div class="card-body p-3">
            <h6 class="fw-bold mb-3">Referencia — Nota de crédito</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">N° de factura original</label>
                <input type="text" class="form-control" :value="ventaParaDevolver.comprobante" disabled />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Cliente</label>
                <input type="text" class="form-control" :value="ventaParaDevolver.cliente" disabled />
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 overflow-hidden">
          <div class="card-header bg-white fw-bold">Ítems a devolver</div>
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-dark-custom">
                <tr>
                  <th class="ps-3"></th>
                  <th>Producto</th>
                  <th>Cant. Vendida</th>
                  <th>Cant. a Devolver</th>
                  <th class="pe-3">Destino</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in ventaParaDevolver.items" :key="item.productoId">
                  <td class="ps-3">
                    <input type="checkbox" v-model="itemsSeleccionados[item.productoId].seleccionado" />
                  </td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.cantidadVendida }}</td>
                  <td style="width: 110px;">
                    <input
                      v-model.number="itemsSeleccionados[item.productoId].cantidad"
                      type="number"
                      min="0"
                      :max="item.cantidadVendida"
                      class="form-control form-control-sm"
                      :disabled="!itemsSeleccionados[item.productoId].seleccionado"
                    />
                  </td>
                  <td class="pe-3">
                    <select
                      v-model="itemsSeleccionados[item.productoId].destino"
                      class="form-select form-select-sm"
                      :disabled="!itemsSeleccionados[item.productoId].seleccionado"
                    >
                      <option v-for="d in DESTINOS_DEVOLUCION" :key="d" :value="d">{{ d }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-3">
            <h6 class="fw-bold mb-3">Resumen de devolución</h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Ítems seleccionados</span>
              <span>{{ itemsSeleccionadosCount }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 fw-bold">
              <span>Monto a reembolsar</span>
              <span>${{ montoAReembolsar.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }}</span>
            </div>

            <div class="form-check mb-3">
              <input v-model="dejarComoSaldo" class="form-check-input" type="checkbox" id="saldoFavor" />
              <label class="form-check-label" for="saldoFavor">Dejar como saldo a favor del cliente</label>
            </div>

            <button class="btn btn-coralon w-100 fw-semibold" type="button" @click="generarNotaCredito">
              📄 Generar nota de crédito
            </button>
          </div>
        </div>
      </div>
    </div>

    <ModalAnulacion
      :mostrar="mostrarModalAnular"
      :venta="ventaAAnular"
      @cerrar="cerrarModalAnular"
      @confirmar="confirmarAnulacion"
    />
  </div>
</template>

<style scoped>
.btn-coralon {
  background-color: #b33e14;
  border-color: #b33e14;
  color: #ffffff;
}
.btn-coralon:hover {
  background-color: #ff7a45;
  border-color: #ff7a45;
  color: #ffffff;
}
.table-dark-custom {
  background-color: #231f1d;
  color: #f5f5f5;
}
.table-dark-custom th {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>