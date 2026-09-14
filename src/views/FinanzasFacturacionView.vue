<script setup lang="ts">
import { ref } from 'vue'
import {
  FACTURAS_MOCK,
  ORDENES_COMPRA_PENDIENTES,
  ORDENES_VENTA_PENDIENTES,
  type FacturaCabecera,
  type FacturaDetalle,
  type OrdenComercial
} from '../types/finanzas'
import ModalDetalleFactura from '../components/ModalDetalleFactura.vue'
import ModalDetalleOrden from '../components/ModalDetalleOrden.vue'

// Listados reactivos
const facturas = ref<FacturaCabecera[]>([...FACTURAS_MOCK])
const ordenesCompra = ref<OrdenComercial[]>([...ORDENES_COMPRA_PENDIENTES])
const ordenesVenta = ref<OrdenComercial[]>([...ORDENES_VENTA_PENDIENTES])

// Selecciones individuales
const facturaSeleccionada = ref<FacturaCabecera | null>(null)
const ordenSeleccionada = ref<OrdenComercial | null>(null)

// Control de modales
const mostrarModalFactura = ref(false)
const mostrarModalOrden = ref(false)

// Exclusión mutua al seleccionar órdenes
function seleccionarOrden(orden: OrdenComercial) {
  if (ordenSeleccionada.value?.orden_id === orden.orden_id && ordenSeleccionada.value?.tipo_orden === orden.tipo_orden) {
    ordenSeleccionada.value = null
  } else {
    ordenSeleccionada.value = orden
  }
}

function seleccionarFactura(factura: FacturaCabecera) {
  if (facturaSeleccionada.value?.facturacabecera_id === factura.facturacabecera_id) {
    facturaSeleccionada.value = null
  } else {
    facturaSeleccionada.value = factura
  }
}

function verDetalleFactura() {
  if (facturaSeleccionada.value) {
    mostrarModalFactura.value = true
  }
}

function verDetalleOrden() {
  if (ordenSeleccionada.value) {
    mostrarModalOrden.value = true
  }
}

