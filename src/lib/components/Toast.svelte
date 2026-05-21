<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckCircle2, XCircle, Info, X } from '@lucide/svelte';
	import { dismissToast, type ToastItem } from '$lib/stores/toastStore';

	interface Props {
		toast: ToastItem;
	}

	let { toast }: Props = $props();

	let visible = $state(false);

	const config = {
		success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: CheckCircle2, iconColor: '#22C55E' },
		error:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: XCircle,      iconColor: '#EF4444' },
		info:    { bg: '#FFF7ED', border: '#FDBA74', text: '#9A3412', icon: Info,          iconColor: '#FF8A4C' }
	};

	const c = $derived(config[toast.type]);

	onMount(() => {
		// trigger slide-in
		requestAnimationFrame(() => { visible = true; });

		const timer = setTimeout(() => {
			visible = false;
			setTimeout(() => dismissToast(toast.id), 300);
		}, toast.duration);

		return () => clearTimeout(timer);
	});
</script>

<div
	role="alert"
	aria-live="polite"
	onclick={() => dismissToast(toast.id)}
	onkeydown={(e) => e.key === 'Enter' && dismissToast(toast.id)}
	tabindex="0"
	class="flex items-start gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none transition-all duration-300 animate-scale-in"
	style="
		background:{c.bg};
		border:1px solid {c.border};
		min-width:260px;
		max-width:360px;
		box-shadow:var(--shadow-md);
		transform:{visible ? 'translateX(0)' : 'translateX(120%)'};
		opacity:{visible ? 1 : 0};
	"
>
	<c.icon size={18} color={c.iconColor} class="shrink-0 mt-0.5" />
	<p class="text-sm font-medium flex-1" style="color:{c.text}">{toast.message}</p>
	<button aria-label="Tutup notifikasi" onclick={(e) => { e.stopPropagation(); dismissToast(toast.id); }} class="hover:scale-110 transition-transform">
		<X size={14} color={c.text} />
	</button>
</div>
