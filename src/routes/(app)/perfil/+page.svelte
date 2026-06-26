<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let loadingProfile = $state(false);
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let email = $state('');

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

	let submitProfileBtn: HTMLButtonElement;

	$effect(() => {
		firstName = data.user?.first_name || '';
		lastName = data.user?.last_name || '';
		phone = data.user?.phone || '';
		email = data.user?.email || '';
	});

	let isFirstNameValid = $derived(firstName.length >= 2);
	let isLastNameValid = $derived(lastName.length >= 2);
	let isPhoneValid = $derived(/^04(14|24|12|16|26)-?\d{7}$/.test(phone) || /^\d{11}$/.test(phone));
	let isEmailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

	let hasProfileChanges = $derived(
		firstName !== (data.user?.first_name || '') ||
			lastName !== (data.user?.last_name || '') ||
			phone !== (data.user?.phone || '') ||
			email !== (data.user?.email || ''),
	);

	let canSubmitProfile = $derived(hasProfileChanges && isFirstNameValid && isLastNameValid && isPhoneValid && isEmailValid);
</script>

<svelte:head>
	<title>{data.appName} | Mi perfil</title>
</svelte:head>

<header class="appbar" data-od-id="profile-appbar">
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
	<h1>Mi perfil</h1>
</header>

<div class="page-content general-margin">
	<div class="card flush general-margin" data-od-id="datos-personales">
		<h3 class="headline">Datos personales</h3>

		<div class="kv-row" style="display: block; padding-top: 0;">
			<div class="kv-label" style="margin-bottom: 4px;">Cédula / Documento</div>
			<div class="kv-value mono" style="font-size: 14px; opacity: 0.8;">{data.user?.document_id}</div>
		</div>

		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				loadingProfile = true;
				return async ({ update }) => {
					await update({ reset: false });
					loadingProfile = false;
				};
			}}
		>
			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 8px;">
				<div class="kv-label" style="margin-bottom: 8px;">Nombres</div>
				<Input
					type="text"
					name="first_name"
					bind:value={firstName}
					restrict="alpha"
					placeholder="Ingresa tus nombres"
					isValid={firstName !== (data.user?.first_name || '') ? isFirstNameValid : undefined}
				/>
			</div>

			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 8px; padding-top: 8px;">
				<div class="kv-label" style="margin-bottom: 8px;">Apellidos</div>
				<Input
					type="text"
					name="last_name"
					bind:value={lastName}
					restrict="alpha"
					placeholder="Ingresa tus apellidos"
					isValid={lastName !== (data.user?.last_name || '') ? isLastNameValid : undefined}
				/>
			</div>

			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 8px; padding-top: 8px;">
				<div class="kv-label" style="margin-bottom: 8px;">Teléfono móvil</div>
				<Input type="tel" name="phone" class="mono" bind:value={phone} restrict="phone" isValid={phone !== (data.user?.phone || '') ? isPhoneValid : undefined} />
			</div>

			<div class="kv-row" style="display: block; padding-bottom: 0; padding-top: 8px; border-bottom: 0">
				<div class="kv-label" style="margin-bottom: 8px;">Correo electrónico</div>
				<Input type="email" name="email" bind:value={email} isValid={email !== (data.user?.email || '') ? isEmailValid : undefined} />
			</div>

			<div
				style="padding-bottom: 16px;  padding-top: 16px;margin-top: 16px; border-top: 1px solid var(--border);"
			>
				<Button
					type="button"
					variant="primary"
					disabled={!canSubmitProfile}
					loading={loadingProfile}
					style="width: 100%;"
					onclick={() => confirmAction('Guardar cambios', '¿Estás seguro de que deseas actualizar tus datos personales?', () => submitProfileBtn.click())}
				>
					Guardar cambios
				</Button>
				<button type="submit" bind:this={submitProfileBtn} style="display: none;" disabled={!canSubmitProfile}></button>
			</div>
		</form>
	</div>

	<div class="menu-card general-margin">
		<div class="menu-section-header">OPCIONES</div>
		
		<a href="/perfil/tarjetas" class="menu-item">
			<div class="menu-item-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
			</div>
			<div class="menu-item-content">
				<div class="menu-item-title">Mis Tarjetas de Débito</div>
				<div class="menu-item-subtitle">{data.cards ? data.cards.length : 0} tarjeta(s) vinculada(s)</div>
			</div>
			<div class="menu-item-arrow">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
			</div>
		</a>
		
		<a href="/perfil/desarrolladores" class="menu-item">
			<div class="menu-item-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
			</div>
			<div class="menu-item-content">
				<div class="menu-item-title">Desarrolladores (API)</div>
				<div class="menu-item-subtitle">API Key y Webhook URL</div>
			</div>
			<div class="menu-item-arrow">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
			</div>
		</a>
	</div>

</div>

<ConfirmModal
	bind:open={showConfirm}
	title={confirmTitle}
	message={confirmMessage}
	onConfirm={() => {
		if (pendingSubmit) pendingSubmit();
	}}
/>

<style>
	.menu-card {
		background: #fff;
		border-radius: 12px;
		border: 1px solid var(--border);
		overflow: hidden;
		margin-bottom: 24px;
	}
	.menu-section-header {
		font-size: 11px;
		font-weight: 600;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 16px 16px 8px 16px;
	}
	.menu-item {
		display: flex;
		align-items: center;
		padding: 16px;
		text-decoration: none;
		color: inherit;
		border-bottom: 1px solid var(--border);
		transition: background 0.2s;
	}
	.menu-item:last-child {
		border-bottom: none;
	}
	.menu-item:hover {
		background: var(--bg-secondary, #f9fafb);
	}
	.menu-item-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(var(--brand-core-rgb, 0, 0, 0), 0.06);
		color: var(--brand-core, #000);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16px;
		flex-shrink: 0;
	}
	.menu-item-icon svg {
		width: 20px;
		height: 20px;
	}
	.menu-item-content {
		flex: 1;
		min-width: 0;
	}
	.menu-item-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text, #111);
		margin-bottom: 2px;
	}
	.menu-item-subtitle {
		font-size: 13px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.menu-item-arrow {
		color: var(--muted);
		margin-left: 16px;
		display: flex;
	}
</style>
