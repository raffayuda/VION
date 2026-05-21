<script lang="ts">
	import { onMount } from 'svelte';
	import { formatRupiahFull } from '$lib/data/dummy';
	import {
		budgetCategories,
		addBudget,
		updateBudget,
		deleteBudget,
		type BudgetCategory
	} from '$lib/stores/appStore';
	import Modal from '$lib/components/Modal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import {
		Chart,
		type ChartConfiguration,
		LineController,
		DoughnutController,
		ArcElement,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Filler,
		Legend
	} from 'chart.js';
	import {
		ArrowRight,
		Car,
		Bell,
		Check,
		ChevronDown,
		CircleEllipsis,
		Clock3,
		Gamepad2,
		Receipt,
		ShoppingBag,
		Target,
		Plus,
		UtensilsCrossed,
		Wallet
	} from '@lucide/svelte';

	Chart.register(
		LineController,
		DoughnutController,
		ArcElement,
		LineElement,
		PointElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Filler,
		Legend
	);

	type BudgetViewMode = 'monthly' | 'weekly' | 'category';
	type BudgetIconKey = 'wallet' | 'utensils' | 'car' | 'shopping-bag' | 'gamepad' | 'receipt';

	const BUDGET_ICON_OPTIONS: { key: BudgetIconKey; label: string; component: typeof Wallet }[] = [
		{ key: 'wallet', label: 'Umum', component: Wallet },
		{ key: 'utensils', label: 'Makanan', component: UtensilsCrossed },
		{ key: 'car', label: 'Transportasi', component: Car },
		{ key: 'shopping-bag', label: 'Belanja', component: ShoppingBag },
		{ key: 'gamepad', label: 'Hiburan', component: Gamepad2 },
		{ key: 'receipt', label: 'Tagihan', component: Receipt }
	];

	const HISTORY_FACTORS = [1, 0.93, 0.9, 0.86, 0.82, 0.8];

	function normalizeBudgetIcon(icon: string): BudgetIconKey {
		const normalized = icon.trim().toLowerCase();
		if (['wallet', 'uang', 'cash', 'money', '💰'].includes(normalized)) return 'wallet';
		if (['utensils', 'food', 'makanan', '🍜'].includes(normalized)) return 'utensils';
		if (['car', 'transport', 'transportasi', '🚗'].includes(normalized)) return 'car';
		if (['shopping-bag', 'shopping', 'belanja', '🛍️'].includes(normalized)) return 'shopping-bag';
		if (['gamepad', 'gamepad2', 'hiburan', '🎮'].includes(normalized)) return 'gamepad';
		if (['receipt', 'bill', 'tagihan', '⚡'].includes(normalized)) return 'receipt';
		return 'wallet';
	}

	function getBudgetIconComponent(icon: string) {
		return (
			BUDGET_ICON_OPTIONS.find((option) => option.key === normalizeBudgetIcon(icon))?.component ??
			Wallet
		);
	}

	function getBudgetIconLabel(icon: string) {
		return (
			BUDGET_ICON_OPTIONS.find((option) => option.key === normalizeBudgetIcon(icon))?.label ?? 'Umum'
		);
	}

	function getMonthValue(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${year}-${month}`;
	}

	function formatMonthLabel(value: string) {
		const [year, month] = value.split('-').map(Number);
		return new Intl.DateTimeFormat('id-ID', {
			month: 'long',
			year: 'numeric'
		}).format(new Date(year, month - 1, 1));
	}

	function addMonths(date: Date, amount: number) {
		return new Date(date.getFullYear(), date.getMonth() + amount, 1);
	}

	function buildBudgetHistory(monthValue: string, budgetTotal: number, usedTotal: number) {
		const baseDate = new Date(`${monthValue}-01T00:00:00`);
		return HISTORY_FACTORS.map((factor, index) => {
			const monthDate = addMonths(baseDate, -index);
			const total = Math.round((budgetTotal || 15000000) * factor);
			const used = Math.round((usedTotal || 11000000) * Math.max(factor - 0.03, 0.5));
			return {
				id: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
				month: getMonthValue(monthDate),
				label: formatMonthLabel(getMonthValue(monthDate)),
				total,
				used,
				status: index === 0 ? 'Aktif' : 'Selesai'
			};
		});
	}

	function getChartDataset(
		viewMode: BudgetViewMode,
		categories: BudgetCategory[],
		budgetTotal: number,
		usedTotal: number
	) {
		if (viewMode === 'weekly') {
			return {
				title: 'Per Minggu',
				subtitle: 'Monitoring 4 minggu terakhir',
				labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
				values: [0.22, 0.46, 0.71, 0.92].map((factor) =>
					Number(((usedTotal / 1000000) * factor).toFixed(1))
				)
			};
		}

		if (viewMode === 'category') {
			const sorted = [...categories]
				.sort((first, second) => second.used - first.used)
				.slice(0, 5);
			return {
				title: 'Per Kategori',
				subtitle: 'Kategori dengan penyerapan terbesar',
				labels: sorted.map((category) => category.name),
				values: sorted.map((category) => Number((category.used / 1000000).toFixed(1)))
			};
		}

		const budgetInMillions = Math.max(1, budgetTotal / 1000000);
		return {
			title: 'Per Bulan',
			subtitle: 'Pergerakan penggunaan sepanjang bulan',
			labels: ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19', '21', '23', '25', '27', '29', '30', '31'],
			values: [0.15, 0.27, 0.31, 0.42, 0.46, 0.51, 0.6, 0.62, 0.58, 0.6, 0.71, 0.75, 0.8, 0.8, 0.8, 0.8, 1]
				.map((factor) => Number((budgetInMillions * factor).toFixed(1)))
		};
	}

	// Task 6.1: Derived summary values from $budgetCategories
	let selectedMonth = $state(getMonthValue(new Date('2026-05-01T00:00:00')));
	let chartViewMode = $state<BudgetViewMode>('monthly');
	let chartFilterOpen = $state(false);
	let allCategoriesOpen = $state(false);
	let historyOpen = $state(false);
	let nearLimitOpen = $state(false);

	const totalBudget = $derived($budgetCategories.reduce((a, b) => a + b.budget, 0));
	const totalUsed = $derived($budgetCategories.reduce((a, b) => a + b.used, 0));
	const totalLeft = $derived(totalBudget - totalUsed);
	const usedPct = $derived(totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0);
	const activeCategories = $derived($budgetCategories.filter((c) => c.used > 0).length);
	const selectedMonthLabel = $derived(formatMonthLabel(selectedMonth));
	const chartDataset = $derived(
		getChartDataset(chartViewMode, $budgetCategories, totalBudget, totalUsed)
	);
	const nearLimitBudgets = $derived(
		[...$budgetCategories]
			.map((category) => ({
				...category,
				pct: Math.round((category.used / category.budget) * 100)
			}))
			.sort((first, second) => second.pct - first.pct)
			.slice(0, 3)
	);
	const budgetHistory = $derived(buildBudgetHistory(selectedMonth, totalBudget, totalUsed));
	const chartViewOptions: { value: BudgetViewMode; label: string; description: string }[] = [
		{ value: 'monthly', label: 'Per Bulan', description: 'Lihat progres penggunaan sepanjang bulan' },
		{ value: 'weekly', label: 'Per Minggu', description: 'Bandingkan pemakaian per pekan' },
		{ value: 'category', label: 'Per Kategori', description: 'Fokus ke kategori dengan serapan tertinggi' }
	];

	const summaryCards = $derived([
		{
			title: 'Total Anggaran',
			value: formatRupiahFull(totalBudget),
			note: `Untuk ${selectedMonthLabel}`,
			icon: Wallet,
			color: '#FF8A4C',
			bg: 'rgba(255,138,76,0.12)'
		},
		{
			title: 'Total Terpakai',
			value: formatRupiahFull(totalUsed),
			note: `${usedPct}% dari anggaran`,
			icon: Wallet,
			color: '#FB923C',
			bg: 'rgba(251,146,60,0.12)'
		},
		{
			title: 'Sisa Anggaran',
			value: formatRupiahFull(totalLeft),
			note: `${100 - usedPct}% masih tersedia`,
			icon: Clock3,
			color: '#FDBA74',
			bg: 'rgba(253,186,116,0.18)'
		},
		{
			title: 'Kategori Aktif',
			value: `${activeCategories} Kategori`,
			note: `Dari ${$budgetCategories.length} kategori`,
			icon: Target,
			color: '#F59E0B',
			bg: 'rgba(245,158,11,0.14)'
		}
	]);

	// Task 6.2: AnggaranFormModal state
	const COLOR_PRESETS = ['#FF8A4C', '#60A5FA', '#A78BFA', '#4ADE80', '#F59E0B', '#FF6B6B'];

	let modalOpen = $state(false);
	let editData = $state<BudgetCategory | null>(null);

	let formName = $state('');
	let formBudget = $state<number | ''>('');
	let formIconKey = $state<BudgetIconKey>('wallet');
	let formIcon = $state('💰');
	const ActiveBudgetIcon = $derived(getBudgetIconComponent(formIconKey));
	let formColor = $state(COLOR_PRESETS[0]);
	let errors = $state<{ name?: string; budget?: string }>({});

	function openAddModal() {
		editData = null;
		formName = '';
		formBudget = '';
		formIconKey = 'wallet';
		formIcon = '💰';
		formColor = COLOR_PRESETS[0];
		errors = {};
		modalOpen = true;
	}

	function openEditModal(cat: BudgetCategory) {
		editData = cat;
		formName = cat.name;
		formBudget = cat.budget;
		formIconKey = normalizeBudgetIcon(cat.icon);
		formIcon = cat.icon;
		formColor = cat.color;
		errors = {};
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

	function validateForm(): boolean {
		errors = {};
		if (!formName.trim()) errors.name = 'Nama kategori tidak boleh kosong';
		if (formBudget === '' || Number(formBudget) <= 0)
			errors.budget = 'Jumlah anggaran harus lebih dari 0';
		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validateForm()) return;
		formIcon = formIconKey;
		if (editData) {
			updateBudget(editData.id, {
				name: formName.trim(),
				budget: Number(formBudget),
				icon: formIcon.trim() || '💰',
				color: formColor
			});
		} else {
			addBudget({
				name: formName.trim(),
				budget: Number(formBudget),
				used: 0,
				icon: formIcon.trim() || '💰',
				color: formColor
			});
		}
		closeModal();
	}

	// Task 6.3: Action menu and confirm delete state
	let openMenuId = $state<number | null>(null);
	let confirmDeleteId = $state<number | null>(null);
	let confirmOpen = $state(false);

	function toggleMenu(id: number) {
		openMenuId = openMenuId === id ? null : id;
	}

	function handleEdit(cat: BudgetCategory) {
		openMenuId = null;
		openEditModal(cat);
	}

	function handleDeleteRequest(id: number) {
		openMenuId = null;
		confirmDeleteId = id;
		confirmOpen = true;
	}

	function handleDeleteConfirm() {
		if (confirmDeleteId !== null) deleteBudget(confirmDeleteId);
		confirmOpen = false;
		confirmDeleteId = null;
	}

	function handleDeleteCancel() {
		confirmOpen = false;
		confirmDeleteId = null;
	}

	function clickOutside(node: HTMLElement) {
		const handlePointerDown = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				chartFilterOpen = false;
			}
		};

		document.addEventListener('mousedown', handlePointerDown, true);

		return {
			destroy() {
				document.removeEventListener('mousedown', handlePointerDown, true);
			}
		};
	}

	// Chart.js setup
	let usageCanvas: HTMLCanvasElement;
	let progressCanvas: HTMLCanvasElement;
	let usageChart: Chart<'line'> | null = null;
	let progressChart: Chart<'doughnut'> | null = null;

	onMount(() => {
		const usageCtx = usageCanvas.getContext('2d');
		const progressCtx = progressCanvas.getContext('2d');
		if (!usageCtx || !progressCtx) return;

		const usageGradient = usageCtx.createLinearGradient(0, 0, 0, 220);
		usageGradient.addColorStop(0, 'rgba(255,138,76,0.28)');
		usageGradient.addColorStop(1, 'rgba(255,138,76,0.03)');

		const usageConfig: ChartConfiguration<'line'> = {
			type: 'line',
			data: {
				labels: chartDataset.labels,
				datasets: [
					{
						label: 'Penggunaan Anggaran',
						data: chartDataset.values,
						borderColor: '#FF8A4C',
						backgroundColor: usageGradient,
						fill: true,
						tension: 0.38,
						borderWidth: 3,
						pointRadius: 0,
						pointHoverRadius: 4,
						pointBackgroundColor: '#FF8A4C',
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						displayColors: false,
						callbacks: { label: (ctx) => `${Number(ctx.parsed.y).toFixed(1)} jt` }
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							color: '#94A3B8',
							maxTicksLimit: chartViewMode === 'weekly' ? 4 : chartViewMode === 'category' ? 5 : 5,
							callback: (_, i) =>
								chartViewMode === 'monthly'
									? ['1 Mei', '8 Mei', '15 Mei', '22 Mei', '31 Mei'][i] ?? ''
									: chartDataset.labels[i] ?? ''
						},
						border: { display: false }
					},
					y: {
						min: 0,
						max: 15,
						ticks: { color: '#94A3B8', callback: (v) => `${v}jt` },
						grid: { color: 'rgba(15,23,42,0.08)' },
						border: { display: false }
					}
				},
				animation: {
					duration: 520,
					easing: 'easeOutQuart'
				}
			}
		};

		const progressConfig: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: ['Terpakai', 'Sisa'],
				datasets: [
					{
						data: [usedPct, Math.max(100 - usedPct, 0)],
						backgroundColor: ['#FF8A4C', 'rgba(15,23,42,0.08)'],
						borderWidth: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '72%',
				plugins: { legend: { display: false }, tooltip: { enabled: false } },
				animation: {
					duration: 420,
					easing: 'easeOutQuart'
				}
			}
		};

		usageChart = new Chart(usageCtx, usageConfig);
		progressChart = new Chart(progressCtx, progressConfig);

		return () => {
			usageChart?.destroy();
			progressChart?.destroy();
		};
	});

	$effect(() => {
		if (!usageChart) return;
		usageChart.data.labels = chartDataset.labels;
		usageChart.data.datasets[0].data = chartDataset.values;
		usageChart.options.scales!.x!.ticks = {
			color: '#94A3B8',
			maxTicksLimit: chartViewMode === 'weekly' ? 4 : chartViewMode === 'category' ? 5 : 5,
			callback: (_, index) =>
				chartViewMode === 'monthly'
					? ['1 Mei', '8 Mei', '15 Mei', '22 Mei', '31 Mei'][Number(index)] ?? ''
					: chartDataset.labels[Number(index)] ?? ''
		};
		usageChart.update();
	});

	$effect(() => {
		if (!progressChart) return;
		progressChart.data.datasets[0].data = [usedPct, Math.max(100 - usedPct, 0)];
		progressChart.update();
	});
</script>

<!-- Backdrop to close action menu when clicking outside -->
{#if openMenuId !== null}
	<div
		class="fixed inset-0 z-10"
		role="presentation"
		onclick={() => (openMenuId = null)}
	></div>
{/if}

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Anggaran</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Atur dan pantau anggaranmu dengan mudah ✨</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<div class="w-full sm:w-[220px]">
				<DatePicker
					value={selectedMonth}
					onselect={(value) => (selectedMonth = value)}
					mode="month"
					placeholder="Pilih bulan"
				/>
			</div>
			<button
				class="w-10 h-10 rounded-full flex items-center justify-center relative"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)"
			>
				<Bell size={16} color="#6b7280" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background:#FF6B6B"></span>
			</button>
			<button
				onclick={openAddModal}
				class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)"
			>
				<Plus size={16} />
				Buat Anggaran Baru
			</button>
		</div>
	</div>

	<!-- Task 6.1: Summary cards derived from $budgetCategories -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		{#each summaryCards as card (card.title)}
			<div class="neu-card p-4 card-hover">
				<div class="flex items-center justify-between mb-3">
					<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style={`background:${card.bg}`}>
						<card.icon size={17} color={card.color} />
					</div>
					<CircleEllipsis size={16} color="#9ca3af" />
				</div>
				<p class="text-xs" style="color:#9ca3af">{card.title}</p>
				<p class="text-base lg:text-lg font-bold mt-1" style="color:#1a1a2e">{card.value}</p>
				<p class="text-xs mt-1" style="color:#6b7280">{card.note}</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
		<section class="neu-card p-5">
				<div class="mb-4 flex items-center justify-between">
					<div>
						<h2 class="text-base font-semibold" style="color:#1a1a2e">Ringkasan Anggaran</h2>
						<p class="mt-1 text-xs text-slate-400">{chartDataset.subtitle}</p>
					</div>
					<div class="relative" use:clickOutside>
						<button
							type="button"
							onclick={() => (chartFilterOpen = !chartFilterOpen)}
							class="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm"
							style={`background:${chartFilterOpen ? 'rgba(255,138,76,0.12)' : 'rgba(0,0,0,0.05)'};color:${chartFilterOpen ? '#C46A3B' : '#64748b'}`}
						>
							{chartDataset.title}
							<ChevronDown
								size={14}
								style={`transform:rotate(${chartFilterOpen ? 180 : 0}deg);transition:transform 0.2s ease;`}
							/>
						</button>
						{#if chartFilterOpen}
							<div
								class="absolute right-0 top-[calc(100%+10px)] z-30 w-[280px] overflow-hidden rounded-[24px] border border-white/70 bg-white/96 p-3 backdrop-blur-xl"
								style="box-shadow:0 24px 48px rgba(15,23,42,0.16), 0 8px 24px rgba(255,138,76,0.12);"
							>
								{#each chartViewOptions as option (option.value)}
									<button
										type="button"
										onclick={() => {
											chartViewMode = option.value;
											chartFilterOpen = false;
										}}
										class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all hover:bg-black/[0.03]"
										style={chartViewMode === option.value
											? 'background:linear-gradient(135deg,rgba(255,138,76,0.12),rgba(253,186,116,0.16));'
											: ''}
									>
										<div>
											<p class="text-sm font-semibold text-slate-900">{option.label}</p>
											<p class="mt-0.5 text-xs text-slate-500">{option.description}</p>
										</div>
										{#if chartViewMode === option.value}
											<span
												class="flex h-8 w-8 items-center justify-center rounded-full"
												style="background:rgba(255,138,76,0.12);color:#FF8A4C"
											>
												<Check size={14} />
											</span>
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>

			<div class="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 items-center">
				<div class="flex items-center justify-center">
					<div class="relative h-44 w-44">
						<canvas bind:this={progressCanvas}></canvas>
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="rounded-full border border-orange-100 bg-white/92 px-4 py-3 text-center shadow-sm">
								<p class="text-4xl font-bold" style="color:#FF8A4C">{usedPct}%</p>
								<p class="text-sm" style="color:#6b7280">Terpakai</p>
							</div>
						</div>
					</div>
				</div>

				<div>
					<div class="h-[220px]">
						<canvas bind:this={usageCanvas}></canvas>
					</div>
				</div>
			</div>

			<div class="mt-5 pt-4 border-t border-black/5">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Anggaran per Kategori</h3>
				<div class="space-y-2">
					<!-- Task 6.1: Iterate over $budgetCategories reactively, keyed by cat.id -->
					{#each $budgetCategories as cat (cat.id)}
						{@const BudgetIcon = getBudgetIconComponent(cat.icon)}
						{@const pct = Math.round((cat.used / cat.budget) * 100)}
						{@const pctColor = pct >= 85 ? '#EA580C' : pct >= 60 ? '#FB923C' : '#FDBA74'}
						<div class="grid grid-cols-[1fr_110px_110px_100px_60px_28px] items-center gap-2 py-2.5 border-b border-black/5 last:border-b-0">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<div
										class="flex h-9 w-9 items-center justify-center rounded-2xl"
										style={`background:${cat.color}18;color:${cat.color}`}
									>
										<BudgetIcon size={16} />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-semibold" style="color:#1a1a2e">{cat.name}</p>
										<p class="text-xs text-slate-400">{getBudgetIconLabel(cat.icon)}</p>
									</div>
								</div>
								<div class="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
									<div class="h-full rounded-full" style={`width:${Math.min(pct, 100)}%;background:${pctColor}`}></div>
								</div>
							</div>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.used)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget - cat.used)}</p>
							<p class="text-sm font-bold text-right" style={`color:${pctColor}`}>{pct}%</p>
							<!-- Task 6.3: Action menu toggle per row -->
							<div class="relative z-20">
								<button
									onclick={() => toggleMenu(cat.id)}
									aria-label="Opsi untuk {cat.name}"
									class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
								>
									<CircleEllipsis size={14} color="#9ca3af" />
								</button>
								{#if openMenuId === cat.id}
									<div
										class="absolute right-0 top-8 w-32 rounded-2xl py-1 z-30"
										style="background:rgba(255,255,255,0.97);box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.06)"
									>
										<button
											onclick={() => handleEdit(cat)}
											class="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
											style="color:#1a1a2e"
										>
											Edit
										</button>
										<button
											onclick={() => handleDeleteRequest(cat.id)}
											class="w-full text-left px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
											style="color:#EA580C"
										>
											Hapus
										</button>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
				<button
					onclick={() => (allCategoriesOpen = true)}
					class="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold"
					style="background:#FFF1E8;color:#FF8A4C"
				>
					Lihat Semua Kategori
					<ArrowRight size={15} />
				</button>
			</div>
		</section>

		<div class="space-y-4">
			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Tips Anggaran</h3>
				<div class="rounded-2xl p-4" style="background:linear-gradient(135deg,#FFF7F2,#FFE8D6)">
					<p class="text-sm leading-relaxed" style="color:#6b7280">
						Kamu sudah menghemat <span class="font-bold" style="color:#FF8A4C">Rp 1.200.000</span> dari anggaran bulan lalu. Pertahankan!
					</p>
				</div>
			</section>

			<!-- Task 6.1: "Anggaran Mendekati Batas" uses $budgetCategories reactively -->
			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Anggaran Mendekati Batas</h3>
				<div class="space-y-3">
					{#each nearLimitBudgets as cat (cat.id)}
						{@const pctColor = cat.pct >= 85 ? '#EA580C' : cat.pct >= 60 ? '#FB923C' : '#FDBA74'}
						<div>
							<div class="flex items-center justify-between mb-1">
								<p class="text-sm font-semibold" style="color:#1a1a2e">{cat.name}</p>
								<p class="text-sm font-bold" style={`color:${pctColor}`}>{cat.pct}%</p>
							</div>
							<div class="h-1.5 rounded-full bg-black/5 overflow-hidden">
								<div class="h-full rounded-full" style={`width:${Math.min(cat.pct, 100)}%;background:${pctColor}`}></div>
							</div>
						</div>
					{/each}
				</div>
				<button onclick={() => (nearLimitOpen = true)} class="w-full mt-4 py-2.5 rounded-full text-sm font-semibold" style="background:#FFF1E8;color:#FF8A4C">Lihat Detail</button>
			</section>

			<section class="neu-card p-5 card-hover">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold" style="color:#1a1a2e">Riwayat Anggaran</h3>
					<button onclick={() => (historyOpen = true)} class="text-xs font-semibold" style="color:#60A5FA">Lihat Semua</button>
				</div>
				<div class="space-y-2">
					{#each budgetHistory.slice(0, 3) as item (item.id)}
						<div class="flex items-center justify-between py-1.5">
							<p class="text-sm font-semibold">{item.label}</p>
							<p class="text-sm">{formatRupiahFull(item.total)}</p>
							<span class="px-2 py-1 rounded-full text-xs font-semibold" style={item.status === 'Aktif' ? 'background:rgba(255,138,76,0.14);color:#FF8A4C' : 'background:rgba(0,0,0,0.06);color:#64748b'}>{item.status}</span>
						</div>
					{/each}
				</div>
				<button onclick={() => (historyOpen = true)} class="w-full mt-3 py-2.5 rounded-full text-sm font-semibold" style="background:rgba(0,0,0,0.04);color:#475569">
					Lihat Semua Riwayat
				</button>
			</section>
		</div>
	</div>
</div>

<!-- Task 6.2: AnggaranFormModal -->
<Modal
	open={modalOpen}
	title={editData ? 'Edit Anggaran' : 'Buat Anggaran Baru'}
	onclose={closeModal}
	size="md"
>
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-5">
			<div
				class="rounded-[28px] border p-4"
				style={`background:linear-gradient(135deg,${formColor}14,rgba(255,255,255,0.96));border-color:${formColor}22`}
			>
				<div class="flex items-center gap-4">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-[20px]"
						style={`background:${formColor};color:white;box-shadow:0 14px 28px ${formColor}33`}
					>
						<ActiveBudgetIcon size={24} />
					</div>
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.18em]" style="color:#F08A5B">
							Preview kategori
						</p>
						<p class="mt-1 text-base font-bold text-slate-900">
							{formName.trim() || 'Kategori baru'}
						</p>
						<p class="mt-1 text-sm text-slate-500">
							{formBudget === '' ? 'Masukkan nominal target bulanan.' : formatRupiahFull(Number(formBudget))}
						</p>
					</div>
				</div>
			</div>
		<div>
			<label for="budget-name" class="block text-sm font-medium mb-1" style="color:#374151">
				Nama Kategori
			</label>
			<input
				id="budget-name"
				type="text"
				bind:value={formName}
				placeholder="Contoh: Makanan & Minuman"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {errors.name ? '#EA580C' : 'transparent'};color:#1a1a2e"
			/>
			{#if errors.name}
				<p class="text-xs mt-1" style="color:#EA580C">{errors.name}</p>
			{/if}
		</div>

		<div>
			<label for="budget-amount" class="block text-sm font-medium mb-1" style="color:#374151">
				Jumlah Anggaran (Rp)
			</label>
			<input
				id="budget-amount"
				type="number"
				bind:value={formBudget}
				placeholder="Contoh: 2000000"
				min="1"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {errors.budget ? '#EA580C' : 'transparent'};color:#1a1a2e"
			/>
			{#if errors.budget}
				<p class="text-xs mt-1" style="color:#EA580C">{errors.budget}</p>
			{/if}
		</div>

			<div>
				<p class="mb-2 text-sm font-medium" style="color:#374151">Ikon Kategori</p>
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
					{#each BUDGET_ICON_OPTIONS as option (option.key)}
						{@const OptionIcon = option.component}
						<button
							type="button"
							onclick={() => (formIconKey = option.key)}
							class="rounded-[20px] border p-3 text-center transition-all duration-200"
							style={formIconKey === option.key
								? `background:${formColor}12;border-color:${formColor};box-shadow:0 12px 24px ${formColor}1f`
								: 'background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.05)'}
						>
							<div class="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl" style={`background:${formIconKey === option.key ? formColor : 'rgba(15,23,42,0.06)'};color:${formIconKey === option.key ? '#ffffff' : '#64748b'}`}>
								<OptionIcon size={18} />
							</div>
							<p class="mt-2 text-[11px] font-semibold text-slate-600">{option.label}</p>
						</button>
					{/each}
				</div>
			</div>

			<div class="hidden">
				<label for="budget-icon" class="block text-sm font-medium mb-1" style="color:#374151">
					Ikon (emoji)
				</label>
			<input
				id="budget-icon"
				type="text"
				bind:value={formIcon}
				placeholder="💰"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors"
				style="background:rgba(0,0,0,0.04);border:1.5px solid transparent;color:#1a1a2e"
			/>
		</div>

		<div>
			<p class="text-sm font-medium mb-2" style="color:#374151">Warna</p>
			<div class="flex gap-2 flex-wrap">
				{#each COLOR_PRESETS as color (color)}
					<button
						type="button"
						onclick={() => (formColor = color)}
						aria-label="Pilih warna {color}"
						class="w-8 h-8 rounded-full transition-transform hover:scale-110"
						style="background:{color};outline:{formColor === color ? `3px solid ${color}` : 'none'};outline-offset:2px"
					></button>
				{/each}
			</div>
		</div>

		<div class="flex gap-3 justify-end pt-2">
			<button
				type="button"
				onclick={closeModal}
				class="px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-black/5"
				style="color:#6b7280"
			>
				Batal
			</button>
			<button
				type="submit"
				class="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)"
			>
				{editData ? 'Simpan Perubahan' : 'Buat Anggaran'}
			</button>
		</div>
	</form>
	</Modal>

	<Modal open={allCategoriesOpen} title="Semua Kategori Anggaran" onclose={() => (allCategoriesOpen = false)} size="lg">
		<div class="space-y-3">
			{#each $budgetCategories as cat (cat.id)}
				{@const pct = Math.round((cat.used / cat.budget) * 100)}
				{@const BudgetIcon = getBudgetIconComponent(cat.icon)}
				<div class="rounded-[24px] border p-4" style="background:rgba(255,255,255,0.8);border-color:rgba(0,0,0,0.05)">
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-3">
							<div class="flex h-11 w-11 items-center justify-center rounded-2xl" style={`background:${cat.color}18;color:${cat.color}`}>
								<BudgetIcon size={18} />
							</div>
							<div>
								<p class="text-sm font-semibold text-slate-900">{cat.name}</p>
								<p class="text-xs text-slate-500">{getBudgetIconLabel(cat.icon)}</p>
							</div>
						</div>
						<span class="rounded-full px-3 py-1 text-xs font-semibold" style={`background:${cat.color}14;color:${cat.color}`}>{pct}% terpakai</span>
					</div>
					<div class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
						<p>Budget: {formatRupiahFull(cat.budget)}</p>
						<p>Terpakai: {formatRupiahFull(cat.used)}</p>
						<p>Sisa: {formatRupiahFull(cat.budget - cat.used)}</p>
					</div>
				</div>
			{/each}
		</div>
	</Modal>

	<Modal open={nearLimitOpen} title="Detail Anggaran Mendekati Batas" onclose={() => (nearLimitOpen = false)} size="md">
		<div class="space-y-3">
			{#each nearLimitBudgets as cat (cat.id)}
				<div class="rounded-[24px] border p-4" style="background:rgba(255,255,255,0.82);border-color:rgba(0,0,0,0.05)">
					<div class="flex items-center justify-between">
						<p class="text-sm font-semibold text-slate-900">{cat.name}</p>
						<span class="text-sm font-bold" style={`color:${cat.pct >= 85 ? '#EA580C' : cat.pct >= 60 ? '#FB923C' : '#FDBA74'}`}>{cat.pct}%</span>
					</div>
					<div class="mt-3 h-2 rounded-full bg-black/5">
						<div class="h-full rounded-full" style={`width:${Math.min(cat.pct, 100)}%;background:${cat.pct >= 85 ? '#EA580C' : cat.pct >= 60 ? '#FB923C' : '#FDBA74'}`}></div>
					</div>
					<div class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
						<p>Target: {formatRupiahFull(cat.budget)}</p>
						<p>Terpakai: {formatRupiahFull(cat.used)}</p>
						<p>Sisa: {formatRupiahFull(cat.budget - cat.used)}</p>
					</div>
				</div>
			{/each}
		</div>
	</Modal>

	<Modal open={historyOpen} title="Riwayat Anggaran" onclose={() => (historyOpen = false)} size="md">
		<div class="space-y-3">
			{#each budgetHistory as item (item.id)}
				<div class="rounded-[24px] border p-4" style="background:rgba(255,255,255,0.82);border-color:rgba(0,0,0,0.05)">
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="text-sm font-semibold text-slate-900">{item.label}</p>
							<p class="mt-1 text-xs text-slate-500">Terpakai {formatRupiahFull(item.used)} dari {formatRupiahFull(item.total)}</p>
						</div>
						<span class="rounded-full px-3 py-1 text-xs font-semibold" style={item.status === 'Aktif' ? 'background:rgba(255,138,76,0.14);color:#FF8A4C' : 'background:rgba(0,0,0,0.06);color:#64748b'}>{item.status}</span>
					</div>
				</div>
			{/each}
		</div>
	</Modal>

	<!-- Task 6.3: ConfirmDialog for delete -->
	<ConfirmDialog
	open={confirmOpen}
	title="Hapus Anggaran"
	description="Apakah kamu yakin ingin menghapus kategori anggaran ini? Tindakan ini tidak dapat dibatalkan."
	confirmLabel="Hapus"
	onconfirm={handleDeleteConfirm}
	oncancel={handleDeleteCancel}
/>
