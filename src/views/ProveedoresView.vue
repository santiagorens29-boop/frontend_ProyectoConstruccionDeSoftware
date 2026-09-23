<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PROVEEDORES_MOCK, type Proveedor, type NuevoProveedor } from '../types/proveedor'
import { PRODUCTOS_MOCK } from '../types/producto'
import { obtenerProveedores, crearProveedor, actualizarProveedor } from '../services/proveedoresService'
import ModalProveedor from '../components/ModalProveedor.vue'

const listaProveedores = ref<Proveedor[]>([])
const cargando = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')

const filtroBusqueda = ref('')
const proveedorSeleccionado = ref<Proveedor | null>(null)

const mostrarModal = ref(false)
const proveedorParaEditar = ref<Proveedor | null>(null)

// GET: Cargar proveedores con validación de tipo array y fallback a MOCK
async function cargarProveedores() {
  cargando.value = true
  mensajeError.value = ''
  try {
    const respuesta = await obtenerProveedores()
    
    let datosCrudos: any[] = []
    if (Array.isArray(respuesta)) {
      datosCrudos = respuesta
    } else if (respuesta && typeof respuesta === 'object' && Array.isArray((respuesta as any).results)) {
      datosCrudos = (respuesta as any).results
    } else {
      console.warn('La respuesta de la API no es un array válido. Usando datos mock.', respuesta)
      listaProveedores.value = [...PROVEEDORES_MOCK]
      return
    }

    // Normalización de propiedades para tolerar snake_case o camelCase
    listaProveedores.value = datosCrudos.map((item: any) => ({
      proveedor_id: Number(item.proveedor_id ?? item.id ?? 0),
      nombre: String(item.nombre ?? ''),
      apellido: String(item.apellido ?? ''),
      email: String(item.email ?? ''),
      telefono: String(item.telefono ?? ''),
      cuit: String(item.cuit ?? ''),
      direccion: String(item.direccion ?? ''),
      producto_id: Number(item.producto_id ?? 1),
      producto_nombre: item.producto_nombre ?? item.producto ?? 'Asignado'
    }))
  } catch (error) {
    console.warn('Backend no disponible o error de autenticación. Usando datos mock.', error)
    listaProveedores.value = [...PROVEEDORES_MOCK]
  } finally {
    cargando.value = false
  }
}

const proveedoresFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim()
  if (!busqueda) return listaProveedores.value

  return listaProveedores.value.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda) ||
    p.apellido.toLowerCase().includes(busqueda) ||
    p.cuit.includes(busqueda) ||
    p.email.toLowerCase().includes(busqueda) ||
    (p.producto_nombre && p.producto_nombre.toLowerCase().includes(busqueda))
  )
})

function seleccionarFila(proveedor: Proveedor) {
  if (proveedorSeleccionado.value?.proveedor_id === proveedor.proveedor_id) {
    proveedorSeleccionado.value = null
  } else {
    proveedorSeleccionado.value = proveedor
  }
}

function abrirModalCrear() {
  proveedorParaEditar.value = null
  mostrarModal.value = true
}

function abrirModalEditar() {
  if (!proveedorSeleccionado.value) return
  proveedorParaEditar.value = { ...proveedorSeleccionado.value }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  proveedorParaEditar.value = null
}

function mostrarMensaje(texto: string, tipo: 'exito' | 'error') {
  if (tipo === 'exito') {
    mensajeExito.value = texto
    setTimeout(() => { mensajeExito.value = '' }, 4000)
  } else {
    mensajeError.value = texto
    setTimeout(() => { mensajeError.value = '' }, 5000)
  }
}

