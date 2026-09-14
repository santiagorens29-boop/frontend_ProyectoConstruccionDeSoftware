<script setup lang="ts">
import { ref, computed } from 'vue'
import Navbar from './components/Navbar.vue'
import SideBar from './components/SideBar.vue'
import ProveedoresView from './views/ProveedoresView.vue'
import ProductosView from './views/ProductosView.vue'
import ClientesView from './views/ClientesView.vue'
import FinanzasFacturacionView from './views/FinanzasFacturacionView.vue'
import FinanzasCierreView from './views/FinanzasCierreView.vue'

// Estado del módulo general activo (coincide con los botones del Navbar)
const moduloActivo = ref('finanzas')

// Estado de la sub-acción activa dentro del módulo seleccionado (Sidebar)
const subVistaActiva = ref<'opcion1' | 'opcion2'>('opcion1')

function cambiarModulo(nuevoModulo: string) {
  moduloActivo.value = nuevoModulo
  subVistaActiva.value = 'opcion1'
}

// Configuración dinámica del Sidebar según el módulo activo
const accionesSidebar = computed(() => {
  if (moduloActivo.value === 'finanzas') {
    return {
      accion1: {
        titulo: 'Facturar Órdenes',
        descripcion: 'Emisión de comprobantes contables'
      },
      accion2: {
        titulo: 'Cierre y Libro Diario',
        descripcion: 'Cierre mensual y asientos contables'
      }
    }
  }

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

  if (moduloActivo.value === 'ventas') {
    return {
      accion1: {
        titulo: 'ABM de clientes',
        descripcion: 'Alta, baja y modificación'
      },
      accion2: {
        titulo: 'Registrar venta / Nueva factura',
        descripcion: 'Buscar cliente por CUIL y facturar'
      }
    }
  }

  return {
    accion1: {
      titulo: 'Acción Principal',
      descripcion: 'Detalle de la acción'
    },
    accion2: {
      titulo: 'Acción Secundaria',
      descripcion: 'Detalle de la acción secundaria'
    }
  }
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <Navbar
      :modulo-activo="moduloActivo"
      @cambiar-modulo="cambiarModulo"
    />

    <div class="d-flex flex-grow-1">
      <SideBar
        :accion1="accionesSidebar.accion1"
        :accion2="accionesSidebar.accion2"
        :sub-vista-activa="subVistaActiva"
        @seleccionar-accion="(opcion) => subVistaActiva = opcion"
      />
      
      <main class="flex-grow-1 p-4">
        <!-- Módulo Finanzas -->
        <template v-if="moduloActivo === 'finanzas'">
          <FinanzasFacturacionView v-if="subVistaActiva === 'opcion1'" />
          <FinanzasCierreView v-else />
        </template>

        <!-- Módulo Sistemas Administrativos -->
        <template v-else-if="moduloActivo === 'administrativos'">
          <ProductosView v-if="subVistaActiva === 'opcion1'" />
          <div v-else class="text-center py-5">
            <h4 class="text-muted">Cargar Stock en Construcción</h4>
          </div>
        </template>

        <!-- Módulo Proveedores y Compra -->
        <template v-else-if="moduloActivo === 'proveedores'">
          <ProveedoresView v-if="subVistaActiva === 'opcion1'" />
          <div v-else class="text-center py-5">
            <h4 class="text-muted">Órdenes de Compra en Construcción</h4>
          </div>
        </template>

        <!-- Módulo Ventas / Clientes -->
        <template v-else-if="moduloActivo === 'ventas'">
          <ClientesView v-if="subVistaActiva === 'opcion1'" />
          <div v-else class="text-center py-5">
            <h4 class="text-muted">Órdenes de Venta en Construcción</h4>
          </div>
        </template>

        <!-- Fallback -->
        <div v-else class="text-center py-5">
          <h4 class="text-muted">Módulo en construcción</h4>
        </div>
      </main>
    </div>
  </div>
</template>