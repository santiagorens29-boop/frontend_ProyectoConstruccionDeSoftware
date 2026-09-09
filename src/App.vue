<script setup lang="ts">
import { ref, computed } from 'vue'
import Navbar from './components/NavBar.vue'
import SideBar from './components/SideBar.vue'
import ProveedoresView from './views/ProveedoresView.vue'

// Estado del módulo general activo
const moduloActivo = ref('proveedores')

// Configuración dinámica del Sidebar según el módulo
const accionesSidebar = computed(() => {
  if (moduloActivo.value === 'proveedores') {
    return {
      accion1: {
        titulo: 'Gestión de Proveedores',
        descripcion: 'Alta, baja y modificación de proveedores'
      },
      accion2: {
        titulo: 'Órdenes de Compra',
        descripcion: 'Consultar y registrar compras a proveedores'
      }
    }
  }

  // Fallback para otros módulos
  return {
    accion1: {
      titulo: 'Cierre contable de período',
      descripcion: 'Ejecutar checklist y cerrar el mes'
    },
    accion2: {
      titulo: 'Registrar pago a proveedor',
      descripcion: 'Cancelar facturas pendientes'
    }
  }
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <!-- Navbar superior -->
    <Navbar 
      :modulo-activo="moduloActivo" 
      @cambiar-modulo="(nuevoModulo) => moduloActivo = nuevoModulo" 
    />

    <!-- Contenedor Principal: Sidebar + Vista -->
    <div class="d-flex flex-grow-1">
      <SideBar 
        :accion1="accionesSidebar.accion1" 
        :accion2="accionesSidebar.accion2" 
      />

      <main class="flex-grow-1 p-4">
        <!-- Renderiza la vista del módulo activo -->
        <ProveedoresView v-if="moduloActivo === 'proveedores'" />
        
        <div v-else class="text-center py-5">
          <h4 class="text-muted">Módulo en construcción</h4>
          <p class="text-secondary">Seleccione "Proveedores y Compra" en la barra superior.</p>
        </div>
      </main>
    </div>
  </div>
</template>
