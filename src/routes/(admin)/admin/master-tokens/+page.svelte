<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let { data }: { data: PageData } = $props();

	let description = $state('');

	// Modal State
	let showConfirm = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let pendingSubmit: (() => void) | null = null;

	function confirmAction(title: string, message: string, action: () => void) {
		confirmTitle = title;
		confirmMessage = message;
		pendingSubmit = () => action();
		showConfirm = true;
	}

	let submitCreateBtn: HTMLButtonElement;
	let submitDeleteBtn: Record<string, HTMLButtonElement> = {};
	let deletingId = $state<number | null>(null);
	let creating = $state(false);
</script>

<svelte:head>
	<title>Tokens Maestros - Administrador - Banky</title>
</svelte:head>

{#if showConfirm}
	<ConfirmModal
		bind:open={showConfirm}
		title={confirmTitle}
		message={confirmMessage}
		onConfirm={() => {
			if (pendingSubmit) pendingSubmit();
			showConfirm = false;
		}}
		onCancel={() => (showConfirm = false)}
	/>
{/if}

<div class="app-container">
	<header class="app-header">
		<button class="icon-btn" onclick={() => history.back()} style="background: none; color: var(--fg); border: none; cursor: pointer; padding: 8px;">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
		</button>
		<div class="brand" style="margin-right: auto; margin-left: 8px;">
			<span>Tokens Maestros (POS)</span>
		</div>
		<button class="logout-btn" title="Cerrar sesión" onclick={async () => {
			await fetch('/api/admin/logout', { method: 'POST' });
			window.location.href = '/admin/login';
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
			<span>Salir</span>
		</button>
	</header>

	<main class="app-main">
		<div class="general-margin" style="padding-top: 24px;">
	<div class="card" style="margin-bottom: 24px;">
		<h3 class="headline">Generar Nuevo Token</h3>
		<p style="font-size: 14px; color: var(--muted); margin-bottom: 16px;">
			Estos tokens permiten a los sistemas externos (como Puntos de Venta) autorizar transferencias en nombre de un usuario específico proporcionando el código de su tarjeta.
		</p>
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				creating = true;
				return async ({ update }) => {
					await update();
					creating = false;
					description = '';
				};
			}}
		>
			<div class="field">
				<label>Descripción del Dispositivo (Opcional)</label>
				<Input
					name="description"
					bind:value={description}
					placeholder="Ej. POS Sucursal Chacao"
				/>
			</div>
			<Button
				type="button"
				variant="primary"
				loading={creating}
				onclick={() => confirmAction('Generar Token', '¿Seguro que deseas crear un nuevo token maestro?', () => submitCreateBtn.click())}
			>
				Generar Token
			</Button>
			<button type="submit" bind:this={submitCreateBtn} style="display: none;"></button>
		</form>
	</div>

	<div class="card">
		<h3 class="headline">Tokens Activos</h3>
		{#if data.tokens.length === 0}
			<div class="empty-state">No hay tokens maestros activos.</div>
		{:else}
			<div style="display: flex; flex-direction: column; gap: 12px;">
				{#each data.tokens as token}
					<div class="kv-row" style="padding: 12px; background: var(--surface-2); border-radius: var(--r-sm); border: 1px solid var(--border); align-items: center;">
						<div style="flex: 1; word-break: break-all;">
							<div class="kv-label" style="margin-bottom: 4px;">{token.description || 'Sin descripción'}</div>
							<div class="kv-value mono" style="font-size: 13px;">{token.token}</div>
							<div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Creado: {new Date(token.created_at).toLocaleString()}</div>
						</div>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								deletingId = token.id;
								return async ({ update }) => {
									await update();
									deletingId = null;
								};
							}}
						>
							<input type="hidden" name="id" value={token.id} />
							<Button
								type="button"
								variant="secondary"
								style="padding: 8px 12px; min-width: 0; color: var(--danger);"
								loading={deletingId === token.id}
								onclick={() => confirmAction('Revocar Token', '¿Estás completamente seguro de que deseas revocar este token maestro? Esta acción no se puede deshacer y los dispositivos que lo usen dejarán de funcionar inmediatamente.', () => submitDeleteBtn[token.id].click())}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
							</Button>
							<button type="submit" bind:this={submitDeleteBtn[token.id]} style="display: none;"></button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</div>
	</div>
	</main>
</div>

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
	.icon-btn:hover {
		background: rgba(0,0,0,0.05) !important;
		border-radius: var(--r-sm);
	}
</style>
