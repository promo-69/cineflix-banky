<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();

  let firstName = $state("");
  let lastName = $state("");
  let documentId = $state("");
  let phonePrefix = $state("0414");
  let phoneNumber = $state("");
  let email = $state("");
  let password = $state("");
  let loading = $state(false);

  // Validaciones en tiempo real
  let isFirstNameValid = $derived(firstName.length >= 2);
  let isLastNameValid = $derived(lastName.length >= 2);
  let isDocumentValid = $derived(
    /^V-\d{1,2}\.\d{3}\.\d{3}$/.test(documentId) ||
      /^[VEJGP]-\d{8,9}$/.test(documentId),
  );
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

  function getValidationClass(value: string, isValid: boolean) {
    if (!value) return "";
    return isValid ? "is-valid" : "is-invalid";
  }
</script>

<div class="app login-app">
  <header class="login-hero">
    <div class="brand-mark">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path
          d="M2 12l10 5 10-5"
        /></svg
      >
    </div>
    <h1>Únete a Banky</h1>
    <p>Abre tu cuenta satélite en minutos y gestiona tus pagos al instante.</p>
  </header>

  <div class="login-card">
    {#if form?.error}
      <div
        style="background: var(--danger); color: white; padding: 12px; border-radius: var(--r-md); margin-bottom: 20px; font-size: 14px;"
      >
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
      <div class="form-row">
        <div class="field">
          <label for="first_name">Nombres</label>
          <input
            id="first_name"
            name="first_name"
            class="input {getValidationClass(firstName, isFirstNameValid)}"
            type="text"
            placeholder="Ej. Carlos"
            bind:value={firstName}
          />
        </div>
        <div class="field">
          <label for="last_name">Apellidos</label>
          <input
            id="last_name"
            name="last_name"
            class="input {getValidationClass(lastName, isLastNameValid)}"
            type="text"
            placeholder="Ej. Pérez"
            bind:value={lastName}
          />
        </div>
      </div>

      <div class="field">
        <label for="document_id">Cédula de Identidad / RIF</label>
        <div class="input-wrap">
          <span
            class="icon"
            aria-hidden="true"
            style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted-2);"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
              /><line x1="8" y1="2" x2="8" y2="6" /><line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
              /><path d="M9 16l2 2 4-4" /></svg
            >
          </span>
          <input
            id="document_id"
            name="document_id"
            class="input with-icon {getValidationClass(
              documentId,
              isDocumentValid,
            )}"
            type="text"
            placeholder="V-12345678"
            style="font-family: var(--font-mono); padding-left: 40px;"
            bind:value={documentId}
          />
        </div>
      </div>

      <div class="field">
        <label for="phone">Teléfono celular</label>
        <div class="form-row" style="gap: 8px;">
          <select
            name="phone_prefix"
            class="input"
            style="font-family: var(--font-mono); width: 85px; flex-shrink: 0; padding: 0 8px;"
            bind:value={phonePrefix}
          >
            <option>0414</option>
            <option>0424</option>
            <option>0412</option>
            <option>0416</option>
            <option>0426</option>
          </select>
          <input
            id="phone"
            name="phone_number"
            class="input {getValidationClass(phoneNumber, isPhoneValid)}"
            type="tel"
            placeholder="1234567"
            style="font-family: var(--font-mono); letter-spacing: 0.06em; flex: 1;"
            bind:value={phoneNumber}
            maxlength="7"
          />
        </div>
      </div>

      <div class="field">
        <label for="email">Correo electrónico</label>
        <div class="input-wrap">
          <span
            class="icon"
            aria-hidden="true"
            style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted-2);"
          >
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
              /><polyline points="22,6 12,13 2,6" /></svg
            >
          </span>
          <input
            id="email"
            name="email"
            class="input with-icon {getValidationClass(email, isEmailValid)}"
            type="email"
            placeholder="correo@ejemplo.com"
            style="padding-left: 40px;"
            bind:value={email}
          />
        </div>
      </div>

      <div class="field">
        <label for="pwd">Contraseña segura</label>
        <div class="input-wrap">
          <span
            class="icon"
            aria-hidden="true"
            style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted-2);"
          >
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
              /></svg
            >
          </span>
          <input
            id="pwd"
            name="password"
            class="input with-icon {getValidationClass(
              password,
              isPasswordValid,
            )}"
            type="password"
            placeholder="Mínimo 8 caracteres"
            style="padding-left: 40px;"
            bind:value={password}
          />
        </div>
      </div>

      <div class="spacer"></div>
      <button
        class="btn primary"
        type="submit"
        style="width: 100%; border: none;"
        disabled={!canSubmit || loading}
      >
        {loading ? "Procesando..." : "Registrarme"}
      </button>

      <div class="helper-row">
        <span>¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a></span>
      </div>
    </form>
  </div>
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
    margin-bottom: 24px;
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
    padding: 24px 20px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  }
  .form-row {
    display: flex;
    gap: 12px;
  }
  .form-row .field {
    flex: 1;
  }
  .spacer {
    height: 24px;
  }
  .helper-row {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    margin-top: 24px;
  }
  .helper-row a {
    color: var(--brand-core);
    text-decoration: none;
    font-weight: 500;
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
