<script lang="ts">
	import { page } from '$app/stores';
	import { user } from '$lib/data/dummy';
	import {
		LayoutDashboard, ReceiptText, ScanLine, PieChart,
		Target, TrendingUp, BarChart3,
		Sparkles, Settings, HelpCircle, ChevronDown, Crown, X, Wallet
	} from '@lucide/svelte';

	interface NavItem { href: string; label: string; icon: typeof LayoutDashboard; }

	let { sidebarOpen = false, closeSidebar }: { sidebarOpen?: boolean; closeSidebar?: () => void } = $props();

	const navItems: NavItem[] = [
		{ href: '/',           label: 'Dashboard',        icon: LayoutDashboard },
		{ href: '/transaksi',  label: 'Transaksi',         icon: ReceiptText     },
		{ href: '/ocr',        label: 'Scan Struk (OCR)',  icon: ScanLine        },
		{ href: '/anggaran',   label: 'Anggaran',          icon: PieChart        },
		{ href: '/tujuan',     label: 'Tujuan Keuangan',   icon: Target          },
		{ href: '/investasi',  label: 'Investasi',         icon: TrendingUp      },
		{ href: '/rekening',   label: 'Rekening',          icon: Wallet          },
		{ href: '/laporan',    label: 'Laporan',           icon: BarChart3       },
		{ href: '/insight',    label: 'Insight',           icon: Sparkles        },
	];

	const bottomItems: NavItem[] = [
		{ href: '/pengaturan', label: 'Pengaturan',         icon: Settings   },
		{ href: '/bantuan',    label: 'Bantuan & Dukungan', icon: HelpCircle },
	];

	function isActive(href: string) {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}

	function handleNav() { closeSidebar?.(); }
</script>

<!-- Desktop sidebar -->
<aside
	class="fixed top-3 bottom-3 flex-col z-40 hidden lg:flex"
	style="left:12px;width:236px;background:rgba(255,255,255,0.85);backdrop-filter:var(--backdrop-blur);border-radius:32px;border:1px solid rgba(0,0,0,0.04);box-shadow:var(--shadow-neu-md);"
