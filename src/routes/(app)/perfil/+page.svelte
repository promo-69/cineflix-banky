<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loadingWebhook = $state(false);
	let rotatingApi = $state(false);
	let webhookUrl = $state('');
	let loadingProfile = $state(false);
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let email = $state('');

	$effect(() => {
		webhookUrl = data.user?.webhook_url || '';
		firstName = data.user?.first_name || '';
		lastName = data.user?.last_name || '';
		phone = data.user?.phone || '';
		email = data.user?.email || '';
	});

	let hasProfileChanges = $derived(
		firstName !== (data.user?.first_name || '') ||
			lastName !== (data.user?.last_name || '') ||
			phone !== (data.user?.phone || '') ||
			email !== (data.user?.email || ''),
	);
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
	<div class="card flush general-margin" style="padding: 0 16px;" data-od-id="datos-personales">
		<div
			style="padding: 14px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 600;"
		>
			Datos personales
		</div>

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
				/>
			</div>

			<div class="kv-row" style="display: block; border-bottom: 0; padding-bottom: 8px; padding-top: 8px;">
				<div class="kv-label" style="margin-bottom: 8px;">Teléfono móvil</div>
				<Input type="tel" name="phone" class="mono" bind:value={phone} restrict="phone" />
			</div>

			<div class="kv-row" style="display: block; padding-bottom: 0; padding-top: 8px; border-bottom: 0">
				<div class="kv-label" style="margin-bottom: 8px;">Correo electrónico</div>
				<Input type="email" name="email" bind:value={email} />
			</div>

			<div
				style="padding-bottom: 16px;  padding-top: 16px;margin-top: 16px; border-top: 1px solid var(--border);"
			>
				<Button
					type="submit"
					variant="primary"
					disabled={!hasProfileChanges}
					loading={loadingProfile}
					style="width: 100%;"
				>
					Guardar cambios
				</Button>
			</div>
		</form>
	</div>

	<div class="card flush general-margin" style="padding: 0 16px;" data-od-id="desarrolladores">
		<div
			style="padding: 14px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-weight: 600;"
		>
			Desarrolladores (API)
		</div>

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
						type="submit"
						aria-label="Rotar API Key"
						variant="secondary"
						style="padding: 10px; width: auto; min-width: 0;"
						loading={rotatingApi}
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
						await update();
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
				/>
				<Button
					type="submit"
					variant="secondary"
					style="padding: 10px 14px; width: auto; flex: 0 0 auto;"
					loading={loadingWebhook}
				>
					Guardar
				</Button>
			</form>
		</div>
	</div>
</div>

<div class="general-margin" style="text-align: center; color: var(--muted-2); font-size: 11px;">
	Core Satélite MVP · v1.0.0
</div>

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
