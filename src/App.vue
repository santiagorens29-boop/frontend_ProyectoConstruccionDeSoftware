<script setup lang="ts">
import { ref, computed } from 'vue'
import Navbar from './components/Navbar.vue'
import SideBar from './components/SideBar.vue'
import ProveedoresView from './views/ProveedoresView.vue'
import ProductosView from './views/ProductosView.vue'

// Estado del módulo general activo (coincide con los botones del Navbar)
const moduloActivo = ref('administrativos')

// Configuración dinámica del Sidebar según el módulo activo
const accionesSidebar = computed(() => {
  if (moduloActivo.value === 'administrativos') {
    return {
      accion1: {
        titulo: 'Catálogo de Productos',
        descripcion: 'Gestión de artículos, precios y stock mínimo'
      },
      accion2: {
        titulo: 'Cargar Stock',
        descripcion: 'Ingreso manual de mercadería a inventario'
      }
    }
  }

  if (moduloActivo.value === 'proveedores') {
    return {
      accion1: {
        titulo: 'Gestión de Proveedores',
        descripcion: 'Alta, consulta y modificación de proveedores'
      },
      accion2: {
        titulo: 'Órdenes de Compra',
        descripcion: 'Consultar y registrar compras a proveedores'
      }
    }
  }

  // Fallback para otros módulos (Finanzas / Ventas)
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

    <!-- Contenedor Principal: Sidebar + Vista activa -->
    <div class="d-flex flex-grow-1">
      <SideBar 
        :accion1="accionesSidebar.accion1" 
        :accion2="accionesSidebar.accion2" 
      />

      <main class="flex-grow-1 p-4">
        <!-- Sistemas Administrativos -> Productos -->
        <ProductosView v-if="moduloActivo === 'administrativos'" />

        <!-- Proveedores y Compra -> Proveedores -->
        <ProveedoresView v-else-if="moduloActivo === 'proveedores'" />
        
        <!-- Vista temporal para módulos no implementados -->
        <div v-else class="text-center py-5">
          <h4 class="text-muted">Módulo en construcción</h4>
          <p class="text-secondary">Seleccione "Sistemas Administrativos" o "Proveedores y Compra".</p>
        </div>
      </main>
    </div>
  </div>
</template>
