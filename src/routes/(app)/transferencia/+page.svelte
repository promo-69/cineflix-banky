<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { goto } from '$app/navigation';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import StatusModal from '$lib/components/StatusModal.svelte';

  let { data, form }: { data: PageData, form: ActionData } = $props();

  let currentTab = $state(data.tab || 'transferencia');

  // Transferencia state
  let destinationDocument = $state('');
  let destinationAccount = $state('');
  let amount = $state('');
  let loading = $state(false);

  let isDocValid = $derived(/^V-\d{1,2}\.\d{3}\.\d{3}$/.test(destinationDocument) || /^[VEJGP]-\d{8,9}$/.test(destinationDocument));
  let isAccountValid = $derived(/^\d{20}$/.test(destinationAccount));
  let isAmountValid = $derived(Number(amount) > 0 && Number(amount) <= data.balance);
  let canSubmit = $derived(isDocValid && isAccountValid && isAmountValid && amount !== '');

  // Pago Móvil state
  let pmDocument = $state('');
  let pmPhone = $state('');
  let pmBankCode = $state('0102');
  let pmAmount = $state('');
  let pmLoading = $state(false);

  let isPmDocValid = $derived(/^V-\d{1,2}\.\d{3}\.\d{3}$/.test(pmDocument) || /^[VEJGP]-\d{8,9}$/.test(pmDocument));
  let isPmPhoneValid = $derived(/^04(14|24|12|16|26)-?\d{7}$/.test(pmPhone) || /^\d{11}$/.test(pmPhone));
  let isPmAmountValid = $derived(Number(pmAmount) > 0 && Number(pmAmount) <= data.balance);
  let canSubmitPm = $derived(isPmDocValid && isPmPhoneValid && pmBankCode !== '' && isPmAmountValid && pmAmount !== '');

  // Modals state
  let showConfirm = $state(false);
  let showStatus = $state(false);
  let statusType = $state<'success' | 'error'>('success');
  let statusTitle = $state('');
  let statusMessage = $state('');
  let receiptData = $state<any>(null);
  let pendingSubmit = $state<(() => void) | null>(null);
  let redirectUrl = $state<string | null>(null);

  let submitTransferBtn: HTMLButtonElement;
  let submitPmBtn: HTMLButtonElement;

  function confirmAction(action: () => void) {
    pendingSubmit = () => action();
    showConfirm = true;
  }
</script>

