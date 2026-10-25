// Los tipos del backend de Finanzas (períodos, cierres, diarios y facturas reales)
// están en ./finanzasApi.ts.

// NO MODIFICAR: FacturaDetalle y FacturaCabecera los consume el módulo de
// Proveedores (types/compra.ts, OrdenesDeCompras.vue y ModalVerOrdenesCompra.vue).
// Cambiar sus campos rompe `npm run build` (vue-tsc).
export interface FacturaDetalle {
  facturadetalle_id: number
  factura_id: number
  producto_id: number
  producto_nombre?: string
  cantidad: number
  preciounitario: number
  subtotal: number
}

export interface FacturaCabecera {
  facturacabecera_id: number
  ordenventa_id: number | null
  ordencompra_id: number | null
  diario_id: number | null
  tipo: 'Factura A' | 'Factura B' | 'Nota Débito' | 'Nota Crédito'
  numero: string
  fecha: string
  subtotal: number
  impuesto: number
  total: number
  detalles?: FacturaDetalle[]
}

// Modelo de pantalla de las órdenes que Finanzas muestra para facturar.
// Se arma en services/ordenesParaFacturarService.ts a partir de los backends de
// compras y de ventas.
export interface OrdenDetalleItem {
  detalle_id: number
  producto_id: number
  producto_nombre: string
  cantidad: number
  preciounitario: number
  // Descuento del renglón (solo ventas). `subtotal` ya viene con el descuento aplicado.
  descuento?: number
  subtotal: number
}

export interface OrdenComercial {
  orden_id: number
  tipo_orden: 'Compra' | 'Venta'
  origen_id: number
  entidad_nombre: string
  fecha: string
  estado_nombre: string
  total: number
  // Comprobante que la orden de venta ya tiene asignado (por ejemplo "B-0002145").
  numero_comprobante?: string | null
  detalles: OrdenDetalleItem[]
}
