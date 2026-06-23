<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import DocumentInput from '$lib/components/ui/DocumentInput.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import StatusModal from '$lib/components/StatusModal.svelte';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let currentTab = $state((data as any).tab || 'transferencia');

	// Transferencia state
	let docPrefix = $state('V');
	let docNumber = $state('');
	let destinationAccount = $state('');
	let amountStr = $state('');
	let loading = $state(false);

	let isDocValid = $derived(/^\d{7,9}$/.test(docNumber));
	let isAccountValid = $derived(/^\d{20}$/.test(destinationAccount));
	let isAmountValid = $derived(Number(amountStr) > 0 && Number(amountStr) <= data.balance);
	let canSubmit = $derived(isDocValid && isAccountValid && isAmountValid && amountStr !== '');

	// Pago Móvil state
	let pmDocPrefix = $state('V');
	let pmDocNumber = $state('');
	let pmPhone = $state('');
	let pmBankCode = $state('0201');
	let pmAmountStr = $state('');
	let pmLoading = $state(false);

	let isPmDocValid = $derived(/^\d{7,9}$/.test(pmDocNumber));
	let isPmPhoneValid = $derived(/^04(14|24|12|16|26)-?\d{7}$/.test(pmPhone) || /^\d{11}$/.test(pmPhone));
	let isPmAmountValid = $derived(Number(pmAmountStr) > 0 && Number(pmAmountStr) <= data.balance);
	let canSubmitPm = $derived(
		isPmDocValid && isPmPhoneValid && pmBankCode !== '' && isPmAmountValid && pmAmountStr !== '',
	);

	// Modals state
	let showConfirm = $state(false);
	let showStatus = $state(false);
	let statusType = $state<'success' | 'error'>('success');
	let statusTitle = $state('');
	let statusMessage = $state('');
	let receiptData = $state<any>(null);
	let pendingSubmit = $state<(() => void) | null>(null);
	let redirectUrl = $state<string | null>(null);

	// Contact Selection
	let transferEntryMode = $state<'manual' | 'contact'>('manual');
	let selectedAccountId = $state('');

	let pmEntryMode = $state<'manual' | 'contact'>('manual');
	let selectedMobileId = $state('');

	// Automatically update fields when a contact is selected
	$effect(() => {
		if (transferEntryMode === 'contact' && selectedAccountId) {
			const contact = data.accounts.find((a) => a.id.toString() === selectedAccountId);
			if (contact) {
				destinationAccount = contact.account_number;
				const parts = contact.document_id.split('-');
				if (parts.length === 2) {
					docPrefix = parts[0];
					docNumber = parts[1];
				} else {
					docNumber = contact.document_id;
				}
			}
		}
	});

	$effect(() => {
		if (pmEntryMode === 'contact' && selectedMobileId) {
			const contact = data.mobilePayments.find((m) => m.id.toString() === selectedMobileId);
			if (contact) {
				pmPhone = contact.phone_number;
				pmBankCode = contact.bank_code;
				const parts = contact.document_id.split('-');
				if (parts.length === 2) {
					pmDocPrefix = parts[0];
					pmDocNumber = parts[1];
				} else {
					pmDocNumber = contact.document_id;
				}
			}
		}
	});

	let submitTransferBtn: HTMLButtonElement;
	let submitPmBtn: HTMLButtonElement;

	function confirmAction(action: () => void) {
		pendingSubmit = () => action();
		showConfirm = true;
	}
</script>

<svelte:head>
	<title>{data.appName} | Transferencias</title>
</svelte:head>

<header class="appbar" data-od-id="transfer-appbar">
	<a class="back-btn" href="/dashboard" aria-label="Volver">
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
		>
	</a>
	<h1>{currentTab === 'transferencia' ? 'Transferencia' : 'Pago Móvil'}</h1>
</header>

