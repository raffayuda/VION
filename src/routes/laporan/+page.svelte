<script lang="ts">
	import { onMount } from 'svelte';
	import { categoryExpenses, summary, chartData, formatRupiahFull } from '$lib/data/dummy';
	import {
		Chart,
		type ChartConfiguration,
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

	const stats = [
		{ title: 'Total Pemasukan',   value: summary.pemasukan,                      change: '+18.6%', note: 'dari April 2026', icon: ArrowUp,   color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
		{ title: 'Total Pengeluaran', value: summary.pengeluaran,                     change: '+9.4%',  note: 'dari April 2026', icon: ArrowDown, color: '#EA580C', bg: 'rgba(234,88,12,0.10)'  },
		{ title: 'Surplus / Defisit', value: summary.pemasukan - summary.pengeluaran, change: '+34.2%', note: 'dari April 2026', icon: Wallet,    color: '#FDBA74', bg: 'rgba(253,186,116,0.18)' },
		{ title: 'Rasio Tabungan',    value: 28.4,                                    change: '+6.1%',  note: 'dari April 2026', icon: PieIcon,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	];

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

	onMount(() => {
		const barCtx = barCanvas.getContext('2d');
		const donutCtx = donutCanvas.getContext('2d');
		if (!barCtx || !donutCtx) return;

		const incomeGradient = barCtx.createLinearGradient(0, 0, 0, 280);
		incomeGradient.addColorStop(0, 'rgba(253,186,116,0.98)');
		incomeGradient.addColorStop(1, 'rgba(253,186,116,0.62)');

		const expenseGradient = barCtx.createLinearGradient(0, 0, 0, 280);
		expenseGradient.addColorStop(0, 'rgba(255,138,76,0.96)');
		expenseGradient.addColorStop(1, 'rgba(255,138,76,0.6)');

		const barConfig: ChartConfiguration<'bar'> = {
			type: 'bar',
			data: {
				labels: chartData.map((d) => String(d.date).split(' ')[0]),
				datasets: [
					{
						label: 'Pemasukan',
						data: chartData.map((d) => d.pemasukan),
						backgroundColor: incomeGradient,
						borderRadius: 10,
						borderSkipped: false,
						maxBarThickness: 22
					},
					{
						label: 'Pengeluaran',
						data: chartData.map((d) => d.pengeluaran),
						backgroundColor: expenseGradient,
						borderRadius: 10,
						borderSkipped: false,
						maxBarThickness: 22
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: { duration: 1100, easing: 'easeOutQuart' },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: {
							label: (ctx) => `${ctx.dataset.label}: ${formatRupiahFull(Number(ctx.parsed.y))}`
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: '#94A3B8', font: { size: 11 } },
						border: { display: false }
					},
					y: {
						beginAtZero: true,
						ticks: {
							color: '#94A3B8',
							font: { size: 11 },
							callback: (v) => `${(Number(v) / 1000000).toFixed(0)}jt`
						},
						grid: { color: 'rgba(15,23,42,0.08)' },
						border: { display: false }
					}
				}
			}
		};

		const donutConfig: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: categoryExpenses.map((c) => c.name),
				datasets: [
					{
						data: categoryExpenses.map((c) => c.amount),
						backgroundColor: categoryExpensesWarm.map((c) => c.warmColor),
						borderColor: '#ffffff',
						borderWidth: 3,
						hoverOffset: 8
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '54%',
				animation: { duration: 1300, easing: 'easeOutBack' },
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
		};

		barChart = new Chart(barCtx, barConfig);
		donutChart = new Chart(donutCtx, donutConfig);

		return () => {
			barChart?.destroy();
			donutChart?.destroy();
			barChart = null;
			donutChart = null;
		};
	});
</script>

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Laporan</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Ringkasan keuanganmu dalam periode pilihan</p>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Calendar size={14} /> 1 - 31 Mei 2026 <ChevronDown size={14} />
			</button>
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Filter size={14} /> Filter
			</button>
			<button class="px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
				<Download size={14} /> Export <ChevronDown size={14} />
			</button>
		</div>
	</div>

	<!-- Stats -->
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
			<div class="h-[260px] w-full">
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
			<div class="relative h-[240px] w-full">
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
				<div class="flex justify-between"><span style="color:#FB923C">+ Total Pemasukan</span><span style="color:#FB923C">{formatRupiahFull(summary.pemasukan)}</span></div>
				<div class="flex justify-between"><span style="color:#EA580C">- Total Pengeluaran</span><span style="color:#EA580C">{formatRupiahFull(summary.pengeluaran)}</span></div>
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
