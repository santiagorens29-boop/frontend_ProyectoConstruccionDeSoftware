export type EstadoVenta = 'Confirmada' | 'Devolución parcial' | 'Anulada'

export interface ItemVentaHistorial {
  productoId: number
  nombre: string
  cantidadVendida: number
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

export const VENTAS_MOCK: VentaHistorial[] = [
  {
    id: 1,
    comprobante: 'B-0002145',
    fecha: '2026-08-31 10:22',
    cliente: 'Cliente mostrador',
    total: 52272,
    estado: 'Confirmada',
    items: [
      { productoId: 1, nombre: 'Cemento Portland Normal 50kg', cantidadVendida: 4 },
      { productoId: 3, nombre: 'Ladrillo Hueco 12x18x33 (6 tubos)', cantidadVendida: 10 },
    ],
  },
  {
    id: 2,
    comprobante: 'B-0002139',
    fecha: '2026-08-30 16:05',
    cliente: 'Estudio ABC',
    total: 128400,
    estado: 'Devolución parcial',
    items: [
      { productoId: 2, nombre: 'Hierro Conformado 12mm x 12m', cantidadVendida: 6 },
    ],
  },
  {
    id: 3,
    comprobante: 'B-0002130',
    fecha: '2026-08-29 12:48',
    cliente: 'Cliente mostrador',
    total: 9800,
    estado: 'Anulada',
    items: [{ productoId: 1, nombre: 'Cemento Portland Normal 50kg', cantidadVendida: 1 }],
  },
]