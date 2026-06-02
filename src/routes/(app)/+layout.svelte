<script lang="ts">
  import Tabbar from '$lib/components/Tabbar.svelte';
  let { children } = $props();
</script>

<div class="app-container">
  <header class="app-header">
    <div class="brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <span>Banky</span>
    </div>
    <form method="POST" action="/perfil?/logout" class="logout-form">
      <button type="submit" class="logout-btn" title="Cerrar sesión">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
	overflow-y: auto;
  }
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 50;
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
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
