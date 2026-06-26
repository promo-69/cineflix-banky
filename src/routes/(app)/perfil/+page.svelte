<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loadingWebhook = $state(false);
	let rotatingApi = $state(false);
	let webhookUrl = $state('');
	let loadingProfile = $state(false);
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let email = $state('');

	let addingCard = $state(false);
	let newCardNumber = $state('');
	let newCardAlias = $state('');
	let deletingCardId = $state<number | null>(null);

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
	let submitAddCardBtn: HTMLButtonElement;
	let submitDeleteCardBtn: Record<string, HTMLButtonElement> = {};
	let submitRotateApiBtn: HTMLButtonElement;
	let submitWebhookBtn: HTMLButtonElement;

	$effect(() => {
		webhookUrl = data.user?.webhook_url || '';
		firstName = data.user?.first_name || '';
		lastName = data.user?.last_name || '';
		phone = data.user?.phone || '';
		email = data.user?.email || '';
	});

	let isFirstNameValid = $derived(firstName.length >= 2);
	let isLastNameValid = $derived(lastName.length >= 2);
	let isPhoneValid = $derived(/^04(14|24|12|16|26)-?\d{7}$/.test(phone) || /^\d{11}$/.test(phone));
	let isEmailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	let isWebhookValid = $derived(webhookUrl === '' || /^https?:\/\/.+/.test(webhookUrl));
	let hasWebhookChanged = $derived(webhookUrl !== (data.user?.webhook_url || ''));
	let canSubmitWebhook = $derived(hasWebhookChanged && isWebhookValid);

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

	<div class="card flush general-margin" data-od-id="mis-tarjetas">
		<h3 class="headline">Mis Tarjetas de Débito</h3>

		{#if data.cards && data.cards.length > 0}
			<div style="margin-bottom: 8px;">
				{#each data.cards as card}
					<div class="kv-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding: 12px 0;">
						<div>
							<div class="kv-label" style="margin-bottom: 4px;">{card.alias || 'Tarjeta de Débito'}</div>
							<div class="kv-value mono" style="font-size: 14px; opacity: 0.8;">
								**** **** **** {card.card_number.slice(-4)}
							</div>
						</div>
						<form
							method="POST"
							action="?/deleteCard"
							use:enhance={() => {
								deletingCardId = card.id;
								return async ({ update }) => {
									await update();
									deletingCardId = null;
								};
							}}
						>
							<input type="hidden" name="card_id" value={card.id} />
							<Button
								type="button"
								variant="secondary"
								style="padding: 6px 10px; min-width: 0; color: var(--danger);"
								loading={deletingCardId === card.id}
								onclick={() => confirmAction('Eliminar Tarjeta', '¿Estás seguro de que deseas desvincular esta tarjeta de débito?', () => submitDeleteCardBtn[card.id].click())}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
							</Button>
							<button type="submit" bind:this={submitDeleteCardBtn[card.id]} style="display: none;"></button>
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<div class="kv-row" style="padding: 12px 0; font-size: 13px; color: var(--muted);">
				No tienes tarjetas asociadas.
			</div>
		{/if}

		<form
			method="POST"
			action="?/addCard"
			use:enhance={() => {
				addingCard = true;
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') {
						newCardNumber = '';
						newCardAlias = '';
					}
					addingCard = false;
				};
			}}
		>
			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 8px; padding-top: 16px;">
				<div class="kv-label" style="margin-bottom: 8px;">Vincular Nueva Tarjeta</div>
				<Input
					type="text"
					name="card_number"
					class="mono"
					bind:value={newCardNumber}
					placeholder="Identificador (letras y números)"
					restrict="alphanumeric_upper"
					maxlength={20}
					isValid={newCardNumber ? newCardNumber.length >= 3 : undefined}
				/>
			</div>
			
			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 16px; padding-top: 8px;">
				<div class="kv-label" style="margin-bottom: 8px;">Alias de Tarjeta (Opcional)</div>
				<Input
					type="text"
					name="alias"
					bind:value={newCardAlias}
					placeholder="Ej. Nómina"
				/>
			</div>

			<div
				style="padding-bottom: 16px; padding-top: 16px; margin-top: 8px; border-top: 1px solid var(--border);"
			>
				<Button
					type="button"
					variant="secondary"
					disabled={!newCardNumber || newCardNumber.length < 3}
					loading={addingCard}
					style="width: 100%;"
					onclick={() => confirmAction('Vincular Tarjeta', '¿Estás seguro de que deseas vincular esta nueva tarjeta a tu cuenta?', () => submitAddCardBtn.click())}
				>
					Añadir
				</Button>
				<button type="submit" bind:this={submitAddCardBtn} style="display: none;" disabled={!newCardNumber || newCardNumber.length < 3}></button>
			</div>
		</form>
	</div>

	<div class="card flush general-margin" data-od-id="desarrolladores">
		<h3 class="headline">Desarrolladores (API)</h3>

		<div class="kv-row" style="display: block;">
			<div class="kv-label" style="margin-bottom: 8px;">API Key</div>
			<div style="display: flex; gap: 8px; align-items: center;">
				<Input
					type="text"
					class="mono"
					readonly
					value={form?.newApiKey || data.user?.api_key || 'No generada'}
					style="flex: 1;"
				/>
				<form
					method="POST"
					action="?/rotateApiKey"
					use:enhance={() => {
						rotatingApi = true;
						return async ({ update }) => {
							await update();
							rotatingApi = false;
						};
					}}
					style="flex: 0 0 auto;"
				>
					<Button
						type="button"
						aria-label="Rotar API Key"
						variant="secondary"
						style="padding: 10px; width: auto; min-width: 0;"
						loading={rotatingApi}
						onclick={() => confirmAction('Rotar API Key', '¿Estás seguro de que deseas rotar tu API Key? Las integraciones actuales dejarán de funcionar inmediatamente.', () => submitRotateApiBtn.click())}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							style="width: 16px; height: 16px;"
							><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z" /><path
								d="M21 12h-6"
							/><path d="M18 15l3-3-3-3" /></svg
						>
					</Button>
					<button type="submit" bind:this={submitRotateApiBtn} style="display: none;"></button>
				</form>
			</div>
		</div>

		<div class="kv-row" style="display: block; border-bottom: 0;">
			<div class="kv-label" style="margin-bottom: 8px;">Webhook URL (Síncrono)</div>
			<form
				method="POST"
				action="?/updateWebhook"
				use:enhance={() => {
					loadingWebhook = true;
					return async ({ update }) => {
						await update({ reset: false });
						loadingWebhook = false;
					};
				}}
				style="display: flex; gap: 8px; align-items: center;"
			>
				<Input
					type="url"
					name="webhook_url"
					bind:value={webhookUrl}
					placeholder="https://tu-sistema.com/webhook"
					style="flex: 1; min-width: 0;"
					isValid={webhookUrl !== (data.user?.webhook_url || '') ? isWebhookValid : undefined}
				/>
				<Button
					type="button"
					variant="secondary"
					disabled={!canSubmitWebhook}
					style="padding: 10px 14px; width: auto; flex: 0 0 auto;"
					loading={loadingWebhook}
					onclick={() => confirmAction('Actualizar Webhook', '¿Estás seguro de que deseas actualizar la URL de tu webhook?', () => submitWebhookBtn.click())}
				>
					Guardar
				</Button>
				<button type="submit" bind:this={submitWebhookBtn} style="display: none;" disabled={!canSubmitWebhook}></button>
			</form>
		</div>
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
	.profile-hero {
		background: var(--brand-core);
		color: #fff;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		border-radius: 0 0 28px 28px;
		text-align: center;
	}
	.profile-hero .avatar.lg {
		background: #fff;
		color: var(--brand-core);
		box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
	}
	.profile-hero h2 {
		font-family: var(--font-display);
		font-size: 19px;
		width: 100%;
		font-weight: 600;
		letter-spacing: -0.01em;
	}
</style>
