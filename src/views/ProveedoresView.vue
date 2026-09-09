<script setup lang="ts">
import { ref, computed } from 'vue'
import { PROVEEDORES_MOCK, type Proveedor, type NuevoProveedor } from '../types/proveedor'
import ModalProveedor from '../components/ModalProveedor.vue'

// Lista reactiva de proveedores inicializada con los mocks
const listaProveedores = ref<Proveedor[]>([...PROVEEDORES_MOCK])

// Estados para búsqueda y selección
const filtroBusqueda = ref('')
const proveedorSeleccionado = ref<Proveedor | null>(null)

// Estados para el Modal
const mostrarModal = ref(false)
const proveedorParaEditar = ref<Proveedor | null>(null)

// Filtrado en tiempo real por CUIT, Nombre o Apellido
const proveedoresFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim()
  if (!busqueda) return listaProveedores.value

  return listaProveedores.value.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda) ||
    p.apellido.toLowerCase().includes(busqueda) ||
    p.cuit.includes(busqueda) ||
    p.email.toLowerCase().includes(busqueda)
  )
})

// Selección de fila
function seleccionarFila(proveedor: Proveedor) {
  if (proveedorSeleccionado.value?.proveedor_id === proveedor.proveedor_id) {
    proveedorSeleccionado.value = null // Deselecciona si vuelve a tocar la misma
  } else {
    proveedorSeleccionado.value = proveedor
  }
}

// Abrir modal en modo creación
function abrirModalCrear() {
  proveedorParaEditar.value = null
  mostrarModal.value = true
}

// Abrir modal en modo edición
function abrirModalEditar() {
  if (!proveedorSeleccionado.value) return
  proveedorParaEditar.value = { ...proveedorSeleccionado.value }
  mostrarModal.value = true
}

// Cerrar modal
function cerrarModal() {
  mostrarModal.value = false
  proveedorParaEditar.value = null
}

// Guardar (Crear o Actualizar)
function guardarProveedor(datos: Proveedor | NuevoProveedor) {
  if ('proveedor_id' in datos && datos.proveedor_id) {
    // Modo Edición: actualizar en la lista
    const index = listaProveedores.value.findIndex(p => p.proveedor_id === datos.proveedor_id)
    if (index !== -1) {
      listaProveedores.value[index] = datos as Proveedor
    }
    proveedorSeleccionado.value = datos as Proveedor
  } else {
    // Modo Creación: generar nuevo ID temporal y agregar
    const nuevoId = listaProveedores.value.length > 0 
      ? Math.max(...listaProveedores.value.map(p => p.proveedor_id)) + 1 
      : 1

    const nuevo: Proveedor = {
      proveedor_id: nuevoId,
      ...datos
    }
    listaProveedores.value.push(nuevo)
  }
  cerrarModal()
}
</script>

<template>
  <div class="container-fluid py-3">
    <!-- Barra superior: Título y Acciones -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Gestión de Proveedores</h3>
        <p class="text-muted small mb-0">Alta, consulta y edición de proveedores del corralón</p>
      </div>

      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-primary d-flex align-items-center gap-1"
          :disabled="!proveedorSeleccionado"
          @click="abrirModalEditar"
        >
          ✏️ Editar Seleccionado
        </button>
        <button 
          class="btn btn-primary d-flex align-items-center gap-1 fw-semibold"
          @click="abrirModalCrear"
        >
          ➕ Nuevo Proveedor
        </button>
      </div>
    </div>

    <!-- Barra de Búsqueda -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light">🔍</span>
              <input
                v-model="filtroBusqueda"
                type="text"
                class="form-control"
                placeholder="Buscar por Nombre, CUIT o Email..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Proveedores -->
    <div class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3">ID</th>
              <th scope="col">Nombre / Razón Social</th>
              <th scope="col">Apellido / Denominación</th>
              <th scope="col">CUIT</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Email</th>
              <th scope="col">Dirección</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="proveedor in proveedoresFiltrados"
              :key="proveedor.proveedor_id"
              :class="{ 'table-primary': proveedorSeleccionado?.proveedor_id === proveedor.proveedor_id }"
              style="cursor: pointer;"
              @click="seleccionarFila(proveedor)"
            >
              <td class="ps-3 fw-bold">{{ proveedor.proveedor_id }}</td>
              <td>{{ proveedor.nombre }}</td>
              <td>{{ proveedor.apellido }}</td>
              <td><span class="badge bg-secondary font-monospace">{{ proveedor.cuit }}</span></td>
              <td>{{ proveedor.telefono }}</td>
              <td>{{ proveedor.email }}</td>
              <td>{{ proveedor.direccion }}</td>
            </tr>
            <tr v-if="proveedoresFiltrados.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                No se encontraron proveedores que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Componente Modal para Crear / Editar -->
    <ModalProveedor
      :mostrar="mostrarModal"
      :proveedor-a-editar="proveedorParaEditar"
      @cerrar="cerrarModal"
      @guardar="guardarProveedor"
    />
  </div>
</template>