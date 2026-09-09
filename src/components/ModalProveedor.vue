<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Proveedor, NuevoProveedor } from '../types/proveedor'

interface Props {
  mostrar: boolean
  proveedorAEditar: Proveedor | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', proveedor: Proveedor | NuevoProveedor): void
}>()

// Estado interno del formulario
const formulario = ref<NuevoProveedor & { proveedor_id?: number }>({
  nombre: '',
  apellido: '',
  cuit: '',
  email: '',
  telefono: '',
  direccion: ''
})

// Sincroniza los datos cuando cambia la prop (edición o nuevo)
watch(
  () => props.proveedorAEditar,
  (nuevoValor) => {
    if (nuevoValor) {
      formulario.value = { ...nuevoValor }
    } else {
      formulario.value = {
        nombre: '',
        apellido: '',
        cuit: '',
        email: '',
        telefono: '',
        direccion: ''
      }
    }
  },
  { immediate: true }
)

function cerrarModal() {
  emit('cerrar')
}

function guardarProveedor() {
  emit('guardar', { ...formulario.value })
}
</script>

<template>
  <div v-if="mostrar">
    <!-- Backdrop oscuro difuso -->
    <div class="modal-backdrop fade show"></div>

    <!-- Contenedor del Modal -->
    <div
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow">
          <!-- Encabezado -->
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              {{ proveedorAEditar ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Cerrar"
              @click="cerrarModal"
            ></button>
          </div>

          <!-- Cuerpo / Formulario -->
          <form @submit.prevent="guardarProveedor">
            <div class="modal-body p-4">
              <div class="row g-3">
                <!-- ID bloqueado si es edición -->
                <div v-if="proveedorAEditar" class="col-md-12">
                  <label class="form-label fw-semibold">ID Proveedor</label>
                  <input
                    type="text"
                    class="form-control bg-light"
                    :value="formulario.proveedor_id"
                    disabled
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Nombre / Razón Social *</label>
                  <input
                    v-model="formulario.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej: Loma Negra"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Apellido / Denominación *</label>
                  <input
                    v-model="formulario.apellido"
                    type="text"
                    class="form-control"
                    placeholder="Ej: S.A."
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">CUIT *</label>
                  <input
                    v-model="formulario.cuit"
                    type="text"
                    class="form-control"
                    placeholder="30-00000000-0"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email *</label>
                  <input
                    v-model="formulario.email"
                    type="email"
                    class="form-control"
                    placeholder="contacto@empresa.com"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Teléfono *</label>
                  <input
                    v-model="formulario.telefono"
                    type="text"
                    class="form-control"
                    placeholder="011-1234-5678"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Dirección *</label>
                  <input
                    v-model="formulario.direccion"
                    type="text"
                    class="form-control"
                    placeholder="Calle 123, Localidad"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Pie del Modal con acciones -->
            <div class="modal-footer bg-light">
              <button
                type="button"
                class="btn btn-secondary px-4"
                @click="cerrarModal"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary px-4 fw-semibold">
                {{ proveedorAEditar ? 'Guardar Cambios' : 'Crear Proveedor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  opacity: 0.5;
}
</style>