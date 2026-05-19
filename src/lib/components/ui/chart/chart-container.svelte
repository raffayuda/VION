<script lang="ts">
	import type { ChartConfig } from './index.js';
	import { cn } from '$lib/utils.js';

	let {
		config,
		class: className = '',
		children,
		...restProps
	}: {
		config: ChartConfig;
		class?: string;
		children?: import('svelte').Snippet;
		[key: string]: unknown;
	} = $props();

	// Inject CSS variables for chart colors
	let styleVars = $derived(
		Object.entries(config)
			.map(([key, val]) => (val.color ? `--color-${key}: ${val.color}` : ''))
			.filter(Boolean)
			.join('; ')
	);
</script>

<div
	class={cn('flex aspect-video justify-center text-xs', className)}
	style={styleVars}
	{...restProps}
>
	{@render children?.()}
</div>
