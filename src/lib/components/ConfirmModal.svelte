<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { open = $bindable(false), title = '¿Estás seguro?', message = 'Esta acción no se puede deshacer.', onConfirm = () => {}, onCancel = () => {} } = $props();

	function handleConfirm() {
		open = false;
		onConfirm();
	}

	function handleCancel() {
		open = false;
		onCancel();
	}
</script>

{#if open}
	<div class="modal-backdrop" transition:fade={{ duration: 200 }}>
		<div class="modal-content" transition:scale={{ duration: 200, start: 0.95 }}>
			<h2>{title}</h2>
			<p>{message}</p>
			<div class="modal-actions">
				<button type="button" class="btn secondary" onclick={handleCancel}>Cancelar</button>
				<button type="button" class="btn primary" onclick={handleConfirm}>Confirmar</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}
	.modal-content {
		background: var(--surface, #fff);
		border-radius: var(--r-lg, 16px);
		padding: 24px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 10px 40px rgba(0,0,0,0.3);
		text-align: center;
	}
	.modal-content h2 { margin-top: 0; font-size: 20px; color: var(--text-main, #111); }
	.modal-content p { color: var(--muted, #666); font-size: 14px; margin-bottom: 24px; }
	.modal-actions {
		display: flex;
		gap: 12px;
	}
	.modal-actions button {
		flex: 1;
		border: none;
		cursor: pointer;
	}
	.btn.secondary {
		background: var(--surface-2, #e5e7eb);
		color: var(--text-main, #111);
	}
</style>
