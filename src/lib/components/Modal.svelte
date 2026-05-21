<script lang="ts">
	import { onDestroy } from 'svelte';
	import { X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		size?: 'sm' | 'md' | 'lg';
		children?: import('svelte').Snippet;
	}

	let { open, title, onclose, size = 'md', children }: Props = $props();

	const sizeClass = {
		sm: 'max-w-sm',
		md: 'max-w-lg',
		lg: 'max-w-2xl'
	};

	let dialogEl = $state<HTMLDivElement | null>(null);

	function portal(node: HTMLElement) {
		if (typeof document === 'undefined') return;
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') { onclose(); return; }
		if (e.key === 'Tab' && dialogEl) {
			const focusable = dialogEl.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey) {
				if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
			} else {
				if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
			}
		}
	}

	$effect(() => {
		if (typeof document === 'undefined') return;

		if (open) {
			document.body.style.overflow = 'hidden';
			// focus first focusable element
			setTimeout(() => {
				const first = dialogEl?.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				first?.focus();
			}, 50);
		} else {
			document.body.style.overflow = '';
		}
	});

	onDestroy(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = '';
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div
		use:portal
		class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background:rgba(15,23,42,0.34);backdrop-filter:blur(10px);"
		role="presentation"
		onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
	>
		<!-- Dialog -->
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			class="modal-panel relative w-full {sizeClass[size]} max-h-[90vh] overflow-visible"
			style="background:rgba(255,255,255,0.98);border-radius:32px;box-shadow:var(--shadow-xl);border:1px solid rgba(0,0,0,0.04);"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
				<h2 id="modal-title" class="text-base font-bold" style="color:#1a1a2e">{title}</h2>
				<button
					onclick={onclose}
					aria-label="Tutup"
					class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
				>
					<X size={16} color="#6b7280" />
				</button>
			</div>
			<!-- Body -->
			<div class="max-h-[calc(90vh-88px)] overflow-y-auto overflow-x-visible px-6 py-5">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		animation: modal-fade-in 220ms ease-out both;
	}

	.modal-panel {
		transform-origin: center;
		animation: modal-panel-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes modal-fade-in {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes modal-panel-in {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.96);
			filter: blur(6px);
		}

		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}
</style>
