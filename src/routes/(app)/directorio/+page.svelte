<script lang="ts">
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import DocumentInput from '$lib/components/ui/DocumentInput.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';

	let { data, form } = $props();

	let activeTab = $state<'cuentas' | 'movil'>('cuentas');

	// State for forms
	let showForm = $state(false);
	let formMode = $state<'create' | 'edit'>('create');

	let currentId = $state('');
	let alias = $state('');
	let bankCode = $state('0102');
	let accountNumber = $state('');
	let phoneNumber = $state('');
	let docPrefix = $state('V');
	let docNumber = $state('');
	let name = $state('');

	// Confirm Modal State
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let pendingAction = $state<() => void>(() => {});

	// To trigger the actual form submit programmatically
	let formElement = $state<HTMLFormElement | null>(null);
	let currentAction = $state(''); // The formaction URL to submit to

	function resetForm() {
		currentId = '';
		alias = '';
		bankCode = '0102';
		accountNumber = '';
		phoneNumber = '';
		docPrefix = 'V';
		docNumber = '';
		name = '';
		showForm = false;
	}

	function openCreate() {
		resetForm();
		formMode = 'create';
		showForm = true;
	}

	function openEdit(contact: any) {
		resetForm();
		formMode = 'edit';
		currentId = contact.id;
		alias = contact.alias;
		bankCode = contact.bank_code;

		const docParts = contact.document_id.split('-');
		if (docParts.length === 2) {
			docPrefix = docParts[0];
			docNumber = docParts[1];
		} else {
			docNumber = contact.document_id;
		}

		name = contact.name;
		if (activeTab === 'cuentas') {
			accountNumber = contact.account_number;
		} else {
			phoneNumber = contact.phone_number;
		}
		showForm = true;
	}

	// Wrapper to ask confirmation before submitting forms
	function requestAction(title: string, message: string, actionUrl: string) {
		confirmTitle = title;
		confirmMessage = message;
		pendingAction = () => {
			currentAction = actionUrl;
			if (formElement) {
				formElement.action = actionUrl;
				formElement.requestSubmit();
			}
		};
		confirmOpen = true;
	}

	function handleFormSubmit(e: Event) {
		e.preventDefault();
		const action =
			activeTab === 'cuentas'
				? formMode === 'create'
					? '?/createAccount'
					: '?/updateAccount'
				: formMode === 'create'
					? '?/createMobile'
					: '?/updateMobile';

		const title = formMode === 'create' ? 'Crear Contacto' : 'Actualizar Contacto';
		const msg = `¿Estás seguro que deseas ${formMode === 'create' ? 'guardar' : 'actualizar'} este contacto?`;
		requestAction(title, msg, action);
	}

	function handleDelete(id: string) {
		const action = activeTab === 'cuentas' ? '?/deleteAccount' : '?/deleteMobile';
		// We set the currentId so the hidden form can pick it up
		currentId = id;
		requestAction(
			'Eliminar Contacto',
			'¿Estás seguro que deseas eliminar este contacto? Esta acción no se puede deshacer.',
			action,
		);
	}
</script>

<header class="appbar" data-od-id="directorio-appbar">
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
	<h1>Directorio</h1>
</header>

