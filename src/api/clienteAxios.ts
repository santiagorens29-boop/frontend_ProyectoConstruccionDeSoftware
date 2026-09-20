import axios from 'axios'

// Instancia base de Axios
// Al usar baseURL: '/api', las peticiones se dirigen de forma relativa al mismo servidor
const clienteAxios = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000 // Tiempo límite de espera de 10 segundos
})

export default clienteAxios