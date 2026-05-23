<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		chartData, categoryExpenses,
		formatRupiah, formatRupiahFull
	} from '$lib/data/dummy';
	import {
		transactions, budgetCategories, financialGoals, userProfile,
		totalSaldo, totalPemasukan, totalPengeluaran, sisaBudget,
		insights
	} from '$lib/stores/appStore';
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
		Bell, Plus, Search, TrendingUp, TrendingDown, Wallet,
		Target, ScanLine, RefreshCw, PieChart,
		BellRing, FileText, Sparkles, ArrowRight, Eye, EyeOff, Utensils, Car, ShoppingBag, Receipt
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

	// Task 4.1: saldo visibility toggle
	let saldoVisible = $state(true);

	// Task 4.2: derived recent transactions (5 most recent, sorted by date desc)
	const recentTx = $derived(
		[...$transactions]
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, 5)
	);

	const warmPalette = ['#FF8A4C', '#FB923C', '#FDBA74', '#F59E0B', '#FED7AA'];
	const categoryWarm = categoryExpenses.map((cat, idx) => ({ ...cat, warmColor: warmPalette[idx] ?? '#FF8A4C' }));

	const quickActions: Array<{
		label: string;
		icon: typeof ScanLine;
		bg: string;
		color: string;
		href: Parameters<typeof resolve>[0];
		hash?: string;
	}> = [
		{ label: 'Scan Struk\n(OCR)',            icon: ScanLine,   bg: '#FFF1E8', color: '#FF8A4C', href: '/transaksi', hash: 'ocr' },
		{ label: 'Tambah\nTransaksi',             icon: Plus,       bg: '#FFF3E8', color: '#FB923C', href: '/transaksi' },
		{ label: 'Transaksi\nBerulang',           icon: RefreshCw,  bg: '#FFF5EC', color: '#FDBA74', href: '/transaksi' },
		{ label: 'Buat\nAnggaran',                icon: PieChart,   bg: '#FFF1E8', color: '#F59E0B', href: '/anggaran'  },
		{ label: 'Kirim Pengingat\nPembayaran',   icon: BellRing,   bg: '#FFFBEB', color: '#F59E0B', href: '/transaksi' },
		{ label: 'Laporan\nKeuangan',             icon: FileText,   bg: '#FFF3E8', color: '#EA580C', href: '/laporan'   },
	];

	function budgetIconFor(name: string) {
		if (name.includes('Makanan')) return Utensils;
		if (name.includes('Transport')) return Car;
		if (name.includes('Belanja')) return ShoppingBag;
		return Receipt;
	}

	let summaryCanvas: HTMLCanvasElement;
	let categoryCanvas: HTMLCanvasElement;
	let summaryChart: Chart<'line'> | null = null;
	let categoryChart: Chart<'doughnut'> | null = null;

	onMount(() => {
		const summaryCtx = summaryCanvas.getContext('2d');
		const categoryCtx = categoryCanvas.getContext('2d');
		if (!summaryCtx || !categoryCtx) return;

		const incomeGradient = summaryCtx.createLinearGradient(0, 0, 0, 160);
		incomeGradient.addColorStop(0, 'rgba(253,186,116,0.32)');
		incomeGradient.addColorStop(1, 'rgba(253,186,116,0.04)');
		const expenseGradient = summaryCtx.createLinearGradient(0, 0, 0, 160);
		expenseGradient.addColorStop(0, 'rgba(255,138,76,0.30)');
		expenseGradient.addColorStop(1, 'rgba(255,138,76,0.03)');

		const summaryConfig: ChartConfiguration<'line'> = {
			type: 'line',
			data: {
				labels: chartData.map((d) => d.date),
				datasets: [
					{
						label: 'Pemasukan',
						data: chartData.map((d) => d.pemasukan),
						borderColor: '#FDBA74',
						backgroundColor: incomeGradient,
						fill: true,
						tension: 0.42,
						borderWidth: 2.5,
						pointRadius: 3,
						pointBackgroundColor: '#FDBA74',
						pointBorderColor: '#fff',
						pointBorderWidth: 1.5
					},
					{
						label: 'Pengeluaran',
						data: chartData.map((d) => d.pengeluaran),
						borderColor: '#FF8A4C',
						backgroundColor: expenseGradient,
						fill: true,
						tension: 0.42,
						borderWidth: 2.5,
						pointRadius: 3,
						pointBackgroundColor: '#FF8A4C',
						pointBorderColor: '#fff',
						pointBorderWidth: 1.5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,23,42,0.92)' } },
				scales: {
					x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } }, border: { display: false } },
					y: { grid: { color: 'rgba(15,23,42,0.07)' }, ticks: { display: false }, border: { display: false } }
				},
				animation: false
			}
		};

		const categoryConfig: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: categoryWarm.map((c) => c.name),
				datasets: [{ data: categoryWarm.map((c) => c.amount), backgroundColor: categoryWarm.map((c) => c.warmColor), borderColor: '#fff', borderWidth: 2 }]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '58%',
				plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,23,42,0.92)' } },
				animation: false
			}
		};

		summaryChart = new Chart(summaryCtx, summaryConfig);
		categoryChart = new Chart(categoryCtx, categoryConfig);

		return () => {
			summaryChart?.destroy();
			categoryChart?.destroy();
		};
	});
