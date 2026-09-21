<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CLIENTES_MOCK, type Cliente } from '../types/cliente'
import { PRODUCTOS_MOCK, type Producto } from '../types/producto'
import { TIPOS_COMPROBANTE, METODOS_PAGO, IVA_PORCENTAJE, type ItemVenta } from '../types/venta'

// --- Búsqueda de cliente por CUIL ---
const cuilBuscado = ref('')
const clienteEncontrado = ref<Cliente | null>(null)
const busquedaSinResultado = ref(false)

function buscarCliente() {
  const termino = cuilBuscado.value.trim()
  const encontrado = CLIENTES_MOCK.find((c) => c.cuil === termino)
  clienteEncontrado.value = encontrado ?? null
  busquedaSinResultado.value = !encontrado && termino.length > 0
}

// Sugiere el tipo de comprobante según la condición IVA del cliente
// encontrado. El usuario puede cambiarlo a mano después si hace falta.
function comprobanteSugerido(condicionIva: string): string {
  if (condicionIva === 'Responsable Inscripto') return 'Factura A'
  if (condicionIva === 'Monotributista') return 'Factura C'
  return 'Factura B' // Consumidor Final o Exento
}

watch(clienteEncontrado, (cliente) => {
  if (cliente) {
    tipoComprobante.value = comprobanteSugerido(cliente.condicion_iva)
  }
})

// --- Encabezado ---
const fecha = ref(new Date().toISOString().slice(0, 10))
const tipoComprobante = ref(TIPOS_COMPROBANTE[0])

// --- Ítems de la factura ---
const items = ref<ItemVenta[]>([])
const busquedaProducto = ref('')
const mostrarSugerencias = ref(false)

// Lista de coincidencias en vivo, a medida que se escribe
const sugerencias = computed<Producto[]>(() => {
  const termino = busquedaProducto.value.trim().toLowerCase()
  if (!termino) return []
  return PRODUCTOS_MOCK.filter((p) => p.nombre.toLowerCase().includes(termino)).slice(0, 6)
})

function agregarProducto(producto: Producto) {
  const existente = items.value.find((i) => i.productoId === producto.producto_id)
  if (existente) {
    existente.cantidad += 1
  } else {
    items.value.push({
      id: Date.now(),
      productoId: producto.producto_id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: producto.preciounitario,
      descuento: 0,
    })
  }
  busquedaProducto.value = ''
  mostrarSugerencias.value = false
}

function ocultarSugerenciasConDelay() {
  setTimeout(() => {
    mostrarSugerencias.value = false
  }, 150)
}

function quitarItem(id: number) {
  items.value = items.value.filter((i) => i.id !== id)
}

function subtotalItem(item: ItemVenta) {
  return item.cantidad * item.precioUnitario - item.descuento
}

// --- Totales ---
const subtotal = computed(() => items.value.reduce((acc, item) => acc + subtotalItem(item), 0))
const iva = computed(() => subtotal.value * IVA_PORCENTAJE)
const total = computed(() => subtotal.value + iva.value)

// --- Método de pago ---
const metodoPago = ref(METODOS_PAGO[0])

function confirmarVenta() {
  if (!clienteEncontrado.value) {
    alert('Buscá y seleccioná un cliente antes de continuar')
    return
  }
  if (items.value.length === 0) {
    alert('Agregá al menos un producto')
    return
  }

  // Acá, cuando el backend esté listo, se reemplaza por:
  // await api.post('/ventas', { clienteId: ..., items: ..., total: total.value })
  alert(`Venta registrada (simulada): Total $${total.value.toLocaleString('es-AR')}`)

  items.value = []
  clienteEncontrado.value = null
  cuilBuscado.value = ''
}
</script>

