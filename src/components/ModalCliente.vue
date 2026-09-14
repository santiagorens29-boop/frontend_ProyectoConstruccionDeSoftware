<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Cliente, NuevoCliente } from '../types/cliente'
import { CONDICIONES_IVA } from '../types/cliente'

interface Props {
  mostrar: boolean
  clienteAEditar: Cliente | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardar', cliente: Cliente | NuevoCliente): void
}>()

function formularioVacio(): NuevoCliente & { cliente_id?: number } {
  return {
    cuil: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    condicion_iva: 'Consumidor Final',
    estado: 'Activo',
  }
}

const formulario = ref<NuevoCliente & { cliente_id?: number }>(formularioVacio())

watch(
  () => props.clienteAEditar,
  (nuevoValor) => {
    formulario.value = nuevoValor ? { ...nuevoValor } : formularioVacio()
  },
  { immediate: true }
)

function cerrarModal() {
  emit('cerrar')
}

function guardarCliente() {
  emit('guardar', { ...formulario.value })
}
</script>

<template>
  <div v-if="mostrar">
    <div class="modal-backdrop fade show"></div>

    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow border-0 overflow-hidden">
          <!-- Encabezado Institucional -->
          <div class="modal-header modal-header-custom text-white px-4 py-3">
            <h5 class="modal-title fw-bold">
              {{ clienteAEditar ? 'Editar Cliente' : 'Nuevo Cliente' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" @click="cerrarModal"></button>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="guardarCliente">
            <div class="modal-body p-4 bg-white">
              <div class="row g-3">
                <!-- CUIL / CUIT -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">CUIL / CUIT *</label>
                  <input
                    v-model="formulario.cuil"
                    type="text"
                    class="form-control custom-input"
                    placeholder="20-12345678-3"
                    required
                  />
                </div>

                <!-- Condición IVA -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold text-dark">Condición frente al IVA *</label>
                  <select v-model="formulario.condicion_iva" class="form-select custom-input" required>
                    <option v-for="op in CONDICIONES_IVA" :key="op" :value="op">{{ op }}</option>
                  </select>
                </div>

                <!-- Nombre / Razón social -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold text-dark">Nombre / Razón social *</label>
                  <input
                    v-model="formulario.nombre"
                    type="text"
                    class="form-control custom-input"
                    placeholder="Nombre y apellido o razón social"
                    required
                  />
                </div>

                <!-- Teléfono -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Teléfono</label>
                  <input
                    v-model="formulario.telefono"
                    type="text"
                    class="form-control custom-input"
                    placeholder="11-4455-6677"
                  />
                </div>

                <!-- Email -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Email</label>
                  <input
                    v-model="formulario.email"
                    type="email"
                    class="form-control custom-input"
                    placeholder="cliente@correo.com"
                  />
                </div>

                <!-- Estado -->
                <div class="col-md-4">
                  <label class="form-label fw-semibold text-dark">Estado</label>
                  <select v-model="formulario.estado" class="form-select custom-input">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <!-- Dirección -->
                <div class="col-md-12">
                  <label class="form-label fw-semibold text-dark">Dirección</label>
                  <input
                    v-model="formulario.direccion"
                    type="text"
                    class="form-control custom-input"
                    placeholder="Calle, número, localidad"
                  />
                </div>
              </div>
            </div>

            <!-- Footer con acciones -->
            <div class="modal-footer bg-light px-4 py-3 border-top">
              <button type="button" class="btn btn-secondary px-4" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn btn-coralon px-4 fw-semibold">
                {{ clienteAEditar ? 'Guardar Cambios' : 'Guardar Cliente' }}
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