<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModalNuevaOrdenCompra from '../components/ModalNuevaOrdenCompra.vue'
import { PROVEEDORES_MOCK } from '../types/proveedor'
import { PRODUCTOS_MOCK } from '../types/producto'
import {
  CABECERAS_COMPRA_MOCK,
  DETALLES_COMPRA_MOCK,
  type NuevaOrdenCompra,
  type NuevaOrdenCompraCabecera,
  type NuevoOrdenCompraDetalle,
  type OrdenCompraCabecera,
  type OrdenCompraDetalle
} from '../types/compra'
import type { OrdenComercial } from '../types/finanzas'


// Simulación en memoria de las operaciones de órdenes de compra.
// Reemplazar sus implementaciones por llamadas a api.ts al definir el backend.
const cabecerasCompra = ref<OrdenCompraCabecera[]>(CABECERAS_COMPRA_MOCK.map(item => ({ ...item })))
const detallesCompra = ref<OrdenCompraDetalle[]>(DETALLES_COMPRA_MOCK.map(item => ({ ...item })))

async function getOrdenCompraCabeceras(): Promise<OrdenCompraCabecera[]> {
  return cabecerasCompra.value.map(item => ({ ...item }))
}

async function getOrdenCompraDetalles(): Promise<OrdenCompraDetalle[]> {
  return detallesCompra.value.map(item => ({ ...item }))
}

async function actualizarEstadoOrdenCompra(
  ordencompra_id: number,
  estado: OrdenCompraCabecera['estado']
): Promise<OrdenCompraCabecera> {
  const cabecera = cabecerasCompra.value.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (!['Pendiente', 'Aprobada', 'Cancelada'].includes(estado)) {
    throw new Error('El estado de la orden no es válido.')
  }
  if (estado === 'Aprobada' && !detallesCompra.value.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('No se puede aprobar una orden sin productos registrados.')
  }
  cabecera.estado = estado
  return { ...cabecera }
}

async function aprobarOrdenCompra(ordencompra_id: number): Promise<OrdenCompraCabecera> {
  const cabecera = cabecerasCompra.value.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (cabecera.estado !== 'Pendiente') throw new Error('Solo se pueden aprobar órdenes pendientes.')
  if (!detallesCompra.value.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('No se puede aprobar una orden sin productos registrados.')
  }
  cabecera.estado = 'Aprobada'
  return { ...cabecera }
}

async function cancelarOrdenCompra(ordencompra_id: number): Promise<OrdenCompraCabecera> {
  const cabecera = cabecerasCompra.value.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (cabecera.estado === 'Cancelada') throw new Error('La orden ya está cancelada.')
  cabecera.estado = 'Cancelada'
  return { ...cabecera }
}

async function postOrdenCompraCabecera(datos: NuevaOrdenCompraCabecera): Promise<OrdenCompraCabecera> {
  if (!PROVEEDORES_MOCK.some(item => item.proveedor_id === datos.proveedor_id)
    || !datos.solicitante?.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)
    || !Number.isFinite(datos.total) || datos.total <= 0) {
    throw new Error('La cabecera requiere solicitante interno, proveedor, fecha y total válidos.')
  }
  const cabecera: OrdenCompraCabecera = {
    ...datos,
    solicitante: datos.solicitante.trim(),
    ordencompra_id: Math.max(0, ...cabecerasCompra.value.map(item => item.ordencompra_id)) + 1,
    estado: 'Pendiente'
  }
  cabecerasCompra.value.push(cabecera)
  return { ...cabecera }
}

// El POST de detalle recibe todos los ítems de la cabecera en una sola operación.
async function postOrdenCompraDetalle(
  ordencompra_id: number,
  items: NuevoOrdenCompraDetalle[]
): Promise<OrdenCompraDetalle[]> {
  const cabecera = cabecerasCompra.value.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la cabecera de la orden.')
  if (detallesCompra.value.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('La orden ya tiene detalles registrados.')
  }
  if (!items.length || items.some(item =>
    !PRODUCTOS_MOCK.some(producto => producto.producto_id === item.producto_id)
    || !Number.isFinite(item.cantidad) || item.cantidad <= 0
    || !Number.isFinite(item.preciounitario) || item.preciounitario <= 0
  )) throw new Error('Cada detalle requiere producto, cantidad y precio válidos.')

  const primerId = Math.max(0, ...detallesCompra.value.map(item => item.ordencompradetalle_id)) + 1
  const nuevos = items.map((item, index) => ({
    ...item,
    ordencompra_id,
    ordencompradetalle_id: primerId + index,
    subtotal: Math.round(item.cantidad * item.preciounitario * 100) / 100
  }))
  const total = Math.round(nuevos.reduce((suma, item) => suma + item.subtotal, 0) * 100) / 100
  if (total !== cabecera.total) throw new Error('El total de los detalles no coincide con la cabecera.')
  detallesCompra.value.push(...nuevos)
  return nuevos.map(item => ({ ...item }))
}

