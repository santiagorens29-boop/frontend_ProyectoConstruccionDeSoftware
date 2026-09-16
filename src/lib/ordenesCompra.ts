import {
  CABECERAS_COMPRA_MOCK,
  DETALLES_COMPRA_MOCK,
  type NuevaOrdenCompraCabecera,
  type NuevoOrdenCompraDetalle,
  type OrdenCompraCabecera,
  type OrdenCompraDetalle
} from '../types/compra'
import { PROVEEDORES_MOCK } from '../types/proveedor'
import { PRODUCTOS_MOCK } from '../types/producto'

// Simulación en memoria de las operaciones de órdenes de compra.
// Reemplazar sus implementaciones por llamadas a api.ts al definir el backend.
const cabeceras = CABECERAS_COMPRA_MOCK.map(item => ({ ...item }))
const detalles = DETALLES_COMPRA_MOCK.map(item => ({ ...item }))

export async function getOrdenCompraCabeceras(): Promise<OrdenCompraCabecera[]> {
  return cabeceras.map(item => ({ ...item }))
}

export async function getOrdenCompraDetalles(): Promise<OrdenCompraDetalle[]> {
  return detalles.map(item => ({ ...item }))
}

export async function actualizarEstadoOrdenCompra(
  ordencompra_id: number,
  estado: OrdenCompraCabecera['estado']
): Promise<OrdenCompraCabecera> {
  const cabecera = cabeceras.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (!['Pendiente', 'Aprobada', 'Cancelada'].includes(estado)) {
    throw new Error('El estado de la orden no es válido.')
  }
  if (estado === 'Aprobada' && !detalles.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('No se puede aprobar una orden sin productos registrados.')
  }
  cabecera.estado = estado
  return { ...cabecera }
}

export async function aprobarOrdenCompra(ordencompra_id: number): Promise<OrdenCompraCabecera> {
  const cabecera = cabeceras.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (cabecera.estado !== 'Pendiente') throw new Error('Solo se pueden aprobar órdenes pendientes.')
  if (!detalles.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('No se puede aprobar una orden sin productos registrados.')
  }
  cabecera.estado = 'Aprobada'
  return { ...cabecera }
}

export async function cancelarOrdenCompra(ordencompra_id: number): Promise<OrdenCompraCabecera> {
  const cabecera = cabeceras.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (cabecera.estado === 'Cancelada') throw new Error('La orden ya está cancelada.')
  cabecera.estado = 'Cancelada'
  return { ...cabecera }
}

export async function volverOrdenCompraAPendiente(ordencompra_id: number): Promise<OrdenCompraCabecera> {
  const cabecera = cabeceras.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la orden de compra.')
  if (cabecera.estado !== 'Aprobada') throw new Error('Solo una orden aprobada puede volver a pendiente.')
  cabecera.estado = 'Pendiente'
  return { ...cabecera }
}

export async function postOrdenCompraCabecera(datos: NuevaOrdenCompraCabecera): Promise<OrdenCompraCabecera> {
  if (!PROVEEDORES_MOCK.some(item => item.proveedor_id === datos.proveedor_id)
    || !datos.solicitante?.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)
    || !Number.isFinite(datos.total) || datos.total <= 0) {
    throw new Error('La cabecera requiere solicitante interno, proveedor, fecha y total válidos.')
  }
  const cabecera: OrdenCompraCabecera = {
    ...datos,
    solicitante: datos.solicitante.trim(),
    ordencompra_id: Math.max(0, ...cabeceras.map(item => item.ordencompra_id)) + 1,
    estado: 'Pendiente'
  }
  cabeceras.push(cabecera)
  return { ...cabecera }
}

// El POST de detalle recibe todos los ítems de la cabecera en una sola operación.
export async function postOrdenCompraDetalle(
  ordencompra_id: number,
  items: NuevoOrdenCompraDetalle[]
): Promise<OrdenCompraDetalle[]> {
  const cabecera = cabeceras.find(item => item.ordencompra_id === ordencompra_id)
  if (!cabecera) throw new Error('No existe la cabecera de la orden.')
  if (detalles.some(item => item.ordencompra_id === ordencompra_id)) {
    throw new Error('La orden ya tiene detalles registrados.')
  }
  if (!items.length || items.some(item =>
    !PRODUCTOS_MOCK.some(producto => producto.producto_id === item.producto_id)
    || !Number.isFinite(item.cantidad) || item.cantidad <= 0
    || !Number.isFinite(item.preciounitario) || item.preciounitario <= 0
  )) throw new Error('Cada detalle requiere producto, cantidad y precio válidos.')

  const primerId = Math.max(0, ...detalles.map(item => item.ordencompradetalle_id)) + 1
  const nuevos = items.map((item, index) => ({
    ...item,
    ordencompra_id,
    ordencompradetalle_id: primerId + index,
    subtotal: Math.round(item.cantidad * item.preciounitario * 100) / 100
  }))
  const total = Math.round(nuevos.reduce((suma, item) => suma + item.subtotal, 0) * 100) / 100
  if (total !== cabecera.total) throw new Error('El total de los detalles no coincide con la cabecera.')
  detalles.push(...nuevos)
  return nuevos.map(item => ({ ...item }))
}
