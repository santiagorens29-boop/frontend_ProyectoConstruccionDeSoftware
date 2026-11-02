export interface ItemVenta {
  id: number
  productoId: number
  nombre: string
  cantidad: number
  precioUnitario: number
  stock: number // stock disponible: la cantidad no puede pasarlo
}

export const TIPOS_COMPROBANTE = ['Factura A', 'Factura B', 'Factura C', 'Nota de venta']

export const METODOS_PAGO = ['Efectivo', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia']

// Producto tal como lo necesita la pantalla de Generar orden de venta
export interface ProductoVenta {
  producto_id: number
  nombre: string
  preciounitario: number
  stock: number
  sinPrecio: boolean // el producto todavía no tiene precio de venta: no se puede vender
}
