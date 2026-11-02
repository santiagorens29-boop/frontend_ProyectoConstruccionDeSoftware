// Importes en pesos, siempre con 2 decimales: 1300.1 -> "1.300,10"
export function pesos(valor: number): string {
  return valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
