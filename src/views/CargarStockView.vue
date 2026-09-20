<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PRODUCTOS_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  type Producto,
  type MovimientoInventario
} from '../types/producto'
import ModalReponerStock from '../components/ModalReponerStock.vue'

// Estado reactivo en memoria
const productos = ref<Producto[]>([...PRODUCTOS_MOCK])
const movimientos = ref<MovimientoInventario[]>([...MOVIMIENTOS_INVENTARIO_MOCK])

const filtroBusqueda = ref('')
const productoSeleccionado = ref<Producto | null>(null)
const mostrarModalReponer = ref(false)
const mensajeExito = ref('')

// Filtrado reactivo por código o nombre
const productosFiltrados = computed(() => {
  const termino = filtroBusqueda.value.toLowerCase().trim()
  if (!termino) return productos.value

  return productos.value.filter(p =>
    p.producto_id.toString().includes(termino) ||
    p.nombre.toLowerCase().includes(termino)
  )
})

function seleccionarProducto(producto: Producto) {
  if (productoSeleccionado.value?.producto_id === producto.producto_id) {
    productoSeleccionado.value = null // Si vuelve a hacer click, deselecciona
  } else {
    productoSeleccionado.value = producto
  }
}

function abrirModalReponer() {
  if (!productoSeleccionado.value) return
  mostrarModalReponer.value = true
}

function cerrarModalReponer() {
  mostrarModalReponer.value = false
}

function confirmarReposicion(datos: { producto_id: number; cantidad: number; observacion: string }) {
  const prod = productos.value.find(p => p.producto_id === datos.producto_id)
  if (!prod) return

  // 1. Actualiza el stock en la entidad Producto (PUT)
  prod.stockactual += datos.cantidad

  // 2. Registra el movimiento en el inventario (POST)
  const nuevoMovimientoId = movimientos.value.length > 0
    ? Math.max(...movimientos.value.map(m => m.movimientoinventario_id)) + 1
    : 1

  const hoy = new Date().toISOString().split('T')[0]

  const nuevoMovimiento: MovimientoInventario = {
    movimientoinventario_id: nuevoMovimientoId,
    producto_id: prod.producto_id,
    usuario_id: 1,
    tipo: 'Ingreso',
    cantidad: datos.cantidad,
    fecha: hoy,
    observacion: datos.observacion
  }

  movimientos.value.unshift(nuevoMovimiento)

  mensajeExito.value = `Se ingresaron ${datos.cantidad} un. a "${prod.nombre}". Stock final: ${prod.stockactual} un.`
  
  // Limpia la selección activa tras reponer
  productoSeleccionado.value = null

  setTimeout(() => {
    mensajeExito.value = ''
  }, 4500)
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Encabezado con Botón General de Acción -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Carga y Reposición de Stock</h3>
        <p class="text-muted small mb-0">Seleccione un producto de la tabla para gestionar su reposición</p>
      </div>
      <div>
        <!-- Botón único: deshabilitado si no hay producto seleccionado -->
        <button
          type="button"
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold shadow-sm"
          :disabled="!productoSeleccionado"
          @click="abrirModalReponer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <span>Reponer Stock</span>
          <span v-if="productoSeleccionado" class="badge bg-light text-dark ms-1">
            #{{ productoSeleccionado.producto_id }}
          </span>
        </button>
      </div>
    </div>

    <!-- Alerta de éxito -->
    <div v-if="mensajeExito" class="alert alert-success small py-2 mb-3" role="status">
      {{ mensajeExito }}
    </div>

    <!-- Barra de búsqueda -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-3">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted pe-1">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </span>
              <input
                v-model="filtroBusqueda"
                type="text"
                class="form-control border-start-0 ps-2"
                placeholder="Buscar por código o nombre del producto..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla Principal de Stock con selección de fila -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header encabezado-custom text-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0 fs-6">Inventario de Mercadería</h5>
        <span class="small text-white-50">Haga clic en una fila para seleccionarla</span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3 py-2" style="width: 50px;">Sel.</th>
              <th scope="col" class="py-2">Código</th>
              <th scope="col" class="py-2">Producto</th>
              <th scope="col" class="py-2 text-center">Stock Mínimo</th>
              <th scope="col" class="py-2 text-center">Stock Actual</th>
              <th scope="col" class="pe-3 py-2 text-end">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="producto in productosFiltrados"
              :key="producto.producto_id"
              class="fila-producto"
              :class="{ 'fila-seleccionada': productoSeleccionado?.producto_id === producto.producto_id }"
              @click="seleccionarProducto(producto)"
            >
              <td class="ps-3">
                <input
                  type="radio"
                  class="form-check-input"
                  :checked="productoSeleccionado?.producto_id === producto.producto_id"
                  @click.stop="seleccionarProducto(producto)"
                />
              </td>
              <td class="font-monospace fw-bold text-muted">#{{ producto.producto_id }}</td>
              <td>
                <div class="fw-semibold text-dark">{{ producto.nombre }}</div>
                <div class="text-muted small text-truncate" style="max-width: 380px;">
                  {{ producto.descripcion }}
                </div>
              </td>
              <td class="text-center text-muted">
                {{ producto.stockminreposicion }} un.
              </td>
              <td class="text-center">
                <span
                  class="fw-bold fs-6"
                  :class="producto.stockactual <= producto.stockminreposicion ? 'text-danger' : 'text-dark'"
                >
                  {{ producto.stockactual }} un.
                </span>
              </td>
              <td class="pe-3 text-end">
                <span
                  v-if="producto.stockactual <= producto.stockminreposicion"
                  class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"
                >
                  Reponer Urgente
                </span>
                <span
                  v-else
                  class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"
                >
                  Stock Normal
                </span>
              </td>
            </tr>
            <tr v-if="productosFiltrados.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                No se encontraron productos coincidentes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de reposición -->
    <ModalReponerStock
      :mostrar="mostrarModalReponer"
      :producto="productoSeleccionado"
      @cerrar="cerrarModalReponer"
      @confirmar="confirmarReposicion"
    />
  </div>
</template>

<style scoped>
.encabezado-custom {
  background-color: #231f1d;
  border-bottom: 3px solid #b33e14;
}

.btn-coralon {
  background-color: #b33e14;
  border-color: #b33e14;
  color: #ffffff;
  transition: all 0.2s ease-in-out;
}

.btn-coralon:hover:not(:disabled) {
  background-color: #ff7a45;
  border-color: #ff7a45;
  color: #ffffff;
}

.fila-producto {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.fila-seleccionada {
  background-color: #fbeee8 !important;
  border-left: 4px solid #b33e14;
}
</style>