type OrdenCompraListado = Omit<OrdenComercial, 'estado_nombre'> & {
  solicitante: string
  estado_nombre: OrdenCompraCabecera['estado']
}

const ordenes = ref<OrdenCompraListado[]>([])
const consultado = ref(false)
const cargando = ref(false)
const guardando = ref(false)
const mostrarNuevaOrden = ref(false)
const cabeceraCreadaId = ref<number | null>(null)
const mensaje = ref('')
const errorConsulta = ref('')
const errorGuardado = ref('')
const aprobandoId = ref<number | null>(null)
const errorAprobacion = ref('')
const cancelandoId = ref<number | null>(null)
const editandoEstadoId = ref<number | null>(null)
const estadoEditado = ref<OrdenCompraCabecera['estado']>('Pendiente')
const guardandoEstado = ref(false)
const cambiosEstadoHabilitados = ref(false)
const accionesBloqueadas = computed(() =>
  cargando.value || guardando.value || aprobandoId.value !== null || cancelandoId.value !== null || editandoEstadoId.value !== null
)
const moneda = (valor: number) => valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
const filtroBusqueda = ref('')

const ordenesFiltradas = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim()
  if (!busqueda) return ordenes.value

  return ordenes.value.filter(orden =>
    orden.orden_id.toString().includes(busqueda) ||
    orden.solicitante.toLowerCase().includes(busqueda) ||
    orden.fecha.includes(busqueda)
  )
})

async function verOrdenes() {
  if (cargando.value) return
  cargando.value = true
  errorConsulta.value = ''
  try {
    // Dos GET simulados: cabeceras y detalles, unidos por ordencompra_id.
    const [cabeceras, detalles] = await Promise.all([
      getOrdenCompraCabeceras(),
      getOrdenCompraDetalles()
    ])
    ordenes.value = cabeceras.map(cabecera => {
      const proveedor = PROVEEDORES_MOCK.find(item => item.proveedor_id === cabecera.proveedor_id)
      return {
        orden_id: cabecera.ordencompra_id,
        solicitante: cabecera.solicitante,
        tipo_orden: 'Compra',
        origen_id: cabecera.proveedor_id,
        entidad_nombre: proveedor ? `${proveedor.nombre} ${proveedor.apellido}` : `Proveedor #${cabecera.proveedor_id}`,
        fecha: cabecera.fecha,
        estado_nombre: cabecera.estado,
        total: cabecera.total,
        detalles: detalles.filter(item => item.ordencompra_id === cabecera.ordencompra_id).map(item => ({
          detalle_id: item.ordencompradetalle_id,
          producto_id: item.producto_id,
          producto_nombre: PRODUCTOS_MOCK.find(producto => producto.producto_id === item.producto_id)?.nombre ?? `Producto #${item.producto_id}`,
          cantidad: item.cantidad,
          preciounitario: item.preciounitario,
          subtotal: item.subtotal
        }))
      }
    })
    consultado.value = true
  } catch (error) {
    errorConsulta.value = error instanceof Error ? error.message : 'No se pudieron consultar las órdenes.'
  } finally {
    cargando.value = false
  }
}

function abrirModalCrear() {
  // Si falló el detalle, se conserva el formulario y el ID para reintentar sin duplicar la cabecera.
  mensaje.value = ''
  if (cabeceraCreadaId.value === null) errorGuardado.value = ''
  mostrarNuevaOrden.value = true
}

function cerrarModal() {
  if (guardando.value) return
  mostrarNuevaOrden.value = false
}

async function guardarOrden(datos: NuevaOrdenCompra) {
  if (guardando.value) return
  guardando.value = true
  errorGuardado.value = ''
  try {
    if (cabeceraCreadaId.value === null) {
      const cabecera = await postOrdenCompraCabecera(datos.cabecera)
      cabeceraCreadaId.value = cabecera.ordencompra_id
    }
    await postOrdenCompraDetalle(cabeceraCreadaId.value, datos.detalles)
    mensaje.value = `Orden #${cabeceraCreadaId.value} creada con ${datos.detalles.length} ítem(s).`
    cabeceraCreadaId.value = null
    mostrarNuevaOrden.value = false
    await verOrdenes()
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'No se pudo guardar la orden.'
    errorGuardado.value = cabeceraCreadaId.value === null
      ? detalle
      : `La cabecera #${cabeceraCreadaId.value} se creó, pero falta guardar el detalle. ${detalle}`
  } finally {
    guardando.value = false
  }
}

function alternarCambiosEstado() {
  if (accionesBloqueadas.value) return
  cambiosEstadoHabilitados.value = !cambiosEstadoHabilitados.value
}

