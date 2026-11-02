// Estados de una orden de venta, tal como los define el servidor
export type EstadoVenta = 'Pendiente' | 'Anulada' | 'Devolución parcial' | 'Devolución total'

// Qué significa cada estado de una orden de venta (se muestra en la pantalla de Estado orden venta)
export const ESTADOS_VENTA: { estado: EstadoVenta; descripcion: string }[] = [
  { estado: 'Pendiente', descripcion: 'La orden se generó. Se puede anular o devolver.' },
  { estado: 'Anulada', descripcion: 'La orden se anuló y se repuso el stock. No admite más cambios.' },
  { estado: 'Devolución parcial', descripcion: 'Se devolvió una parte de lo vendido. Todavía se puede devolver el resto.' },
  { estado: 'Devolución total', descripcion: 'Se devolvió todo lo vendido.' },
]

export interface ItemVentaHistorial {
  productoId: number
  nombre: string
  cantidadVendida: number
  subtotal: number // lo cobrado por este producto (ya con el descuento)
}

export interface VentaHistorial {
  id: number
  comprobante: string
  fecha: string
  cliente: string
  total: number
  estado: EstadoVenta
  items: ItemVentaHistorial[]
}

export const MOTIVOS_ANULACION = [
  'Error en precio',
  'Error de carga',
  'Pedido del cliente',
  'Producto defectuoso',
  'Otro',
]

export const DESTINOS_DEVOLUCION = ['Stock disponible', 'Producto dañado (baja)']
