import api from '../lib/api'
import type { Periodo, NuevoPeriodo } from '../types/finanzas'

// Endpoint de tu hoja: /api/contabilidad/periodos/ (baseURL ya tiene /api)
const RUTA_PERIODOS = '/contabilidad/periodos/'

/**
 * GET: Obtener todos los períodos contables
 */
export async function obtenerPeriodos(): Promise<Periodo[]> {
  const respuesta = await api.get<Periodo[]>(RUTA_PERIODOS)
  return respuesta.data
}

/**
 * GET por ID: Obtener un período puntual
 */
export async function obtenerPeriodoPorId(id: number): Promise<Periodo> {
  const respuesta = await api.get<Periodo>(`${RUTA_PERIODOS}${id}/`)
  return respuesta.data
}

/**
 * POST: Crear un nuevo período contable
 */
export async function crearPeriodo(datos: NuevoPeriodo): Promise<Periodo> {
  const respuesta = await api.post<Periodo>(RUTA_PERIODOS, datos)
  return respuesta.data
}

/**
 * PUT: Modificar un período contable
 */
export async function actualizarPeriodo(id: number, datos: Partial<NuevoPeriodo>): Promise<Periodo> {
  const respuesta = await api.put<Periodo>(`${RUTA_PERIODOS}${id}/`, datos)
  return respuesta.data
}