// Contrato de datos para Producto alineado con el Backend SCM
export interface Producto {
  id?: number
  producto_id: number
  codigo?: string
  nombre: string
  descripcion: string
  precio?: number | string
  preciounitario: number
  rubro?: number
  rubro_id: number
  rubro_nombre?: string
  stock_actual?: number
  stockactual: number
  stock_minimo?: number
  stockminreposicion: number
  necesita_reposicion?: boolean
  activo?: boolean
}

// Payload para crear un producto en el backend
export interface ProductoBackendInput {
  codigo: string
  nombre: string
  descripcion: string
  precio: number | string
  rubro: number
  stock_minimo: number
}

// Tipo para creación de producto en frontend
export type NuevoProducto = Omit<Producto, 'producto_id' | 'id' | 'stockactual' | 'stock_actual' | 'activo'>

// Contrato para Movimiento de Inventario
export interface MovimientoInventario {
  movimientoinventario_id: number
  id?: number
  producto_id: number
  producto?: number
  usuario_id: number
  tipo: 'Ingreso' | 'Egreso' | 'Ajuste'
  cantidad: number
  fecha: string
  observacion: string
}

export type NuevoMovimientoInventario = Omit<MovimientoInventario, 'movimientoinventario_id' | 'id'>

// Datos simulados (Mock) de respaldo
export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: 1,
    producto_id: 1,
    codigo: 'ART-001',
    nombre: 'Cemento Portland Normal 50kg',
    descripcion: 'Bolsa de cemento Loma Negra de uso general para albañilería y hormigón.',
    precio: 9800,
    preciounitario: 9800,
    rubro: 101,
    rubro_id: 101,
    rubro_nombre: 'Áridos y Cementos',
    stock_actual: 150,
    stockactual: 150,
    stock_minimo: 30,
    stockminreposicion: 30,
    activo: true
  },
  {
    id: 2,
    producto_id: 2,
    codigo: 'ART-002',
    nombre: 'Hierro Conformado 12mm x 12m',
    descripcion: 'Barra de acero corrugado de alta resistencia para estructuras.',
    precio: 14500,
    preciounitario: 14500,
    rubro: 102,
    rubro_id: 102,
    rubro_nombre: 'Hierros y Mallas',
    stock_actual: 45,
    stockactual: 45,
    stock_minimo: 15,
    stockminreposicion: 15,
    activo: true
  },
  {
    id: 3,
    producto_id: 3,
    codigo: 'ART-003',
    nombre: 'Ladrillo Hueco 12x18x33 (6 tubos)',
    descripcion: 'Ladrillo cerámico hueco para tabiques y muros no portantes.',
    precio: 650,
    preciounitario: 650,
    rubro: 103,
    rubro_id: 103,
    rubro_nombre: 'Ladrillos y Bloques',
    stock_actual: 1200,
    stockactual: 1200,
    stock_minimo: 300,
    stockminreposicion: 300,
    activo: true
  },
  {
    id: 4,
    producto_id: 4,
    codigo: 'ART-004',
    nombre: 'Pintura Látex Exterior 20L',
    descripcion: 'Impermeabilizante y antihongo color blanco mate para frentes.',
    precio: 58000,
    preciounitario: 58000,
    rubro: 104,
    rubro_id: 104,
    rubro_nombre: 'Pinturas y Acabados',
    stock_actual: 12,
    stockactual: 12,
    stock_minimo: 5,
    stockminreposicion: 5,
    activo: true
  }
]

export const MOVIMIENTOS_INVENTARIO_MOCK: MovimientoInventario[] = [
  {
    movimientoinventario_id: 1,
    producto_id: 1,
    usuario_id: 1,
    tipo: 'Ingreso',
    cantidad: 50,
    fecha: '2026-09-10 10:30',
    observacion: 'Carga inicial de stock'
  },
  {
    movimientoinventario_id: 2,
    producto_id: 1,
    usuario_id: 1,
    tipo: 'Egreso',
    cantidad: 10,
    fecha: '2026-09-15 14:20',
    observacion: 'Entrega por remito #1040'
  },
  {
    movimientoinventario_id: 3,
    producto_id: 1,
    usuario_id: 1,
    tipo: 'Ingreso',
    cantidad: 120,
    fecha: '2026-09-20 09:15',
    observacion: 'Recepción orden de compra #304'
  },
  {
    movimientoinventario_id: 4,
    producto_id: 1,
    usuario_id: 1,
    tipo: 'Ajuste',
    cantidad: -2,
    fecha: '2026-09-25 18:00',
    observacion: 'Bolsas rotas por estiba defectuosa'
  },
  {
    movimientoinventario_id: 5,
    producto_id: 1,
    usuario_id: 1,
    tipo: 'Egreso',
    cantidad: 8,
    fecha: '2026-09-28 11:45',
    observacion: 'Venta mostrador ticket #8841'
  },
  {
    movimientoinventario_id: 6,
    producto_id: 3,
    usuario_id: 1,
    tipo: 'Ingreso',
    cantidad: 400,
    fecha: '2026-09-12 08:30',
    observacion: 'Ingreso de mercadería por recepción'
  }
]