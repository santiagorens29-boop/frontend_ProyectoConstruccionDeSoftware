import { obtenerTodos } from './finanzasApi'
import { aNumero } from '../utils/formatoFinanzas'
import type { OrdenComercial } from '../types/finanzas'

// Solo lectura: Finanzas consulta las órdenes de compra y de venta para poder facturarlas.
const RUTA_ORDENES_COMPRA = '/compras/ordenes-compra/'
const RUTA_PROVEEDORES = '/compras/proveedores/'
const RUTA_ESTADOS_ORDEN_COMPRA = '/compras/estados-orden-compra/'
const RUTA_ORDENES_VENTA = '/ventas/ordenes-venta/'
const RUTA_CLIENTES = '/ventas/clientes/'

interface OrdenCompraDetalleCrudo {
  ordencompradetalle_id: number
  producto_id: number
  cantidad: number
  precio_unitario: string
}

// El backend de compras manda `proveedor` y `estado` solo como id.
interface OrdenCompraCruda {
  ordencompra_id: number
  proveedor: number
  estado: number
  fecha: string
  total: string
  detalles: OrdenCompraDetalleCrudo[]
}

interface ProveedorCrudo {
  proveedor_id: number
  nombre: string
  apellido: string
}

interface EstadoOrdenCompraCrudo {
  estadoordencompra_id: number
  nombre: string
}

// Ventas ya manda el nombre del estado y de cada producto; el cliente viene solo como id.
// Los renglones llegan en `items` (el campo `detalles` es solo de escritura).
interface OrdenVentaItemCrudo {
  id: number
  producto: number
  producto_nombre: string
  cantidad: number
  precio_unitario: string
  descuento: string
  subtotal: string
}

interface OrdenVentaCruda {
  id: number
  cliente: number
  numero_comprobante: string | null
  estado: number
  estado_nombre: string
  fecha: string
  total: string
  items: OrdenVentaItemCrudo[]
}

interface ClienteCrudo {
  id_cliente: number
  nombre: string
}

/**
 * GET: Órdenes de compra con proveedor y estado ya resueltos por nombre.
 * Incluye todas las órdenes; el filtrado de las que se pueden facturar lo hace la vista.
 */
export async function obtenerOrdenesCompra(): Promise<OrdenComercial[]> {
  const [ordenes, proveedores, estados] = await Promise.all([
    obtenerTodos<OrdenCompraCruda>(RUTA_ORDENES_COMPRA),
    obtenerTodos<ProveedorCrudo>(RUTA_PROVEEDORES),
    obtenerTodos<EstadoOrdenCompraCrudo>(RUTA_ESTADOS_ORDEN_COMPRA)
  ])

  const nombresProveedor = new Map(
    proveedores.map((p) => [p.proveedor_id, `${p.nombre} ${p.apellido ?? ''}`.trim()])
  )
  const nombresEstado = new Map(estados.map((e) => [e.estadoordencompra_id, e.nombre]))

  return ordenes.map((orden) => ({
    orden_id: orden.ordencompra_id,
    tipo_orden: 'Compra',
    origen_id: orden.proveedor,
    entidad_nombre: nombresProveedor.get(orden.proveedor) ?? `Proveedor #${orden.proveedor}`,
    fecha: orden.fecha,
    estado_nombre: nombresEstado.get(orden.estado) ?? `Estado #${orden.estado}`,
    total: aNumero(orden.total),
    detalles: (orden.detalles ?? []).map((detalle) => {
      const precio = aNumero(detalle.precio_unitario)
      return {
        detalle_id: detalle.ordencompradetalle_id,
        producto_id: detalle.producto_id,
        producto_nombre: `Producto #${detalle.producto_id}`,
        cantidad: detalle.cantidad,
        preciounitario: precio,
        subtotal: detalle.cantidad * precio
      }
    })
  }))
}

/**
 * GET: Órdenes de venta con el cliente resuelto por nombre.
 * Incluye todas las órdenes; el filtrado de las que se pueden facturar lo hace la vista.
 */
export async function obtenerOrdenesVenta(): Promise<OrdenComercial[]> {
  const [ordenes, clientes] = await Promise.all([
    obtenerTodos<OrdenVentaCruda>(RUTA_ORDENES_VENTA),
    obtenerTodos<ClienteCrudo>(RUTA_CLIENTES)
  ])

  const nombresCliente = new Map(clientes.map((c) => [c.id_cliente, c.nombre]))

  return ordenes.map((orden) => ({
    orden_id: orden.id,
    tipo_orden: 'Venta',
    origen_id: orden.cliente,
    entidad_nombre: nombresCliente.get(orden.cliente) ?? `Cliente #${orden.cliente}`,
    fecha: orden.fecha,
    estado_nombre: orden.estado_nombre || `Estado #${orden.estado}`,
    total: aNumero(orden.total),
    numero_comprobante: orden.numero_comprobante,
    detalles: (orden.items ?? []).map((item) => ({
      detalle_id: item.id,
      producto_id: item.producto,
      producto_nombre: item.producto_nombre || `Producto #${item.producto}`,
      cantidad: item.cantidad,
      preciounitario: aNumero(item.precio_unitario),
      descuento: aNumero(item.descuento),
      subtotal: aNumero(item.subtotal)
    }))
  }))
}

// Una orden cancelada (compras) o anulada (ventas) no se puede facturar.
export function esOrdenCancelada(orden: OrdenComercial): boolean {
  return /cancel|anul/i.test(orden.estado_nombre)
}
