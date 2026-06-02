<script lang="ts">
  import { page } from '$app/state';
</script>

<nav class="tabbar" data-od-id="tabbar">
  <a href="/dashboard" class:active={page.url.pathname === '/dashboard'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
    Inicio
  </a>
  <a href="/estado-cuenta" class:active={page.url.pathname === '/estado-cuenta'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-5"/></svg>
    Movimientos
  </a>
  <a href="/transferencia" class:active={page.url.pathname === '/transferencia'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h12"/><path d="M17 7l-4-4M17 7l-4 4"/><path d="M17 17H5"/><path d="M7 17l4-4M7 17l4 4"/></svg>
    Enviar
  </a>
  <a href="/perfil" class:active={page.url.pathname === '/perfil'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    Perfil
  </a>
  <form method="POST" action="/perfil?/logout" class="logout-form">
    <button type="submit" class="logout-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Salir
    </button>
  </form>
</nav>

<style>
  .logout-form {
    display: contents;
  }
  .logout-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 4px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 500;
    background: none;
    border: none;
    margin: 0;
    cursor: pointer;
    font-family: inherit;
    width: 100%;
  }
  .logout-btn svg {
    width: 22px;
    height: 22px;
    color: var(--danger);
  }
</style>
