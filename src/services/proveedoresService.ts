import api from '../lib/api'
import type { Proveedor, NuevoProveedor } from '../types/proveedor'

const RUTA_PROVEEDORES = '/compras/proveedores/' // Ajustar la ruta si el backend usa '/proveedores/' o similar

export async function obtenerProveedores(): Promise<Proveedor[]> {
  const respuesta = await api.get<Proveedor[]>(RUTA_PROVEEDORES)
  return respuesta.data
}

export async function obtenerProveedorPorId(id: number): Promise<Proveedor> {
  const respuesta = await api.get<Proveedor>(`${RUTA_PROVEEDORES}${id}/`)
  return respuesta.data
}

export async function crearProveedor(datos: NuevoProveedor): Promise<Proveedor> {
  const respuesta = await api.post<Proveedor>(RUTA_PROVEEDORES, datos)
  return respuesta.data
}

export async function actualizarProveedor(id: number, datos: Partial<NuevoProveedor>): Promise<Proveedor> {
  const respuesta = await api.put<Proveedor>(`${RUTA_PROVEEDORES}${id}/`, datos)
  return respuesta.data
}

export async function eliminarProveedor(id: number): Promise<void> {
  await api.delete(`${RUTA_PROVEEDORES}${id}/`)
}