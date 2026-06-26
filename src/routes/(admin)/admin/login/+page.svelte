<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="app-container auth-app">
	<header class="auth-hero" data-od-id="admin-login-hero">
		<div class="brand-mark light">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-1v2axqk"><path d="M12 2L2 7l10 5 10-5-10-5Z" class="svelte-1v2axqk"></path><path d="M2 17l10 5 10-5" class="svelte-1v2axqk"></path><path d="M2 12l10 5 10-5" class="svelte-1v2axqk"></path></svg>
			<span class="word">banky admin</span>
		</div>
		<h1>Panel de Control</h1>
		<p>Acceso exclusivo para el super usuario del sistema.</p>
	</header>

	<div class="page-content general-margin">
		<section class="auth-card" data-od-id="admin-login-form">
			<h2>Iniciar Sesión</h2>

			{#if form?.error}
				<AlertMessage {form} />
			{/if}

			<form method="POST" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}>
				<div class="field">
					<label>Usuario</label>
					<Input name="username" placeholder="admin" required />
				</div>
				<div class="field">
					<label>Contraseña</label>
					<Input name="password" type="password" placeholder="••••••••" required />
				</div>

				<div class="spacer"></div>
				<Button type="submit" variant="primary" disabled={loading} style="width: 100%; border: none;">
					{loading ? 'Ingresando...' : 'Acceder al Panel'}
				</Button>
			</form>
		</section>

		<div style="text-align: center; margin-top: 2rem;">
			<a href="/login" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
				Volver a Banca en Línea
			</a>
		</div>
	</div>
</div>

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: var(--muted);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
	}
	.back-link:hover {
		color: var(--brand-core, #000);
	}
	.back-link svg {
		width: 18px;
		height: 18px;
	}
</style>
