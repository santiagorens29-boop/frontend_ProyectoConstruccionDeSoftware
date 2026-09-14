// Entidades de Período y Cierre Contable
export interface Periodo {
  periodo_id: number
  anio: number
  mes: number
}

export type EstadoCierre = 'Abierto' | 'Cerrado'

export interface CierreMensual {
  cierremensual_id: number
  periodo_id: number
  fecha_cierre: string
  estado: EstadoCierre
  mesNombre?: string
  anio?: number
  montoTotal?: number
}

export interface AsientoDiario {
  diario_id: number
  cierremensual_id: number
  fecha: string
  descripcion: string
  debe: number
  haber: number
}

// Entidades de Facturación
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

// Entidades de Órdenes Comerciales para Facturar
export interface OrdenDetalleItem {
  detalle_id: number
  producto_id: number
  producto_nombre: string
  cantidad: number
  preciounitario: number
  subtotal: number
}

export interface OrdenComercial {
  orden_id: number
  tipo_orden: 'Compra' | 'Venta'
  origen_id: number
  entidad_nombre: string
  fecha: string
  estado_nombre: 'Pendiente' | 'Facturada' | 'Aprobada'
  total: number
  detalles: OrdenDetalleItem[]
}

// ==================== DATOS MOCK INICIALES ====================

export const CIERRES_MOCK: CierreMensual[] = [
  {
    cierremensual_id: 1,
    periodo_id: 1,
    fecha_cierre: '2026-07-31',
    estado: 'Cerrado',
    mesNombre: 'Julio 2026',
    anio: 2026,
    montoTotal: 1850000
  },
  {
    cierremensual_id: 2,
    periodo_id: 2,
    fecha_cierre: '2026-08-31',
    estado: 'Cerrado',
    mesNombre: 'Agosto 2026',
    anio: 2026,
    montoTotal: 2420000
  },
  {
    cierremensual_id: 3,
    periodo_id: 3,
    fecha_cierre: '2026-09-30',
    estado: 'Abierto',
    mesNombre: 'Septiembre 2026',
    anio: 2026,
    montoTotal: 960000
  }
]

export const DIARIO_MOCK: AsientoDiario[] = [
  {
    diario_id: 1,
    cierremensual_id: 3,
    fecha: '2026-09-02',
    descripcion: 'Cobro de Factura FCA-0001 (Cliente Loma Construcciones)',
    debe: 450000,
    haber: 0
  },
  {
    diario_id: 2,
    cierremensual_id: 3,
    fecha: '2026-09-05',
    descripcion: 'Pago Orden de Compra OC-104 (Loma Negra S.A.)',
    debe: 0,
    haber: 320000
  },
  {
    diario_id: 3,
    cierremensual_id: 3,
    fecha: '2026-09-10',
    descripcion: 'Venta contado mostrador materiales varios',
    debe: 190000,
    haber: 0
  },
  {
    diario_id: 4,
    cierremensual_id: 3,
    fecha: '2026-09-12',
    descripcion: 'Pago flete y logística de distribución',
    debe: 0,
    haber: 75000
  }
]

export const FACTURAS_MOCK: FacturaCabecera[] = [
  {
    facturacabecera_id: 1,
    ordenventa_id: 101,
    ordencompra_id: null,
    diario_id: 1,
    tipo: 'Factura A',
    numero: 'FCA-0001',
    fecha: '2026-09-02',
    subtotal: 371900.82,
    impuesto: 78099.18,
    total: 450000,
    detalles: [
      {
        facturadetalle_id: 1,
        factura_id: 1,
        producto_id: 1,
        producto_nombre: 'Cemento Portland Normal 50kg',
        cantidad: 30,
        preciounitario: 9800,
        subtotal: 294000
      },
      {
        facturadetalle_id: 2,
        factura_id: 1,
        producto_id: 3,
        producto_nombre: 'Ladrillo Hueco 12x18x33',
        cantidad: 240,
        preciounitario: 650,
        subtotal: 156000
      }
    ]
  },
  {
    facturacabecera_id: 2,
    ordenventa_id: null,
    ordencompra_id: 201,
    diario_id: 2,
    tipo: 'Factura A',
    numero: 'FCA-0002',
    fecha: '2026-09-05',
    subtotal: 264462.81,
    impuesto: 55537.19,
    total: 320000,
    detalles: [
      {
        facturadetalle_id: 3,
        factura_id: 2,
        producto_id: 2,
        producto_nombre: 'Hierro Conformado 12mm',
        cantidad: 22,
        preciounitario: 14500,
        subtotal: 319000
      }
    ]
  }
]

export const ORDENES_COMPRA_PENDIENTES: OrdenComercial[] = [
  {
    orden_id: 301,
    tipo_orden: 'Compra',
    origen_id: 1,
    entidad_nombre: 'Loma Negra S.A.',
    fecha: '2026-09-11',
    estado_nombre: 'Pendiente',
    total: 490000,
    detalles: [
      {
        detalle_id: 1,
        producto_id: 1,
        producto_nombre: 'Cemento Portland Normal 50kg',
        cantidad: 50,
        preciounitario: 9800,
        subtotal: 490000
      }
    ]
  },
  {
    orden_id: 302,
    tipo_orden: 'Compra',
    origen_id: 2,
    entidad_nombre: 'Aceros Bragado',
    fecha: '2026-09-13',
    estado_nombre: 'Pendiente',
    total: 290000,
    detalles: [
      {
        detalle_id: 2,
        producto_id: 2,
        producto_nombre: 'Hierro Conformado 12mm x 12m',
        cantidad: 20,
        preciounitario: 14500,
        subtotal: 290000
      }
    ]
  }
]

export const ORDENES_VENTA_PENDIENTES: OrdenComercial[] = [
  {
    orden_id: 401,
    tipo_orden: 'Venta',
    origen_id: 1,
    entidad_nombre: 'Constructora del Sur S.R.L.',
    fecha: '2026-09-12',
    estado_nombre: 'Pendiente',
    total: 232000,
    detalles: [
      {
        detalle_id: 3,
        producto_id: 4,
        producto_nombre: 'Pintura Látex Exterior 20L',
        cantidad: 4,
        preciounitario: 58000,
        subtotal: 232000
      }
    ]
  }
]