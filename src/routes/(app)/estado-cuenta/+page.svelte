<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.appName} | Estado de cuenta</title>
</svelte:head>

<header class="appbar">
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
	<h1>Movimientos</h1>
</header>

<div class="page-content general-margin">
	<div class="card flush" style="padding: 4px 16px;">
		{#each data.transactions as txn}
			<div class="txn">
				<div class="ico {txn.amount > 0 ? 'credit' : 'debit'}">
					{#if txn.amount > 0}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg
						>
					{:else}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg
						>
					{/if}
				</div>
				<div class="txt">
					<div class="title">{txn.type === 'transfer' ? 'Transferencia' : 'Pago Móvil'}</div>
					<div class="sub">
						<span>Ref: {txn.reference}</span>
						<span
							>{new Date(txn.created_at).toLocaleString('es-VE', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
								hour12: true,
							})}</span
						>
					</div>
				</div>
				<div class="amt {txn.amount > 0 ? 'credit' : ''}">
					<div>
						{txn.amount > 0 ? '+' : '−'} Bs. {Math.abs(txn.amount).toLocaleString('es-VE', {
							minimumFractionDigits: 2,
						})}
					</div>
					<div style="font-size: 11px; color: var(--muted); font-weight: 500;">
						Saldo: Bs. {Number(txn.balance_after).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
					</div>
				</div>
			</div>
		{:else}
			<div style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">
				No hay movimientos registrados.
			</div>
		{/each}
	</div>

	{#if data.pagination.total > 0}
		<div class="pagination-footer">
			<div class="per-page">
				Items per page:
				<select class="limit-select" onchange={(e) => goto(`?page=1&limit=${(e.currentTarget as HTMLSelectElement).value}`)}>
					<option value="5" selected={data.pagination.limit === 5}>5</option>
					<option value="15" selected={data.pagination.limit === 15}>15</option>
					<option value="50" selected={data.pagination.limit === 50}>50</option>
				</select>
			</div>

			<div class="page-info">
				{(data.pagination.page - 1) * data.pagination.limit + 1} - {Math.min(
					data.pagination.page * data.pagination.limit,
					data.pagination.total,
				)} of {data.pagination.total}
			</div>

			<div class="page-controls">
				{#if data.pagination.page > 1}
					<a
						href="?page=1&limit={data.pagination.limit}"
						class="page-btn"
						aria-label="First page"
						data-sveltekit-replacestate
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" /></svg
						>
					</a>
					<a
						href="?page={data.pagination.page - 1}&limit={data.pagination.limit}"
						class="page-btn"
						aria-label="Previous page"
						data-sveltekit-replacestate
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
						>
					</a>
				{:else}
					<span class="page-btn disabled">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" /></svg
						>
					</span>
					<span class="page-btn disabled">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
						>
					</span>
				{/if}

				{#if data.pagination.page < data.pagination.totalPages}
					<a
						href="?page={data.pagination.page + 1}&limit={data.pagination.limit}"
						class="page-btn"
						aria-label="Next page"
						data-sveltekit-replacestate
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
						>
					</a>
					<a
						href="?page={data.pagination.totalPages}&limit={data.pagination.limit}"
						class="page-btn"
						aria-label="Last page"
						data-sveltekit-replacestate
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" /></svg
						>
					</a>
				{:else}
					<span class="page-btn disabled">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
						>
					</span>
					<span class="page-btn disabled">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" /></svg
						>
					</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.pagination-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 16px;
		font-size: 13px;
		color: var(--muted);
	}
	.per-page {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.limit-select {
		border: none;
		background: transparent;
		font-family: inherit;
		font-size: 13px;
		color: var(--fg);
		cursor: pointer;
		outline: none;
		border-bottom: 2px solid var(--brand-core);
		padding-bottom: 2px;
		font-weight: 500;
	}
	.page-info {
		font-weight: 500;
		color: var(--fg);
	}
	.page-controls {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.page-btn {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		color: var(--brand-core);
		text-decoration: none;
		transition: background 0.15s;
	}
	.page-btn:hover:not(.disabled) {
		background: var(--surface-2);
	}
	.page-btn svg {
		width: 16px;
		height: 16px;
	}
	.page-btn.disabled {
		color: var(--border-strong);
		cursor: default;
	}
</style>
