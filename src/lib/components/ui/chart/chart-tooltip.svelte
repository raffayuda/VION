<script lang="ts">
	import type { ChartConfig } from './index.js';

	let {
		config = {},
		label = '',
		hideLabel = false,
		hideIndicator = false,
		indicator = 'dot',
		formatter,
	}: {
		config?: ChartConfig;
		label?: string;
		hideLabel?: boolean;
		hideIndicator?: boolean;
		indicator?: 'dot' | 'line' | 'dashed';
		formatter?: import('svelte').Snippet<[{ name: string; value: unknown; color: string }]>;
	} = $props();
</script>

<!-- Tooltip is rendered by LayerChart internally; this is a style wrapper -->
<div class="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs shadow-xl">
	{#if !hideLabel && label}
		<p class="font-medium" style="color:#1a1a2e">{label}</p>
	{/if}
	<slot />
</div>
