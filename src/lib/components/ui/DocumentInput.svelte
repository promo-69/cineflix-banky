<script lang="ts">
	import Select from './Select.svelte';
	import Input from './Input.svelte';

	interface Props {
		prefix?: string;
		number?: string;
		isValid?: boolean | undefined;
		id?: string;
		namePrefix?: string;
		nameNumber?: string;
	}

	let {
		prefix = $bindable('V'),
		number = $bindable(''),
		isValid = undefined,
		id = 'doc_number',
		namePrefix = 'doc_prefix',
		nameNumber = 'doc_number'
	}: Props = $props();
</script>

<div class="form-row" style="display: flex; align-items: center; gap: 8px;">
	<Select
		name={namePrefix}
		style="font-family: var(--font-mono); width: 75px; flex-shrink: 0;"
		bind:value={prefix}
	>
		<option value="V">V</option>
		<option value="E">E</option>
		<option value="J">J</option>
		<option value="G">G</option>
	</Select>

	<Input
		{id}
		name={nameNumber}
		type="text"
		restrict="phone" 
		placeholder="12345678"
		autocomplete="username"
		maxlength={9}
		style="font-family: var(--font-mono); flex: 1;"
		bind:value={number}
		{isValid}
	/>
</div>
