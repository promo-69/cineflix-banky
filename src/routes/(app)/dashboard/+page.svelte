<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="header-section">
	<header class="dash-header" data-od-id="dashboard-header">
		<div class="top-row">
			<div class="avatar" style="background: rgba(255,255,255,0.15); color: #fff;">
				{(data.user?.first_name?.[0] || '') + (data.user?.last_name?.[0] || '') || 'US'}
			</div>
			<div class="greet">
				Buenas tardes,
				<strong>
					{#if data.user?.first_name || data.user?.last_name}
						{data.user?.first_name ? data.user.first_name : ''}{data.user?.last_name
							? ' ' + data.user?.last_name
							: ''}
					{:else}
						{data.user?.document_id}
					{/if}
				</strong>
			</div>
		</div>
	</header>
	<section class="dash-balance general-margin" data-od-id="balance-card">
		<div class="label">Saldo disponible</div>
		<p class="amount">
			<span class="currency">Bs.</span>{Number(data.user?.balance || 0).toLocaleString('es-VE', {
				minimumFractionDigits: 2,
			})}
		</p>
		<div class="acct">
			<div>
				<span class="l">Cuenta corriente</span><br />
				<span class="v">{data.user?.account_number || '---'}</span>
			</div>
		</div>
	</section>
</div>

<div class="quick-actions general-margin" data-od-id="quick-actions">
	<a class="quick-action" href="/transferencia">
		<span class="ico">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg
			>
		</span>
		<span>Transferir</span>
	</a>
	<a class="quick-action" href="/transferencia?tab=pago_movil">
		<span class="ico">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M11 18h2" /></svg
			>
		</span>
		<span>Pago móvil</span>
	</a>
</div>

<section class="recent-movements general-margin">
	<hgroup class="section-title">
		<h3>Movimientos recientes</h3>
		<a href="/estado-cuenta">Ver todos</a>
	</hgroup>
	<div class="card flush" data-od-id="recent-txns">
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
				No hay movimientos recientes.
			</div>
		{/each}
	</div>
</section>
