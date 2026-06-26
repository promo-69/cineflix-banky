<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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

	let submitAddCardBtn: HTMLButtonElement;
	let submitDeleteCardBtn: Record<string, HTMLButtonElement> = {};
</script>

<svelte:head>
	<title>{data.appName} | Mis Tarjetas</title>
</svelte:head>

<header class="appbar">
	<a class="back-btn" href="/perfil" aria-label="Volver">
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
	</a>
	<h1>Mis Tarjetas</h1>
</header>

<div class="page-content general-margin">
	<div class="card flush general-margin">
		<h3 class="headline">Tarjetas de Débito</h3>

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

			<div style="padding-bottom: 16px; padding-top: 16px; margin-top: 8px; border-top: 1px solid var(--border);">
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
</div>

<ConfirmModal
	bind:open={showConfirm}
	title={confirmTitle}
	message={confirmMessage}
	onConfirm={() => {
		if (pendingSubmit) pendingSubmit();
	}}
/>
