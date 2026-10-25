import api from '../lib/api'
import type { Rubro, NuevoRubro } from '../types/rubro'

// baseURL ya incluye /api
const RUTA_RUBROS = '/scm/rubros/'

interface RespuestaPaginada<T> {
  count: number
  next: string | null
  results: T[]
}

/**
 * GET: Obtener todos los rubros (recorre las páginas del backend)
 */
export async function obtenerRubros(): Promise<Rubro[]> {
  const rubros: Rubro[] = []
  let pagina = 1
  while (true) {
    const respuesta = await api.get<Rubro[] | RespuestaPaginada<Rubro>>(RUTA_RUBROS, {
      params: { page: pagina }
    })
    if (Array.isArray(respuesta.data)) return respuesta.data
    rubros.push(...respuesta.data.results)
    if (!respuesta.data.next) return rubros
    pagina++
  }
}

/**
 * POST: Crear un rubro
 */
export async function crearRubro(datos: NuevoRubro): Promise<Rubro> {
  const respuesta = await api.post<Rubro>(RUTA_RUBROS, datos)
  return respuesta.data
}

/**
 * PUT: Modificar un rubro
 */
export async function actualizarRubro(id: number, datos: NuevoRubro): Promise<Rubro> {
  const respuesta = await api.put<Rubro>(`${RUTA_RUBROS}${id}/`, datos)
  return respuesta.data
}

/**
 * DELETE: Eliminar un rubro
 */
export async function eliminarRubro(id: number): Promise<void> {
  await api.delete(`${RUTA_RUBROS}${id}/`)
}

/**
 * Extrae un mensaje legible de un error de la API (400 con errores por campo).
 */
export function mensajeDeError(error: any, porDefecto: string): string {
  const data = error?.response?.data
  if (data && typeof data === 'object') {
    const mensajes = Object.values(data).flat().filter((m) => typeof m === 'string')
    if (mensajes.length) return mensajes.join(' ')
  }
  return porDefecto
}
