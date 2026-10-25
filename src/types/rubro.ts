// Contrato de datos para Rubro (endpoint /api/scm/rubros/)
export interface Rubro {
  id: number
  nombre: string
  descripcion: string
}

// Tipo para creación de rubro (omite ID generado por DB)
export type NuevoRubro = Omit<Rubro, 'id'>