// Acción de Facturación
function registrarFacturaDesdeOrden() {
  if (!ordenSeleccionada.value) return

  const orden = ordenSeleccionada.value
  const nuevoId = facturas.value.length > 0 ? Math.max(...facturas.value.map(f => f.facturacabecera_id)) + 1 : 1
  const numeroFactura = `FCA-${nuevoId.toString().padStart(4, '0')}`

  // Cálculo de Subtotal e IVA (21%)
  const subtotalNeto = Math.round((orden.total / 1.21) * 100) / 100
  const impuestoIva = Math.round((orden.total - subtotalNeto) * 100) / 100

  const detallesFactura: FacturaDetalle[] = orden.detalles.map((d, index) => ({
    facturadetalle_id: index + 1,
    factura_id: nuevoId,
    producto_id: d.producto_id,
    producto_nombre: d.producto_nombre,
    cantidad: d.cantidad,
    preciounitario: d.preciounitario,
    subtotal: d.subtotal
  }))

  const nuevaFactura: FacturaCabecera = {
    facturacabecera_id: nuevoId,
    ordenventa_id: orden.tipo_orden === 'Venta' ? orden.orden_id : null,
    ordencompra_id: orden.tipo_orden === 'Compra' ? orden.orden_id : null,
    diario_id: null,
    tipo: 'Factura A',
    numero: numeroFactura,
    fecha: new Date().toISOString().split('T')[0],
    subtotal: subtotalNeto,
    impuesto: impuestoIva,
    total: orden.total,
    detalles: detallesFactura
  }

  // Insertar al inicio de la lista de facturas
  facturas.value.unshift(nuevaFactura)

  // Remover la orden facturada de la lista correspondiente
  if (orden.tipo_orden === 'Compra') {
    ordenesCompra.value = ordenesCompra.value.filter(o => o.orden_id !== orden.orden_id)
  } else {
    ordenesVenta.value = ordenesVenta.value.filter(o => o.orden_id !== orden.orden_id)
  }

  ordenSeleccionada.value = null
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Título de la Vista -->
    <div class="mb-4">
      <h3 class="fw-bold mb-0 text-dark">Facturación y Registro de Órdenes</h3>
      <p class="text-muted small mb-0">Transformación de órdenes comerciales en comprobantes contables</p>
    </div>

    <div class="row g-4">
      
      <!-- Columna Izquierda: Facturas Registradas -->
      <div class="col-lg-6">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-header bg-dark-custom text-white d-flex justify-content-between align-items-center py-3">
            <h5 class="fw-bold mb-0 fs-6">Facturas Registradas</h5>
            <button 
              class="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
              :disabled="!facturaSeleccionada"
              @click="verDetalleFactura"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
              </svg>
              <span>Ver Detalle</span>
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-3 py-2">N° Factura</th>
                  <th scope="col" class="py-2">Tipo</th>
                  <th scope="col" class="py-2">Fecha</th>
                  <th scope="col" class="pe-3 py-2 text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="fac in facturas"
                  :key="fac.facturacabecera_id"
                  :class="{ 'fila-seleccionada': facturaSeleccionada?.facturacabecera_id === fac.facturacabecera_id }"
                  style="cursor: pointer;"
                  @click="seleccionarFactura(fac)"
                >
                  <td class="ps-3 fw-bold">{{ fac.numero }}</td>
                  <td><span class="badge bg-secondary font-monospace">{{ fac.tipo }}</span></td>
                  <td class="text-muted small">{{ fac.fecha }}</td>
                  <td class="pe-3 text-end fw-bold text-dark">${{ fac.total.toLocaleString('es-AR') }}</td>
                </tr>
                <tr v-if="facturas.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No hay facturas registradas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Órdenes de Compra y Venta -->
      <div class="col-lg-6 d-flex flex-column gap-3">
        
        <!-- Acciones sobre la Orden Seleccionada -->
        <div class="card shadow-sm border-0">
          <div class="card-body p-3 d-flex justify-content-between align-items-center bg-light rounded">
            <div>
              <span class="text-muted small d-block">Orden seleccionada:</span>
              <strong class="text-dark">
                {{ ordenSeleccionada ? `${ordenSeleccionada.tipo_orden} #${ordenSeleccionada.orden_id} (${ordenSeleccionada.entidad_nombre})` : 'Ninguna' }}
              </strong>
            </div>
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-coralon d-flex align-items-center gap-1 fw-semibold"
                :disabled="!ordenSeleccionada"
                @click="verDetalleOrden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                </svg>
                <span>Ver</span>
              </button>

              <button 
                class="btn btn-sm btn-coralon d-flex align-items-center gap-1 fw-semibold"
                :disabled="!ordenSeleccionada"
                @click="registrarFacturaDesdeOrden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
                <span>Facturar Orden</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla Órdenes de Compra -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-dark-custom text-white py-2">
            <h6 class="fw-bold mb-0 small text-uppercase letter-spacing">Órdenes de Compra (Proveedores)</h6>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-3 py-2">ID</th>
                  <th scope="col" class="py-2">Proveedor</th>
                  <th scope="col" class="py-2">Fecha</th>
                  <th scope="col" class="pe-3 py-2 text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="oc in ordenesCompra"
                  :key="'oc-' + oc.orden_id"
                  :class="{ 'fila-seleccionada': ordenSeleccionada?.orden_id === oc.orden_id && ordenSeleccionada?.tipo_orden === 'Compra' }"
                  style="cursor: pointer;"
                  @click="seleccionarOrden(oc)"
                >
                  <td class="ps-3 fw-bold text-muted">#{{ oc.orden_id }}</td>
                  <td class="fw-semibold">{{ oc.entidad_nombre }}</td>
                  <td class="text-muted small">{{ oc.fecha }}</td>
                  <td class="pe-3 text-end fw-bold text-dark">${{ oc.total.toLocaleString('es-AR') }}</td>
                </tr>
                <tr v-if="ordenesCompra.length === 0">
                  <td colspan="4" class="text-center py-3 text-muted small">No hay órdenes de compra pendientes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla Órdenes de Venta -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-dark-custom text-white py-2">
            <h6 class="fw-bold mb-0 small text-uppercase letter-spacing">Órdenes de Venta (Clientes)</h6>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-3 py-2">ID</th>
                  <th scope="col" class="py-2">Cliente</th>
                  <th scope="col" class="py-2">Fecha</th>
                  <th scope="col" class="pe-3 py-2 text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ov in ordenesVenta"
                  :key="'ov-' + ov.orden_id"
                  :class="{ 'fila-seleccionada': ordenSeleccionada?.orden_id === ov.orden_id && ordenSeleccionada?.tipo_orden === 'Venta' }"
                  style="cursor: pointer;"
                  @click="seleccionarOrden(ov)"
                >
                  <td class="ps-3 fw-bold text-muted">#{{ ov.orden_id }}</td>
                  <td class="fw-semibold">{{ ov.entidad_nombre }}</td>
                  <td class="text-muted small">{{ ov.fecha }}</td>
                  <td class="pe-3 text-end fw-bold text-dark">${{ ov.total.toLocaleString('es-AR') }}</td>
                </tr>
                <tr v-if="ordenesVenta.length === 0">
                  <td colspan="4" class="text-center py-3 text-muted small">No hay órdenes de venta pendientes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Modales -->
    <ModalDetalleFactura
      :mostrar="mostrarModalFactura"
      :factura="facturaSeleccionada"
      @cerrar="mostrarModalFactura = false"
    />

    <ModalDetalleOrden
      :mostrar="mostrarModalOrden"
      :orden="ordenSeleccionada"
      @cerrar="mostrarModalOrden = false"
    />
  </div>
</template>

<style scoped>
.bg-dark-custom {
  background-color: #231f1d;
}

.letter-spacing {
  letter-spacing: 0.5px;
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

.btn-outline-coralon {
  border: 1px solid #b33e14;
  color: #b33e14;
  background-color: transparent;
  transition: all 0.2s ease-in-out;
}

.btn-outline-coralon:hover:not(:disabled) {
  background-color: #b33e14;
  color: #ffffff;
}

.btn-outline-coralon:disabled {
  border-color: #d1cfcc;
  color: #a8a5a0;
}

.fila-seleccionada {
  background-color: #fff1eb !important;
  border-left: 4px solid #b33e14;
}

.fila-seleccionada td {
  background-color: #fff1eb !important;
}
</style>