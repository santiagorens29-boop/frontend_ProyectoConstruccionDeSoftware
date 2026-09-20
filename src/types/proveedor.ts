// Contrato de datos para Proveedor basado en el DER
export interface Proveedor {
  proveedor_id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  cuit: string
  direccion: string
  producto_id: number
  producto_nombre?: string
}

// Tipo para la creación (no requiere proveedor_id ya que lo genera la base de datos)
export type NuevoProveedor = Omit<Proveedor, 'proveedor_id'>

// Datos simulados (Mock) para pruebas de interfaz y diseño
export const PROVEEDORES_MOCK: Proveedor[] = [
  {
    proveedor_id: 1,
    nombre: 'Juan Carlos',
    apellido: 'Loma Negra',
    email: 'ventas@lomanegra.com.ar',
    telefono: '011-4567-8901',
    cuit: '30-50001234-9',
    direccion: 'Av. del Libertador 4400, CABA',
    producto_id: 1,
    producto_nombre: 'Cemento Portland Normal 50kg'
  },
  {
    proveedor_id: 2,
    nombre: 'Roberto',
    apellido: 'Aceros Bragado',
    email: 'contacto@acerosbragado.com',
    telefono: '02342-421234',
    cuit: '30-54678912-3',
    direccion: 'Ruta 5 Km 210, Bragado',
    producto_id: 2,
    producto_nombre: 'Hierro Conformado 12mm x 12m'
  },
  {
    proveedor_id: 3,
    nombre: 'Elena',
    apellido: 'Cerámica San Lorenzo',
    email: 'pedidos@sanlorenzo.com.ar',
    telefono: '011-4789-3322',
    cuit: '30-61234567-8',
    direccion: 'Parque Industrial Pilar Lote 45',
    producto_id: 3,
    producto_nombre: 'Ladrillo Hueco 12x18x33 (6 tubos)'
  },
  {
    proveedor_id: 4,
    nombre: 'Marcelo',
    apellido: 'Pinturas Alba',
    email: 'atencion@alba.com.ar',
    telefono: '0800-444-2522',
    cuit: '30-50123789-1',
    direccion: 'Av. Corrientes 1234, CABA',
    producto_id: 4,
    producto_nombre: 'Pintura Látex Exterior 20L'
  }
]