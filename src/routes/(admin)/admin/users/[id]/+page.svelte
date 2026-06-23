<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let { data }: { data: PageData } = $props();
	let user = $state(data.user);
	let cards = $state(data.cards);
	let currentTab = $state('perfil');
	let movimientosTab = $state('estado');

	let alertMsg = $state('');
	let alertType = $state<'success' | 'danger' | 'warn'>('success');

	function showAlert(msg: string, type: 'success' | 'danger' | 'warn') {
		alertMsg = msg;
		alertType = type;
		setTimeout(() => alertMsg = '', 5000);
	}

	let showConfirm = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let pendingSubmit = $state<(() => void) | null>(null);

	function confirmAction(title: string, message: string, action: () => void) {
		confirmTitle = title;
		confirmMessage = message;
		pendingSubmit = () => action();
		showConfirm = true;
	}

	let firstName = $state(user.first_name || '');
	let lastName = $state(user.last_name || '');
	let email = $state(user.email || '');
	let phone = $state(user.phone || '');
	let webhookUrl = $state(user.webhook_url || '');

	let newPassword = $state('');
	let newCardNumber = $state('');
	let newCardAlias = $state('');
	
	let adjustAmount = $state('');
	
	let forceType = $state('transfer');
	let forceDestDoc = $state('');
	let forceDestAcc = $state('');
	let forceDestPhone = $state('');
	let forceBankCode = $state('');
	let forceAmount = $state('');

	function setForceType(type: string) {
		forceType = type;
		forceDestDoc = '';
		forceDestAcc = '';
		forceDestPhone = '';
		forceBankCode = '';
		forceAmount = '';
	}

	let submitProfileBtn: HTMLButtonElement;
	let submitPasswordBtn: HTMLButtonElement;
	let submitRotateApiBtn: HTMLButtonElement;
	let submitAddCardBtn: HTMLButtonElement;
	let submitAdjustBtn: HTMLButtonElement;
	let submitForceBtn: HTMLButtonElement;
	let submitDeleteCardBtn: Record<string, HTMLButtonElement> = {};

	let isFirstNameValid = $derived(firstName.length >= 2);
	let isLastNameValid = $derived(lastName.length >= 2);
	let isEmailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	let isPhoneValid = $derived(/^04(14|24|12|16|26)-?\d{7}$/.test(phone) || /^\d{11}$/.test(phone));
	let isWebhookValid = $derived(webhookUrl === '' || /^https?:\/\/.+/.test(webhookUrl));
	let canSubmitProfile = $derived(isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid && isWebhookValid);

	let isPasswordValid = $derived(newPassword.length >= 8);
	let isCardValid = $derived(newCardNumber.length >= 3);
	let isAdjustValid = $derived(Number(adjustAmount) !== 0 && adjustAmount !== '');
	let isForceValid = $derived(
		Number(forceAmount) > 0 && forceDestDoc !== '' &&
		(forceType === 'transfer' ? forceDestAcc !== '' : (forceDestPhone !== '' && forceBankCode !== ''))
	);

	async function updateProfile(e: Event) {
		e.preventDefault();
		const body = { first_name: firstName, last_name: lastName, email, phone, webhook_url: webhookUrl };
		const res = await fetch(`/api/admin/users/${user.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		const result = await res.json();
		if (result.success) {
			user = result.data;
			showAlert('Perfil actualizado', 'success');
		} else showAlert(result.error, 'danger');
	}

	async function updatePassword(e: Event) {
		e.preventDefault();
		const res = await fetch(`/api/admin/users/${user.id}/password`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ new_password: newPassword })
		});
		const result = await res.json();
		if (result.success) {
			showAlert('Contraseña cambiada', 'success');
			newPassword = '';
		}
		else showAlert(result.error, 'danger');
	}

	async function rotateApiKey(e: Event) {
		e.preventDefault();
		const res = await fetch(`/api/admin/users/${user.id}/api-key`, { method: 'POST' });
		const result = await res.json();
		if (result.success) {
			user.api_key = result.data.api_key;
			showAlert('API Key rotada', 'success');
		} else showAlert(result.error, 'danger');
	}

	async function addCard(e: Event) {
		e.preventDefault();
		const res = await fetch(`/api/admin/users/${user.id}/cards`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ card_number: newCardNumber, alias: newCardAlias })
		});
		const result = await res.json();
		if (result.success) {
			cards = [...cards, result.data];
			showAlert('Tarjeta añadida', 'success');
			newCardNumber = '';
			newCardAlias = '';
		} else showAlert(result.error, 'danger');
	}

	async function deleteCard(cardId: number) {
		const res = await fetch(`/api/admin/users/${user.id}/cards?card_id=${cardId}`, { method: 'DELETE' });
		const result = await res.json();
		if (result.success) {
			cards = cards.filter((c: any) => c.id !== cardId);
			showAlert('Tarjeta eliminada', 'success');
		} else showAlert(result.error, 'danger');
	}

	async function adjustBalance(e: Event) {
		e.preventDefault();
		const res = await fetch(`/api/admin/users/${user.id}/adjustments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount: Number(adjustAmount) })
		});
		const result = await res.json();
		if (result.success) {
			user.balance = result.data.balance_after;
			showAlert('Saldo ajustado', 'success');
			adjustAmount = '';
		} else showAlert(result.error, 'danger');
	}

	async function forceTransaction(e: Event) {
		e.preventDefault();
		const body = {
			type: forceType,
			destination_document: forceDestDoc,
			destination_account: forceDestAcc,
			destination_phone: forceDestPhone,
			bank_code: forceBankCode,
			source_user_id: user.id,
			amount: Number(forceAmount)
		};
		const res = await fetch(`/api/admin/transactions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		const result = await res.json();
		if (result.success) {
			user.balance = result.data.balance_after;
			showAlert('Transacción forzada exitosa', 'success');
			forceDestDoc = '';
			forceDestAcc = '';
			forceDestPhone = '';
			forceBankCode = '';
			forceAmount = '';
		} else showAlert(result.error, 'danger');
	}
</script>

<div class="app-container">
	<header class="app-header">
		<button class="icon-btn" onclick={() => goto('/admin/dashboard')} style="background: none; color: var(--fg); border: none; cursor: pointer; padding: 8px;">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
		</button>
		<div class="brand" style="margin-right: auto; margin-left: 8px;">
			<span>Detalles de Cuenta</span>
		</div>
		<button class="logout-btn" title="Cerrar sesión" onclick={() => {
			document.cookie = 'admin_session=; Max-Age=0; path=/';
			goto('/admin/login');
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
			<span>Salir</span>
		</button>
	</header>

	<main class="app-main">
		<div class="general-margin" style="padding-top: 24px;">
			{#if alertMsg}
				<div style="margin-bottom: 1rem;">
					<div style="padding:12px; border-radius:8px; color:white; background: {alertType === 'success' ? 'var(--success)' : 'var(--danger)'}">
						{alertMsg}
					</div>
				</div>
			{/if}

			<div class="tabs" style="margin-bottom: 24px; display: flex; flex-wrap: nowrap; overflow-x: auto;">
				<button class="tab-btn {currentTab === 'perfil' ? 'active' : ''}" onclick={() => currentTab = 'perfil'} style="flex: 1 0 auto;">Perfil</button>
				<button class="tab-btn {currentTab === 'seguridad' ? 'active' : ''}" onclick={() => currentTab = 'seguridad'} style="flex: 1 0 auto;">Seguridad</button>
				<button class="tab-btn {currentTab === 'tarjetas' ? 'active' : ''}" onclick={() => currentTab = 'tarjetas'} style="flex: 1 0 auto;">Tarjetas</button>
				<button class="tab-btn {currentTab === 'movimientos' ? 'active' : ''}" onclick={() => currentTab = 'movimientos'} style="flex: 1 0 auto;">Movimientos</button>
			</div>

			{#if currentTab === 'perfil'}
				<div class="card" style="margin-bottom: 1rem;">
					<h3 class="headline" style="font-size: 16px;">Editar Perfil</h3>
					<form onsubmit={updateProfile}>
						<div class="field"><label>Nombre</label><Input name="first_name" bind:value={firstName} isValid={firstName && !isFirstNameValid ? false : undefined} restrict="alpha" required /></div>
						<div class="field"><label>Apellido</label><Input name="last_name" bind:value={lastName} isValid={lastName && !isLastNameValid ? false : undefined} restrict="alpha" required /></div>
						<div class="field"><label>Email</label><Input name="email" type="email" bind:value={email} isValid={email && !isEmailValid ? false : undefined} required /></div>
						<div class="field"><label>Teléfono</label><Input name="phone" bind:value={phone} isValid={phone && !isPhoneValid ? false : undefined} restrict="phone" class="mono" required /></div>
						<div class="field"><label>Webhook URL</label><Input name="webhook_url" bind:value={webhookUrl} isValid={webhookUrl && !isWebhookValid ? false : undefined} type="url" /></div>
						
						<Button type="button" variant="primary" disabled={!canSubmitProfile} onclick={() => confirmAction('Guardar cambios', '¿Estás seguro de que deseas actualizar los datos de esta cuenta?', () => submitProfileBtn.click())}>Guardar Cambios</Button>
						<button type="submit" bind:this={submitProfileBtn} style="display: none;" disabled={!canSubmitProfile}></button>
					</form>
				</div>
			{:else if currentTab === 'seguridad'}
				<div class="card" style="margin-bottom: 1rem;">
					<h3 class="headline" style="font-size: 16px;">Rotación de API Key</h3>
					<div class="field">
						<label>API KEY ACTUAL</label>
						<Input class="mono" readonly value={user.api_key} />
					</div>
					<form onsubmit={rotateApiKey}>
						<Button type="button" variant="secondary" onclick={() => confirmAction('Rotar API Key', '¿Seguro que deseas rotar el API Key? Se romperán las integraciones existentes de este usuario.', () => submitRotateApiBtn.click())}>Rotar API Key</Button>
						<button type="submit" bind:this={submitRotateApiBtn} style="display: none;"></button>
					</form>
				</div>

				<div class="card" style="margin-bottom: 1rem;">
					<h3 class="headline" style="font-size: 16px;">Cambio de Contraseña</h3>
					<form onsubmit={updatePassword}>
						<div class="field"><label>Nueva Contraseña</label><Input name="new_password" bind:value={newPassword} type="password" isValid={newPassword && !isPasswordValid ? false : undefined} required /></div>
						<Button type="button" variant="danger-ghost" disabled={!isPasswordValid} style="border: 1px solid var(--danger);" onclick={() => confirmAction('Forzar Cambio de Clave', '¿Estás seguro de que deseas sobrescribir la contraseña de este usuario?', () => submitPasswordBtn.click())}>Forzar Cambio de Clave</Button>
						<button type="submit" bind:this={submitPasswordBtn} style="display: none;" disabled={!isPasswordValid}></button>
					</form>
				</div>
			{:else if currentTab === 'tarjetas'}
				<div class="card" style="margin-bottom: 1rem;">
					<h3 class="headline" style="font-size: 16px;">Tarjetas Asignadas</h3>
					{#each cards as card}
						<div class="kv-row" style="padding: 8px 0; align-items: center;">
							<div>
								<div class="kv-value mono">{card.card_number}</div>
								<div class="kv-label">{card.alias || 'Sin alias'}</div>
							</div>
							<form onsubmit={(e) => { e.preventDefault(); deleteCard(card.id); }}>
								<Button type="button" variant="secondary" style="padding: 6px 10px; min-width: 0; color: var(--danger);" onclick={() => confirmAction('Eliminar tarjeta', '¿Seguro que deseas desvincular esta tarjeta?', () => submitDeleteCardBtn[card.id].click())}>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
								</Button>
								<button type="submit" bind:this={submitDeleteCardBtn[card.id]} style="display: none;"></button>
							</form>
						</div>
					{:else}
						<div class="empty-state">No hay tarjetas asignadas.</div>
					{/each}
					
					<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border);">
						<h3 class="headline" style="font-size: 14px; margin-bottom: 12px; color: var(--muted);">Añadir Nueva Tarjeta</h3>
						<form onsubmit={addCard}>
							<div class="field">
								<label>Número de Tarjeta</label>
								<Input class="mono" name="card_number" bind:value={newCardNumber} restrict="alphanumeric_upper" placeholder="0000 0000 0000 0000" isValid={newCardNumber && !isCardValid ? false : undefined} required />
							</div>
							<div class="field">
								<label>Alias (Opcional)</label>
								<Input name="alias" bind:value={newCardAlias} placeholder="Ej. Nómina" />
							</div>
							<Button type="button" variant="secondary" disabled={!isCardValid} style="width: 100%;" onclick={() => confirmAction('Asignar Tarjeta', '¿Vincular esta nueva tarjeta a la cuenta?', () => submitAddCardBtn.click())}>Añadir Tarjeta</Button>
							<button type="submit" bind:this={submitAddCardBtn} style="display: none;" disabled={!isCardValid}></button>
						</form>
					</div>
				</div>
			{:else if currentTab === 'movimientos'}
				<div class="tabs" style="margin-bottom: 24px;">
					<button class="tab-btn {movimientosTab === 'estado' ? 'active' : ''}" onclick={() => movimientosTab = 'estado'} style="flex: 1;">Estado de Cuenta</button>
					<button class="tab-btn {movimientosTab === 'transacciones' ? 'active' : ''}" onclick={() => movimientosTab = 'transacciones'} style="flex: 1;">Transacciones</button>
				</div>

				{#if movimientosTab === 'estado'}
					<div class="dash-balance" style="margin-top: 0; margin-bottom: 20px;">
						<div class="label">Saldo Actual</div>
						<h2 class="amount"><span class="currency">Bs.</span>{Number(user.balance).toFixed(2)}</h2>
						<div class="acct">
							<span class="l">Cta: {user.account_number}</span>
							<span class="v">{user.document_id}</span>
						</div>
					</div>

					<div class="card flush" style="margin-bottom: 1rem;">
						<div style="padding: 1rem; border-bottom: 1px solid var(--border);">
							<h3 class="headline" style="font-size: 16px; margin: 0;">Historial de Transacciones</h3>
						</div>
						{#each data.transactions as txn}
							<div class="txn" style="padding: 12px 1rem;">
								<div class="ico {Number(txn.amount) < 0 ? 'debit' : 'credit'}">
									{#if Number(txn.amount) < 0}
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
									{:else}
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
									{/if}
								</div>
								<div class="txt">
									<div class="title" style="display: flex; align-items: center; gap: 6px;">
										{txn.type === 'deposit' ? 'Depósito' : txn.type === 'withdrawal' ? 'Retiro' : txn.type === 'transfer' ? 'Transferencia' : 'Pago Móvil'}
										{#if txn.reference.startsWith('ADM-')}
											<span style="font-size: 10px; background: var(--warn-soft); color: var(--warn); padding: 2px 6px; border-radius: 4px; font-weight: 600;">SISTEMA</span>
										{/if}
									</div>
									<div class="sub">
										<span>Ref: {txn.reference}</span>
										<span>{new Date(txn.created_at).toLocaleString()}</span>
									</div>
								</div>
								<div class="amt">
									{Number(txn.amount) < 0 ? '-' : '+'} Bs. {Math.abs(Number(txn.amount)).toFixed(2)}
								</div>
							</div>
						{:else}
							<div class="empty-state">No hay transacciones asociadas a la cuenta.</div>
						{/each}
						
						{#if data.txTotalPages > 1}
							<div style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border);">
								<Button variant="secondary" style="width: auto; padding: 4px 12px;" disabled={data.txPage <= 1} onclick={() => goto(`?page=${data.txPage - 1}`)}>Anterior</Button>
								<span style="font-size: 13px; color: var(--muted); font-weight: 500;">Pág. {data.txPage} de {data.txTotalPages}</span>
								<Button variant="secondary" style="width: auto; padding: 4px 12px;" disabled={data.txPage >= data.txTotalPages} onclick={() => goto(`?page=${data.txPage + 1}`)}>Siguiente</Button>
							</div>
						{/if}
					</div>
				{:else if movimientosTab === 'transacciones'}
					<div class="card" style="margin-bottom: 1rem;">
						<h3 class="headline" style="font-size: 16px;">Asignar / Retirar Fondos</h3>
						<form onsubmit={adjustBalance}>
							<div class="field"><label>Monto (Positivo para abonar, negativo para retirar)</label><Input name="amount" bind:value={adjustAmount} isValid={adjustAmount !== '' && !isAdjustValid ? false : undefined} type="number" step="0.01" required /></div>
							<Button type="button" variant="primary" disabled={!isAdjustValid} onclick={() => confirmAction('Ajustar Saldo', `¿Confirma el ajuste de saldo de Bs. ${adjustAmount}?`, () => submitAdjustBtn.click())}>Ajustar Saldo</Button>
							<button type="submit" bind:this={submitAdjustBtn} style="display: none;" disabled={!isAdjustValid}></button>
						</form>
					</div>

					<div class="card" style="margin-bottom: 1rem;">
						<h3 class="headline" style="font-size: 16px;">Forzar Transacción Externa</h3>
						<div class="segmented" style="margin-bottom: 20px;">
							<button class={forceType === 'transfer' ? 'active' : ''} onclick={() => setForceType('transfer')}>Transferencia</button>
							<button class={forceType === 'mobile_payment' ? 'active' : ''} onclick={() => setForceType('mobile_payment')}>Pago Móvil</button>
						</div>
						<form onsubmit={forceTransaction}>
							<input type="hidden" name="type" value={forceType} />
							<div class="field"><label>Documento Destino</label><Input bind:value={forceDestDoc} restrict="alphanumeric_upper" name="destination_document" required /></div>
							<div class="field">
								<label>Banco Destino</label>
								<select class="input" bind:value={forceBankCode} name="bank_code" required>
									<option value="">Selecciona un banco...</option>
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
								</select>
							</div>
							{#if forceType === 'transfer'}
								<div class="field"><label>Cuenta Destino</label><Input bind:value={forceDestAcc} restrict="numeric" name="destination_account" required /></div>
							{:else}
								<div class="field"><label>Teléfono Celular</label><Input bind:value={forceDestPhone} restrict="phone" name="destination_phone" required /></div>
							{/if}
							<div class="field"><label>Monto</label><Input bind:value={forceAmount} name="amount" type="number" step="0.01" required /></div>
							
							<Button type="button" variant="primary" disabled={!isForceValid} onclick={() => confirmAction('Forzar Transacción', `¿Confirma enviar Bs. ${forceAmount} en nombre de este usuario?`, () => submitForceBtn.click())}>Ejecutar Transacción</Button>
							<button type="submit" bind:this={submitForceBtn} style="display: none;" disabled={!isForceValid}></button>
						</form>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</div>

<ConfirmModal bind:open={showConfirm} title={confirmTitle} message={confirmMessage} onConfirm={() => { if (pendingSubmit) pendingSubmit(); }} />

<style>
	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		height: 70px;
		width: 100%;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 18px;
		color: var(--brand-core);
	}
	.logout-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: var(--muted);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		padding: 8px;
		border-radius: var(--r-sm);
		transition: all 0.2s;
	}
	.logout-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		color: var(--danger);
	}
	.logout-btn svg {
		width: 18px;
		height: 18px;
	}
	.app-main {
		height: calc(100% - 70px);
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		overflow-y: auto;
		background: var(--surface-2);
		width: 100%;
		padding-bottom: 24px;
	}
</style>
