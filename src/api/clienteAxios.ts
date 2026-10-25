import axios from 'axios'

const clienteAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000
})

clienteAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

clienteAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        localStorage.removeItem('access_token')
        window.location.href = '/'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          { refresh }
        )
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        original.headers.Authorization = `Bearer ${data.access}`
        return clienteAxios(original)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default clienteAxios
