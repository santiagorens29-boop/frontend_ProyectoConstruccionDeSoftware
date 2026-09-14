export interface Cliente {
  cliente_id: number
  cuil: string
  nombre: string
  telefono: string
  email: string
  direccion: string
  condicion_iva: string
  estado: 'Activo' | 'Inactivo'
}

export type NuevoCliente = Omit<Cliente, 'cliente_id'>

export const CONDICIONES_IVA = [
  'Consumidor Final',
  'Responsable Inscripto',
  'Monotributista',
  'Exento',
]

export const CLIENTES_MOCK: Cliente[] = [
  {
    cliente_id: 1,
    cuil: '20-31456789-2',
    nombre: 'Estudio ABC',
    telefono: '11-4455-6677',
    email: '',
    direccion: '',
    condicion_iva: 'Responsable Inscripto',
    estado: 'Activo',
  },
  {
    cliente_id: 2,
    cuil: '27-28564321-5',
    nombre: 'María Fernández',
    telefono: '11-2233-4455',
    email: '',
    direccion: '',
    condicion_iva: 'Consumidor Final',
    estado: 'Activo',
  },
  {
    cliente_id: 3,
    cuil: '20-24897733-9',
    nombre: 'Corralón San Martín S.R.L.',
    telefono: '351-555-0192',
    email: '',
    direccion: '',
    condicion_iva: 'Responsable Inscripto',
    estado: 'Inactivo',
  },
]