async function aprobarOrden(orden: OrdenCompraListado) {
  if (accionesBloqueadas.value || !cambiosEstadoHabilitados.value || orden.estado_nombre !== 'Pendiente') return
  aprobandoId.value = orden.orden_id
  errorAprobacion.value = ''
  mensaje.value = ''
  try {
    const cabecera = await aprobarOrdenCompra(orden.orden_id)
    orden.estado_nombre = cabecera.estado
    mensaje.value = `Orden #${orden.orden_id} aprobada correctamente.`
  } catch (error) {
    errorAprobacion.value = error instanceof Error ? error.message : 'No se pudo aprobar la orden.'
  } finally {
    aprobandoId.value = null
  }
}

async function cancelarOrden(orden: OrdenCompraListado) {
  if (accionesBloqueadas.value || !cambiosEstadoHabilitados.value || orden.estado_nombre !== 'Pendiente') return
  cancelandoId.value = orden.orden_id
  errorAprobacion.value = ''
  mensaje.value = ''
  try {
    const cabecera = await cancelarOrdenCompra(orden.orden_id)
    orden.estado_nombre = cabecera.estado
    mensaje.value = `Orden #${orden.orden_id} cancelada correctamente.`
  } catch (error) {
    errorAprobacion.value = error instanceof Error ? error.message : 'No se pudo cancelar la orden.'
  } finally {
    cancelandoId.value = null
  }
}

function editarEstado(orden: OrdenCompraListado) {
  if (accionesBloqueadas.value || !cambiosEstadoHabilitados.value) return
  editandoEstadoId.value = orden.orden_id
  estadoEditado.value = orden.estado_nombre
  errorAprobacion.value = ''
  mensaje.value = ''
}

function descartarEstado() {
  if (guardandoEstado.value) return
  editandoEstadoId.value = null
  errorAprobacion.value = ''
}

async function guardarEstado(orden: OrdenCompraListado) {
  if (!cambiosEstadoHabilitados.value || guardandoEstado.value || editandoEstadoId.value !== orden.orden_id) return
  guardandoEstado.value = true
  errorAprobacion.value = ''
  try {
    const cabecera = await actualizarEstadoOrdenCompra(orden.orden_id, estadoEditado.value)
    orden.estado_nombre = cabecera.estado
    mensaje.value = `Orden #${orden.orden_id}: estado actualizado a ${cabecera.estado.toLowerCase()}.`
    editandoEstadoId.value = null
  } catch (error) {
    errorAprobacion.value = error instanceof Error ? error.message : 'No se pudo actualizar el estado.'
  } finally {
    guardandoEstado.value = false
  }
}

onMounted(verOrdenes)
</script>

