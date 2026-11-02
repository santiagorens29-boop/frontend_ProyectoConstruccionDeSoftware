import axios from 'axios'
import api from '../api/clienteAxios'
import { mensajeErrorApi } from '../utils/erroresApi'
import type { Cliente, NuevoCliente } from '../types/cliente'
import type { ProductoVenta } from '../types/venta'
import type { EstadoVenta, VentaHistorial } from '../types/devolucion'
import { pesos } from '../utils/formatoVentas'

// Rutas del backend (módulo Ventas)
const RUTA_CLIENTES = '/ventas/clientes/'
const RUTA_PRODUCTOS = '/ventas/productos-venta/' // con el precio de venta ya calculado por el servidor
const RUTA_ORDENES = '/ventas/ordenes-venta/'
const RUTA_ANULACIONES = '/ventas/anulaciones/'
const RUTA_NOTAS_CREDITO = '/ventas/notas-credito/'

// Las listas paginadas del backend llegan como { count, next, results: [...] }.
// Esta función va pidiendo página por página hasta juntar todo.
// Si se pasa "busqueda", el filtro lo hace el servidor (parámetro ?search=), no el navegador.
async function obtenerTodos<T>(ruta: string, busqueda = ''): Promise<T[]> {
  const resultado: T[] = []
  for (let pagina = 1; pagina <= 50; pagina++) {
    const params: Record<string, string | number> = { page: pagina }
    if (busqueda.trim()) params.search = busqueda.trim()
    const { data } = await api.get(ruta, { params })
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
    condicion_iva: c.condicion_iva ?? '',
    estado: c.estado === 'AC' ? 'Activo' : 'Inactivo',
  }
}

export async function obtenerClientes(busqueda = ''): Promise<Cliente[]> {
  const clientes = await obtenerTodos<ClienteApi>(RUTA_CLIENTES, busqueda)
  return clientes.map(clienteDesdeApi)
}

// ---------- Productos para vender ----------
interface ProductoVentaApi {
  id: number
  codigo: string
  nombre: string
  stock_actual: number
  precio_venta: string | null // precio de compra del proveedor + 30 %; null si todavía no tiene precio
}

export async function obtenerProductosVenta(): Promise<ProductoVenta[]> {
  const productos = await obtenerTodos<ProductoVentaApi>(RUTA_PRODUCTOS)
  return productos.map((p) => ({
    producto_id: p.id,
    nombre: p.nombre,
    preciounitario: p.precio_venta === null ? 0 : Number(p.precio_venta),
    sinPrecio: p.precio_venta === null,
    stock: p.stock_actual,
  }))
}

// ---------- Órdenes de venta (historial de Estado orden venta) ----------
interface OrdenVentaApi {
  id: number
  cliente_nombre: string | null
  cliente_cuil: string | null
  numero_comprobante: string | null
  estado_nombre: string | null
  fecha: string
  total: string | number
  detalles: { producto: number; producto_nombre: string; cantidad: number; subtotal: string | number }[]
}

// Estados de la orden, tal como los define el servidor
const ESTADOS: EstadoVenta[] = ['Pendiente', 'Anulada', 'Devolución parcial', 'Devolución total']

function estadoDesdeApi(nombre: string | null): EstadoVenta {
  return ESTADOS.find((e) => e === nombre) ?? 'Pendiente'
}

