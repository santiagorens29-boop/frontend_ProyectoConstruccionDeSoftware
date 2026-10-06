import api from '../api/clienteAxios'
import type { Cliente } from '../types/cliente'
import type { ProductoVenta } from '../types/venta'
import type { EstadoVenta, VentaHistorial } from '../types/devolucion'

// Rutas del backend (módulo Ventas)
const RUTA_CLIENTES = '/ventas/clientes/'
const RUTA_PRODUCTOS = '/scm/productos/'
const RUTA_ORDENES = '/ventas/ordenes-venta/'

// Las listas paginadas del backend llegan como { count, next, results: [...] }.
// Esta función va pidiendo página por página hasta juntar todo.
async function obtenerTodos<T>(ruta: string): Promise<T[]> {
  const resultado: T[] = []
  for (let pagina = 1; pagina <= 50; pagina++) {
    const { data } = await api.get(ruta, { params: { page: pagina } })
    if (Array.isArray(data)) return data as T[] // lista simple, sin paginar
    resultado.push(...((data?.results ?? []) as T[]))
    if (!data?.next) break
  }
  return resultado
}

// ---------- Clientes ----------
// La API usa id_cliente y estado 'AC' (activo) / 'OF' (baja);
// el front usa cliente_id y 'Activo' / 'Inactivo'.
interface ClienteApi {
  id_cliente: number
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
  cuil: string | null
  condicion_iva: string | null
  estado: string
}

function clienteDesdeApi(c: ClienteApi): Cliente {
  return {
    cliente_id: c.id_cliente,
    cuil: c.cuil ?? '',
    nombre: c.nombre,
    telefono: c.telefono ?? '',
    email: c.email ?? '',
    direccion: c.direccion ?? '',
    condicion_iva: c.condicion_iva ?? 'Consumidor Final',
    estado: c.estado === 'AC' ? 'Activo' : 'Inactivo',
  }
}

export async function obtenerClientes(): Promise<Cliente[]> {
  const clientes = await obtenerTodos<ClienteApi>(RUTA_CLIENTES)
  return clientes.map(clienteDesdeApi)
}

// ---------- Productos ----------
interface ProductoApi {
  id: number
  nombre: string
  precio: string | number // el backend manda los decimales como texto ("9800.00")
  stock_actual: number
}

export async function obtenerProductosVenta(): Promise<ProductoVenta[]> {
  const productos = await obtenerTodos<ProductoApi>(RUTA_PRODUCTOS)
  return productos.map((p) => ({
    producto_id: p.id,
    nombre: p.nombre,
    preciounitario: Number(p.precio),
    stock: p.stock_actual,
  }))
}

// ---------- Órdenes de venta (historial de Devoluciones) ----------
interface OrdenVentaApi {
  id: number
  cliente: number | null
  numero_comprobante: string | null
  estado_nombre: string | null
  fecha: string
  total: string | number
  items: { producto: number; producto_nombre: string; cantidad: number }[]
}

function estadoDesdeApi(nombre: string | null): EstadoVenta {
  if (nombre === 'Anulada') return 'Anulada'
  if (nombre === 'Devolución parcial') return 'Devolución parcial'
  return 'Confirmada'
}

// '2026-09-28T19:05:00-03:00' -> '2026-09-28 19:05'
function formatearFecha(iso: string): string {
  const f = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())} ${dos(f.getHours())}:${dos(f.getMinutes())}`
}

export async function obtenerOrdenesVenta(): Promise<VentaHistorial[]> {
  // La orden solo trae el id del cliente: buscamos los nombres en la lista de clientes
  const [ordenes, clientes] = await Promise.all([
    obtenerTodos<OrdenVentaApi>(RUTA_ORDENES),
    obtenerClientes(),
  ])
  const nombrePorId = new Map(clientes.map((c) => [c.cliente_id, c.nombre]))

  return ordenes.map((o) => ({
    id: o.id,
    comprobante: o.numero_comprobante ?? `OV-${o.id}`,
    fecha: formatearFecha(o.fecha),
    cliente: o.cliente ? (nombrePorId.get(o.cliente) ?? 'Cliente mostrador') : 'Cliente mostrador',
    total: Number(o.total),
    estado: estadoDesdeApi(o.estado_nombre),
    items: o.items.map((i) => ({
      productoId: i.producto,
      nombre: i.producto_nombre,
      cantidadVendida: i.cantidad,
    })),
  }))
}