<div class="page-content general-margin">
	<AlertMessage {form} />

	<div class="tabs">
		<button
			class="tab-btn"
			class:active={activeTab === 'cuentas'}
			onclick={() => {
				activeTab = 'cuentas';
				resetForm();
			}}>Cuentas Bancarias</button
		>
		<button
			class="tab-btn"
			class:active={activeTab === 'movil'}
			onclick={() => {
				activeTab = 'movil';
				resetForm();
			}}>Pago Móvil</button
		>
	</div>

	<div class="actions-bar">
		<Button variant="primary" onclick={openCreate}
			>+ Añadir {activeTab === 'cuentas' ? 'Cuenta' : 'Pago Móvil'}</Button
		>
	</div>

	<!-- The actual form that will be submitted programmatically via requestSubmit -->
	<form
		bind:this={formElement}
		method="POST"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				resetForm();
			};
		}}
	>
		<!-- Hidden input for ID when editing or deleting -->
		<input type="hidden" name="id" value={currentId} />

		{#if showForm}
			<div class="form-card card">
				<h3 style="margin-top: 0;">{formMode === 'create' ? 'Nuevo Contacto' : 'Editar Contacto'}</h3>
				<div class="form-row">
					<div class="field">
						<label for="alias">Alias</label>
						<Input id="alias" name="alias" bind:value={alias} required placeholder="Ej. Casa, Trabajo" />
					</div>
					<div class="field">
						<label for="name">Nombre Titular</label>
						<Input
							id="name"
							name="name"
							bind:value={name}
							restrict="alpha"
							required
							placeholder="Nombre completo"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="field">
						<label for="bank_code">Banco</label>
						<Select id="bank_code" name="bank_code" bind:value={bankCode}>
							<option value="0102">Banco de Venezuela (0102)</option>
							<option value="0104">Venezolano de Crédito (0104)</option>
							<option value="0105">Mercantil (0105)</option>
							<option value="0108">Provincial (0108)</option>
							<option value="0134">Banesco (0134)</option>
							<option value="0151">BFC (0151)</option>
							<option value="0156">100% Banco (0156)</option>
							<option value="0172">Bancamiga (0172)</option>
							<option value="0175">Bicentenario (0175)</option>
							<option value="0191">BNC (0191)</option>
						</Select>
					</div>
					<div class="field">
						<label for="doc_number">Cédula / RIF</label>
						<DocumentInput bind:prefix={docPrefix} bind:number={docNumber} />
					</div>
				</div>

				{#if activeTab === 'cuentas'}
					<div class="field">
						<label for="account_number">Número de Cuenta</label>
						<Input
							restrict="numeric"
							id="account_number"
							name="account_number"
							bind:value={accountNumber}
							required
							minlength={20}
							maxlength={20}
							placeholder="20 dígitos"
						/>
					</div>
				{:else}
					<div class="field">
						<label for="phone_number">Número de Teléfono</label>
						<Input
							restrict="phone"
							id="phone_number"
							name="phone_number"
							bind:value={phoneNumber}
							required
							minlength={11}
							maxlength={11}
							placeholder="04141234567"
						/>
					</div>
				{/if}

				<div class="form-actions">
					<Button type="button" variant="secondary" onclick={resetForm}>Cancelar</Button>
					<Button type="button" variant="primary" onclick={handleFormSubmit}>Guardar</Button>
				</div>
			</div>
		{/if}
	</form>

	<div class="list-section">
		{#if activeTab === 'cuentas'}
			{#if data.accounts.length === 0}
				<div class="empty-state">No tienes cuentas bancarias guardadas.</div>
			{:else}
				<div class="cards-grid">
					{#each data.accounts as acc}
						<div class="contact-card card">
							<div class="contact-header">
								<div class="alias">{acc.alias}</div>
								<div class="bank-tag">{acc.bank_code}</div>
							</div>
							<div class="contact-body">
								<div><strong>{acc.name}</strong> ({acc.document_id})</div>
								<div class="number">{acc.account_number}</div>
							</div>
							<div class="contact-actions">
								<Button variant="secondary" onclick={() => openEdit(acc)} style="flex: 1;"
									>Editar</Button
								>
								<Button
									variant="danger-ghost"
									onclick={() => handleDelete(acc.id.toString())}
									style="flex: 1;">Eliminar</Button
								>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{:else if data.mobilePayments.length === 0}
			<div class="empty-state">No tienes contactos de pago móvil guardados.</div>
		{:else}
			<div class="cards-grid">
				{#each data.mobilePayments as movil}
					<div class="contact-card card">
						<div class="contact-header">
							<div class="alias">{movil.alias}</div>
							<div class="bank-tag">{movil.bank_code}</div>
						</div>
						<div class="contact-body">
							<div><strong>{movil.name}</strong> ({movil.document_id})</div>
							<div class="number">{movil.phone_number}</div>
						</div>
						<div class="contact-actions">
							<Button variant="secondary" onclick={() => openEdit(movil)} style="flex: 1;">Editar</Button>
							<Button
								variant="danger-ghost"
								onclick={() => handleDelete(movil.id.toString())}
								style="flex: 1;">Eliminar</Button
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<ConfirmModal bind:open={confirmOpen} title={confirmTitle} message={confirmMessage} onConfirm={() => pendingAction()} />

<style>
	.form-row {
		display: flex;
		gap: 16px;
	}
	.form-row .field {
		flex: 1;
	}
	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		margin-top: 24px;
	}
	.contact-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.contact-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.alias {
		font-weight: 600;
		font-size: 18px;
	}
	.bank-tag {
		background: var(--surface-2);
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
	}
	.contact-body {
		font-size: 14px;
		color: var(--text-main);
	}
	.number {
		font-family: var(--font-mono);
		margin-top: 4px;
		color: var(--muted);
		word-break: break-all;
	}
	.contact-actions {
		display: flex;
		gap: 8px;
		margin-top: auto;
	}
</style>
