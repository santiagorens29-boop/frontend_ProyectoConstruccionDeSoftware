import api from '../lib/api'
import {
  PRODUCTOS_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  type Producto,
  type NuevoProducto,
  type MovimientoInventario
} from '../types/producto'

const RUTA_PRODUCTOS = '/scm/productos/'

interface RespuestaProductosAPI {
  count?: number
  next?: string | null
  previous?: string | null
  results?: any[]
}

function mapearProductoDesdeBackend(item: any): Producto {
  const id = item.id ?? item.producto_id
  const precioNumerico = typeof item.precio === 'string' ? parseFloat(item.precio) : (item.precio ?? item.preciounitario ?? 0)
  const rubroId = item.rubro ?? item.rubro_id ?? 101

  return {
    id,
    producto_id: id,
    codigo: item.codigo || `ART-${id}`,
    nombre: item.nombre || '',
    descripcion: item.descripcion || '',
    precio: precioNumerico,
    preciounitario: precioNumerico,
    rubro: rubroId,
    rubro_id: rubroId,
    rubro_nombre: item.rubro_nombre,
    stock_actual: item.stock_actual ?? item.stockactual ?? 0,
    stockactual: item.stock_actual ?? item.stockactual ?? 0,
    stock_minimo: item.stock_minimo ?? item.stockminreposicion ?? 0,
    stockminreposicion: item.stock_minimo ?? item.stockminreposicion ?? 0,
    necesita_reposicion: item.necesita_reposicion,
    activo: item.activo !== false
  }
}

export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const respuesta = await api.get<RespuestaProductosAPI | any[]>(RUTA_PRODUCTOS)
    const items = Array.isArray(respuesta.data)
      ? respuesta.data
      : (respuesta.data?.results || [])

    if (items.length > 0) {
      return items.map(mapearProductoDesdeBackend)
    }

    return PRODUCTOS_MOCK
  } catch (error) {
    console.warn('Backend de productos no disponible. Usando mocks.', error)
    return PRODUCTOS_MOCK
  }
}

export async function crearProducto(datos: NuevoProducto & { codigo?: string }): Promise<Producto> {
  const payload = {
    codigo: datos.codigo || `ART-${Date.now().toString().slice(-4)}`,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    precio: datos.preciounitario,
    rubro: datos.rubro_id,
    stock_minimo: datos.stockminreposicion
  }

  const respuesta = await api.post(RUTA_PRODUCTOS, payload)
  return mapearProductoDesdeBackend(respuesta.data)
}

export async function actualizarProducto(id: number, datos: Partial<Producto>): Promise<Producto> {
  const payload: any = {}
  if (datos.codigo !== undefined) payload.codigo = datos.codigo
  if (datos.nombre !== undefined) payload.nombre = datos.nombre
  if (datos.descripcion !== undefined) payload.descripcion = datos.descripcion
  if (datos.preciounitario !== undefined) payload.precio = datos.preciounitario
  if (datos.rubro_id !== undefined) payload.rubro = datos.rubro_id
  if (datos.stockminreposicion !== undefined) payload.stock_minimo = datos.stockminreposicion

  const respuesta = await api.patch(`${RUTA_PRODUCTOS}${id}/`, payload)
  return mapearProductoDesdeBackend(respuesta.data)
}

export async function inactivarProducto(id: number): Promise<void> {
  try {
    // Si la API tiene endpoint DELETE o PATCH de inactivación
    await api.delete(`${RUTA_PRODUCTOS}${id}/`)
  } catch (error) {
    // Fallback con patch si maneja soft-delete
    await api.patch(`${RUTA_PRODUCTOS}${id}/`, { activo: false })
  }
}

export async function obtenerMovimientosPorProducto(productoId: number): Promise<MovimientoInventario[]> {
  try {
    const respuesta = await api.get<any>(`/scm/movimientos-inventario/?producto=${productoId}`)
    const items = Array.isArray(respuesta.data)
      ? respuesta.data
      : (respuesta.data?.results || [])

    if (items.length > 0) {
      return items.map((m: any) => ({
        movimientoinventario_id: m.id ?? m.movimientoinventario_id,
        producto_id: m.producto ?? m.producto_id,
        usuario_id: m.usuario ?? m.usuario_id ?? 1,
        tipo: m.tipo,
        cantidad: m.cantidad,
        fecha: m.fecha || m.created_at || '',
        observacion: m.observacion || m.motivo || ''
      }))
    }

    return MOVIMIENTOS_INVENTARIO_MOCK.filter(m => m.producto_id === productoId)
  } catch (error) {
    console.warn('Backend de movimientos no disponible. Usando mocks.', error)
    return MOVIMIENTOS_INVENTARIO_MOCK.filter(m => m.producto_id === productoId)
  }
}