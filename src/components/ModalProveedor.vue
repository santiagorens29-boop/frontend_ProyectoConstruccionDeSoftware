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

const formulario = ref<NuevoProveedor & { proveedor_id?: number }>({
  nombre: '',
  apellido: '',
  cuit: '',
  email: '',
  telefono: '',
  direccion: ''
})

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
    <div class="modal-backdrop fade show"></div>

    <div
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0 overflow-hidden">
          <!-- Cabecera institucional -->
          <div class="modal-header modal-header-custom text-white px-4 py-3">
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

          <!-- Formulario -->
          <form @submit.prevent="guardarProveedor">
            <div class="modal-body p-4 bg-white">
              <div class="row g-3">
                <div v-if="proveedorAEditar" class="col-md-12">
                  <label class="form-label fw-semibold text-dark">ID Proveedor</label>
                  <input
                    type="text"
                    class="form-control bg-light"
                    :value="formulario.proveedor_id"
                    disabled
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Nombre / Razón Social *</label>
                  <input
                    v-model="formulario.nombre"
                    type="text"
                    class="form-control custom-input"
                    placeholder="Ej: Loma Negra"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Apellido / Denominación *</label>
                  <input
                    v-model="formulario.apellido"
                    type="text"
                    class="form-control custom-input"
                    placeholder="Ej: S.A."
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">CUIT *</label>
                  <input
                    v-model="formulario.cuit"
                    type="text"
                    class="form-control custom-input"
                    placeholder="30-00000000-0"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Email *</label>
                  <input
                    v-model="formulario.email"
                    type="email"
                    class="form-control custom-input"
                    placeholder="contacto@empresa.com"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Teléfono *</label>
                  <input
                    v-model="formulario.telefono"
                    type="text"
                    class="form-control custom-input"
                    placeholder="011-1234-5678"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Dirección *</label>
                  <input
                    v-model="formulario.direccion"
                    type="text"
                    class="form-control custom-input"
                    placeholder="Calle 123, Localidad"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Footer con botones institucionales -->
            <div class="modal-footer bg-light px-4 py-3 border-top">
              <button
                type="button"
                class="btn btn-secondary px-4"
                @click="cerrarModal"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-coralon px-4 fw-semibold">
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
  opacity: 0.6;
}

.modal-header-custom {
  background-color: #231f1d;
  border-bottom: 3px solid #b33e14;
}

.custom-input:focus {
  border-color: #b33e14;
  box-shadow: 0 0 0 0.25rem rgba(179, 62, 20, 0.2);
}

.btn-coralon {
  background-color: #b33e14;
  border-color: #b33e14;
  color: #ffffff;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-coralon:hover {
  background-color: #ff7a45;
  border-color: #ff7a45;
  color: #ffffff;
}
</style>