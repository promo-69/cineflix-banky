<script lang="ts">
	let { form } = $props<{ form?: any }>();
	
	let visible = $state(false);
	let currentMessage = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (form?.error) {
			currentMessage = form.error;
			visible = true;
			clearTimeout(timer);
			timer = setTimeout(() => {
				visible = false;
			}, 5000);
		} else {
			visible = false;
		}

		return () => clearTimeout(timer);
	});
</script>

{#if visible && currentMessage}
	<div class="alert-error">
		{currentMessage}
	</div>
{/if}

<style>
	.alert-error {
		background: var(--danger);
		color: white;
		padding: 12px;
		border-radius: var(--r-md);
		margin-bottom: 20px;
		animation: fadein 0.3s ease;
		font-weight: 500;
	}
	@keyframes fadein {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
