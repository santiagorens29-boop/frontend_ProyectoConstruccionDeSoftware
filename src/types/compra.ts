// Contratos provisionales de la simulación, a ajustar cuando exista el backend.
export interface OrdenCompraCabecera {
  ordencompra_id: number
  proveedor_id: number
  solicitante: string
  fecha: string
  estado: 'Pendiente' | 'Aprobada' | 'Cancelada'
  total: number
}

export interface OrdenCompraDetalle {
  ordencompradetalle_id: number
  ordencompra_id: number
  producto_id: number
  cantidad: number
  preciounitario: number
  subtotal: number
}

export type NuevaOrdenCompraCabecera = Omit<OrdenCompraCabecera, 'ordencompra_id' | 'estado'>
export type NuevoOrdenCompraDetalle = Omit<OrdenCompraDetalle, 'ordencompradetalle_id' | 'ordencompra_id' | 'subtotal'>

export interface NuevaOrdenCompra {
  cabecera: NuevaOrdenCompraCabecera
  detalles: NuevoOrdenCompraDetalle[]
}

export const CABECERAS_COMPRA_MOCK: OrdenCompraCabecera[] = [
  { ordencompra_id: 301, proveedor_id: 1, solicitante: 'Depósito Central', fecha: '2026-09-11', estado: 'Pendiente', total: 490000 },
  { ordencompra_id: 302, proveedor_id: 2, solicitante: 'Sucursal Norte', fecha: '2026-09-13', estado: 'Pendiente', total: 290000 }
]

export const DETALLES_COMPRA_MOCK: OrdenCompraDetalle[] = [
  { ordencompradetalle_id: 1, ordencompra_id: 301, producto_id: 1, cantidad: 50, preciounitario: 9800, subtotal: 490000 },
  { ordencompradetalle_id: 2, ordencompra_id: 302, producto_id: 2, cantidad: 20, preciounitario: 14500, subtotal: 290000 }
]
