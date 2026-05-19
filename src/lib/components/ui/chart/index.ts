export { default as Container } from './chart-container.svelte';
export { default as Tooltip } from './chart-tooltip.svelte';

export type ChartConfig = {
	[key: string]: {
		label?: string;
		color?: string;
		icon?: unknown;
		theme?: { light?: string; dark?: string };
	};
};
