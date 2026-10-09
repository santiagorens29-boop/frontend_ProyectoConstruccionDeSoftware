import type { OrdenCompraAPI, DatosFacturaCompra } from '../services/comprasService'
import { transicionPermitida } from '../services/comprasService'
import type { NuevaOrdenCompra, FacturaCompra } from '../types/compra'

export function crearComprasMock() {
  const estados = ['Pendiente', 'Aprobada', 'Rechazada', 'Recibida', 'Devuelto', 'Contabilizado']
    .map((nombre, i) => ({ estadoordencompra_id: i + 1, nombre }))
  const productos = [
    { id: -1, nombre: 'Cemento Portland 50 kg', precio: 9800 },
    { id: -2, nombre: 'Arena por m³', precio: 24500 },
    { id: -3, nombre: 'Ladrillo hueco', precio: 850 },
    { id: -4, nombre: 'Hierro de 12 mm', precio: 15800 },
    { id: -5, nombre: 'Cal hidratada 25 kg', precio: 6200 },
    { id: -6, nombre: 'Pintura látex 20 L', precio: 58000 }
  ]
  const proveedores = ['Materiales del Sur', 'Hierros del Norte', 'Distribuidora Central', 'Construcciones del Oeste', 'Pinturería del Parque'].map((nombre, i) => ({
    proveedor_id: -(i + 1), nombre: nombre + ' (ejemplo)', apellido: '', email: 'proveedor' + (i + 1) + '@example.com',
    telefono: '011 4000-000' + i, cuit: '30-0000000' + i + '-0', direccion: 'Dirección de ejemplo ' + (i + 1),
    productos: productos.map(p => p.id), preciosCompra: Object.fromEntries(productos.map(p => [p.id, p.precio]))
  }))
  const ordenes: OrdenCompraAPI[] = Array.from({ length: 20 }, (_, i) => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - i)
    const detalles = Array.from({ length: 1 + i % 3 }, (_, j) => {
      const producto = productos[(i + j) % productos.length]!
      return { ordencompradetalle_id: -((i + 1) * 10 + j), producto_id: producto.id, cantidad: 2 + (i + j) % 9, precio_unitario: producto.precio.toFixed(2) }
    })
    return { ordencompra_id: -(1001 + i), proveedor: -(i % proveedores.length + 1), estado: i % estados.length + 1,
      fecha: fecha.toISOString(), total: detalles.reduce((total, d) => total + d.cantidad * Number(d.precio_unitario), 0).toFixed(2), detalles }
  })
  const facturas: FacturaCompra[] = ordenes.filter(o => o.estado === 6).map((o, i) => ({
    facturacabecera_id: -(i + 1), ordencompra_id: o.ordencompra_id, tipo: 'COMPRA', numero: 'MOCK-' + Math.abs(o.ordencompra_id),
    fecha: o.fecha, subtotal: Number(o.total), impuesto: 0, total: Number(o.total)
  }))
  return {
    cargar: () => structuredClone({ ordenes, proveedores, productos, estados }),
    facturas: () => structuredClone(facturas),
    crear(datos: NuevaOrdenCompra) {
      const id = Math.min(...ordenes.map(o => o.ordencompra_id)) - 1
      const orden: OrdenCompraAPI = { ordencompra_id: id, proveedor: datos.cabecera.proveedor_id, estado: 1,
        fecha: new Date(datos.cabecera.fecha + 'T12:00:00').toISOString(),
        total: datos.detalles.reduce((total, d) => total + d.cantidad * d.preciounitario, 0).toFixed(2),
        detalles: datos.detalles.map((d, i) => ({ ordencompradetalle_id: id * 10 + i, producto_id: d.producto_id, cantidad: d.cantidad, precio_unitario: d.preciounitario.toFixed(2) })) }
      ordenes.unshift(orden)
      return structuredClone(orden)
    },
    cambiar(id: number, estado: number) {
      const orden = ordenes.find(o => o.ordencompra_id === id)
      const actual = estados.find(e => e.estadoordencompra_id === orden?.estado)?.nombre.toLowerCase() ?? ''
      const nuevo = estados.find(e => e.estadoordencompra_id === estado)?.nombre.toLowerCase() ?? ''
      if (!orden || !transicionPermitida(actual, nuevo)) throw new Error('Cambio de estado no permitido.')
      if (estado === 6 && !facturas.some(f => f.ordencompra_id === id)) throw new Error('La orden todavía no tiene factura de compra.')
      orden.estado = estado
      return structuredClone(orden)
    },
    contabilizar(id: number, datos: DatosFacturaCompra) {
      const orden = ordenes.find(o => o.ordencompra_id === id)
      if (!orden || orden.estado !== 4 || facturas.some(f => f.ordencompra_id === id)) throw new Error('La orden no se puede contabilizar.')
      if (!datos.numero.trim()) throw new Error('Falta el número de factura.')
      const subtotal = Number(orden.total)
      facturas.push({ facturacabecera_id: Math.min(0, ...facturas.map(f => f.facturacabecera_id)) - 1,
        ordencompra_id: id, tipo: 'COMPRA', numero: datos.numero, fecha: datos.fecha, subtotal,
        impuesto: datos.impuestos, total: Math.round((subtotal + datos.impuestos) * 100) / 100 })
      orden.estado = 6
      return structuredClone(orden)
    }
  }
}
