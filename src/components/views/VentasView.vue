<template>
  <section class="container-fluid py-4">
    <div class="mb-4">
      <h1 class="h3 mb-1">Ventas</h1>
      <p class="text-body-secondary mb-0">Nueva venta — Caja 1.</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 fw-semibold">
            <span>Ítems</span>
            <input class="form-control form-control-sm" style="max-width: 220px" placeholder="Código de producto" aria-label="Código de producto" />
          </div>
          <div class="table-responsive">
            <table class="table mb-0">
              <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
              <tbody>
                <tr><td>Perfil de aluminio 6 m</td><td>2</td><td>$ 18.500</td><td>$ 37.000</td></tr>
                <tr><td>Tornillo M6 x 20 (caja)</td><td>1</td><td>$ 6.200</td><td>$ 6.200</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-header fw-semibold">Resumen</div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>$ 43.200</span></div>
            <div class="d-flex justify-content-between mb-3"><span>Impuestos</span><span>$ 9.072</span></div>
            <div class="d-flex justify-content-between fw-bold border-top pt-3 mb-3"><span>Total</span><span>$ 52.272</span></div>
            <label class="form-label" for="medio-pago">Método de pago</label>
            <select id="medio-pago" class="form-select mb-3"><option>Tarjeta de débito</option><option>Tarjeta de crédito</option><option>Efectivo</option></select>
            <button class="btn btn-primary w-100" type="button">Finalizar venta</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
