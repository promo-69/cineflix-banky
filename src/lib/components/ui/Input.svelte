<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		value?: string;
		restrict?: 'numeric' | 'alpha' | 'phone';
		isValid?: boolean | undefined;
		icon?: Snippet;
	}

	let {
		value = $bindable(''),
		restrict,
		isValid = undefined,
		icon,
		class: className = '',
		oninput,
		...rest
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let val = target.value;

		if (restrict === 'numeric') {
			// Only digits and optional single dot. Removes commas, plus signs, etc.
			val = val.replace(/[^0-9.]/g, '');
			const parts = val.split('.');
			if (parts.length > 2) {
				val = parts[0] + '.' + parts.slice(1).join('');
			}
		} else if (restrict === 'phone') {
			// Only digits
			val = val.replace(/[^0-9]/g, '');
		} else if (restrict === 'alpha') {
			// Only letters (including accents) and spaces
			val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
		}

		if (target.value !== val) {
			target.value = val;
		}
		
		value = val;

		if (oninput) {
			(oninput as any)(e);
		}
	}

	let validationClass = $derived(isValid === true ? 'is-valid' : isValid === false ? 'is-invalid' : '');
	let wrapperClass = $derived(icon ? 'input-wrap' : '');
</script>

{#if icon}
	<div class="{wrapperClass}">
		<span class="lead-icon" aria-hidden="true" style="left: 12px; position: absolute; top: 50%; transform: translateY(-50%); color: var(--muted-2);">
			{@render icon()}
		</span>
		<input
			{...rest}
			class="input with-icon {validationClass} {className}"
			style="padding-left: 40px; {rest.style || ''}"
			{value}
			oninput={handleInput}
		/>
	</div>
{:else}
	<input
		{...rest}
		class="input {validationClass} {className}"
		{value}
		oninput={handleInput}
	/>
{/if}
