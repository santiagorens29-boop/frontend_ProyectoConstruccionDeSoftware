<script setup lang="ts">
import { ref, computed } from 'vue'
import { PRODUCTOS_MOCK, type Producto, type NuevoProducto } from '../types/producto'
import ModalProducto from '../components/ModalProducto.vue'

const listaProductos = ref<Producto[]>([...PRODUCTOS_MOCK])
const filtroBusqueda = ref('')
const productoSeleccionado = ref<Producto | null>(null)

const mostrarModal = ref(false)
const productoParaEditar = ref<Producto | null>(null)

// Filtrado en tiempo real por Nombre, Descripción o ID de Rubro
const productosFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim()
  if (!busqueda) return listaProductos.value

  return listaProductos.value.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda) ||
    p.descripcion.toLowerCase().includes(busqueda) ||
    p.rubro_id.toString().includes(busqueda)
  )
})

function seleccionarFila(producto: Producto) {
  if (productoSeleccionado.value?.producto_id === producto.producto_id) {
    productoSeleccionado.value = null
  } else {
    productoSeleccionado.value = producto
  }
}

function abrirModalCrear() {
  productoParaEditar.value = null
  mostrarModal.value = true
}

function abrirModalEditar() {
  if (!productoSeleccionado.value) return
  productoParaEditar.value = { ...productoSeleccionado.value }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  productoParaEditar.value = null
}

function guardarProducto(datos: Producto | NuevoProducto) {
  if ('producto_id' in datos && datos.producto_id) {
    const index = listaProductos.value.findIndex(p => p.producto_id === datos.producto_id)
    if (index !== -1) {
      listaProductos.value[index] = datos as Producto
    }
    productoSeleccionado.value = datos as Producto
  } else {
    const nuevoId = listaProductos.value.length > 0 
      ? Math.max(...listaProductos.value.map(p => p.producto_id)) + 1 
      : 1

    const nuevo: Producto = {
      producto_id: nuevoId,
      ...datos
    }
    listaProductos.value.push(nuevo)
  }
  cerrarModal()
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Header y Acciones -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Catálogo de Productos</h3>
        <p class="text-muted small mb-0">Gestión de inventario, precios y stock del corralón</p>
      </div>

      <div class="d-flex gap-2">
        <!-- Botón Editar -->
        <button 
          class="btn btn-outline-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          :disabled="!productoSeleccionado"
          @click="abrirModalEditar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
          </svg>
          <span>Editar Seleccionado</span>
        </button>

        <!-- Botón Nuevo Producto -->
        <button 
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          @click="abrirModalCrear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="card shadow-sm border-0 mb-4 search-card">
      <div class="card-body p-3">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0 text-muted pe-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </span>
              <input
                v-model="filtroBusqueda"
                type="text"
                class="form-control border-start-0 custom-search ps-2"
                placeholder="Buscar por Nombre, Descripción o ID de Rubro..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card shadow-sm border-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark-custom">
            <tr>
              <th scope="col" class="ps-3 py-3">ID</th>
              <th scope="col" class="py-3">Producto</th>
              <th scope="col" class="py-3">Descripción</th>
              <th scope="col" class="py-3">Rubro</th>
              <th scope="col" class="py-3">Precio Unit.</th>
              <th scope="col" class="py-3">Stock Actual</th>
              <th scope="col" class="py-3 pe-3">Stock Mín.</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="producto in productosFiltrados"
              :key="producto.producto_id"
              :class="{ 'fila-seleccionada': productoSeleccionado?.producto_id === producto.producto_id }"
              style="cursor: pointer;"
              @click="seleccionarFila(producto)"
            >
              <td class="ps-3 fw-bold">{{ producto.producto_id }}</td>
              <td class="fw-semibold">{{ producto.nombre }}</td>
              <td class="text-secondary small text-truncate" style="max-width: 250px;">
                {{ producto.descripcion }}
              </td>
              <td><span class="badge badge-rubro font-monospace">Rubro #{{ producto.rubro_id }}</span></td>
              <td class="fw-bold text-dark">${{ producto.preciounitario.toLocaleString('es-AR') }}</td>
              <td>
                <span 
                  class="badge" 
                  :class="producto.stockactual <= producto.stockminreposicion ? 'bg-danger' : 'bg-success'"
                >
                  {{ producto.stockactual }} un.
                </span>
              </td>
              <td class="pe-3 text-muted">{{ producto.stockminreposicion }} un.</td>
            </tr>
            <tr v-if="productosFiltrados.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                No se encontraron productos que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalProducto
      :mostrar="mostrarModal"
      :producto-a-editar="productoParaEditar"
      @cerrar="cerrarModal"
      @guardar="guardarProducto"
    />
  </div>
</template>

<style scoped>
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

.table-dark-custom {
  background-color: #231f1d;
  color: #f5f5f5;
  border-bottom: 2px solid #b33e14;
}

.table-dark-custom th {
  background-color: #231f1d;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.88rem;
  letter-spacing: 0.3px;
}

.badge-rubro {
  background-color: #332d2a;
  color: #c9881e;
  font-weight: 500;
  padding: 0.4em 0.6em;
}

.fila-seleccionada {
  background-color: #fff1eb !important;
  border-left: 4px solid #b33e14;
}

.fila-seleccionada td {
  background-color: #fff1eb !important;
}
</style>