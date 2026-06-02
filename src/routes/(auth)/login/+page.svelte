<script lang="ts">
  import { enhance } from "$app/forms";

  let cedula = $state("");
  let password = $state("");
  let loading = $state(false);

  // Validación básica de cédula venezolana (V-12.345.678 o V-12345678)
  let isCedulaValid = $derived(
    /^V-\d{1,2}\.\d{3}\.\d{3}$/.test(cedula) ||
      /^[VEJGP]-\d{8,9}$/.test(cedula),
  );
  let canSubmit = $derived(cedula.length > 0 && password.length > 0);

  let { form } = $props();
</script>

<div class="app login-app">
  <header class="login-hero" data-od-id="login-hero">
    <div class="brand-mark light">
      <span class="glyph" aria-hidden="true"></span>
      <span class="word">banky</span>
    </div>
    <h1>Bienvenido de vuelta</h1>
    <p>
      Tu banca en línea, segura y diseñada para que solo te tome unos segundos.
    </p>
  </header>

  <section class="login-card" data-od-id="login-form">
    <h2>Inicia sesión</h2>

    {#if form?.error}
      <div style="color: var(--danger); font-size: 13px; margin-bottom: 12px;">
        {form.error}
      </div>
    {/if}

    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
    >
      <div class="field">
        <label for="cedula">Cédula</label>
        <div class="input-wrap">
          <span class="lead-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><rect x="3" y="5" width="18" height="14" rx="2" /><circle
                cx="9"
                cy="12"
                r="2.5"
              /><path d="M14 10h4M14 14h3" /></svg
            >
          </span>
          <input
            id="cedula"
            name="cedula"
            class="input with-icon"
            type="text"
            bind:value={cedula}
            placeholder="V-12345678"
            autocomplete="username"
          />
        </div>
        {#if cedula && !isCedulaValid}
          <span
            style="color: var(--danger); font-size: 11px; margin-top: 4px; display: block;"
            >Formato inválido. Use V-12345678</span
          >
        {/if}
      </div>

      <div class="field">
        <label for="pwd">Contraseña</label>
        <div class="input-wrap">
          <span class="lead-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><rect x="4" y="11" width="16" height="10" rx="2" /><path
                d="M8 11V8a4 4 0 0 1 8 0v3"
              /></svg
            >
          </span>
          <input
            id="pwd"
            name="password"
            class="input with-icon"
            type="password"
            bind:value={password}
            placeholder="••••••••••"
            autocomplete="current-password"
          />
        </div>
      </div>

      <div class="helper-row">
        <label class="check">
          <input type="checkbox" checked />
          Recordar mi cédula
        </label>
        <a href="/recuperar">Olvidé mi contraseña</a>
      </div>

      <div class="spacer"></div>
      <button
        type="submit"
        class="btn primary"
        disabled={!canSubmit || loading}
        style="width: 100%; border: none;"
      >
        {loading ? "Cargando..." : "Entrar"}
      </button>
    </form>
  </section>

  <div class="signup-foot">
    ¿Aún no tienes cuenta? <a href="/signup">Ábrela aquí</a>
  </div>

  <p class="legal">
    Banky, C.A. — Institución Bancaria autorizada por la SUDEBAN.<br />
    Tu sesión está protegida por cifrado TLS 1.3.
  </p>
</div>

<style>
  .login-app {
    background: linear-gradient(
      180deg,
      var(--brand-core) 0%,
      var(--brand-deep) 280px,
      var(--bg) 280px
    );
  }
  .login-hero {
    color: #fff;
    padding: 48px 24px 24px;
    text-align: left;
  }
  .login-hero .brand-mark {
    margin-bottom: 28px;
  }
  .login-hero h1 {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0 0 6px;
  }
  .login-hero p {
    font-size: 14px;
    opacity: 0.8;
    margin: 0;
    max-width: 280px;
  }
  .login-card {
    margin: 0 20px;
    background: var(--surface);
    border-radius: var(--r-xl);
    padding: 24px 22px;
    box-shadow:
      0 1px 2px rgba(4, 50, 99, 0.04),
      0 12px 36px -12px rgba(4, 50, 99, 0.18);
  }
  .login-card h2 {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    margin: 0 0 18px;
    color: var(--brand-deep);
  }
  .helper-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
  }
  .helper-row .check {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
  }
  .helper-row .check input {
    width: 16px;
    height: 16px;
    accent-color: var(--brand-core);
  }
  .helper-row a {
    color: var(--brand-medium);
    font-size: 13px;
    text-decoration: none;
    font-weight: 500;
  }
  .signup-foot {
    text-align: center;
    padding: 24px 20px 32px;
    color: var(--muted);
    font-size: 13px;
  }
  .signup-foot a {
    color: var(--brand-medium);
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
  }
  .legal {
    text-align: center;
    color: var(--muted-2);
    font-size: 11px;
    padding: 0 24px 24px;
  }
</style>