<template>
  <div class="container-fluid py-2">
    <div class="mb-4">
      <h3 class="fw-bold mb-0 text-dark">Registrar venta / Nueva factura</h3>
      <p class="text-muted small mb-0">Nueva venta</p>
    </div>

    <!-- Encabezado -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-3">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Cliente (buscar por CUIL)</label>
            <div class="input-group">
              <input
                v-model="cuilBuscado"
                type="text"
                class="form-control"
                placeholder="20-31456789-2"
                @keyup.enter="buscarCliente"
              />
              <button class="btn btn-coralon" type="button" @click="buscarCliente">🔍</button>
            </div>
            <div v-if="clienteEncontrado" class="text-success small mt-1">
              ✓ {{ clienteEncontrado.nombre }} — {{ clienteEncontrado.condicion_iva }}
            </div>
            <div v-else-if="busquedaSinResultado" class="text-danger small mt-1">
              Cliente no encontrado
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Fecha</label>
            <input v-model="fecha" type="date" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-semibold">Tipo de comprobante</label>
            <select v-model="tipoComprobante" class="form-select">
              <option v-for="tipo in TIPOS_COMPROBANTE" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Detalle de ítems -->
      <div class="col-lg-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-white d-flex justify-content-between align-items-center position-relative">
            <span class="fw-bold">Detalle de ítems</span>
            <div class="position-relative" style="width: 320px;">
              <input
                v-model="busquedaProducto"
                type="text"
                class="form-control form-control-sm"
                placeholder="Buscar producto por nombre..."
                @focus="mostrarSugerencias = true"
                @blur="ocultarSugerenciasConDelay"
              />

              <!-- Lista de sugerencias en vivo -->
              <ul
                v-if="mostrarSugerencias && sugerencias.length > 0"
                class="list-group position-absolute w-100 shadow-sm sugerencias-lista"
              >
                <li
                  v-for="producto in sugerencias"
                  :key="producto.producto_id"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  style="cursor: pointer;"
                  @mousedown.prevent="agregarProducto(producto)"
                >
                  <span>{{ producto.nombre }}</span>
                  <span class="text-muted small">${{ producto.preciounitario.toLocaleString('es-AR') }}</span>
                </li>
              </ul>

              <div
                v-if="mostrarSugerencias && busquedaProducto.trim() && sugerencias.length === 0"
                class="position-absolute w-100 shadow-sm sugerencias-lista bg-white border rounded p-2 text-muted small"
              >
                No se encontraron productos.
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-dark-custom">
                <tr>
                  <th class="ps-3">Producto</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Desc.</th>
                  <th>Subtotal</th>
                  <th class="pe-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td class="ps-3">{{ item.nombre }}</td>
                  <td style="width: 90px;">
                    <input v-model.number="item.cantidad" type="number" min="1" class="form-control form-control-sm" />
                  </td>
                  <td>${{ item.precioUnitario.toLocaleString('es-AR') }}</td>
                  <td style="width: 100px;">
                    <input v-model.number="item.descuento" type="number" min="0" class="form-control form-control-sm" />
                  </td>
                  <td class="fw-bold">${{ subtotalItem(item).toLocaleString('es-AR') }}</td>
                  <td class="pe-3 text-end">
                    <button class="btn btn-sm btn-outline-danger" type="button" @click="quitarItem(item.id)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="items.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    Buscá un producto arriba para agregarlo a la venta.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Resumen -->
      <div class="col-lg-4">
        <div class="card shadow-sm border-0">
          <div class="card-body p-3">
            <h6 class="fw-bold mb-3">Resumen</h6>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal</span>
              <span>${{ subtotal.toLocaleString('es-AR') }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">IVA (21%)</span>
              <span>${{ iva.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }}</span>
            </div>
            <hr />
            <div class="d-flex justify-content-between mb-3 fs-5 fw-bold">
              <span>Total</span>
              <span>${{ total.toLocaleString('es-AR', { maximumFractionDigits: 0 }) }}</span>
            </div>

            <label class="form-label fw-semibold">Método de pago</label>
            <select v-model="metodoPago" class="form-select mb-3">
              <option v-for="m in METODOS_PAGO" :key="m" :value="m">{{ m }}</option>
            </select>

            <button class="btn btn-coralon w-100 fw-semibold" type="button" @click="confirmarVenta">
              💳 Cobrar
            </button>
          </div>
        </div>
      </div>
    </div>
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
.sugerencias-lista {
  top: 100%;
  left: 0;
  z-index: 20;
  max-height: 240px;
  overflow-y: auto;
}
</style>