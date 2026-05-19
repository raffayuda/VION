<script lang="ts">
	import { onMount } from 'svelte';
	import { categoryExpenses, summary, transactions, formatRupiahFull } from '$lib/data/dummy';
	import {
		Chart,
		type ChartConfiguration,
		DoughnutController,
		BarController,
		ArcElement,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	} from 'chart.js';
	import {
		Bell,
		Calendar,
		ChevronDown,
		CircleEllipsis,
		Coffee,
		Gift,
		Heart,
		Plus,
		Search,
		TrendingUp,
		Wallet,
		Zap
	} from '@lucide/svelte';

	Chart.register(DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

	let activeTab = $state('Semua');
	const tabs = ['Semua', 'Pemasukan', 'Pengeluaran'];

	const listedTransactions = transactions.slice(0, 5);
	const grouped = listedTransactions.reduce(
		(acc, tx) => {
			if (!acc[tx.date]) acc[tx.date] = [];
			acc[tx.date].push(tx);
			return acc;
		},
		{} as Record<string, typeof listedTransactions>
	);

	const topTransactions = [...transactions]
		.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
		.slice(0, 3);

	const warmPalette = ['#FF8A4C', '#FB923C', '#FDBA74', '#F59E0B', '#FED7AA'];
	const categoryWarm = categoryExpenses.map((c, i) => ({ ...c, warmColor: warmPalette[i] ?? '#FF8A4C' }));

	const statCards = [
		{
			title: 'Total Pemasukan',
			value: summary.pemasukan,
			change: `+${summary.pemasukanChange}% dari bulan lalu`,
			positive: true,
			color: '#FB923C',
			bg: 'rgba(251,146,60,0.12)',
			icon: Gift
		},
		{
			title: 'Total Pengeluaran',
			value: summary.pengeluaran,
			change: `-${summary.pengeluaranChange}% dari bulan lalu`,
			positive: false,
			color: '#EA580C',
			bg: 'rgba(234,88,12,0.12)',
			icon: Heart
		},
		{
			title: 'Saldo Bersih',
			value: summary.sisaBudget,
			change: '+5.1% dari bulan lalu',
			positive: true,
			color: '#FDBA74',
			bg: 'rgba(253,186,116,0.18)',
			icon: Zap
		},
		{
			title: 'Transaksi',
			value: transactions.length,
			change: '+4 dari bulan lalu',
			positive: true,
			color: '#F59E0B',
			bg: 'rgba(245,158,11,0.12)',
			icon: Wallet
		}
	];

	let donutCanvas: HTMLCanvasElement;
	let insightCanvas: HTMLCanvasElement;
	let donutChart: Chart<'doughnut'> | null = null;
	let insightChart: Chart<'bar'> | null = null;

	onMount(() => {
		const donutCtx = donutCanvas.getContext('2d');
		const insightCtx = insightCanvas.getContext('2d');
		if (!donutCtx || !insightCtx) return;

		const donutConfig: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: categoryWarm.map((c) => c.name),
				datasets: [
					{
						data: categoryWarm.map((c) => c.amount),
						backgroundColor: categoryWarm.map((c) => c.warmColor),
						borderColor: '#ffffff',
						borderWidth: 3,
						hoverOffset: 8
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '58%',
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: { label: (ctx) => formatRupiahFull(Number(ctx.parsed)) }
					}
				},
				animation: { duration: 1200, easing: 'easeOutBack' }
			}
		};

		const insightConfig: ChartConfiguration<'bar'> = {
			type: 'bar',
			data: {
				labels: ['M-2', 'M-1', 'M'],
				datasets: [
					{
						label: 'Pengeluaran',
						data: [7.2, 8.1, 9.3],
						backgroundColor: ['#FED7AA', '#FDBA74', '#FF8A4C'],
						borderRadius: 8,
						borderSkipped: false,
						maxBarThickness: 22
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false }, tooltip: { enabled: false } },
				scales: {
					x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
					y: { grid: { display: false }, ticks: { display: false }, border: { display: false } }
				},
				animation: { duration: 900, easing: 'easeOutQuart' }
			}
		};

		donutChart = new Chart(donutCtx, donutConfig);
		insightChart = new Chart(insightCtx, insightConfig);

		return () => {
			donutChart?.destroy();
			insightChart?.destroy();
		};
	});

	function formatDate(value: string) {
		return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function getTxIcon(category: string) {
		if (category === 'Makanan & Minuman') return Coffee;
		if (category === 'Tagihan & Utilitas') return Zap;
		if (category === 'Pemasukan') return Wallet;
		return TrendingUp;
	}
	function getWallet(merchant: string) {
		if (merchant.includes('Grab')) return 'Gopay';
		if (merchant.includes('Listrik')) return 'PLN';
		if (merchant.includes('Kopi')) return 'OVO';
		if (merchant.includes('Alfamart')) return 'Cash';
		return 'BCA';
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Transaksi</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Kelola semua transaksi keuanganmu dengan mudah</p>
		</div>
		<div class="flex items-center gap-2 w-full lg:w-auto">
			<div class="flex items-center gap-2 px-4 py-2.5 rounded-full flex-1 lg:w-72"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Search size={14} color="#9ca3af" />
				<input class="bg-transparent text-sm outline-none flex-1" placeholder="Cari transaksi..." />
			</div>
			<button class="w-10 h-10 rounded-full flex items-center justify-center"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Bell size={16} color="#6b7280" />
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#F08A5B,#E07A47);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
				<Plus size={16} />
				Tambah Transaksi
				<ChevronDown size={14} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		{#each statCards as stat (stat.title)}
			<div class="neu-card p-4 card-hover">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style={`background:${stat.bg}`}>
					<stat.icon size={17} color={stat.color} />
				</div>
				<p class="text-xs mt-3" style="color:#9ca3af">{stat.title}</p>
				<p class="text-base lg:text-lg font-bold mt-1" style="color:#1a1a2e">
					{typeof stat.value === 'number' && stat.title === 'Transaksi'
						? `${stat.value} Transaksi`
						: formatRupiahFull(Number(stat.value))}
				</p>
				<p class="text-xs mt-1" style={`color:${stat.positive ? '#FB923C' : '#EA580C'}`}>{stat.change}</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
		<section class="neu-card p-0 overflow-hidden">
			<div class="p-4 border-b border-black/5 flex flex-wrap items-center gap-2">
				<div class="flex gap-1 p-1 rounded-full bg-black/5">
					{#each tabs as tab (tab)}
						<button onclick={() => (activeTab = tab)} class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium"
							style={activeTab === tab ? 'background:#fff;color:#F08A5B' : 'color:#6b7280'}>
							{tab}
						</button>
					{/each}
				</div>
				<div class="ml-auto flex gap-2 w-full sm:w-auto">
					<button class="px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
						Semua Kategori <ChevronDown size={14} />
					</button>
					<button class="px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
						Mei 2026 <Calendar size={14} />
					</button>
				</div>
			</div>

			<div class="px-4 pb-3">
				{#each Object.entries(grouped) as [date, txs] (date)}
					<div class="py-4 border-b border-black/5 last:border-b-0">
						<p class="text-xs font-semibold mb-3" style="color:#9ca3af">{formatDate(date)}</p>
						<div class="space-y-2">
							{#each txs as tx (tx.id)}
								{@const TxIcon = getTxIcon(tx.category)}
								<div class="flex items-center gap-3 rounded-2xl p-2">
									<div class="w-10 h-10 rounded-full flex items-center justify-center"
										style={`background:${tx.type === 'income' ? 'rgba(253,186,116,0.18)' : 'rgba(255,138,76,0.12)'}`}>
										<TxIcon size={16} color={tx.type === 'income' ? '#FB923C' : '#FF8A4C'} />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{tx.merchant}</p>
										<div class="flex items-center gap-2 mt-0.5">
											<p class="text-xs sm:text-sm text-slate-500 truncate">{tx.category}</p>
											<span class="px-2 py-1 text-xs rounded-full bg-black/5 text-slate-600">{getWallet(tx.merchant)}</span>
										</div>
									</div>
									<div class="text-right">
										<p class="text-sm font-bold" style={`color:${tx.type === 'income' ? '#FB923C' : '#EA580C'}`}>
											{tx.type === 'income' ? '+' : '-'}{formatRupiahFull(tx.amount)}
										</p>
										<p class="text-xs text-slate-500">10:23</p>
									</div>
									<button class="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
										<CircleEllipsis size={16} color="#6b7280" />
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/each}
				<div class="flex justify-center pt-4">
					<button class="px-5 py-2 rounded-full bg-black/5 text-slate-600 text-sm flex items-center gap-2">
						Muat lebih banyak <ChevronDown size={14} />
					</button>
				</div>
			</div>
		</section>

		<div class="space-y-4">
			<section class="neu-card p-5 card-hover">
				<div class="flex items-center justify-between">
					<h2 class="font-bold text-base" style="color:#1a1a2e">Ringkasan Kategori</h2>
					<button class="text-xs font-semibold" style="color:#F08A5B">Lihat Semua</button>
				</div>
				<div class="mt-4 flex gap-4 items-center">
					<div class="relative h-32 w-32 shrink-0">
						<canvas bind:this={donutCanvas}></canvas>
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="rounded-full border border-orange-100 bg-white/92 px-2 py-1 text-center shadow-sm">
								<p class="text-[10px] text-slate-500">Total</p>
								<p class="text-[11px] font-bold text-orange-500">{formatRupiahFull(summary.pengeluaran)}</p>
							</div>
						</div>
					</div>
					<div class="space-y-1.5">
						{#each categoryWarm as cat (cat.name)}
							<div class="flex items-center justify-between gap-3 text-xs sm:text-sm">
								<div class="flex items-center gap-2">
									<span class="w-2 h-2 rounded-full" style={`background:${cat.warmColor}`}></span>
									<span class="text-slate-600">{cat.name}</span>
								</div>
								<span class="font-semibold text-slate-500">{cat.percentage}%</span>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="font-bold text-base" style="color:#1a1a2e">Insight Bulan Ini</h3>
				<p class="text-sm text-slate-600 mt-2">
					Pengeluaran untuk Makanan & Minuman meningkat 15% dari bulan lalu.
				</p>
				<div class="mt-4 flex items-end justify-between gap-3">
					<button class="px-4 py-2 rounded-full border border-orange-200 text-sm font-semibold text-orange-500">
						Lihat Insight
					</button>
					<div class="h-16 w-20">
						<canvas bind:this={insightCanvas}></canvas>
					</div>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="font-bold text-base mb-3" style="color:#1a1a2e">Transaksi Terbesar</h3>
				<div class="space-y-3">
					{#each topTransactions as tx (tx.id)}
						<div class="flex items-center justify-between gap-2">
							<div>
								<p class="font-semibold text-sm" style="color:#1a1a2e">{tx.merchant}</p>
								<p class="text-xs text-slate-500">{formatDate(tx.date)}</p>
							</div>
							<p class="font-bold text-sm" style={`color:${tx.type === 'income' ? '#FB923C' : '#EA580C'}`}>
								{tx.type === 'income' ? '+' : '-'}{formatRupiahFull(tx.amount)}
							</p>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>
