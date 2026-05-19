<script lang="ts">
	import { onMount } from 'svelte';
	import { insights, categoryExpenses, formatRupiah } from '$lib/data/dummy';
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
	import { Sparkles, AlertTriangle, CheckCircle, Lightbulb, ArrowRight, Coffee, Car, TrendingUp } from '@lucide/svelte';

	Chart.register(DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'];
	const savingsRate = [28, 32, 35, 38, 43];
	const warmPalette = ['#FF8A4C', '#FB923C', '#FDBA74', '#F59E0B', '#FED7AA'];
	const categoryWarm = categoryExpenses.map((cat, idx) => ({ ...cat, warmColor: warmPalette[idx] ?? '#FF8A4C' }));

	const insightIcons = { warning: AlertTriangle, success: CheckCircle, info: Lightbulb };
	const insightColors = { warning: '#F59E0B', success: '#FB923C', info: '#FF8A4C' };

	const recs = [
		{ icon: Coffee, title: 'Kurangi coffee spending', desc: 'Hemat Rp200.000/bulan jika mengurangi 3 kali kopi per minggu', color: '#F59E0B' },
		{ icon: Car, title: 'Pertimbangkan transportasi umum', desc: 'Transportasi online bisa diganti KRL untuk rute tertentu', color: '#FB923C' },
		{ icon: TrendingUp, title: 'Kamu sudah hemat!', desc: 'Rasio tabungan 43.7% sudah di atas rata-rata nasional 35%', color: '#FF8A4C' },
	];

	let categoryCanvas: HTMLCanvasElement;
	let savingsCanvas: HTMLCanvasElement;
	let categoryChart: Chart<'doughnut'> | null = null;
	let savingsChart: Chart<'bar'> | null = null;

	onMount(() => {
		const categoryCtx = categoryCanvas.getContext('2d');
		const savingsCtx = savingsCanvas.getContext('2d');
		if (!categoryCtx || !savingsCtx) return;

		const categoryConfig: ChartConfiguration<'doughnut'> = {
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
				cutout: '56%',
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: { label: (ctx) => formatRupiah(Number(ctx.parsed)) }
					}
				},
				animation: { duration: 1200, easing: 'easeOutBack' }
			}
		};

		const savingsConfig: ChartConfiguration<'bar'> = {
			type: 'bar',
			data: {
				labels: months,
				datasets: [
					{
						label: 'Rasio Tabungan',
						data: savingsRate,
						backgroundColor: ['#FED7AA', '#FDBA74', '#FB923C', '#F59E0B', '#FF8A4C'],
						borderRadius: 10,
						borderSkipped: false,
						maxBarThickness: 26
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
						padding: 8,
						callbacks: { label: (ctx) => `${ctx.parsed.y}%` }
					}
				},
				scales: {
					x: { grid: { display: false }, ticks: { color: '#94A3B8' }, border: { display: false } },
					y: { min: 0, max: 50, grid: { color: 'rgba(15,23,42,0.08)' }, ticks: { color: '#94A3B8', callback: (v) => `${v}%` }, border: { display: false } }
				},
				animation: { duration: 1000, easing: 'easeOutQuart' }
			}
		};

		categoryChart = new Chart(categoryCtx, categoryConfig);
		savingsChart = new Chart(savingsCtx, savingsConfig);
		return () => {
			categoryChart?.destroy();
			savingsChart?.destroy();
		};
	});
</script>

<div class="py-1 space-y-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-xl sm:text-2xl font-bold" style="color:#1a1a2e">Insight Keuangan</h1>
			<p class="text-xs sm:text-sm mt-0.5 hidden sm:block" style="color:#9ca3af">Analisis cerdas pola keuanganmu</p>
		</div>
		<select class="px-4 py-2.5 rounded-full text-sm outline-none"
			style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280;border:none">
			<option>Bulan Ini</option><option>3 Bulan</option><option>Tahun Ini</option>
		</select>
	</div>

	<!-- AI Insights -->
	<div class="space-y-3">
		{#each insights as insight (insight.title)}
			{@const InsightIcon = insightIcons[insight.type as keyof typeof insightIcons] ?? Lightbulb}
			{@const iconColor = insightColors[insight.type as keyof typeof insightColors] ?? '#60A5FA'}
			<div class="p-4 sm:p-5 neu-card card-hover flex items-start gap-4">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
					style="background:{iconColor}18">
					<InsightIcon size={18} color={iconColor} />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold mb-1" style="color:#1a1a2e">{insight.title}</p>
					<p class="text-sm" style="color:#6b7280">{insight.description}</p>
				</div>
				<button
					class="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-all hover:opacity-80"
					style="background:{iconColor}18;color:{iconColor}">
					Detail <ArrowRight size={11} />
				</button>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Spending by category -->
		<div class="p-5 sm:p-6 neu-card">
			<h2 class="text-base font-semibold mb-4" style="color:#1a1a2e">Pengeluaran per Kategori</h2>
			<div class="flex items-center gap-4">
				<div class="relative h-36 w-36 shrink-0">
					<canvas bind:this={categoryCanvas}></canvas>
				</div>
				<div class="flex-1 space-y-2">
					{#each categoryWarm as cat (cat.name)}
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="h-2 w-2 rounded-full" style={`background:${cat.warmColor}`}></span>
								<span class="text-sm text-slate-700">{cat.name}</span>
							</div>
							<span class="text-sm font-semibold text-slate-700">{cat.percentage}%</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Savings rate bar chart -->
		<div class="p-5 sm:p-6 neu-card">
			<h2 class="text-base font-semibold mb-4" style="color:#1a1a2e">Tren Rasio Tabungan</h2>
			<div class="h-44">
				<canvas bind:this={savingsCanvas}></canvas>
			</div>
			<div class="mt-4 p-3 rounded-xl" style="background:rgba(74,222,128,0.08)">
				<div class="flex items-center gap-2">
					<TrendingUp size={14} color="#FF8A4C" />
					<p class="text-xs font-semibold" style="color:#FF8A4C">Rasio tabungan meningkat!</p>
				</div>
				<p class="text-xs mt-0.5" style="color:#6b7280">Dari 28% ke 43% dalam 5 bulan terakhir</p>
			</div>
		</div>
	</div>

	<!-- Recommendations -->
	<div class="p-5 sm:p-6 neu-card">
		<div class="flex items-center gap-2 mb-4">
			<Sparkles size={18} color="#FF8A4C" />
			<h2 class="text-base font-semibold" style="color:#1a1a2e">Rekomendasi untukmu</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{#each recs as rec (rec.title)}
				{@const RecIcon = rec.icon}
				<div class="p-4 rounded-2xl transition-all hover:scale-[1.02]"
					style="background:{rec.color}08;border:1px solid {rec.color}20">
					<RecIcon size={22} color={rec.color} />
					<p class="text-sm font-semibold mt-2 mb-1" style="color:#1a1a2e">{rec.title}</p>
					<p class="text-xs" style="color:#6b7280">{rec.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
