// Contrato de datos para Producto basado en el DER
export interface Producto {
  producto_id: number
  nombre: string
  descripcion: string
  preciounitario: number
  rubro_id: number
  stockactual: number
  stockminreposicion: number
}

// Tipo para creación de producto (omite ID generado por DB)
export type NuevoProducto = Omit<Producto, 'producto_id'>

// Datos simulados (Mock) para el corralón
export const PRODUCTOS_MOCK: Producto[] = [
  {
    producto_id: 1,
    nombre: 'Cemento Portland Normal 50kg',
    descripcion: 'Bolsa de cemento Loma Negra de uso general para albañilería y hormigón.',
    preciounitario: 9800,
    rubro_id: 101, // Áridos y Cementos
    stockactual: 150,
    stockminreposicion: 30
  },
  {
    producto_id: 2,
    nombre: 'Hierro Conformado 12mm x 12m',
    descripcion: 'Barra de acero corrugado de alta resistencia para estructuras.',
    preciounitario: 14500,
    rubro_id: 102, // Hierros y Mallas
    stockactual: 45,
    stockminreposicion: 15
  },
  {
    producto_id: 3,
    nombre: 'Ladrillo Hueco 12x18x33 (6 tubos)',
    descripcion: 'Ladrillo cerámico hueco para tabiques y muros no portantes.',
    preciounitario: 650,
    rubro_id: 103, // Ladrillos y Bloques
    stockactual: 1200,
    stockminreposicion: 300
  },
  {
    producto_id: 4,
    nombre: 'Pintura Látex Exterior 20L',
    descripcion: 'Impermeabilizante y antihongo color blanco mate para frentes.',
    preciounitario: 58000,
    rubro_id: 104, // Pinturas y Acabados
    stockactual: 12,
    stockminreposicion: 5
  }
]