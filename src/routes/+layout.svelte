<script lang="ts">
	import './layout.css';
	import { navigating } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import SkeletonPage from '$lib/components/SkeletonPage.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();

	let sidebarOpen = $state(false);

	function closeSidebar() { sidebarOpen = false; }
</script>

<svelte:head>
	<title>Finova — Smart Finance Tracker</title>
</svelte:head>

<div class="min-h-screen" style="background:var(--color-bg);">
	<ToastContainer />

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
	<main class="min-h-screen p-3 pb-5 sm:p-4 lg:ml-64 lg:p-5 lg:pb-5">
		<!-- Mobile topbar fixed so menu stays accessible while scrolling -->
		<div class="fixed left-3 right-3 top-3 z-40 items-center justify-between lg:hidden {sidebarOpen ? 'hidden' : 'flex'}">
			<button
				onclick={() => sidebarOpen = true}
				aria-label="Buka menu"
				class="surface-btn w-10 h-10 rounded-2xl flex items-center justify-center"
			>
				<svg class="w-5 h-5" style="color:var(--text-body)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
					<line x1="3" y1="6" x2="21" y2="6"/>
					<line x1="3" y1="12" x2="21" y2="12"/>
					<line x1="3" y1="18" x2="21" y2="18"/>
				</svg>
			</button>
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
					style="background:linear-gradient(135deg,var(--color-primary),var(--color-primary-strong));box-shadow:0 4px 12px rgba(255,138,76,0.3);">F</div>
				<span class="text-base font-bold" style="color:var(--text-title);">Finova</span>
			</div>
			<div class="w-10"></div>
		</div>
		<div class="h-14 lg:hidden"></div>

		{#if $navigating}
			<SkeletonPage />
		{:else}
			<div class="page-enter">
				{@render children()}
			</div>
		{/if}
	</main>

</div>
