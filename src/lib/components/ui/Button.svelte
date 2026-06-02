<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger-ghost';
		loading?: boolean;
		loadingText?: string;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		loading = false,
		loadingText = 'Procesando...',
		disabled = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="btn {variant} {className}"
	disabled={disabled || loading}
	{...rest}
>
	{#if loading}
		{loadingText}
	{:else if children}
		{@render children()}
	{/if}
</button>
