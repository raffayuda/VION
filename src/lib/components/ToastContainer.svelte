<script lang="ts">
	import { toasts } from '$lib/stores/toastStore';
	import Toast from './Toast.svelte';
</script>

<div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div class="pointer-events-auto">
			<Toast {toast} />
		</div>
	{/each}
</div>
