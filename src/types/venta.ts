export interface ItemVenta {
  id: number
  productoId: number
  nombre: string
  cantidad: number
  precioUnitario: number
  descuento: number
}

export const TIPOS_COMPROBANTE = ['Factura A', 'Factura B', 'Factura C', 'Nota de venta']

export const METODOS_PAGO = ['Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']

export const IVA_PORCENTAJE = 0.21