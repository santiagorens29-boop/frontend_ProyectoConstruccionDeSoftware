<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Producto } from '../types/producto'

const props = defineProps<{
  mostrar: boolean
  producto: Producto | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar', datos: { producto_id: number; cantidad: number; observacion: string }): void
}>()

const cantidad = ref<number>(1)
const observacion = ref<string>('')
const errorValidacion = ref<string>('')

// Resetea el formulario cada vez que se abre el modal para un producto
watch(() => props.mostrar, (abierto) => {
  if (abierto) {
    cantidad.value = 1
    observacion.value = 'Reposición manual de stock'
    errorValidacion.value = ''
  }
})

// Cálculo reactivo del stock final
const stockFinal = computed(() => {
  if (!props.producto) return 0
  const cant = Number(cantidad.value) || 0
  return props.producto.stockactual + cant
})

function cerrar() {
  errorValidacion.value = ''
  emit('cerrar')
}

function guardar() {
  if (!props.producto) return

  if (!cantidad.value || cantidad.value <= 0 || !Number.isInteger(Number(cantidad.value))) {
    errorValidacion.value = 'Ingrese una cantidad entera mayor a 0.'
    return
  }

  emit('confirmar', {
    producto_id: props.producto.producto_id,
    cantidad: Number(cantidad.value),
    observacion: observacion.value.trim() || 'Reposición manual de stock'
  })

  cerrar()
}
</script>

<template>
  <div v-if="mostrar && producto">
    <div class="modal-backdrop fade show"></div>
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0 overflow-hidden">
          
          <!-- Encabezado -->
          <div class="modal-header encabezado-custom text-white px-4 py-3">
            <div>
              <h5 class="modal-title fw-bold mb-0">Reponer Stock</h5>
              <p class="small text-white-50 mb-0">Carga de mercadería al inventario</p>
            </div>
            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" @click="cerrar"></button>
          </div>

          <!-- Cuerpo -->
          <div class="modal-body p-4 bg-white">
            <div v-if="errorValidacion" class="alert alert-danger small py-2 mb-3" role="alert">
              {{ errorValidacion }}
            </div>

            <!-- Ficha del Producto Seleccionado -->
            <div class="card bg-light border-0 mb-3">
              <div class="card-body p-3">
                <span class="badge bg-dark mb-1 font-monospace">Código #{{ producto.producto_id }}</span>
                <h6 class="fw-bold mb-1 text-dark">{{ producto.nombre }}</h6>
                <div class="d-flex justify-content-between text-muted small mt-2">
                  <span>Stock Actual: <strong>{{ producto.stockactual }}</strong> un.</span>
                  <span>Mínimo reposición: <strong>{{ producto.stockminreposicion }}</strong> un.</span>
                </div>
              </div>
            </div>

            <!-- Formulario de Entrada -->
            <form @submit.prevent="guardar">
              <div class="mb-3">
                <label for="cantidadReponer" class="form-label small fw-bold text-dark">
                  Cantidad a ingresar <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    id="cantidadReponer"
                    v-model.number="cantidad"
                    type="number"
                    min="1"
                    step="1"
                    class="form-control"
                    placeholder="Ej: 50"
                    required
                  />
                  <span class="input-group-text bg-white text-muted">unidades</span>
                </div>
              </div>

              <!-- Indicador de Nuevo Stock Resultante -->
              <div class="p-2 mb-3 rounded border border-warning-subtle bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
                <span class="small fw-semibold text-dark">Nuevo stock disponible:</span>
                <span class="badge bg-success fs-6">{{ stockFinal }} un.</span>
              </div>

              <div class="mb-3">
                <label for="obsReponer" class="form-label small fw-bold text-dark">
                  Observación / Motivo
                </label>
                <input
                  id="obsReponer"
                  v-model="observacion"
                  type="text"
                  class="form-control"
                  placeholder="Ej: Ingreso por recepción de remito"
                />
              </div>

              <!-- Footer de acciones -->
              <div class="modal-footer bg-light px-0 pb-0 pt-3 border-top mt-4">
                <button type="button" class="btn btn-secondary px-3" @click="cerrar">Cancelar</button>
                <button type="submit" class="btn btn-coralon px-4 fw-semibold">
                  Confirmar Reposición
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  opacity: 0.6;
}

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

.btn-coralon:hover {
  background-color: #ff7a45;
  border-color: #ff7a45;
  color: #ffffff;
}
</style>