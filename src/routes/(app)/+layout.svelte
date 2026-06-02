<script lang="ts">
  import Tabbar from '$lib/components/Tabbar.svelte';
  let { children } = $props();
</script>

{@render children()}
<Tabbar />
