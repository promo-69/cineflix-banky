<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { open = $bindable(false), type = 'success', title = '', message = '', receipt = null, onClose = () => {} } = $props();

	function handleClose() {
		open = false;
		onClose();
	}
</script>

{#if open}
	<div class="modal-backdrop" transition:fade={{ duration: 200 }}>
		<div class="modal-content" transition:scale={{ duration: 200, start: 0.95 }}>
			<div class="icon-circle {type}">
				{#if type === 'success'}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
				{/if}
			</div>
			<h2>{title}</h2>
			<p>{message}</p>
			
			{#if receipt}
				<div class="receipt-card" style="width: 100%; text-align: left; background: var(--surface-2); border-radius: var(--r-md); padding: 16px; margin-bottom: 24px;">
					<div class="detail-row">
						<span class="l">Operación</span>
						<span class="r">{receipt.type}</span>
					</div>
					<div class="detail-row">
						<span class="l">Monto</span>
						<span class="r mono">Bs. {Number(receipt.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
					</div>
					<div class="detail-row">
						<span class="l">Destino</span>
						<span class="r">{receipt.destination}</span>
					</div>
					{#if receipt.account}
						<div class="detail-row">
							<span class="l">Cuenta</span>
							<span class="r mono">{receipt.account}</span>
						</div>
					{/if}
					{#if receipt.phone}
						<div class="detail-row">
							<span class="l">Teléfono</span>
							<span class="r mono">{receipt.phone}</span>
						</div>
					{/if}
					{#if receipt.bank}
						<div class="detail-row">
							<span class="l">Banco</span>
							<span class="r">{receipt.bank}</span>
						</div>
					{/if}
					<div class="detail-row">
						<span class="l">Referencia</span>
						<span class="r mono">{receipt.reference}</span>
					</div>
					<div class="detail-row">
						<span class="l">Fecha</span>
						<span class="r">{new Date(receipt.date).toLocaleString()}</span>
					</div>
				</div>
			{/if}

			<button type="button" class="btn primary" onclick={handleClose} style="width: 100%; border: none; cursor: pointer;">Aceptar</button>
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
		padding: 32px 24px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 10px 40px rgba(0,0,0,0.3);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.icon-circle {
		width: 64px; height: 64px;
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		margin-bottom: 20px;
	}
	.icon-circle svg { width: 32px; height: 32px; }
	.icon-circle.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
	.icon-circle.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
	.modal-content h2 { margin-top: 0; font-size: 22px; color: var(--text-main, #111); margin-bottom: 8px; }
	.modal-content p { color: var(--muted, #666); font-size: 15px; margin-bottom: 28px; line-height: 1.5; }
</style>
