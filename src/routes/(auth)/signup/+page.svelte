<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import DocumentInput from "$lib/components/ui/DocumentInput.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import AlertMessage from "$lib/components/ui/AlertMessage.svelte";

  let { form }: { form: ActionData } = $props();

  let firstName = $state("");
  let lastName = $state("");
  let docPrefix = $state("V");
  let docNumber = $state("");
  let phonePrefix = $state("0414");
  let phoneNumber = $state("");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);

  // Validaciones en tiempo real
  let isFirstNameValid = $derived(firstName.length >= 2);
  let isLastNameValid = $derived(lastName.length >= 2);
  let isDocumentValid = $derived(/^\d{7,9}$/.test(docNumber));

  let isPhoneValid = $derived(/^\d{7}$/.test(phoneNumber));
  let isEmailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  let isPasswordValid = $derived(password.length >= 8);

  let canSubmit = $derived(
    isFirstNameValid &&
      isLastNameValid &&
      isDocumentValid &&
      isPhoneValid &&
      isEmailValid &&
      isPasswordValid,
  );
</script>

<div class="app auth-app">
  <header class="auth-hero">
    <div class="brand-mark light">
      <span class="glyph" aria-hidden="true"></span>
      <span class="word">banky</span>
    </div>
    <h1>Únete a Banky</h1>
    <p>Abre tu cuenta satélite en minutos y gestiona tus pagos al instante.</p>
  </header>

  <section class="auth-card">
    <AlertMessage {form} />

    <form
      method="POST"
      action="?/register"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          await update();
          loading = false;
        };
      }}
    >
      <div class="form-row">
        <div class="field">
          <label for="first_name">Nombres</label>
          <Input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Ej. Carlos"
            bind:value={firstName}
            restrict="alpha"
            isValid={firstName ? isFirstNameValid : undefined}
          />
        </div>
        <div class="field">
          <label for="last_name">Apellidos</label>
          <Input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Ej. Pérez"
            bind:value={lastName}
            restrict="alpha"
            isValid={lastName ? isLastNameValid : undefined}
          />
        </div>
      </div>

      <div class="field">
        <label for="doc_number">Cédula de Identidad / RIF</label>
        <DocumentInput
          bind:prefix={docPrefix}
          bind:number={docNumber}
          isValid={docNumber ? isDocumentValid : undefined}
        />
      </div>

      <div class="field">
        <label for="phone">Teléfono celular</label>
        <div class="form-row" style="display: flex; align-items: center; gap: 8px;">
          <Select
            name="phone_prefix"
            style="font-family: var(--font-mono); width: 85px; flex-shrink: 0;"
            bind:value={phonePrefix}
          >
            <option>0414</option>
            <option>0424</option>
            <option>0412</option>
            <option>0416</option>
            <option>0426</option>
          </Select>
          <Input
            id="phone"
            name="phone_number"
            type="tel"
            placeholder="1234567"
            style="font-family: var(--font-mono); letter-spacing: 0.06em; flex: 1;"
            bind:value={phoneNumber}
            restrict="phone"
            maxlength={7}
            isValid={phoneNumber ? isPhoneValid : undefined}
          />
        </div>
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          bind:value={email}
          isValid={email ? isEmailValid : undefined}
        >
          {#snippet icon()}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              /><polyline points="22,6 12,13 2,6" /></svg>
          {/snippet}
        </Input>
      </div>

      <div class="field">
        <label for="pwd">Contraseña segura</label>
        <Input
          id="pwd"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          bind:value={password}
          isValid={password ? isPasswordValid : undefined}
        >
          {#snippet icon()}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
                d="M7 11V7a5 5 0 0 1 10 0v4"
              /></svg>
          {/snippet}
        </Input>
      </div>

      <div class="spacer"></div>
      <Button
        type="submit"
        variant="primary"
        disabled={!canSubmit}
        {loading}
        loadingText="Procesando..."
        style="width: 100%; border: none;"
      >
        Registrarme
      </Button>
    </form>
  </section>
  
  <div class="auth-foot">
    ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
  </div>
</div>

<style>
  .form-row {
    display: flex;
    gap: 12px;
  }
  .form-row .field {
    flex: 1;
  }
  /* Estado de error/éxito visual */
  :global(.input.is-valid) {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }
  :global(.input.is-invalid) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
</style>
