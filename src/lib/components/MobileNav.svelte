<script lang="ts">
	import { page } from '$app/stores';
	import {
		LayoutDashboard, ReceiptText, ScanLine, PieChart, Sparkles
	} from '@lucide/svelte';

	const items = [
		{ href: '/',          label: 'Home',      icon: LayoutDashboard, highlight: false },
		{ href: '/transaksi', label: 'Transaksi', icon: ReceiptText,     highlight: false },
		{ href: '/ocr',       label: 'Scan',      icon: ScanLine,        highlight: true  },
		{ href: '/anggaran',  label: 'Anggaran',  icon: PieChart,        highlight: false },
		{ href: '/insight',   label: 'Insight',   icon: Sparkles,        highlight: false },
	];

	function isActive(href: string) {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}
</script>

<nav class="bottom-nav lg:hidden flex items-center justify-around px-2 py-2">
	{#each items as item}
		{@const active = isActive(item.href)}
		{@const Icon = item.icon}
		<a
			href={item.href}
			class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-0"
			style={item.highlight
				? 'background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4);padding:10px 16px;'
				: active ? 'color:#FF8A4C;' : 'color:#9ca3af;'}
		>
			<Icon
				size={item.highlight ? 22 : 20}
				color={item.highlight ? 'white' : active ? '#FF8A4C' : '#9ca3af'}
				strokeWidth={active || item.highlight ? 2.2 : 1.8}
			/>
			{#if !item.highlight}
				<span class="text-xs font-medium truncate" style="font-size:10px;">{item.label}</span>
			{/if}
		</a>
	{/each}
</nav>
