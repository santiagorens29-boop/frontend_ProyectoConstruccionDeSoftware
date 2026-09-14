<script setup lang="ts">
import { ref, computed } from 'vue'
import { CLIENTES_MOCK, type Cliente, type NuevoCliente } from '../types/cliente'
import ModalCliente from '../components/ModalCliente.vue'

const listaClientes = ref<Cliente[]>([...CLIENTES_MOCK])
const filtroBusqueda = ref('')
const clienteSeleccionado = ref<Cliente | null>(null)

const mostrarModal = ref(false)
const clienteParaEditar = ref<Cliente | null>(null)

// Filtrado en tiempo real por CUIL o nombre
const clientesFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim()
  if (!busqueda) return listaClientes.value

  return listaClientes.value.filter(
    (c) => c.cuil.toLowerCase().includes(busqueda) || c.nombre.toLowerCase().includes(busqueda)
  )
})

function seleccionarFila(cliente: Cliente) {
  if (clienteSeleccionado.value?.cliente_id === cliente.cliente_id) {
    clienteSeleccionado.value = null
  } else {
    clienteSeleccionado.value = cliente
  }
}

function abrirModalCrear() {
  clienteParaEditar.value = null
  mostrarModal.value = true
}

function abrirModalEditar() {
  if (!clienteSeleccionado.value) return
  clienteParaEditar.value = { ...clienteSeleccionado.value }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  clienteParaEditar.value = null
}

function guardarCliente(datos: Cliente | NuevoCliente) {
  if ('cliente_id' in datos && datos.cliente_id) {
    const index = listaClientes.value.findIndex((c) => c.cliente_id === datos.cliente_id)
    if (index !== -1) {
      listaClientes.value[index] = datos as Cliente
    }
    clienteSeleccionado.value = datos as Cliente
  } else {
    const nuevoId = listaClientes.value.length > 0
      ? Math.max(...listaClientes.value.map((c) => c.cliente_id)) + 1
      : 1

    const nuevo: Cliente = {
      cliente_id: nuevoId,
      ...datos,
    }
    listaClientes.value.push(nuevo)
  }
  cerrarModal()
}
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Header y Acciones -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">ABM de Clientes</h3>
        <p class="text-muted small mb-0">Alta, baja y modificación de clientes</p>
      </div>

      <div class="d-flex gap-2">
        <!-- Botón Editar -->
        <button
          class="btn btn-outline-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          :disabled="!clienteSeleccionado"
          @click="abrirModalEditar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
          </svg>
          <span>Editar Seleccionado</span>
        </button>

        <!-- Botón Nuevo Cliente -->
        <button class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold" @click="abrirModalCrear">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <span>Nuevo Cliente</span>
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
                placeholder="Buscar por CUIL o nombre..."
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
              <th scope="col" class="ps-3 py-3">CUIL / CUIT</th>
              <th scope="col" class="py-3">Nombre / Razón Social</th>
              <th scope="col" class="py-3">Teléfono</th>
              <th scope="col" class="py-3">Condición IVA</th>
              <th scope="col" class="py-3 pe-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cliente in clientesFiltrados"
              :key="cliente.cliente_id"
              :class="{ 'fila-seleccionada': clienteSeleccionado?.cliente_id === cliente.cliente_id }"
              style="cursor: pointer;"
              @click="seleccionarFila(cliente)"
            >
              <td class="ps-3 fw-bold">{{ cliente.cuil }}</td>
              <td class="fw-semibold">{{ cliente.nombre }}</td>
              <td class="text-secondary">{{ cliente.telefono }}</td>
              <td><span class="badge badge-rubro font-monospace">{{ cliente.condicion_iva }}</span></td>
              <td class="pe-3">
                <span class="badge" :class="cliente.estado === 'Activo' ? 'bg-success' : 'bg-danger'">
                  {{ cliente.estado }}
                </span>
              </td>
            </tr>
            <tr v-if="clientesFiltrados.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                No se encontraron clientes que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalCliente
      :mostrar="mostrarModal"
      :cliente-a-editar="clienteParaEditar"
      @cerrar="cerrarModal"
      @guardar="guardarCliente"
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