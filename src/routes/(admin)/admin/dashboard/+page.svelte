<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	let { data }: { data: PageData } = $props();
	let search = $state('');

	function handleSearch(e: Event) {
		e.preventDefault();
		goto(`/admin/dashboard?q=${encodeURIComponent(search)}&page=1`);
	}
</script>

<div class="app-container">
	<header class="app-header">
		<div class="brand">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5Z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
			<span>Banky Admin</span>
		</div>
		<div style="display: flex; gap: 12px; align-items: center;">
			<button class="logout-btn" title="Tokens Maestros" onclick={() => goto('/admin/master-tokens')} style="background: var(--surface-2); color: var(--fg);">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
				<span>Tokens (POS)</span>
			</button>
			<button class="logout-btn" title="Cerrar sesión" onclick={async () => {
			await fetch('/api/admin/logout', { method: 'POST' });
			window.location.href = '/admin/login';
		}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
				<span>Salir</span>
			</button>
		</div>
	</header>

	<main class="app-main">
		<div class="general-margin" style="padding-top: 24px;">
			<div class="page-header" style="padding: 0 0 24px 0;">
				<h1>Cuentas Registradas</h1>
				<p>Gestión y administración de usuarios</p>
			</div>

			<form onsubmit={handleSearch} class="field" style="margin-bottom: 24px; display: flex; gap: 8px;">
				<input class="input" type="text" bind:value={search} placeholder="Buscar por cédula (ej. V-12345678)" style="flex: 1;" />
				<Button type="submit" variant="primary" style="width: auto;">Buscar</Button>
			</form>

			<div class="cards-grid">
				{#each data.users as user}
					<a href="/admin/users/{user.id}" class="card" style="text-decoration: none; color: inherit; display: block; transition: transform 0.2s; cursor: pointer;">
						<div class="kv-row" style="border: 0; padding: 0;">
							<div>
								<div class="kv-value">{user.first_name} {user.last_name}</div>
								<div class="kv-label" style="margin-top: 4px; text-transform: none; letter-spacing: 0;">{user.document_id}</div>
							</div>
							<div class="kv-value mono" style="font-size: 16px; color: var(--brand-core);">
								Bs. {Number(user.balance).toFixed(2)}
							</div>
						</div>
					</a>
				{:else}
					<div class="empty-state">No se encontraron cuentas.</div>
				{/each}
			</div>

			{#if data.totalPages > 1}
				<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
					<Button variant="secondary" style="width: auto; padding: 8px 16px;" disabled={data.page <= 1} onclick={() => goto(`?q=${encodeURIComponent(search)}&page=${data.page - 1}`)}>Anterior</Button>
					<span style="font-size: 14px; font-weight: 500; color: var(--muted);">Página {data.page} de {data.totalPages}</span>
					<Button variant="secondary" style="width: auto; padding: 8px 16px;" disabled={data.page >= data.totalPages} onclick={() => goto(`?q=${encodeURIComponent(search)}&page=${data.page + 1}`)}>Siguiente</Button>
				</div>
			{/if}
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
	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
		border-color: var(--brand-medium);
	}
</style>