// POST / PUT: Guardar cambios conectando con el backend
async function guardarProveedor(datos: Proveedor | NuevoProveedor) {
  const prodEncontrado = PRODUCTOS_MOCK.find(p => p.producto_id === datos.producto_id)
  const nombreProd = prodEncontrado ? prodEncontrado.nombre : (datos.producto_nombre || 'Sin asignar')

  // EDICIÓN (PUT)
  if ('proveedor_id' in datos && datos.proveedor_id) {
    try {
      const actualizado = await actualizarProveedor(datos.proveedor_id, datos)
      const index = listaProveedores.value.findIndex(p => p.proveedor_id === datos.proveedor_id)
      if (index !== -1) {
        const itemActualizado: Proveedor = {
          ...actualizado,
          producto_nombre: nombreProd
        }
        listaProveedores.value[index] = itemActualizado
        proveedorSeleccionado.value = itemActualizado
      }
      mostrarMensaje('Proveedor actualizado con éxito en el backend.', 'exito')
    } catch (error) {
      console.warn('Error al actualizar en backend. Aplicando cambio en memoria.', error)
      const index = listaProveedores.value.findIndex(p => p.proveedor_id === datos.proveedor_id)
      if (index !== -1) {
        const itemActualizado: Proveedor = {
          ...(datos as Proveedor),
          producto_nombre: nombreProd
        }
        listaProveedores.value[index] = itemActualizado
        proveedorSeleccionado.value = itemActualizado
      }
      mostrarMensaje('Proveedor actualizado en memoria local (sin persistencia en API).', 'exito')
    }
  } 
  // CREACIÓN (POST)
  else {
    try {
      const nuevo = await crearProveedor(datos as NuevoProveedor)
      const proveedorNormalizado: Proveedor = {
        ...nuevo,
        producto_nombre: nombreProd
      }
      listaProveedores.value.unshift(proveedorNormalizado)
      mostrarMensaje('Proveedor creado con éxito en el backend.', 'exito')
    } catch (error) {
      console.warn('Error al crear en backend. Guardando en memoria local.', error)
      const nuevoId = listaProveedores.value.length > 0 
        ? Math.max(...listaProveedores.value.map(p => p.proveedor_id)) + 1 
        : 1

      const nuevo: Proveedor = {
        ...(datos as NuevoProveedor),
        proveedor_id: nuevoId,
        producto_nombre: nombreProd
      }
      listaProveedores.value.unshift(nuevo)
      mostrarMensaje('Proveedor guardado en memoria local (sin persistencia en API).', 'exito')
    }
  }
  cerrarModal()
}

onMounted(() => {
  cargarProveedores()
})
</script>

<template>
  <div class="container-fluid py-2">
    <!-- Header y Acciones -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h3 class="fw-bold mb-0 text-dark">Gestión de Proveedores</h3>
        <p class="text-muted small mb-0">Alta, consulta y edición de proveedores del corralón</p>
      </div>

      <div class="d-flex gap-2">
        <button 
          class="btn btn-outline-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          :disabled="!proveedorSeleccionado"
          @click="abrirModalEditar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
          </svg>
          <span>Editar Seleccionado</span>
        </button>

        <button 
          class="btn btn-coralon d-flex align-items-center gap-2 px-3 fw-semibold"
          @click="abrirModalCrear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
          <span>Nuevo Proveedor</span>
        </button>
      </div>
    </div>

    <!-- Alertas -->
    <div v-if="mensajeExito" class="alert alert-success py-2 small mb-3" role="status">
      {{ mensajeExito }}
    </div>
    <div v-if="mensajeError" class="alert alert-danger py-2 small mb-3" role="alert">
      {{ mensajeError }}
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
                placeholder="Buscar por Nombre, CUIT, Email o Producto..."
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
              <th scope="col" class="py-3">Nombre / Razón Social</th>
              <th scope="col" class="py-3">Apellido / Denominación</th>
              <th scope="col" class="py-3">CUIT</th>
              <th scope="col" class="py-3">Producto Suministrado</th>
              <th scope="col" class="py-3">Teléfono</th>
              <th scope="col" class="py-3">Email</th>
              <th scope="col" class="py-3 pe-3">Dirección</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="proveedor in proveedoresFiltrados"
              :key="proveedor.proveedor_id"
              :class="{ 'fila-seleccionada': proveedorSeleccionado?.proveedor_id === proveedor.proveedor_id }"
              style="cursor: pointer;"
              @click="seleccionarFila(proveedor)"
            >
              <td class="ps-3 fw-bold">{{ proveedor.proveedor_id }}</td>
              <td class="fw-semibold">{{ proveedor.nombre }}</td>
              <td>{{ proveedor.apellido }}</td>
              <td><span class="badge badge-cuit font-monospace">{{ proveedor.cuit }}</span></td>
              <td>
                <span class="badge bg-secondary-subtle text-dark border border-secondary-subtle px-2 py-1">
                  #{{ proveedor.producto_id }} - {{ proveedor.producto_nombre || 'Producto Asignado' }}
                </span>
              </td>
              <td>{{ proveedor.telefono }}</td>
              <td>{{ proveedor.email }}</td>
              <td class="pe-3 text-secondary">{{ proveedor.direccion }}</td>
            </tr>
            <tr v-if="cargando">
              <td colspan="8" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Cargando proveedores...
              </td>
            </tr>
            <tr v-else-if="proveedoresFiltrados.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                No se encontraron proveedores que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalProveedor
      :mostrar="mostrarModal"
      :proveedor-a-editar="proveedorParaEditar"
      @cerrar="cerrarModal"
      @guardar="guardarProveedor"
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

.badge-cuit {
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