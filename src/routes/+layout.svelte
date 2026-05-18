<script lang="ts">
	import './layout.css';
	import { navigating } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import SkeletonPage from '$lib/components/SkeletonPage.svelte';

	let { children } = $props();

	let sidebarOpen = $state(false);

	function closeSidebar() { sidebarOpen = false; }
</script>

<svelte:head>
	<title>Finova — Smart Finance Tracker</title>
</svelte:head>

<div class="min-h-screen" style="background:#F8F6F3;">

	<!-- Mobile sidebar backdrop -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-30 lg:hidden"
			style="background:rgba(0,0,0,0.35);backdrop-filter:blur(2px);"
			onclick={closeSidebar}
			role="button"
			tabindex="-1"
			aria-label="Tutup sidebar"
			onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
		></div>
	{/if}

	<!-- Sidebar — always rendered, mobile uses translate -->
	<Sidebar {sidebarOpen} {closeSidebar} />

	<!-- Main content -->
	<main class="lg:ml-64 min-h-screen p-3 sm:p-4 lg:p-5 pb-24 lg:pb-5">
		<!-- Mobile topbar with hamburger -->
		<div class="flex items-center justify-between mb-3 lg:hidden">
			<button
				onclick={() => sidebarOpen = true}
				aria-label="Buka menu"
				class="w-10 h-10 rounded-2xl flex items-center justify-center"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)"
			>
				<svg class="w-5 h-5" style="color:#1a1a2e" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<line x1="3" y1="6" x2="21" y2="6"/>
					<line x1="3" y1="12" x2="21" y2="12"/>
					<line x1="3" y1="18" x2="21" y2="18"/>
				</svg>
			</button>
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
					style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)">F</div>
				<span class="text-base font-bold" style="color:#1a1a2e">Finova</span>
			</div>
			<div class="w-10"></div>
		</div>

		{#if $navigating}
			<SkeletonPage />
		{:else}
			<div class="page-enter">
				{@render children()}
			</div>
		{/if}
	</main>

	<MobileNav />
</div>
