import api from '../lib/api'
import { RUBROS_MOCK, type Rubro } from '../types/rubro'

const RUTA_RUBROS = '/scm/rubros/'

interface RespuestaRubrosAPI {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Array<{ id: number; nombre: string; descripcion?: string }>
}

export async function obtenerRubros(): Promise<Rubro[]> {
  try {
    const respuesta = await api.get<RespuestaRubrosAPI | Rubro[]>(RUTA_RUBROS)

    const items = Array.isArray(respuesta.data)
      ? respuesta.data
      : (respuesta.data?.results || [])

    if (items.length > 0) {
      return items.map((r: any) => ({
        rubro_id: r.id ?? r.rubro_id,
        id: r.id ?? r.rubro_id,
        nombre: r.nombre,
        descripcion: r.descripcion
      }))
    }

    return RUBROS_MOCK
  } catch (error) {
    console.warn('Backend de rubros no disponible. Usando mocks.', error)
    return RUBROS_MOCK
  }
}