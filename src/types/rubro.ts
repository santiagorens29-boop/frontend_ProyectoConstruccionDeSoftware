export interface Rubro {
  id?: number
  rubro_id: number
  nombre: string
  descripcion?: string
}

export const RUBROS_MOCK: Rubro[] = [
  { rubro_id: 101, id: 101, nombre: 'Áridos y Cementos' },
  { rubro_id: 102, id: 102, nombre: 'Hierros y Mallas' },
  { rubro_id: 103, id: 103, nombre: 'Ladrillos y Bloques' },
  { rubro_id: 104, id: 104, nombre: 'Pinturas y Acabados' }
]

// Tipo para creación de rubro (omite los IDs generados por DB)
export type NuevoRubro = Omit<Rubro, 'id' | 'rubro_id'> & { descripcion: string }


// Rubro tal como lo devuelve /api/scm/rubros/ (siempre trae id y descripcion)
export type RubroAPI = Rubro & { id: number; descripcion: string }
