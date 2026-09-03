<template>
  <section class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Sistemas Administrativos</h1>
        <p class="text-body-secondary mb-0">Inventario y movimientos por depósito.</p>
      </div>
      <div class="input-group" style="max-width: 300px">
        <input class="form-control" type="search" placeholder="Buscar producto" aria-label="Buscar producto" />
        <button class="btn btn-outline-secondary" type="button">Buscar</button>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header fw-semibold">Stock actual</div>
      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead>
            <tr><th>Producto</th><th>Depósito</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr><td>Perfil de aluminio 6 m</td><td>Depósito Central</td><td>42</td><td>20</td><td><span class="badge text-bg-success">Normal</span></td></tr>
            <tr><td>Tornillo M6 x 20</td><td>Depósito Central</td><td>8</td><td>15</td><td><span class="badge text-bg-danger">Bajo mínimo</span></td></tr>
            <tr><td>Chapa galvanizada 1 m²</td><td>Sucursal Norte</td><td>130</td><td>50</td><td><span class="badge text-bg-success">Normal</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <button class="btn btn-primary" type="button">Solicitar reposición</button>
  </section>
</template>
