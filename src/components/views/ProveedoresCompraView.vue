<template>
  <section class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Proveedores y Compra</h1>
        <p class="text-body-secondary mb-0">Catálogo de proveedores y solicitudes de compra.</p>
      </div>
      <button class="btn btn-primary" type="button">Nuevo proveedor</button>
    </div>

    <div class="card">
      <div class="card-header fw-semibold">Proveedores</div>
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead>
            <tr><th>Razón social</th><th>CUIT</th><th>Homologación</th><th>Desempeño</th><th aria-label="Acciones"></th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Insumos del Sur S.A.</td><td>30-71234567-8</td>
              <td><span class="badge text-bg-success">Homologado</span></td><td><span class="badge text-bg-success">Bueno</span></td>
              <td class="text-end"><button class="btn btn-sm btn-outline-secondary" type="button">Editar</button></td>
            </tr>
            <tr>
              <td>Metalúrgica Andina</td><td>30-70999123-2</td>
              <td><span class="badge text-bg-warning">Documentación pendiente</span></td><td><span class="badge text-bg-secondary">Sin datos</span></td>
              <td class="text-end"><button class="btn btn-sm btn-outline-secondary" type="button">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
