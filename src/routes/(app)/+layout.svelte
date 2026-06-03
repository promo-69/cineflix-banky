<script lang="ts">
	import Tabbar from '$lib/components/Tabbar.svelte';
	import { navigating } from '$app/stores';
	let { children } = $props();
</script>

{#if $navigating}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{/if}

<div class="app-container">
	<header class="app-header">
		<div class="brand">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg
			>
			<span>Banky</span>
		</div>
		<form method="POST" action="/perfil?/logout" class="logout-form">
			<button type="submit" class="logout-btn" title="Cerrar sesión">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
						x1="21"
						y1="12"
						x2="9"
						y2="12"
					/></svg
				>
				<span>Salir</span>
			</button>
		</form>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<Tabbar />
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
	.logout-form {
		display: flex;
	}
	.logout-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: var(--danger);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		padding: 8px;
		border-radius: var(--r-sm);
		transition: background 0.2s;
	}
	.logout-btn:hover {
		background: rgba(239, 68, 68, 0.1);
	}
	.logout-btn svg {
		width: 18px;
		height: 18px;
	}
	.app-main {
		height: calc(100% - 70px * 2);
		padding-top: 0;
		display: flex;
		flex-wrap: wrap;
		overflow-x: hidden;
		position: relative;
		align-content: flex-start;
		gap: 1.5rem;
		overflow-y: auto;
		padding-bottom: 24px;
		background: var(--surface-2);
		width: 100%;

		& > * {
			width: 100%;
		}
	}

	.preloader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(var(--surface-rgb, 255, 255, 255), 0.7);
		backdrop-filter: blur(4px);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--border);
		border-top-color: var(--brand-core);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