<div class="app">
  <header class="appbar" data-od-id="transfer-appbar">
    <a class="back-btn" href="/dashboard" aria-label="Volver">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </a>
    <h1>{currentTab === 'transferencia' ? 'Transferencia' : 'Pago Móvil'}</h1>
  </header>

  <div class="page-content" style="padding: 20px;">
    
    <div class="segmented" style="margin-bottom: 24px;">
      <button class:active={currentTab === 'transferencia'} onclick={() => currentTab = 'transferencia'}>Transferencia</button>
      <button class:active={currentTab === 'pago_movil'} onclick={() => currentTab = 'pago_movil'}>Pago Móvil</button>
    </div>

    {#if form?.error}
      <div style="background: var(--danger); color: white; padding: 12px; border-radius: var(--r-md); margin-bottom: 20px;">
        {form.error}
      </div>
    {/if}

    {#if currentTab === 'transferencia'}
      <form method="POST" action="?/transfer" use:enhance={() => { 
        loading = true; 
        return async ({ update, result }) => { 
          loading = false;
          if (result.type === 'failure') {
            statusType = 'error';
            statusTitle = 'Error';
            statusMessage = result.data?.error || 'Ha ocurrido un error procesando la transferencia';
            showStatus = true;
            await update();
          } else if (result.type === 'success') {
            statusType = 'success';
            statusTitle = '¡Éxito!';
            statusMessage = 'La transferencia ha sido realizada correctamente.';
            receiptData = result.data?.transaction;
            showStatus = true;
            redirectUrl = '/dashboard?success=transfer';
          } else if (result.type === 'redirect') {
            redirectUrl = result.location;
            goto(redirectUrl);
          }
        }; 
      }}>
        
        <div class="field">
          <label for="destination_document">Cédula / RIF del Destinatario</label>
          <div class="input-wrap">
            <input type="text" id="destination_document" name="destination_document" class="input" bind:value={destinationDocument} placeholder="V-12345678" />
          </div>
          {#if destinationDocument && !isDocValid}
            <div style="color: var(--danger); font-size: 11px; margin-top: 4px;">Formato inválido (Ej: V-12345678)</div>
          {/if}
        </div>

        <div class="field">
          <label for="destination_account">Cuenta Destino (20 dígitos)</label>
          <div class="input-wrap">
            <input type="text" id="destination_account" name="destination_account" class="input mono" bind:value={destinationAccount} placeholder="01020000000000000000" maxlength="20" />
          </div>
          {#if destinationAccount && !isAccountValid}
            <div style="color: var(--danger); font-size: 11px; margin-top: 4px;">Debe contener exactamente 20 dígitos numéricos</div>
          {/if}
        </div>

        <div class="field">
          <label for="amount">Monto (Bs.)</label>
          <div class="input-wrap">
            <input type="number" step="0.01" id="amount" name="amount" class="input mono" bind:value={amount} placeholder="0.00" />
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; color: var(--muted);">
            <span>Disponible: Bs. {data.balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
            {#if amount && !isAmountValid}
               <span style="color: var(--danger);">Monto inválido o insuficiente</span>
            {/if}
          </div>
        </div>

        <div class="spacer" style="height: 30px;"></div>

        <button type="button" class="btn primary" disabled={!canSubmit || loading} style="width: 100%; border: none;" onclick={() => confirmAction(() => submitTransferBtn.click())}>
          {loading ? 'Procesando...' : 'Transferir'}
        </button>
        <button type="submit" bind:this={submitTransferBtn} style="display: none;"></button>

      </form>
    {:else}
      <form method="POST" action="?/mobilePayment" use:enhance={() => { 
        pmLoading = true; 
        return async ({ update, result }) => { 
          pmLoading = false;
          if (result.type === 'failure') {
            statusType = 'error';
            statusTitle = 'Error';
            statusMessage = result.data?.error || 'Ha ocurrido un error procesando el pago móvil';
            showStatus = true;
            await update();
          } else if (result.type === 'success') {
            statusType = 'success';
            statusTitle = '¡Éxito!';
            statusMessage = 'El pago móvil ha sido realizado correctamente.';
            receiptData = result.data?.transaction;
            showStatus = true;
            redirectUrl = '/dashboard?success=mobile_payment';
          } else if (result.type === 'redirect') {
            redirectUrl = result.location;
            goto(redirectUrl);
          }
        }; 
      }}>
        
        <div class="field">
          <label for="bank_code">Banco Destino</label>
          <div class="input-wrap">
            <select id="bank_code" name="bank_code" class="input" bind:value={pmBankCode}>
              <option value="0102">0102 - Banky</option>
              <option value="0105">0105 - Mercantil</option>
              <option value="0108">0108 - Provincial</option>
              <option value="0134">0134 - Banesco</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="destination_phone">Teléfono Móvil</label>
          <div class="input-wrap">
            <input type="tel" id="destination_phone" name="destination_phone" class="input mono" bind:value={pmPhone} placeholder="04141234567" />
          </div>
          {#if pmPhone && !isPmPhoneValid}
            <div style="color: var(--danger); font-size: 11px; margin-top: 4px;">Formato inválido (Ej: 04141234567)</div>
          {/if}
        </div>

        <div class="field">
          <label for="destination_document_pm">Cédula / RIF del Destinatario</label>
          <div class="input-wrap">
            <input type="text" id="destination_document_pm" name="destination_document" class="input" bind:value={pmDocument} placeholder="V-12345678" />
          </div>
          {#if pmDocument && !isPmDocValid}
            <div style="color: var(--danger); font-size: 11px; margin-top: 4px;">Formato inválido (Ej: V-12345678)</div>
          {/if}
        </div>

        <div class="field">
          <label for="amount_pm">Monto (Bs.)</label>
          <div class="input-wrap">
            <input type="number" step="0.01" id="amount_pm" name="amount" class="input mono" bind:value={pmAmount} placeholder="0.00" />
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; color: var(--muted);">
            <span>Disponible: Bs. {data.balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
            {#if pmAmount && !isPmAmountValid}
               <span style="color: var(--danger);">Monto inválido o insuficiente</span>
            {/if}
          </div>
        </div>

        <div class="spacer" style="height: 30px;"></div>

        <button type="button" class="btn primary" disabled={!canSubmitPm || pmLoading} style="width: 100%; border: none;" onclick={() => confirmAction(() => submitPmBtn.click())}>
          {pmLoading ? 'Procesando...' : 'Pagar'}
        </button>
        <button type="submit" bind:this={submitPmBtn} style="display: none;"></button>

      </form>
    {/if}
  </div>
</div>

<ConfirmModal 
  bind:open={showConfirm} 
  title="Confirmar Transacción" 
  message="¿Estás seguro de que deseas procesar esta transacción? Esta acción debitará dinero de tu cuenta y no puede deshacerse." 
  onConfirm={() => { if (pendingSubmit) pendingSubmit(); }} 
/>

<StatusModal 
  bind:open={showStatus} 
  type={statusType} 
  title={statusTitle} 
  message={statusMessage} 
  receipt={receiptData}
  onClose={() => { 
    if (statusType === 'success' && redirectUrl) {
      goto(redirectUrl);
    }
  }} 
/>
