<script lang="ts">
	import { onMount } from 'svelte';
	import { budgetCategories, formatRupiahFull } from '$lib/data/dummy';
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
		Bell,
		Calendar,
		ChevronDown,
		CircleEllipsis,
		Clock3,
		Plus,
		Target,
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

	const totalBudget = budgetCategories.reduce((a, b) => a + b.budget, 0);
	const totalUsed = budgetCategories.reduce((a, b) => a + b.used, 0);
	const totalLeft = totalBudget - totalUsed;
	const usedPct = Math.round((totalUsed / totalBudget) * 100);
	const activeCategories = budgetCategories.filter((c) => c.used > 0).length;

	const summaryCards = [
		{
			title: 'Total Anggaran',
			value: formatRupiahFull(totalBudget),
			note: 'Untuk Mei 2026',
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
			note: `Dari ${budgetCategories.length} kategori`,
			icon: Target,
			color: '#F59E0B',
			bg: 'rgba(245,158,11,0.14)'
		}
	];

	const trend = [1.5, 2.7, 3.1, 4.2, 4.6, 5.1, 6.0, 6.2, 5.8, 6.0, 7.1, 7.5, 8.0, 8.0, 8.0, 8.0, 10.0];
	const trendLabels = ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19', '21', '23', '25', '27', '29', '30', '31'];
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
				labels: trendLabels,
				datasets: [
					{
						label: 'Penggunaan Anggaran',
						data: trend,
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
						ticks: { color: '#94A3B8', maxTicksLimit: 5, callback: (_, i) => ['1 Mei', '8 Mei', '15 Mei', '22 Mei', '31 Mei'][i] ?? '' },
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
				animation: { duration: 1100, easing: 'easeOutQuart' }
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
				animation: { duration: 1200, easing: 'easeOutBack' }
			}
		};

		usageChart = new Chart(usageCtx, usageConfig);
		progressChart = new Chart(progressCtx, progressConfig);

		return () => {
			usageChart?.destroy();
			progressChart?.destroy();
		};
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Anggaran</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Atur dan pantau anggaranmu dengan mudah ✨</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				Mei 2026
				<Calendar size={14} />
			</button>
			<button class="w-10 h-10 rounded-full flex items-center justify-center relative"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Bell size={16} color="#6b7280" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background:#FF6B6B"></span>
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
				<Plus size={16} />
				Buat Anggaran Baru
			</button>
		</div>
	</div>

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
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Ringkasan Anggaran</h2>
				<button class="px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
					Per Bulan <ChevronDown size={14} />
				</button>
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
					{#each budgetCategories as cat (cat.name)}
						{@const pct = Math.round((cat.used / cat.budget) * 100)}
						{@const pctColor = pct >= 85 ? '#EA580C' : pct >= 60 ? '#FB923C' : '#FDBA74'}
						<div class="grid grid-cols-[1fr_110px_110px_100px_60px_28px] items-center gap-2 py-2.5 border-b border-black/5 last:border-b-0">
							<div class="min-w-0">
								<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{cat.name}</p>
								<div class="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
									<div class="h-full rounded-full" style={`width:${Math.min(pct, 100)}%;background:${pctColor}`}></div>
								</div>
							</div>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.used)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget - cat.used)}</p>
							<p class="text-sm font-bold text-right" style={`color:${pctColor}`}>{pct}%</p>
							<CircleEllipsis size={14} color="#9ca3af" />
						</div>
					{/each}
				</div>
				<button class="w-full mt-4 py-3 rounded-full text-sm font-semibold" style="background:#FFF1E8;color:#FF8A4C">
					+ Lihat Semua Kategori
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

			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Anggaran Mendekati Batas</h3>
				<div class="space-y-3">
					{#each [...budgetCategories].sort((a, b) => b.used / b.budget - a.used / a.budget).slice(0, 3) as cat (cat.name)}
						{@const pct = Math.round((cat.used / cat.budget) * 100)}
						{@const pctColor = pct >= 85 ? '#EA580C' : pct >= 60 ? '#FB923C' : '#FDBA74'}
						<div>
							<div class="flex items-center justify-between mb-1">
								<p class="text-sm font-semibold" style="color:#1a1a2e">{cat.name}</p>
								<p class="text-sm font-bold" style={`color:${pctColor}`}>{pct}%</p>
							</div>
							<div class="h-1.5 rounded-full bg-black/5 overflow-hidden">
								<div class="h-full rounded-full" style={`width:${Math.min(pct, 100)}%;background:${pctColor}`}></div>
							</div>
						</div>
					{/each}
				</div>
				<button class="w-full mt-4 py-2.5 rounded-full text-sm font-semibold" style="background:#FFF1E8;color:#FF8A4C">Lihat Detail</button>
			</section>

			<section class="neu-card p-5 card-hover">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold" style="color:#1a1a2e">Riwayat Anggaran</h3>
					<button class="text-xs font-semibold" style="color:#60A5FA">Lihat Semua</button>
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between py-1.5">
						<p class="text-sm font-semibold">Mei 2026</p>
						<p class="text-sm">{formatRupiahFull(15000000)}</p>
						<span class="px-2 py-1 rounded-full text-xs font-semibold" style="background:rgba(255,138,76,0.14);color:#FF8A4C">Aktif</span>
					</div>
					<div class="flex items-center justify-between py-1.5">
						<p class="text-sm font-semibold">April 2026</p>
						<p class="text-sm">{formatRupiahFull(14000000)}</p>
						<span class="px-2 py-1 rounded-full text-xs font-semibold" style="background:rgba(0,0,0,0.06);color:#64748b">Selesai</span>
					</div>
					<div class="flex items-center justify-between py-1.5">
						<p class="text-sm font-semibold">Maret 2026</p>
						<p class="text-sm">{formatRupiahFull(13500000)}</p>
						<span class="px-2 py-1 rounded-full text-xs font-semibold" style="background:rgba(0,0,0,0.06);color:#64748b">Selesai</span>
					</div>
				</div>
				<button class="w-full mt-3 py-2.5 rounded-full text-sm font-semibold" style="background:rgba(0,0,0,0.04);color:#475569">
					Lihat Semua Riwayat
				</button>
			</section>
		</div>
	</div>
</div>