>
	<!-- Logo -->
	<div class="px-5 pt-5 pb-2">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
				style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-strong));box-shadow:0 4px 12px rgba(255,138,76,0.3);">
				F
			</div>
			<div>
				<p class="text-sm font-bold leading-tight" style="color:var(--text-title);">Finova</p>
				<p class="text-xs leading-tight" style="color:var(--text-muted);">Kelola keuangan lebih bijak</p>
			</div>
		</div>
	</div>

	<nav class="flex-1 px-3 overflow-y-auto scrollbar-hide space-y-0.5 py-2">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a href={item.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-black/[0.03]"
				style={active ? 'background:var(--color-primary-soft);color:var(--color-primary);' : 'color:var(--text-body);'}>
				<Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
				<span class="truncate text-sm">{item.label}</span>
				{#if active}
					<span class="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style="background:var(--color-primary);"></span>
				{/if}
			</a>
		{/each}

		<div class="my-2 border-t" style="border-color:rgba(0,0,0,0.06);"></div>

		{#each bottomItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a href={item.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-black/[0.03]"
				style={active ? 'background:var(--color-primary-soft);color:var(--color-primary);' : 'color:var(--text-body);'}>
				<Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
				<span class="truncate text-sm">{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Premium Banner -->
	<div class="mx-3 mb-3 p-3 rounded-2xl" style="background:linear-gradient(135deg,var(--color-primary-soft),#FFD6BF);border:1px solid rgba(255,138,76,0.2);">
		<div class="flex items-center gap-1.5 mb-1">
			<Crown size={13} style="color:var(--color-primary);" />
			<span class="text-xs font-semibold" style="color:var(--color-primary);">Finova Premium</span>
		</div>
		<p class="text-xs mb-2 leading-relaxed" style="color:#9a6a4a;">Nikmati fitur premium dan kelola keuangan tanpa batas.</p>
		<button class="primary-btn w-full py-1.5 text-xs font-semibold text-white rounded-full transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1">
			Upgrade Sekarang →
		</button>
	</div>

	<!-- User -->
	<div class="px-3 pb-3">
		<div class="flex items-center gap-2 p-2.5 rounded-2xl cursor-pointer transition-colors hover:bg-black/[0.03]"
			style="background:rgba(0,0,0,0.02);">
			<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
				style="background:linear-gradient(135deg,var(--color-primary),var(--color-purple));">
				{user.name.charAt(0)}
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-semibold truncate" style="color:var(--text-title);">{user.name}</p>
				<p class="text-xs truncate" style="color:var(--text-muted);">{user.email}</p>
			</div>
			<ChevronDown size={13} color="var(--text-muted)" />
		</div>
	</div>
</aside>

<!-- Mobile drawer sidebar -->
<aside
	class="fixed top-0 bottom-0 left-0 z-40 flex flex-col lg:hidden transition-transform duration-300"
	style="width:280px;background:rgba(255,255,255,0.98);backdrop-filter:var(--backdrop-blur);border-right:1px solid rgba(0,0,0,0.04);box-shadow:8px 0 32px rgba(0,0,0,0.08);transform:{sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};"
>
	<!-- Mobile header -->
	<div class="flex items-center justify-between px-5 pt-5 pb-3">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
				style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-strong));box-shadow:0 4px 12px rgba(255,138,76,0.3);">F</div>
			<div>
				<p class="text-sm font-bold" style="color:var(--text-title);">Finova</p>
				<p class="text-xs" style="color:var(--text-muted);">Kelola keuangan lebih bijak</p>
			</div>
		</div>
		<button onclick={closeSidebar} aria-label="Tutup menu"
			class="w-8 h-8 rounded-full flex items-center justify-center"
			style="background:rgba(0,0,0,0.06);transition:all 0.2s ease;">
			<X size={16} style="color:var(--text-body);" />
		</button>
	</div>

	<nav class="flex-1 px-3 overflow-y-auto scrollbar-hide space-y-0.5 py-2">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a href={item.href} onclick={handleNav}
				class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
				style={active ? 'background:var(--color-primary-soft);color:var(--color-primary);' : 'color:var(--text-body);'}>
				<Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
				<span>{item.label}</span>
				{#if active}
					<span class="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style="background:var(--color-primary);"></span>
				{/if}
			</a>
		{/each}

		<div class="my-2 border-t" style="border-color:rgba(0,0,0,0.06);"></div>

		{#each bottomItems as item}
			{@const active = isActive(item.href)}
			{@const Icon = item.icon}
			<a href={item.href} onclick={handleNav}
				class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
				style={active ? 'background:var(--color-primary-soft);color:var(--color-primary);' : 'color:var(--text-body);'}>
				<Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<div class="mx-3 mb-3 p-3 rounded-2xl" style="background:linear-gradient(135deg,var(--color-primary-soft),#FFD6BF);">
		<div class="flex items-center gap-1.5 mb-1">
			<Crown size={13} color="var(--color-primary)" />
			<span class="text-xs font-semibold" style="color:var(--color-primary);">Finova Premium</span>
		</div>
		<p class="text-xs mb-2" style="color:#9a6a4a;">Nikmati fitur premium dan kelola keuangan tanpa batas.</p>
		<button class="w-full py-1.5 text-xs font-semibold text-white rounded-full" style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-strong));">
			Upgrade Sekarang →
		</button>
	</div>

	<div class="px-3 pb-5">
		<div class="flex items-center gap-2 p-2.5 rounded-2xl" style="background:rgba(0,0,0,0.025);">
			<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
				style="background:linear-gradient(135deg,var(--color-primary),var(--color-purple));">
				{user.name.charAt(0)}
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs font-semibold truncate" style="color:#1a1a2e;">{user.name}</p>
				<p class="text-xs truncate" style="color:#9ca3af;">{user.email}</p>
			</div>
			<ChevronDown size={13} color="#9ca3af" />
		</div>
	</div>
</aside>