</script>

<div class="space-y-4">

	<!-- TOPBAR -->
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Halo, {$userProfile.name.split(' ')[0]}!</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Semangat mengatur keuangan hari ini!</p>
		</div>
		<div class="flex items-center gap-2">
			<!-- Search -->
			<div
				class="hidden h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 shadow-sm shadow-slate-900/5 transition-all duration-200 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100/70 md:flex"
			>
				<Search size={15} class="shrink-0 text-slate-400" />

				<input
					type="text"
					placeholder="Cari transaksi..."
					class="h-full w-40 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-700 ring-0 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-0 focus:ring-0 focus:outline-none"
				/>

				<span
					class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400"
				>
					⌘K
				</span>
			</div>
			<button aria-label="Notifikasi" class="relative w-10 h-10 rounded-full flex items-center justify-center border"
				style="background:#ffffff;border-color:rgba(148,163,184,0.35);box-shadow:0 6px 16px rgba(15,23,42,0.06)">
				<Bell size={18} color="#64748b" />
				<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style="background:#FF6B6B"></span>
			</button>
			<button aria-label="Tambah" class="w-10 h-10 rounded-full flex items-center justify-center text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 8px 18px rgba(255,138,76,0.28)">
				<Plus size={20} />
			</button>
		</div>
	</div>

	<!-- SUMMARY CARDS -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<!-- Total Saldo card with visibility toggle -->
		<div class="col-span-2 lg:col-span-1 p-5 rounded-[24px] card-hover"
			style="background:linear-gradient(135deg,#FF8A4C,#ff7a35);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-11 h-11 rounded-2xl flex items-center justify-center" style="background:rgba(255,255,255,0.25)">
					<Wallet size={20} color="white" />
				</div>
				<button
					aria-label={saldoVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
					onclick={() => (saldoVisible = !saldoVisible)}
				>
					{#if saldoVisible}
						<Eye size={16} color="rgba(255,255,255,0.7)" />
					{:else}
						<EyeOff size={16} color="rgba(255,255,255,0.7)" />
					{/if}
				</button>
			</div>
			<p class="text-xs font-medium mb-1" style="color:rgba(255,255,255,0.8)">Total Saldo</p>
			<p class="text-2xl font-bold text-white">
				{saldoVisible ? formatRupiahFull($totalSaldo) : 'Rp ••••••'}
			</p>
			<p class="text-xs mt-1" style="color:rgba(255,255,255,0.75)">▲ 8,45% dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(251,146,60,0.12)">
					<TrendingUp size={18} color="#FB923C" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(251,146,60,0.12);color:#FB923C">+12,7%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Pemasukan</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah($totalPemasukan)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(255,107,107,0.1)">
					<TrendingDown size={18} color="#FF6B6B" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(255,107,107,0.1);color:#FF6B6B">+3,2%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Pengeluaran</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah($totalPengeluaran)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(253,186,116,0.20)">
					<Target size={18} color="#FDBA74" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(251,146,60,0.12);color:#FB923C">+5,1%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Sisa Budget</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah($sisaBudget)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
	</div>

	<!-- ROW 2: OCR Promo + Chart + Quick Actions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

		<!-- OCR Promo -->
		<a href={`${resolve('/transaksi')}#ocr`} class="rounded-[24px] relative overflow-hidden flex flex-col"
			style="background:linear-gradient(160deg,#FFF1E8 0%,#FFD6BF 100%);min-height:360px">
			<div class="px-5 pt-5 relative z-10 w-full max-w-[320px]">
				<h3 class="text-xl font-bold leading-snug mb-2" style="color:#1a1a2e">
					Scan struk,<br/>catatan otomatis!
				</h3>
				<p class="text-xs leading-relaxed" style="color:#9a6a4a;">
					Foto struk belanjamu dan biarkan OCR mencatat semuanya untukmu.
				</p>
			</div>
			<div class="flex-1 flex items-end justify-center px-4 pt-2">
				<img
					src="/Scan-image-grafis.png"
					alt="Scan struk ilustrasi"
					class="w-full max-w-[230px] object-contain"
					style="filter:drop-shadow(0 8px 24px rgba(255,138,76,0.2))"
				/>
			</div>
		</a>

		<!-- Chart -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Ringkasan Keuangan</h2>
				<div class="flex items-center gap-2 flex-wrap">
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full" style="background:#FDBA74"></span>
						<span class="text-xs" style="color:#9ca3af">Pemasukan</span>
					</div>
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full" style="background:#FF8A4C"></span>
						<span class="text-xs" style="color:#9ca3af">Pengeluaran</span>
					</div>
					<select class="text-xs px-2 py-1 rounded-full outline-none" style="background:rgba(0,0,0,0.04);color:#6b7280;border:none">
						<option>Bulan Ini</option><option>3 Bulan</option>
					</select>
				</div>
			</div>
			<div class="h-[130px]">
				<canvas bind:this={summaryCanvas}></canvas>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<h2 class="text-sm font-semibold mb-4" style="color:#1a1a2e">Aksi Cepat</h2>
			<div class="grid grid-cols-3 gap-3">
				{#each quickActions as a (a.label)}
					{@const ActionIcon = a.icon}
					<a href={`${resolve(a.href)}${a.hash ? `#${a.hash}` : ''}`}
						class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
						style="background:{a.bg}">
						<div class="w-10 h-10 rounded-2xl flex items-center justify-center"
							style="background:white;box-shadow:2px 2px 8px rgba(0,0,0,0.06)">
							<ActionIcon size={18} color={a.color} />
						</div>
						<span class="text-center leading-tight" style="color:{a.color};white-space:pre-line;font-size:10px;font-weight:500">{a.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- ROW 3: Category + Transactions + Budget -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

		<!-- Category Donut -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<h2 class="text-sm font-semibold mb-4" style="color:#1a1a2e">Pengeluaran per Kategori</h2>
			<div class="flex items-center gap-3">
				<div class="relative w-24 h-24 shrink-0">
					<canvas bind:this={categoryCanvas}></canvas>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<span class="font-bold leading-none" style="color:#1a1a2e;font-size:9px">Total</span>
						<span class="font-bold" style="color:#FF8A4C;font-size:9px">Rp 8,9jt</span>
					</div>
				</div>
				<div class="flex-1 space-y-1.5">
					{#each categoryWarm as cat (cat.name)}
						<div class="flex items-center justify-between gap-1">
							<div class="flex items-center gap-1.5 min-w-0">
								<span class="w-2 h-2 rounded-full shrink-0" style={`background:${cat.warmColor}`}></span>
								<span class="truncate" style="color:#6b7280;font-size:10px">{cat.name.split(' ')[0]}</span>
							</div>
							<div class="flex items-center gap-1 shrink-0">
								<span style="color:#1a1a2e;font-size:10px;font-weight:600">{formatRupiah(cat.amount)}</span>
								<span style="color:#9ca3af;font-size:10px">{cat.percentage}%</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<a href={resolve('/laporan')}
				class="flex items-center justify-center gap-1 mt-4 py-2 rounded-full text-xs font-medium"
				style="background:#FFF1E8;color:#FF8A4C">
				Lihat Detail <ArrowRight size={12} />
			</a>
		</div>

		<!-- Recent Transactions — reactive from store, click → goto('/transaksi') -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Transaksi Terbaru</h2>
				<a href={resolve('/transaksi')} class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-3">
				{#each recentTx as tx (tx.id)}
					<button
						type="button"
						class="flex items-center gap-3 w-full text-left rounded-xl transition-colors hover:bg-orange-50 active:bg-orange-100 px-1 -mx-1"
						onclick={() => goto('/transaksi')}
					>
						<div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
							style="background:{tx.type === 'income' ? 'rgba(253,186,116,0.18)' : 'rgba(255,138,76,0.1)'}">
							{#if tx.type === 'income'}
								<TrendingUp size={15} color="#FB923C" />
							{:else}
								<TrendingDown size={15} color="#FF8A4C" />
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{tx.merchant}</p>
							<p class="text-xs truncate" style="color:#9ca3af">{tx.category}</p>
						</div>
						<span class="text-sm font-bold shrink-0"
							style="color:{tx.type === 'income' ? '#FB923C' : '#EA580C'}">
							{tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Budget This Month — reactive from $budgetCategories -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Anggaran Bulan Ini</h2>
				<a href={resolve('/anggaran')} class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-4">
				{#each $budgetCategories.slice(0, 3) as cat (cat.id)}
					{@const pct = Math.round((cat.used / cat.budget) * 100)}
					{@const BudgetIcon = budgetIconFor(cat.name)}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2 min-w-0">
								<div class="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0"
									style="background:rgba(255,138,76,0.14)">
									<BudgetIcon size={14} color="#FF8A4C" />
								</div>
								<div class="min-w-0">
									<p class="text-xs font-semibold truncate" style="color:#1a1a2e">{cat.name}</p>
									<p style="color:#9ca3af;font-size:10px">{formatRupiah(cat.used)} / {formatRupiah(cat.budget)}</p>
								</div>
							</div>
							<span class="text-xs font-bold shrink-0 ml-2"
								style="color:{pct > 85 ? '#EA580C' : '#FB923C'}">{pct}%</span>
						</div>
						<div class="progress-bar" style="height:6px">
							<div class="progress-fill"
								style="width:{pct}%;background:{pct > 85 ? '#EA580C' : '#FB923C'}"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- ROW 4: Financial Goals + AI Insight -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

		<!-- Financial Goals — reactive from $financialGoals -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Tujuan Keuangan</h2>
				<a href={resolve('/tujuan')} class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-4">
				{#each $financialGoals.slice(0, 2) as goal (goal.id)}
					{@const pct = Math.round((goal.current / goal.target) * 100)}
					{@const goalTone = pct >= 70 ? '#FF8A4C' : pct >= 40 ? '#FB923C' : '#FDBA74'}
					{@const goalBg = pct >= 70 ? 'rgba(255,138,76,0.16)' : pct >= 40 ? 'rgba(251,146,60,0.14)' : 'rgba(253,186,116,0.20)'}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2 min-w-0">
								<div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
									style="background:{goalBg}">
									<Target size={15} color={goalTone} />
								</div>
								<div class="min-w-0">
									<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{goal.name}</p>
									<p class="text-xs" style="color:#9ca3af">{formatRupiah(goal.current)} / {formatRupiah(goal.target)}</p>
								</div>
							</div>
							<span class="text-sm font-bold shrink-0 ml-2" style="color:{goalTone}">{pct}%</span>
						</div>
						<div class="progress-bar" style="height:8px">
							<div class="progress-fill" style="width:{pct}%;background:{goalTone}"></div>
						</div>
					</div>
				{/each}
			</div>
			<!-- "Buat Tujuan Baru" → goto('/tujuan') -->
			<button
				type="button"
				onclick={() => goto('/tujuan')}
				class="flex items-center justify-center gap-1 mt-4 py-2 rounded-full text-xs font-medium w-full transition-opacity hover:opacity-80"
				style="background:#FFF1E8;color:#FF8A4C">
				<Plus size={12} /> Buat Tujuan Baru
			</button>
		</div>

		<!-- AI Insight -->
		<div class="rounded-[24px] overflow-hidden relative"
			style="background:linear-gradient(135deg,#FFF7F2 0%,#FFE8D6 100%);min-height:120px">
			<div class="flex items-center h-full p-5 gap-4">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
							style="background:rgba(255,138,76,0.15)">
							<Sparkles size={18} color="#FF8A4C" />
						</div>
						<h2 class="text-sm font-bold" style="color:#1a1a2e">Insight untukmu</h2>
					</div>
					<p class="text-xs leading-relaxed mb-4" style="color:#6b7280;max-width:260px">
						{$insights[0]?.description ?? ''}
					</p>
					<a href={resolve('/insight')}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-90"
						style="background:rgba(255,255,255,0.85);color:#FF8A4C;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
						Lihat Insight <ArrowRight size={11} />
					</a>
				</div>
				<div class="shrink-0 hidden sm:block">
					<img
						src="/Insight-dashboard.png"
						alt="Insight ilustrasi"
						class="w-70 h-34 object-contain absolute -right-0 bottom-10 opacity-90"
						style="filter:drop-shadow(0 4px 12px rgba(255,138,76,0.15))"
					/>
				</div>
			</div>
		</div>
	</div>

</div>