<div class="page-content general-margin">
	<div class="segmented">
		<button class:active={currentTab === 'transferencia'} onclick={() => (currentTab = 'transferencia')}
			>Transferencia</button
		>
		<button class:active={currentTab === 'pago_movil'} onclick={() => (currentTab = 'pago_movil')}
			>Pago Móvil</button
		>
	</div>

	<AlertMessage {form} />

	{#if currentTab === 'transferencia'}
		<div class="form-card card">
			<form
				method="POST"
				action="?/transfer"
				use:enhance={() => {
					loading = true;
					return async ({ update, result }) => {
						loading = false;
						if (result.type === 'failure') {
							statusType = 'error';
							statusTitle = 'Error';
							statusMessage = (result.data?.error as string) || 'Ha ocurrido un error procesando la transferencia';
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
				}}
			>
				<div class="field" style="margin-bottom: 20px;">
					<label>Modo de ingreso</label>
					<div style="display: flex; gap: 12px; margin-top: 8px;">
						<label
							style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer;"
						>
							<input type="radio" name="transfer_mode" value="manual" bind:group={transferEntryMode} onchange={() => { docNumber=''; destinationAccount=''; selectedAccountId=''; amountStr=''; }} />
							Ingreso Manual
						</label>
						<label
							style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer;"
						>
							<input type="radio" name="transfer_mode" value="contact" bind:group={transferEntryMode} onchange={() => { docNumber=''; destinationAccount=''; selectedAccountId=''; amountStr=''; }} />
							Desde Directorio
						</label>
					</div>
				</div>

				{#if transferEntryMode === 'contact'}
					<div class="field">
						<label for="selected_account">Seleccionar Cuenta</label>
						{#if data.accounts.length === 0}
							<div
								style="padding: 12px; background: var(--surface-2); border-radius: var(--r-sm); font-size: 13px; color: var(--muted);"
							>
								No tienes cuentas guardadas en tu directorio.
							</div>
						{:else}
							<Select id="selected_account" bind:value={selectedAccountId}>
								<option value="">Selecciona una cuenta...</option>
								{#each data.accounts as dir}
									<option value={dir.id.toString()}>{dir.alias} - {dir.name} ({dir.bank_code})</option
									>
								{/each}
							</Select>
						{/if}
					</div>
					<!-- Hidden inputs to send data if they selected contact -->
					<input type="hidden" name="doc_prefix" value={docPrefix} />
					<input type="hidden" name="doc_number" value={docNumber} />
					<input type="hidden" name="destination_account" value={destinationAccount} />
				{/if}

				{#if transferEntryMode === 'manual'}
					<div class="field">
						<label for="doc_number">Cédula / RIF del Destinatario</label>
						<DocumentInput
							bind:prefix={docPrefix}
							bind:number={docNumber}
							isValid={docNumber ? isDocValid : undefined}
						/>
					</div>

					<div class="field">
						<label for="destination_account">Cuenta Destino (20 dígitos)</label>
						<div class="input-wrap">
							<Input
								type="text"
								restrict="numeric"
								id="destination_account"
								name="destination_account"
								class="mono"
								bind:value={destinationAccount}
								placeholder="02010000000000000000"
								maxlength={20}
								isValid={destinationAccount ? isAccountValid : undefined}
							/>
						</div>
					</div>
				{/if}

				<div class="field">
					<label for="amount">Monto (Bs.)</label>
					<Input
						type="text"
						restrict="numeric"
						id="amount"
						name="amount"
						class="amount mono"
						bind:value={amountStr}
						placeholder="0.00"
						isValid={amountStr && !isAmountValid ? false : undefined}
						style="padding-left: 48px;"
					>
						{#snippet icon()}
							<span style="font-weight: 500;">Bs.</span>
						{/snippet}
					</Input>
					<div
						style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; color: var(--muted);"
					>
						<span>Disponible: Bs. {data.balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span
						>
						{#if amountStr && !isAmountValid}
							<span style="color: var(--danger);">Monto inválido o insuficiente</span>
						{/if}
					</div>
				</div>

				<div class="spacer" style="height: 24px;"></div>
				<div style="display: flex; justify-content: flex-end;">
					<Button
						type="button"
						variant="primary"
						disabled={!canSubmit}
						{loading}
						style="width: 100%; border: none;"
						onclick={() => confirmAction(() => submitTransferBtn.click())}
					>
						Transferir
					</Button>
					<button type="submit" bind:this={submitTransferBtn} style="display: none;" disabled={!canSubmit}></button>
				</div>
			</form>
		</div>
	{:else}
		<div class="form-card card">
			<form
				method="POST"
				action="?/mobilePayment"
				use:enhance={() => {
					pmLoading = true;
					return async ({ update, result }) => {
						pmLoading = false;
						if (result.type === 'failure') {
							statusType = 'error';
							statusTitle = 'Error';
							statusMessage = (result.data?.error as string) || 'Ha ocurrido un error procesando el pago móvil';
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
				}}
			>
				<div class="field" style="margin-bottom: 20px;">
					<label>Modo de ingreso</label>
					<div style="display: flex; gap: 12px; margin-top: 8px;">
						<label
							style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer;"
						>
							<input type="radio" name="pm_mode" value="manual" bind:group={pmEntryMode} onchange={() => { pmPhone=''; pmDocNumber=''; selectedMobileId=''; pmAmountStr=''; }} />
							Ingreso Manual
						</label>
						<label
							style="display: flex; align-items: center; gap: 6px; font-weight: normal; cursor: pointer;"
						>
							<input type="radio" name="pm_mode" value="contact" bind:group={pmEntryMode} onchange={() => { pmPhone=''; pmDocNumber=''; selectedMobileId=''; pmAmountStr=''; }} />
							Desde Directorio
						</label>
					</div>
				</div>

				{#if pmEntryMode === 'contact'}
					<div class="field">
						<label for="selected_mobile">Seleccionar Contacto</label>
						{#if data.mobilePayments.length === 0}
							<div
								style="padding: 12px; background: var(--surface-2); border-radius: var(--r-sm); font-size: 13px; color: var(--muted);"
							>
								No tienes contactos de pago móvil guardados.
							</div>
						{:else}
							<Select id="selected_mobile" bind:value={selectedMobileId}>
								<option value="">Selecciona un contacto...</option>
								{#each data.mobilePayments as m}
									<option value={m.id.toString()}>{m.alias} - {m.name} ({m.bank_code})</option>
								{/each}
							</Select>
						{/if}
					</div>
					<!-- Hidden inputs for PM -->
					<input type="hidden" name="bank_code" value={pmBankCode} />
					<input type="hidden" name="destination_phone" value={pmPhone} />
					<input type="hidden" name="doc_prefix" value={pmDocPrefix} />
					<input type="hidden" name="doc_number" value={pmDocNumber} />
				{/if}

				{#if pmEntryMode === 'manual'}
					<div class="field">
						<label for="bank_code">Banco Destino</label>
						<div class="input-wrap">
							<Select id="bank_code" name="bank_code" bind:value={pmBankCode}>
								<option value="0201">0201 - Banky</option>
								<option value="0102">0102 - Banco de Venezuela</option>
								<option value="0104">0104 - Venezolano de Crédito</option>
								<option value="0105">0105 - Mercantil</option>
								<option value="0108">0108 - Provincial</option>
								<option value="0134">0134 - Banesco</option>
								<option value="0151">0151 - BFC</option>
								<option value="0156">0156 - 100% Banco</option>
								<option value="0172">0172 - Bancamiga</option>
								<option value="0175">0175 - Bicentenario</option>
								<option value="0191">0191 - BNC</option>
							</Select>
						</div>
					</div>

					<div class="field">
						<label for="destination_phone">Teléfono Móvil</label>
						<Input
							type="text"
							restrict="phone"
							id="destination_phone"
							name="destination_phone"
							class="mono"
							bind:value={pmPhone}
							placeholder="04141234567"
							maxlength={11}
							isValid={pmPhone ? isPmPhoneValid : undefined}
						/>
					</div>

					<div class="field">
						<label for="pm_doc_number">Cédula / RIF del Destinatario</label>
						<DocumentInput
							bind:prefix={pmDocPrefix}
							bind:number={pmDocNumber}
							isValid={pmDocNumber ? isPmDocValid : undefined}
						/>
					</div>
				{/if}

				<div class="field">
					<label for="amount_pm">Monto (Bs.)</label>
					<Input
						type="text"
						restrict="numeric"
						id="amount_pm"
						name="amount"
						class="amount mono"
						bind:value={pmAmountStr}
						placeholder="0.00"
						isValid={pmAmountStr && !isPmAmountValid ? false : undefined}
						style="padding-left: 48px;"
					>
						{#snippet icon()}
							<span style="font-weight: 500;">Bs.</span>
						{/snippet}
					</Input>
					<div
						style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; color: var(--muted);"
					>
						<span>Disponible: Bs. {data.balance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span
						>
						{#if pmAmountStr && !isPmAmountValid}
							<span style="color: var(--danger);">Monto inválido o insuficiente</span>
						{/if}
					</div>
				</div>

				<div class="spacer" style="height: 24px;"></div>
				<div style="display: flex; justify-content: flex-end;">
					<Button
						type="button"
						variant="primary"
						disabled={!canSubmitPm}
						loading={pmLoading}
						style="width: 100%; border: none;"
						onclick={() => confirmAction(() => submitPmBtn.click())}
					>
						Pagar
					</Button>
					<button type="submit" bind:this={submitPmBtn} style="display: none;" disabled={!canSubmitPm}></button>
				</div>
			</form>
		</div>
	{/if}
</div>

<ConfirmModal
	bind:open={showConfirm}
	title="Confirmar Transacción"
	message="¿Estás seguro de que deseas procesar esta transacción? Esta acción debitará dinero de tu cuenta y no puede deshacerse."
	onConfirm={() => {
		if (pendingSubmit) pendingSubmit();
	}}
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
