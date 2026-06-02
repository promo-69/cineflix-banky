<script lang="ts">
</script>

<div class="app login-app">
  <header class="login-hero">
    <a href="/login" style="color: #fff; text-decoration: none; margin-bottom: 24px; display: inline-block;">&larr; Volver al login</a>
    <h1>Recuperar Contraseña</h1>
    <p>Ingresa tu cédula y enviaremos un código de recuperación a tu teléfono.</p>
  </header>

  <section class="login-card">
    <form>
      <div class="field">
        <label for="cedula">Cédula</label>
        <div class="input-wrap">
          <input id="cedula" type="text" class="input" placeholder="V-12345678" />
        </div>
      </div>
      <button type="button" class="btn primary" style="width: 100%; border: none;">Enviar código</button>
    </form>
  </section>
</div>
