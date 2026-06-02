<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import DocumentInput from "$lib/components/ui/DocumentInput.svelte";

  let docPrefix = $state("V");
  let docNumber = $state("");
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
        <label for="cedula">Cédula / RIF</label>
        <DocumentInput
          bind:prefix={docPrefix}
          bind:number={docNumber}
        />
      </div>

      <div class="spacer" style="height: 24px;"></div>
      <Button type="submit" variant="primary" style="width: 100%; border: none;">
        Enviar código
      </Button>
    </form>
  </section>
</div>
