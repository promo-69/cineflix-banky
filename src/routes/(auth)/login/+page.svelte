<script lang="ts">
  import { enhance } from "$app/forms";
  import Button from "$lib/components/ui/Button.svelte";
  import DocumentInput from "$lib/components/ui/DocumentInput.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import AlertMessage from "$lib/components/ui/AlertMessage.svelte";

  let docPrefix = $state("V");
  let docNumber = $state("");
  let password = $state("");
  let loading = $state(false);

  // Validación básica de números (7 a 9 dígitos)
  let isCedulaValid = $derived(/^\d{7,9}$/.test(docNumber));
  let canSubmit = $derived(docNumber.length > 0 && password.length > 0 && isCedulaValid);

  let { form } = $props();
</script>

<div class="app auth-app">
  <header class="auth-hero" data-od-id="login-hero">
    <div class="brand-mark light">
      <span class="glyph" aria-hidden="true"></span>
      <span class="word">banky</span>
    </div>
    <h1>Bienvenido de vuelta</h1>
    <p>
      Tu banca en línea, segura y diseñada para que solo te tome unos segundos.
    </p>
  </header>

  <section class="auth-card" data-od-id="login-form">
    <h2>Inicia sesión</h2>

    <AlertMessage {form} />

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
        <label for="doc_number">Cédula de Identidad / RIF</label>
        <DocumentInput
          bind:prefix={docPrefix}
          bind:number={docNumber}
        />
        {#if docNumber && !isCedulaValid}
          <span
            style="color: var(--danger); font-size: 11px; margin-top: 4px; display: block;"
            >Formato numérico inválido</span
          >
        {/if}
      </div>

      <div class="field">
        <label for="pwd">Contraseña</label>
        <Input
          id="pwd"
          name="password"
          type="password"
          bind:value={password}
          placeholder="••••••••••"
          autocomplete="current-password"
        >
          {#snippet icon()}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="width: 16px; height: 16px;"
              ><rect x="4" y="11" width="16" height="10" rx="2" /><path
                d="M8 11V8a4 4 0 0 1 8 0v3"
              /></svg>
          {/snippet}
        </Input>
      </div>

      <div class="helper-row">
        <label class="check">
          <input type="checkbox" checked />
          Recordar mi cédula
        </label>
        <a href="/recuperar">Olvidé mi contraseña</a>
      </div>

      <div class="spacer"></div>
      
      <Button
        type="submit"
        variant="primary"
        disabled={!canSubmit}
        {loading}
        loadingText="Cargando..."
        style="width: 100%; border: none;"
      >
        Entrar
      </Button>
    </form>
  </section>

  <div class="auth-foot">
    ¿Aún no tienes cuenta? <a href="/signup">Ábrela aquí</a>
  </div>

  <p class="auth-legal">
    Banky, C.A. — Institución Bancaria autorizada por la SUDEBAN.<br />
    Tu sesión está protegida por cifrado TLS 1.3.
  </p>
</div>

<style>
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
</style>