<template>
  <div class="container-fluid py-2">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Órdenes de Compra</h3>
        <p class="text-muted small mb-0">Registro y consulta de pedidos de los solicitantes internos</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-outline-coralon px-3 fw-semibold"
          :disabled="accionesBloqueadas"
          :aria-pressed="cambiosEstadoHabilitados"
          @click="alternarCambiosEstado"
        >{{ cambiosEstadoHabilitados ? 'Bloquear cambios de estado' : 'Habilitar cambios de estado' }}</button>
        <button
          type="button"
          class="btn btn-outline-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          :disabled="accionesBloqueadas"
          @click="verOrdenes"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
          </svg>
          <span>{{ cargando ? 'Cargando…' : 'Ver Ordenes' }}</span>
        </button>
        <button
          type="button"
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          :disabled="accionesBloqueadas"
          @click="abrirModalCrear"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
          <span>Nueva Orden</span>
        </button>
      </div>
    </div>

    <div v-if="mensaje" class="alert alert-success" role="status">{{ mensaje }}</div>
    <div v-if="errorConsulta" class="alert alert-danger" role="alert">{{ errorConsulta }}</div>
    <div v-if="errorAprobacion" class="alert alert-danger" role="alert">{{ errorAprobacion }}</div>
    <div class="card shadow-sm border-0 mb-4 search-card">
      <div class="card-body p-3">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted pe-1">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </span>
              <input
                v-model="filtroBusqueda"
                :disabled="editandoEstadoId !== null"
                type="text"
                class="form-control border-start-0 custom-search ps-2"
                placeholder="Buscar por Número, Solicitante o Fecha..."
                aria-label="Buscar órdenes por número, solicitante o fecha"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card shadow-sm border-0 overflow-hidden" :aria-busy="cargando">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" aria-label="Órdenes de compra registradas">
          <thead class="table-dark-custom">
            <tr>
              <th scope="col" class="ps-3 py-3">N° Orden</th>
              <th scope="col" class="py-3">Solicitante</th>
              <th scope="col" class="py-3">Productos y cantidades</th>
              <th scope="col" class="py-3">Fecha</th>
              <th scope="col" class="py-3">Estado</th>
              <th scope="col" class="py-3 text-end">Total</th>
              <th scope="col" class="pe-3 py-3 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orden in ordenesFiltradas" :key="orden.orden_id">
              <th scope="row" class="ps-3 py-3 font-monospace">#{{ orden.orden_id }}</th>
              <td class="fw-semibold">{{ orden.solicitante }}</td>
              <td>
                <ul v-if="orden.detalles.length" class="list-unstyled mb-0 d-flex flex-column gap-2">
                  <li v-for="item in orden.detalles" :key="item.detalle_id" class="d-flex align-items-baseline gap-2">
                    <span class="badge bg-light text-dark border font-monospace text-nowrap" :aria-label="`Cantidad: ${item.cantidad.toLocaleString('es-AR')}`">
                      {{ item.cantidad.toLocaleString('es-AR') }} ×
                    </span>
                    <span>{{ item.producto_nombre }}</span>
                  </li>
                </ul>
                <span v-else class="text-muted small">Sin productos registrados.</span>
              </td>
              <td class="text-muted text-nowrap">{{ orden.fecha }}</td>
              <td>
                <select
                  v-if="editandoEstadoId === orden.orden_id"
                  v-model="estadoEditado"
                  class="form-select form-select-sm"
                  :aria-label="`Estado de la orden ${orden.orden_id}`"
                  :disabled="guardandoEstado"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobada" :disabled="orden.detalles.length === 0">Aprobada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
                <span v-else class="badge" :class="orden.estado_nombre === 'Cancelada' ? 'bg-danger' : orden.estado_nombre === 'Aprobada' ? 'bg-success' : 'bg-warning text-dark'">{{ orden.estado_nombre }}</span>
              </td>
              <td class="text-end fw-bold text-nowrap">{{ moneda(orden.total) }}</td>
              <td class="pe-3 text-end">
                <div v-if="editandoEstadoId === orden.orden_id" class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-sm btn-coralon text-nowrap" :disabled="guardandoEstado || estadoEditado === orden.estado_nombre" @click="guardarEstado(orden)">
                    {{ guardandoEstado ? 'Guardando…' : 'Guardar estado' }}
                  </button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="guardandoEstado" @click="descartarEstado">Descartar</button>
                </div>
                <div v-else class="d-flex flex-wrap justify-content-end gap-2">
                  <button
                    v-if="orden.estado_nombre === 'Pendiente'"
                    type="button"
                    class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 text-nowrap"
                    :disabled="accionesBloqueadas || !cambiosEstadoHabilitados || orden.detalles.length === 0"
                    :aria-label="`Aprobar orden ${orden.orden_id}`"
                    :title="orden.detalles.length === 0 ? 'La orden requiere productos para aprobarse' : 'Aprobar orden'"
                    @click="aprobarOrden(orden)"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 0 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                    </svg>
                    <span>{{ aprobandoId === orden.orden_id ? 'Aprobando…' : 'Aprobar' }}</span>
                  </button>
                  <button
                    v-if="orden.estado_nombre === 'Pendiente'"
                    type="button"
                    class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 text-nowrap"
                    :disabled="accionesBloqueadas || !cambiosEstadoHabilitados"
                    :aria-label="`Cancelar orden ${orden.orden_id}`"
                    @click="cancelarOrden(orden)"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                    </svg>
                    <span>{{ cancelandoId === orden.orden_id ? 'Cancelando…' : 'Cancelar' }}</span>
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-coralon text-nowrap"
                    :disabled="accionesBloqueadas || !cambiosEstadoHabilitados"
                    :aria-label="`Editar estado de la orden ${orden.orden_id}`"
                    @click="editarEstado(orden)"
                  >Editar estado</button>
                </div>
              </td>
            </tr>
            <tr v-if="ordenesFiltradas.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                {{ cargando ? 'Consultando órdenes…' : filtroBusqueda.trim() ? 'No se encontraron órdenes que coincidan con la búsqueda.' : consultado ? 'No hay órdenes de compra registradas.' : 'Presioná Ver Ordenes para consultar las compras registradas.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <p class="text-muted small mt-3">Modo de demostración: los cambios se reinician al salir de esta vista o recargar la página.</p>

    <ModalNuevaOrdenCompra
      :mostrar="mostrarNuevaOrden"
      :guardando="guardando"
      :error="errorGuardado"
      :cabecera-creada="cabeceraCreadaId !== null"
      @cerrar="cerrarModal"
      @guardar="guardarOrden"
    />
  </div>
</template>

<style scoped>
.table-dark-custom {
  background-color: #231f1d;
  border-bottom: 2px solid #b33e14;
}

.table-dark-custom th {
  background-color: #231f1d;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.3px;
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

.custom-search:focus {
  border-color: #dee2e6;
  box-shadow: none;
}
</style>
