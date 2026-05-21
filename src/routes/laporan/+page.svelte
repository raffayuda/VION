<script lang="ts">
	import { onMount } from 'svelte';
	import { categoryExpenses, summary, chartData, formatRupiahFull } from '$lib/data/dummy';
	import { transactions } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import {
		Chart,
		BarController,
		DoughnutController,
		ArcElement,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	} from 'chart.js';
	import { ArrowDown, ArrowUp, Calendar, ChevronDown, Download, Filter, PieChart as PieIcon, Wallet } from '@lucide/svelte';

	Chart.register(BarController, DoughnutController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

	// ── Task 10.1: DateRangePicker state ──────────────────────────────────────
	let dateRangeOpen = $state(false);
	let dateRange = $state({ start: '2026-05-01', end: '2026-05-31' });
	let tempStart = $state('2026-05-01');
	let tempEnd = $state('2026-05-31');

	function openDatePicker() {
		tempStart = dateRange.start;
		tempEnd = dateRange.end;
		dateRangeOpen = true;
	}

	function confirmDateRange() {
		dateRange = { start: tempStart, end: tempEnd };
		dateRangeOpen = false;
	}

	// Format date range label: "1 Mei 2026 - 31 Mei 2026"
	const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

	function formatDateLabel(iso: string): string {
		const [y, m, d] = iso.split('-').map(Number);
		return `${d} ${MONTHS_ID[m - 1]} ${y}`;
	}

	let dateRangeLabel = $derived(`${formatDateLabel(dateRange.start)} - ${formatDateLabel(dateRange.end)}`);

	// ── Task 10.2: Filtered transactions derived from store ───────────────────
	// Task 10.4: Filter state
	let filterOpen = $state(false);
	let filterCategory = $state('');
	let filterType = $state('');
	let filterMin = $state(0);
	let filterMax = $state(0);
	// Active filters applied on confirm
	let activeFilters = $state({ category: '', type: '', min: 0, max: 0 });

	const CATEGORIES = ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan & Utilitas', 'Pemasukan', 'Lainnya'];

	let filteredTransactions = $derived(
		$transactions.filter((t) => {
			// Date range filter (inclusive, ISO string comparison)
			if (t.date < dateRange.start || t.date > dateRange.end) return false;
			// Category filter
			if (activeFilters.category && t.category !== activeFilters.category) return false;
			// Type filter
			if (activeFilters.type && t.type !== activeFilters.type) return false;
			// Min amount filter
			if (activeFilters.min > 0 && t.amount < activeFilters.min) return false;
			// Max amount filter
			if (activeFilters.max > 0 && t.amount > activeFilters.max) return false;
			return true;
		})
	);

	let filteredPemasukan = $derived(
		filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
	);

	let filteredPengeluaran = $derived(
		filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
	);

	let filteredSurplus = $derived(filteredPemasukan - filteredPengeluaran);

	let stats = $derived([
		{ title: 'Total Pemasukan',   value: filteredPemasukan,  change: '+18.6%', note: 'dari April 2026', icon: ArrowUp,   color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
		{ title: 'Total Pengeluaran', value: filteredPengeluaran, change: '+9.4%',  note: 'dari April 2026', icon: ArrowDown, color: '#EA580C', bg: 'rgba(234,88,12,0.10)'  },
		{ title: 'Surplus / Defisit', value: filteredSurplus,     change: '+34.2%', note: 'dari April 2026', icon: Wallet,    color: '#FDBA74', bg: 'rgba(253,186,116,0.18)' },
		{ title: 'Rasio Tabungan',    value: 28.4,                change: '+6.1%',  note: 'dari April 2026', icon: PieIcon,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	]);

	// ── Task 10.3: Export simulation state ────────────────────────────────────
	let exportMenuOpen = $state(false);

	function handleExport(format: 'PDF' | 'Excel') {
		exportMenuOpen = false;
		showToast(`Mengunduh laporan ${format}... (simulasi)`, 'info');
		setTimeout(() => {
			showToast(`Laporan ${format} berhasil diunduh (simulasi)`, 'success');
		}, 1500);
	}

	// ── Task 10.4: Filter panel confirm/reset ─────────────────────────────────
	function applyFilters() {
		activeFilters = { category: filterCategory, type: filterType, min: filterMin, max: filterMax };
		filterOpen = false;
	}

	function resetFilters() {
		filterCategory = '';
		filterType = '';
		filterMin = 0;
		filterMax = 0;
		activeFilters = { category: '', type: '', min: 0, max: 0 };
		filterOpen = false;
	}

	// ── Chart setup (unchanged) ───────────────────────────────────────────────
	const barSeries = [
		{ key: 'pemasukan', label: 'Pemasukan', color: '#FDBA74' },
		{ key: 'pengeluaran', label: 'Pengeluaran', color: '#FF8A4C' }
	];
	const warmDonutPalette = ['#FF8A4C', '#FDBA74', '#F59E0B', '#FB923C', '#FED7AA', '#FDBA74'];
	const categoryExpensesWarm = categoryExpenses.map((item, idx) => ({
		...item,
		warmColor: warmDonutPalette[idx] ?? '#FF8A4C'
	}));

	let barCanvas: HTMLCanvasElement;
	let donutCanvas: HTMLCanvasElement;
	let barChart: Chart<'bar'> | null = null;
	let donutChart: Chart<'doughnut'> | null = null;

	const totalExpense = categoryExpenses.reduce((sum, item) => sum + item.amount, 0);

	function tryInitBar(retryCount = 0) {
		if (!barCanvas) { if (retryCount < 8) setTimeout(() => tryInitBar(retryCount + 1), 80); return; }
		const parent = barCanvas.parentElement;
		const w = parent?.clientWidth ?? 0;
		const h = parent?.clientHeight ?? 0;
		if (w === 0 || h === 0) {
			if (retryCount < 8) setTimeout(() => tryInitBar(retryCount + 1), 80);
			return;
		}
		const ctx = barCanvas.getContext('2d');
		if (!ctx) return;
		barChart?.destroy();
		barChart = null;

		const incomeGrad = ctx.createLinearGradient(0, 0, 0, h);
		incomeGrad.addColorStop(0, 'rgba(253,186,116,0.98)');
		incomeGrad.addColorStop(1, 'rgba(253,186,116,0.62)');
		const expenseGrad = ctx.createLinearGradient(0, 0, 0, h);
		expenseGrad.addColorStop(0, 'rgba(255,138,76,0.96)');
		expenseGrad.addColorStop(1, 'rgba(255,138,76,0.6)');

		barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: chartData.map((d) => String(d.date).split(' ')[0]),
				datasets: [
					{ label: 'Pemasukan',   data: chartData.map((d) => d.pemasukan),   backgroundColor: incomeGrad,  borderRadius: 10, borderSkipped: false, maxBarThickness: 22 },
					{ label: 'Pengeluaran', data: chartData.map((d) => d.pengeluaran), backgroundColor: expenseGrad, borderRadius: 10, borderSkipped: false, maxBarThickness: 22 }
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatRupiahFull(Number(ctx.parsed.y))}` }
					}
				},
				scales: {
					x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } }, border: { display: false } },
					y: {
						beginAtZero: true,
						ticks: { color: '#94A3B8', font: { size: 11 }, callback: (v) => `${(Number(v) / 1000000).toFixed(0)}jt` },
						grid: { color: 'rgba(15,23,42,0.08)' },
						border: { display: false }
					}
				}
			}
		});
	}

	function tryInitDonut(retryCount = 0) {
		if (!donutCanvas) { if (retryCount < 8) setTimeout(() => tryInitDonut(retryCount + 1), 80); return; }
		const parent = donutCanvas.parentElement;
		const w = parent?.clientWidth ?? 0;
		const h = parent?.clientHeight ?? 0;
		if (w === 0 || h === 0) {
			if (retryCount < 8) setTimeout(() => tryInitDonut(retryCount + 1), 80);
			return;
		}
		const ctx = donutCanvas.getContext('2d');
		if (!ctx) return;
		donutChart?.destroy();
		donutChart = null;

		donutChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: categoryExpenses.map((c) => c.name),
				datasets: [{
					data: categoryExpenses.map((c) => c.amount),
					backgroundColor: categoryExpensesWarm.map((c) => c.warmColor),
					borderColor: '#ffffff',
					borderWidth: 3,
					hoverOffset: 8
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '54%',
				animation: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: {
							title: (items) => items[0]?.label ?? '',
							label: (ctx) => formatRupiahFull(Number(ctx.parsed))
						}
					}
				}
			}
		});
	}

	onMount(() => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				tryInitBar();
				tryInitDonut();
			});
		});

		return () => {
			barChart?.destroy();
			donutChart?.destroy();
		};
	});
</script>

<!-- ── Task 10.1: DateRangePicker Modal ──────────────────────────────────── -->
<Modal open={dateRangeOpen} title="Pilih Rentang Tanggal" onclose={() => (dateRangeOpen = false)} size="sm">
	<div class="space-y-4">
		<div>
			<label class="block text-xs font-medium mb-1" for="date-start" style="color:#6b7280">Tanggal Mulai</label>
			<input
				id="date-start"
				type="date"
				bind:value={tempStart}
				class="w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2"
				style="border-color:rgba(0,0,0,0.12);focus-ring-color:#FF8A4C;color:#1a1a2e"
			/>
		</div>
		<div>
			<label class="block text-xs font-medium mb-1" for="date-end" style="color:#6b7280">Tanggal Akhir</label>
			<input
				id="date-end"
				type="date"
				bind:value={tempEnd}
				min={tempStart}
				class="w-full px-3 py-2 rounded-2xl border text-sm outline-none focus:ring-2"
				style="border-color:rgba(0,0,0,0.12);color:#1a1a2e"
			/>
		</div>
		<div class="flex gap-2 pt-1">
			<button
				onclick={() => (dateRangeOpen = false)}
				class="flex-1 py-2.5 rounded-full text-sm font-medium"
				style="background:rgba(0,0,0,0.06);color:#6b7280"
			>Batal</button>
			<button
				onclick={confirmDateRange}
				class="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)"
			>Terapkan</button>
		</div>
	</div>
</Modal>

<!-- ── Task 10.4: FilterPanel Modal ─────────────────────────────────────── -->
<Modal open={filterOpen} title="Filter Laporan" onclose={() => (filterOpen = false)} size="sm">
	<div class="space-y-4">
		<div>
			<label class="block text-xs font-medium mb-1" for="filter-category" style="color:#6b7280">Kategori</label>
			<select
				id="filter-category"
				bind:value={filterCategory}
				class="w-full px-3 py-2 rounded-2xl border text-sm outline-none"
				style="border-color:rgba(0,0,0,0.12);color:#1a1a2e;background:white"
			>
				<option value="">Semua Kategori</option>
				{#each CATEGORIES as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-xs font-medium mb-1" for="filter-type" style="color:#6b7280">Tipe Transaksi</label>
			<select
				id="filter-type"
				bind:value={filterType}
				class="w-full px-3 py-2 rounded-2xl border text-sm outline-none"
				style="border-color:rgba(0,0,0,0.12);color:#1a1a2e;background:white"
			>
				<option value="">Semua</option>
				<option value="income">Pemasukan</option>
				<option value="expense">Pengeluaran</option>
			</select>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="block text-xs font-medium mb-1" for="filter-min" style="color:#6b7280">Min. Jumlah (0 = semua)</label>
				<input
					id="filter-min"
					type="number"
					bind:value={filterMin}
					min="0"
					class="w-full px-3 py-2 rounded-2xl border text-sm outline-none"
					style="border-color:rgba(0,0,0,0.12);color:#1a1a2e"
				/>
			</div>
			<div>
				<label class="block text-xs font-medium mb-1" for="filter-max" style="color:#6b7280">Maks. Jumlah (0 = semua)</label>
				<input
					id="filter-max"
					type="number"
					bind:value={filterMax}
					min="0"
					class="w-full px-3 py-2 rounded-2xl border text-sm outline-none"
					style="border-color:rgba(0,0,0,0.12);color:#1a1a2e"
				/>
			</div>
		</div>
		<div class="flex gap-2 pt-1">
			<button
				onclick={resetFilters}
				class="flex-1 py-2.5 rounded-full text-sm font-medium"
				style="background:rgba(0,0,0,0.06);color:#6b7280"
			>Reset</button>
			<button
				onclick={applyFilters}
				class="flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)"
			>Terapkan</button>
		</div>
	</div>
</Modal>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Laporan</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Ringkasan keuanganmu dalam periode pilihan</p>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<!-- Task 10.1: Date range button with dynamic label -->
			<button
				onclick={openDatePicker}
				class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280"
			>
				<Calendar size={14} /> {dateRangeLabel} <ChevronDown size={14} />
			</button>
			<!-- Task 10.4: Filter button -->
			<button
				onclick={() => { filterCategory = activeFilters.category; filterType = activeFilters.type; filterMin = activeFilters.min; filterMax = activeFilters.max; filterOpen = true; }}
				class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:{activeFilters.category || activeFilters.type || activeFilters.min > 0 || activeFilters.max > 0 ? '#FF8A4C' : '#6b7280'}"
			>
				<Filter size={14} /> Filter
			</button>
			<!-- Task 10.3: Export button with dropdown -->
			<div class="relative">
				<button
					onclick={() => (exportMenuOpen = !exportMenuOpen)}
					class="px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
					style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)"
				>
					<Download size={14} /> Export <ChevronDown size={14} />
				</button>
				{#if exportMenuOpen}
					<!-- Backdrop to close menu -->
					<div
						class="fixed inset-0 z-10"
						role="presentation"
						onclick={() => (exportMenuOpen = false)}
					></div>
					<div
						class="absolute right-0 top-full mt-2 z-20 rounded-2xl overflow-hidden"
						style="background:white;box-shadow:0 8px 32px rgba(0,0,0,0.12);min-width:140px;border:1px solid rgba(0,0,0,0.06)"
					>
						<button
							onclick={() => handleExport('PDF')}
							class="w-full px-4 py-3 text-sm text-left font-medium hover:bg-orange-50 transition-colors"
							style="color:#1a1a2e"
						>📄 PDF</button>
						<button
							onclick={() => handleExport('Excel')}
							class="w-full px-4 py-3 text-sm text-left font-medium hover:bg-orange-50 transition-colors"
							style="color:#1a1a2e"
						>📊 Excel</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Stats — Task 10.2: wired to filteredTransactions derived values -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		{#each stats as stat (stat.title)}
			{@const StatIcon = stat.icon}
			<div class="neu-card p-4 card-hover">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style="background:{stat.bg}">
					<StatIcon size={16} color={stat.color} />
				</div>
				<p class="text-xs" style="color:#9ca3af">{stat.title}</p>
				<p class="text-lg font-bold mt-1" style="color:#1a1a2e">
					{stat.title === 'Rasio Tabungan' ? `${stat.value}%` : formatRupiahFull(Number(stat.value))}
				</p>
				<p class="text-xs mt-1" style="color:{stat.title === 'Total Pengeluaran' ? '#EA580C' : '#FB923C'}">
					{stat.change} <span style="color:#9ca3af">{stat.note}</span>
				</p>
			</div>
		{/each}
	</div>

	<!-- Charts -->
	<div class="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">

		<!-- Bar chart -->
		<section class="neu-card p-5">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Tren Pemasukan vs Pengeluaran</h2>
				<div class="flex items-center gap-3">
					{#each barSeries as s (s.key)}
						<div class="flex items-center gap-1.5">
							<span class="w-3 h-3 rounded-full" style="background:{s.color}"></span>
							<span class="text-xs" style="color:#9ca3af">{s.label}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="h-[260px] w-full" style="position:relative;overflow:hidden;">
				<canvas bind:this={barCanvas}></canvas>
			</div>
		</section>

		<!-- Donut chart -->
		<section class="neu-card p-5">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Ringkasan per Kategori</h2>
				<div class="flex gap-1 p-1 rounded-full" style="background:rgba(0,0,0,0.05)">
					<button class="px-3 py-1 rounded-full text-xs font-semibold" style="background:white;color:#FF8A4C">Pengeluaran</button>
					<button class="px-3 py-1 rounded-full text-xs" style="color:#9ca3af">Pemasukan</button>
				</div>
			</div>
			<div class="relative h-[240px] w-full" style="overflow:hidden;">
				<canvas bind:this={donutCanvas}></canvas>
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div class="rounded-full border border-orange-100 bg-white/92 px-4 py-2 text-center shadow-sm backdrop-blur-[2px]">
						<p class="text-[11px] font-medium text-orange-300">Total Pengeluaran</p>
						<p class="text-[16px] font-bold leading-tight text-orange-500">{formatRupiahFull(totalExpense)}</p>
					</div>
				</div>
			</div>
			<div class="mt-3 space-y-1.5 rounded-2xl bg-orange-50/50 p-3 ring-1 ring-orange-100/60">
				{#each categoryExpensesWarm as cat (cat.name)}
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full shrink-0" style="background:{cat.warmColor}"></span>
							<span style="color:#1a1a2e">{cat.name}</span>
						</div>
						<div class="flex items-center gap-3">
							<span style="color:#6b7280">{formatRupiahFull(cat.amount)}</span>
							<span class="font-semibold w-8 text-right" style="color:#1a1a2e">{cat.percentage}%</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<!-- Bottom row -->
	<div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
		<section class="neu-card p-5 card-hover">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-base font-semibold">Arus Kas</h3>
				<button class="text-xs font-semibold" style="color:#FF8A4C">Detail</button>
			</div>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span style="color:#6b7280">Saldo Awal</span><span class="font-semibold">{formatRupiahFull(15250000)}</span></div>
				<div class="flex justify-between"><span style="color:#FB923C">+ Total Pemasukan</span><span style="color:#FB923C">{formatRupiahFull(filteredPemasukan)}</span></div>
				<div class="flex justify-between"><span style="color:#EA580C">- Total Pengeluaran</span><span style="color:#EA580C">{formatRupiahFull(filteredPengeluaran)}</span></div>
				<div class="mt-2 pt-2 border-t border-black/5 flex justify-between"><span class="font-semibold">Saldo Akhir</span><span class="font-bold">{formatRupiahFull(22770000)}</span></div>
			</div>
		</section>
		<section class="neu-card p-5 card-hover">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-base font-semibold">Laporan per Rekening</h3>
				<button class="text-xs font-semibold" style="color:#9ca3af">Semua</button>
			</div>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span>BCA •••• 1234</span><span>{formatRupiahFull(18450000)}</span></div>
				<div class="flex justify-between"><span>Mandiri •••• 5678</span><span>{formatRupiahFull(8250000)}</span></div>
				<div class="flex justify-between"><span>BRI •••• 9012</span><span>{formatRupiahFull(3870000)}</span></div>
				<div class="flex justify-between"><span>OVO Wallet</span><span>{formatRupiahFull(2150000)}</span></div>
				<div class="flex justify-between"><span>GoPay</span><span>{formatRupiahFull(1050000)}</span></div>
			</div>
		</section>
		<section class="neu-card p-5 card-hover">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-base font-semibold">Insight Keuangan</h3>
				<button class="text-xs font-semibold" style="color:#FF8A4C">Lihat Semua</button>
			</div>
			<div class="space-y-2">
				<div class="rounded-2xl p-3" style="background:rgba(255,138,76,0.10)">
					<p class="font-semibold text-sm">Pengeluaran Turun</p>
					<p class="text-sm" style="color:#6b7280">Pengeluaranmu turun 9.4% dibanding bulan lalu.</p>
				</div>
				<div class="rounded-2xl p-3" style="background:rgba(245,158,11,0.08)">
					<p class="font-semibold text-sm">Makanan & Minuman Tinggi</p>
					<p class="text-sm" style="color:#6b7280">Kategori ini mencapai 27.7% dari total pengeluaran.</p>
				</div>
				<div class="rounded-2xl p-3" style="background:rgba(253,186,116,0.20)">
					<p class="font-semibold text-sm">Tujuan Mendekat</p>
					<p class="text-sm" style="color:#6b7280">2 tujuan keuanganmu sudah mencapai lebih dari 50%.</p>
				</div>
			</div>
		</section>
	</div>
</div>
