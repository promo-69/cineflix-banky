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

	let submitRotateApiBtn: HTMLButtonElement;
	let submitWebhookBtn: HTMLButtonElement;

	$effect(() => {
		webhookUrl = data.user?.webhook_url || '';
	});

	let isWebhookValid = $derived(webhookUrl === '' || /^https?:\/\/.+/.test(webhookUrl));
	let hasWebhookChanged = $derived(webhookUrl !== (data.user?.webhook_url || ''));
	let canSubmitWebhook = $derived(hasWebhookChanged && isWebhookValid);
</script>

<svelte:head>
	<title>{data.appName} | Desarrolladores (API)</title>
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
	<h1>Desarrolladores (API)</h1>
</header>

<div class="page-content general-margin">
	<div class="card flush general-margin">
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