// '2026-09-28T19:05:00-03:00' -> '2026-09-28 19:05'
function formatearFecha(iso: string): string {
  const f = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())} ${dos(f.getHours())}:${dos(f.getMinutes())}`
}

// Si un producto aparece en varias líneas de la orden, se juntan en una sola
function juntarItems(detalles: OrdenVentaApi['detalles']): VentaHistorial['items'] {
  const porProducto = new Map<number, VentaHistorial['items'][number]>()
  for (const d of detalles) {
    const actual = porProducto.get(d.producto)
    if (actual) {
      actual.cantidadVendida += d.cantidad
      actual.subtotal += Number(d.subtotal)
    } else {
      porProducto.set(d.producto, {
        productoId: d.producto,
        nombre: d.producto_nombre,
        cantidadVendida: d.cantidad,
        subtotal: Number(d.subtotal),
      })
    }
  }
  return [...porProducto.values()]
}

export async function obtenerOrdenesVenta(busqueda = ''): Promise<VentaHistorial[]> {
  const ordenes = await obtenerTodos<OrdenVentaApi>(RUTA_ORDENES, busqueda)
  return ordenes.map((o) => ({
    id: o.id,
    comprobante: o.numero_comprobante ?? `OV-${o.id}`,
    fecha: formatearFecha(o.fecha),
    cliente: o.cliente_nombre ?? 'Cliente mostrador',
    total: Number(o.total),
    estado: estadoDesdeApi(o.estado_nombre),
    items: juntarItems(o.detalles ?? []),
  }))
}

// ---------- Sesión y mensajes de error ----------
function exigirSesion() {
  if (!localStorage.getItem('access_token')) {
    throw new Error('No hay sesión iniciada. Volvé a iniciar sesión.')
  }
}

// Junta en frases todos los errores por campo: { detalles: [{ cantidad: ['...'] }] } -> ['cantidad: ...']
function aplanarErrores(valor: unknown, campo = ''): string[] {
  if (typeof valor === 'string') return [campo ? `${campo}: ${valor}` : valor]
  if (Array.isArray(valor)) return valor.flatMap((v) => aplanarErrores(v, campo))
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, v]) =>
      aplanarErrores(v, clave === 'non_field_errors' ? campo : clave),
    )
  }
  return []
}

// El servidor de Ventas responde los errores como { codigo, mensaje, errores }
function mensajeDeVentas(err: unknown): string {
  if (axios.isAxiosError(err) && err.response && err.response.status < 500 && err.response.status !== 401) {
    const datos = err.response.data as { codigo?: string; mensaje?: unknown; errores?: unknown } | undefined
    if (datos && typeof datos.mensaje === 'string' && datos.mensaje) {
      // En los errores de formato se agrega el detalle por campo; en los de negocio el mensaje ya lo dice todo
      const detalle = datos.codigo === 'datos_invalidos' ? aplanarErrores(datos.errores).join(' ') : ''
      return detalle ? `${datos.mensaje} ${detalle}` : datos.mensaje
    }
  }
  return mensajeErrorApi(err) || 'Tu sesión venció. Volvé a iniciar sesión.'
}

// Todos los errores se muestran con el mismo formato: "Error: <detalle>".
// Si el token venció (401), el cliente de axios ya cierra la sesión y vuelve al login.
export function textoError(err: unknown): string {
  return `Error: ${mensajeDeVentas(err)}`
}

// ---------- Clientes: buscar por CUIL (GET), crear (POST) y editar (PUT) ----------
// El servidor filtra por CUIL exacto con ?cuil= (11 dígitos)
export async function buscarClientePorCuil(cuil: string): Promise<Cliente | null> {
  const { data } = await api.get(RUTA_CLIENTES, { params: { cuil } })
  const lista = (Array.isArray(data) ? data : (data?.results ?? [])) as ClienteApi[]
  const encontrado = lista.find((c) => c.cuil === cuil)
  return encontrado ? clienteDesdeApi(encontrado) : null
}

function clienteHaciaApi(c: NuevoCliente) {
  return {
    nombre: c.nombre.trim(),
    telefono: (c.telefono || '').trim(), // el servidor no acepta null en estos campos: va vacío
    email: (c.email || '').trim(),
    direccion: (c.direccion || '').trim(),
    cuil: c.cuil,
    condicion_iva: c.condicion_iva,
    estado: c.estado === 'Activo' ? 'AC' : 'OF', // la baja es lógica: nunca se borra el cliente
  }
}

export async function crearCliente(datos: NuevoCliente): Promise<Cliente> {
  exigirSesion()
  const { data } = await api.post<ClienteApi>(RUTA_CLIENTES, clienteHaciaApi(datos))
  return clienteDesdeApi(data)
}

export async function actualizarCliente(cliente: Cliente): Promise<Cliente> {
  exigirSesion()
  const { data } = await api.put<ClienteApi>(`${RUTA_CLIENTES}${cliente.cliente_id}/`, clienteHaciaApi(cliente))
  return clienteDesdeApi(data)
}

// ---------- Generar orden de venta (POST) ----------
const FORMA_PAGO: Record<string, string> = {
  Efectivo: 'EFECTIVO',
  'Tarjeta de débito': 'DEBITO',
  'Tarjeta de crédito': 'CREDITO',
  Transferencia: 'TRANSFERENCIA',
}

const TIPO_COMPROBANTE: Record<string, string> = {
  'Factura A': 'FACTURA_A',
  'Factura B': 'FACTURA_B',
  'Factura C': 'FACTURA_C',
  'Nota de venta': 'NOTA_VENTA',
}

export interface DatosOrdenVenta {
  cuil: string // el servidor obtiene al cliente por su CUIL
  metodoPago: string
  tipoComprobante: string
  items: { productoId: number; cantidad: number }[]
}

// El precio unitario y el total los calcula el servidor
export async function crearOrdenVenta(datos: DatosOrdenVenta): Promise<{ id: number; total: number }> {
  exigirSesion()
  const { data } = await api.post<{ id: number; total: string | number }>(RUTA_ORDENES, {
    cuil: datos.cuil,
    forma_pago: FORMA_PAGO[datos.metodoPago],
    tipo_comprobante: TIPO_COMPROBANTE[datos.tipoComprobante] ?? '',
    detalles: datos.items.map((i) => ({ producto: i.productoId, cantidad: i.cantidad })),
  })
  return { id: data.id, total: Number(data.total) }
}

// ---------- Estado orden venta: anular (POST) y nota de crédito (POST) ----------
export async function anularOrdenVenta(ordenId: number, motivo: string, detalle: string): Promise<void> {
  exigirSesion()
  await api.post(RUTA_ANULACIONES, {
    orden_venta: ordenId,
    motivo,
    detalle: detalle.trim(), // el servidor acepta vacío, pero no null
  })
}

const DESTINO_DEVOLUCION: Record<string, string> = {
  'Stock disponible': 'STOCK_DISPONIBLE',
  'Producto dañado (baja)': 'PRODUCTO_DANADO',
}

export interface DatosNotaCredito {
  ordenId: number
  items: { productoId: number; cantidad: number; destino: string }[]
}

// El monto de la nota de crédito lo calcula el servidor y vuelve en la respuesta
export async function crearNotaCredito(datos: DatosNotaCredito): Promise<{ monto: number }> {
  exigirSesion()
  const { data } = await api.post<{ monto: string | number }>(RUTA_NOTAS_CREDITO, {
    orden_venta: datos.ordenId,
    saldo_a_favor: false,
    detalles: datos.items.map((i) => ({
      producto: i.productoId,
      cantidad_devuelta: i.cantidad,
      destino: DESTINO_DEVOLUCION[i.destino],
    })),
  })
  return { monto: Number(data.monto) }
}

// ---------- Motivo de la anulación y detalle de las devoluciones (GET) ----------
const ETIQUETA_DESTINO: Record<string, string> = {
  STOCK_DISPONIBLE: 'Stock disponible',
  PRODUCTO_DANADO: 'Producto dañado (baja)',
}

interface NotaCreditoApi {
  orden_venta: number
  monto: string | number
  fecha: string
  detalles: { producto: number; producto_nombre?: string; cantidad_devuelta: number; destino: string }[]
}

// Sin abrir el ojito (o el pop up de devolución) no se pide nada: los datos se traen solo cuando hacen falta
async function buscarRegistros<T extends { orden_venta: number }>(
  ruta: string,
  venta: { id: number; comprobante: string },
): Promise<T[]> {
  let registros = (await obtenerTodos<T>(ruta, venta.comprobante)).filter((r) => r.orden_venta === venta.id)
  if (registros.length === 0) {
    // por si la búsqueda del servidor no encuentra el comprobante (ej. "OV-12")
    registros = (await obtenerTodos<T>(ruta)).filter((r) => r.orden_venta === venta.id)
  }
  return registros
}

// Cuántas unidades de cada producto ya se devolvieron en esta orden (para no devolver de más)
export async function obtenerDevueltoPorProducto(venta: {
  id: number
  comprobante: string
}): Promise<Record<number, number>> {
  const notas = await buscarRegistros<NotaCreditoApi>(RUTA_NOTAS_CREDITO, venta)
  const devuelto: Record<number, number> = {}
  for (const nota of notas) {
    for (const d of nota.detalles ?? []) {
      devuelto[d.producto] = (devuelto[d.producto] ?? 0) + d.cantidad_devuelta
    }
  }
  return devuelto
}

export async function obtenerMotivoOrden(
  venta: { id: number; comprobante: string; estado: EstadoVenta },
): Promise<{ titulo: string; mensaje: string }> {
  exigirSesion()
  if (venta.estado === 'Anulada') {
    const anulaciones = await buscarRegistros<{ orden_venta: number; motivo: string; detalle: string | null; fecha: string }>(
      RUTA_ANULACIONES,
      venta,
    )
    const a = anulaciones[0]
    if (!a) return { titulo: 'Orden anulada', mensaje: 'No se encontró el motivo de esta anulación.' }
    return {
      titulo: `Motivo de la anulación — ${venta.comprobante}`,
      mensaje:
        `Motivo: ${a.motivo}\n` +
        `Detalle: ${a.detalle || 'Sin detalle'}\n` +
        `Fecha: ${formatearFecha(a.fecha)}`,
    }
  }

  const notas = await buscarRegistros<NotaCreditoApi>(RUTA_NOTAS_CREDITO, venta)
  if (notas.length === 0) return { titulo: 'Orden devuelta', mensaje: 'No se encontró el detalle de esta devolución.' }
  const lineas = notas.map(
    (n) =>
      `Fecha: ${formatearFecha(n.fecha)} — Monto: $${pesos(Number(n.monto))}\n` +
      (n.detalles ?? [])
        .map((i) => `• ${i.producto_nombre ?? `Producto ${i.producto}`}: ${i.cantidad_devuelta} u. → ${ETIQUETA_DESTINO[i.destino] ?? i.destino}`)
        .join('\n'),
  )
  return { titulo: `Detalle de la devolución — ${venta.comprobante}`, mensaje: lineas.join('\n\n') }
}
