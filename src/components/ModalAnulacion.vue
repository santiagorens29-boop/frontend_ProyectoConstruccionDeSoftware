<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VentaHistorial } from '../types/devolucion'
import { MOTIVOS_ANULACION } from '../types/devolucion'

interface Props {
  mostrar: boolean
  venta: VentaHistorial | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'confirmar', datos: { ventaId: number; motivo: string; detalle: string }): void
}>()

const motivo = ref(MOTIVOS_ANULACION[0])
const detalle = ref('')

watch(
  () => props.mostrar,
  (visible) => {
    if (visible) {
      motivo.value = MOTIVOS_ANULACION[0]
      detalle.value = ''
    }
  }
)

function cerrarModal() {
  emit('cerrar')
}

function confirmarAnulacion() {
  if (!props.venta) return
  emit('confirmar', { ventaId: props.venta.id, motivo: motivo.value, detalle: detalle.value })
}
</script>

<template>
  <div v-if="mostrar && venta">
    <div class="modal-backdrop fade show"></div>

    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0 overflow-hidden">
          <div class="modal-header modal-header-custom text-white px-4 py-3">
            <h5 class="modal-title fw-bold">Anular comprobante {{ venta.comprobante }}</h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" @click="cerrarModal"></button>
          </div>

          <div class="modal-body p-4 bg-white">
            <p class="text-muted mb-3">
              {{ venta.cliente }} · ${{ venta.total.toLocaleString('es-AR') }} · {{ venta.fecha }}
            </p>

            <div class="mb-3">
              <label class="form-label fw-semibold text-dark">Motivo de anulación *</label>
              <select v-model="motivo" class="form-select custom-input">
                <option v-for="m in MOTIVOS_ANULACION" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div>
              <label class="form-label fw-semibold text-dark">Detalle adicional (opcional)</label>
              <textarea v-model="detalle" class="form-control custom-input" rows="3"></textarea>
            </div>
          </div>

          <div class="modal-footer bg-light px-4 py-3 border-top">
            <button type="button" class="btn btn-secondary px-4" @click="cerrarModal">Cancelar</button>
            <button type="button" class="btn btn-anular px-4 fw-semibold" @click="confirmarAnulacion">
              Confirmar anulación
            </button>
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
.modal-header-custom {
  background-color: #231f1d;
  border-bottom: 3px solid #b33e14;
}
.custom-input:focus {
  border-color: #b33e14;
  box-shadow: 0 0 0 0.25rem rgba(179, 62, 20, 0.2);
}
.btn-anular {
  background-color: #b33e14;
  border-color: #b33e14;
  color: #ffffff;
}
.btn-anular:hover {
  background-color: #ff7a45;
  border-color: #ff7a45;
  color: #ffffff;
}
</style>