<script setup lang="ts">
import { ref } from 'vue'
import api from './lib/api'
import Navbar from './components/Navbar.vue'
import SideBar from './components/SideBar.vue'
import Finanzas from './components/views/FinanzasView.vue'
import ProveedoresCompraView from './components/views/ProveedoresCompraView.vue'
import SistemasAdministrativosView from './components/views/SistemasAdministrativosView.vue'
import VentasView from './components/views/VentasView.vue'


const status = ref<string>('sin probar')
const loading = ref(false)

async function pingApi() {
  loading.value = true
  status.value = 'consultando...'
  try {
    const { data } = await api.get('/health')
    status.value = `OK: ${JSON.stringify(data)}`
  } catch (e) {
    status.value = `Error al conectar con la API`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-vh-100 bg-light">
    <!-- Componente de navegación -->
    <Navbar />
    <div class="d-flex">
      <SideBar />
      <div class="flex-grow-1" style="background-color: #E8DCC3;">
        <Finanzas />
      </div>
    </div>
    <!-- Contenido principal / Pruebas de integración -->
    <main class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h1 class="mb-3">El Coralon - ERP</h1>
          <p class="text-body-secondary">Stack: Vite · Vue 3 · Bootstrap 5 · Axios · TypeScript</p>

          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Prueba de Axios</h5>
              <p class="card-text">
                Estado: <span class="badge text-bg-secondary">{{ status }}</span>
              </p>
              <button class="btn btn-primary" :disabled="loading" @click="pingApi">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Probar GET /health
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
