<template>
  <section class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Cierre contable de período</h1>
        <p class="text-body-secondary mb-0">Contabilidad General — Agosto 2026</p>
      </div>
      <button class="btn btn-primary" type="button">Ejecutar cierre</button>
    </div>

    <div class="card mb-4">
      <div class="card-header fw-semibold">Checklist de precierre</div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Partida doble global
          <span class="badge text-bg-success">OK</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Conciliación de cuentas
          <span class="badge text-bg-warning">Revisar</span>
        </li>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          Asientos en borrador
          <span class="badge text-bg-success">OK</span>
        </li>
      </ul>
    </div>

    <div class="card">
      <div class="card-header fw-semibold">Legajo de cierre</div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr><th>Documento</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr><td>Balance de sumas y saldos</td><td><span class="badge text-bg-secondary">Pendiente</span></td></tr>
            <tr><td>Libro Diario</td><td><span class="badge text-bg-secondary">Pendiente</span></td></tr>
            <tr><td>Estados contables</td><td><span class="badge text-bg-secondary">Pendiente</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
