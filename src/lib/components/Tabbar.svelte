<script lang="ts">
  import { page } from '$app/state';
</script>

<nav class="tabbar" data-od-id="tabbar">
<li>
  <a href="/dashboard" class:active={page.url.pathname === '/dashboard'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
    <span>Inicio</span>
  </a>
  </li>
  <li>
  <a href="/estado-cuenta" class:active={page.url.pathname === '/estado-cuenta'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-5"/></svg>
    <span>Movimientos</span>
  </a>
  </li>
  <li>
  <a href="/transferencia" class:active={page.url.pathname === '/transferencia'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h12"/><path d="M17 7l-4-4M17 7l-4 4"/><path d="M17 17H5"/><path d="M7 17l4-4M7 17l4 4"/></svg>
    <span>Enviar</span>
  </a>
  </li>
  <li>
  <a href="/perfil" class:active={page.url.pathname === '/perfil'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    <span>Perfil</span>
  </a>
  </li>
  <li>
  <a href="/directorio" class:active={page.url.pathname === '/directorio'}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    <span>Directorio</span>
  </a>
  </li>
</nav>
