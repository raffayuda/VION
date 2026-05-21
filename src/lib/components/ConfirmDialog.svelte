<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		onconfirm: () => void;
		oncancel: () => void;
	}

	let { open, title, description, confirmLabel = 'Hapus', onconfirm, oncancel }: Props = $props();
</script>

<Modal {open} {title} onclose={oncancel} size="sm">
	<p class="text-sm mb-6" style="color:var(--text-secondary);">{description}</p>
	<div class="flex gap-3 justify-end">
		<button
			onclick={oncancel}
			class="surface-btn px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
			style="color:var(--text-body);"
		>
			Batal
		</button>
		<button
			onclick={onconfirm}
			class="primary-btn px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg"
		>
			{confirmLabel}
		</button>
	</div>
</Modal>
