import type { ObjectDirective } from 'vue'
import { limpiarTexto } from '../utils/validacionesCompras'

const manejadores = new WeakMap<HTMLInputElement, { input: (evento: Event) => void; blur: () => void }>()
export const vTextoLimpio: ObjectDirective<HTMLInputElement> = {
  mounted(elemento) {
    const input = (evento: Event) => {
      if ((evento as InputEvent).isComposing) return
      const original = elemento.value
      const cursor = elemento.selectionStart
      let valor = limpiarTexto(original, false)
      if (elemento.maxLength >= 0) valor = valor.slice(0, elemento.maxLength)
      if (valor === original) return
      elemento.value = valor
      if (cursor !== null) {
        const posicion = Math.min(limpiarTexto(original.slice(0, cursor), false).length, valor.length)
        elemento.setSelectionRange(posicion, posicion)
      }
    }
    const blur = () => {
      const valor = limpiarTexto(elemento.value)
      if (valor !== elemento.value) {
        elemento.value = valor
        elemento.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
    // Captura antes de v-model para que el modelo reciba el texto normalizado.
    elemento.addEventListener('input', input, true)
    elemento.addEventListener('blur', blur)
    manejadores.set(elemento, { input, blur })
  },
  beforeUnmount(elemento) {
    const handlers = manejadores.get(elemento)
    if (handlers) {
      elemento.removeEventListener('input', handlers.input, true)
      elemento.removeEventListener('blur', handlers.blur)
      manejadores.delete(elemento)
    }
  }
}
