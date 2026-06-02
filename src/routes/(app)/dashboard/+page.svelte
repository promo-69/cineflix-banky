<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<div class="app dash-app">
  <header class="dash-header" data-od-id="dashboard-header">
    <div class="top-row">
      <div class="avatar" style="background: rgba(255,255,255,0.15); color: #fff;">
        {(data.user?.first_name?.[0] || '') + (data.user?.last_name?.[0] || '') || 'US'}
      </div>
      <div class="greet">
        Buenas tardes,
        <strong>
          {#if data.user?.first_name || data.user?.last_name}
            {data.user?.first_name ? data.user.first_name : ''}{data.user?.last_name ? ' ' + data.user?.last_name : ''}
          {:else}
            {data.user?.document_id}
          {/if}
        </strong>
      </div>
    </div>
  </header>

  <section class="dash-balance" data-od-id="balance-card">
    <div class="label">
      Saldo disponible
    </div>
    <p class="amount"><span class="currency">Bs.</span>{Number(data.user?.balance || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
    <div class="acct">
      <div>
        <span class="l">Cuenta corriente</span><br>
        <span class="v">{data.user?.account_number || '---'}</span>
      </div>
    </div>
  </section>

  <div class="quick-actions" data-od-id="quick-actions">
    <a class="quick-action" href="/transferencia">
      <span class="ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>
      </span>
      <span>Transferir</span>
    </a>
    <a class="quick-action" href="/transferencia?tab=pago_movil">
      <span class="ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></svg>
      </span>
      <span>Pago móvil</span>
    </a>
  </div>

  <div class="section-title">
    <h3>Movimientos recientes</h3>
    <a href="/estado-cuenta">Ver todos</a>
  </div>

  <div class="txn-list-wrap" data-od-id="recent-txns">
    {#each data.transactions as txn}
      <div class="txn">
        <div class="ico {txn.amount > 0 ? 'credit' : 'debit'}">
          {#if txn.amount > 0}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>
          {/if}
        </div>
        <div class="txt">
          <div class="title">{txn.type === 'transfer' ? 'Transferencia' : 'Pago Móvil'}</div>
          <div class="sub">Ref: {txn.reference} · {new Date(txn.created_at).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
        </div>
        <div class="amt {txn.amount > 0 ? 'credit' : ''}" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
          <div>{txn.amount > 0 ? '+' : '−'} Bs. {Math.abs(txn.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
          <div style="font-size: 11px; color: var(--muted); font-weight: 500;">Saldo: Bs. {Number(txn.balance_after).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    {:else}
      <div style="padding: 20px; text-align: center; color: var(--muted); font-size: 13px;">No hay movimientos recientes.</div>
    {/each}
  </div>

</div>

<style>
  .dash-app { background: var(--surface-2); }
  .dash-header { background: var(--brand-core); color: #fff; padding: 18px 20px 60px; border-radius: 0 0 24px 24px; position: relative; }
  .dash-header .top-row { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  .dash-header .greet { flex: 1; font-size: 13px; opacity: 0.85; }
  .dash-header .greet strong { display: block; font-size: 17px; font-weight: 600; opacity: 1; letter-spacing: -0.01em; }
  .dash-balance { margin: -42px 20px 0; background: linear-gradient(135deg, var(--brand-deep) 0%, var(--brand-core) 100%); color: #fff; border-radius: var(--r-xl); padding: 20px 22px; position: relative; overflow: hidden; box-shadow: 0 8px 24px -10px rgba(4,50,99,0.35); }
  .dash-balance::after { content: ''; position: absolute; right: -50px; top: -50px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(45,204,205,0.20) 0%, transparent 70%); pointer-events: none; }
  .dash-balance .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .dash-balance .amount { font-family: var(--font-mono); font-size: 34px; font-weight: 600; letter-spacing: -0.01em; margin: 0; line-height: 1.1; }
  .dash-balance .amount .currency { font-size: 18px; opacity: 0.8; margin-right: 5px; font-weight: 500; }
  .dash-balance .acct { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.18); font-size: 12px; }
  .dash-balance .acct .l { opacity: 0.75; }
  .dash-balance .acct .v { font-family: var(--font-mono); font-weight: 500; }
  .section-title { display: flex; justify-content: space-between; align-items: baseline; padding: 22px 20px 8px; }
  .section-title h3 { font-family: var(--font-display); font-size: 15px; font-weight: 600; margin: 0; color: var(--fg); }
  .section-title a { font-size: 12px; color: var(--brand-medium); text-decoration: none; font-weight: 500; }
  .quick-actions { margin: 24px 20px 0; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .txn-list-wrap { background: var(--surface); margin: 0 20px; border-radius: var(--r-lg); padding: 4px 16px; border: 1px solid var(--border); }
</style>
