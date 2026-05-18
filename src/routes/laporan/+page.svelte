<script lang="ts">
	import { categoryExpenses, summary, chartData, formatRupiahFull } from '$lib/data/dummy';
	import {
		ArrowDown,
		ArrowUp,
		BriefcaseBusiness,
		Calendar,
		ChevronDown,
		Download,
		Filter,
		PieChart,
		TrendingUp,
		Wallet
	} from '@lucide/svelte';

	const stats = [
		{
			title: 'Total Pemasukan',
			value: summary.pemasukan,
			change: '+18.6%',
			note: 'dari April 2026',
			icon: ArrowUp,
			color: 'rgba(16,185,129,0.78)',
			bg: 'rgba(16,185,129,0.10)'
		},
		{
			title: 'Total Pengeluaran',
			value: summary.pengeluaran,
			change: '+9.4%',
			note: 'dari April 2026',
			icon: ArrowDown,
			color: 'rgba(239,68,68,0.75)',
			bg: 'rgba(239,68,68,0.10)'
		},
		{
			title: 'Surplus / Defisit',
			value: summary.pemasukan - summary.pengeluaran,
			change: '+34.2%',
			note: 'dari April 2026',
			icon: Wallet,
			color: 'rgba(59,130,246,0.78)',
			bg: 'rgba(59,130,246,0.10)'
		},
		{
			title: 'Rasio Tabungan',
			value: 28.4,
			change: '+6.1%',
			note: 'dari April 2026',
			icon: PieChart,
			color: 'rgba(245,158,11,0.78)',
			bg: 'rgba(245,158,11,0.12)'
		}
	];

	const barSeries = chartData.flatMap((d) => [
		{ label: d.date, type: 'income', value: Math.round(d.pemasukan / 100000) },
		{ label: d.date, type: 'expense', value: Math.round(d.pengeluaran / 100000) }
	]);

	const catRing = categoryExpenses
		.map((cat, i) => {
			const start = categoryExpenses.slice(0, i).reduce((sum, item) => sum + item.percentage, 0);
			const end = start + cat.percentage;
			return `${cat.color} ${start}% ${end}%`;
		})
		.join(', ');
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Laporan</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Ringkasan keuanganmu dalam periode pilihan</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Calendar size={14} /> 1 - 31 Mei 2026 <ChevronDown size={14} />
			</button>
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Filter size={14} /> Filter
			</button>
			<button class="px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
				style="background:linear-gradient(135deg,#8B5CF6,#7C63D9);box-shadow:0 4px 14px rgba(124,99,217,0.35)">
				<Download size={14} /> Export <ChevronDown size={14} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		{#each stats as stat}
			<div class="neu-card p-4 card-hover">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={`background:${stat.bg}`}>
					<stat.icon size={16} color={stat.color} />
				</div>
				<p class="text-xs" style="color:#9ca3af">{stat.title}</p>
				<p class="text-lg font-bold mt-1" style="color:#1a1a2e">
					{stat.title === 'Rasio Tabungan' ? `${stat.value}%` : formatRupiahFull(Number(stat.value))}
				</p>
				<p class="text-xs mt-1" style={`color:${stat.title === 'Total Pengeluaran' ? 'rgba(239,68,68,0.75)' : 'rgba(16,185,129,0.75)'}`}>
					{stat.change} <span class="text-slate-500">{stat.note}</span>
				</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
		<section class="neu-card p-5">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Tren Pemasukan vs Pengeluaran</h2>
				<button class="px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
					Harian <ChevronDown size={14} />
				</button>
			</div>
			<div class="grid grid-cols-[repeat(12,minmax(0,1fr))] gap-1 h-52 items-end">
				{#each barSeries as b}
					<div class="w-full rounded-t-md" style={`height:${Math.max(8, b.value)}px;background:${b.type === 'income' ? 'rgba(16,185,129,0.55)' : 'rgba(239,68,68,0.55)'}`}></div>
				{/each}
			</div>
			<div class="mt-3 flex justify-between text-xs text-slate-500">
				<span>1 Mei</span><span>8 Mei</span><span>15 Mei</span><span>22 Mei</span><span>29 Mei</span>
			</div>
		</section>

		<section class="neu-card p-5">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Ringkasan per Kategori</h2>
				<div class="flex gap-1 p-1 rounded-full bg-black/5">
					<button class="px-3 py-1 rounded-full bg-white text-xs font-semibold" style="color:#7C63D9">Pengeluaran</button>
					<button class="px-3 py-1 rounded-full text-xs font-semibold text-slate-500">Pemasukan</button>
				</div>
			</div>
			<div class="grid grid-cols-[180px_1fr] gap-3 items-center">
				<div class="w-40 h-40 rounded-full" style={`background:conic-gradient(${catRing})`}>
					<div class="w-full h-full flex items-center justify-center">
						<div class="w-24 h-24 rounded-full bg-[#f8f6f3] flex flex-col items-center justify-center">
							<p class="text-xs text-slate-500">Total</p>
							<p class="text-sm font-bold">{formatRupiahFull(summary.pengeluaran)}</p>
						</div>
					</div>
				</div>
				<div class="space-y-2 min-w-0">
					{#each categoryExpenses as cat}
						<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-xs sm:text-sm items-center">
							<div class="flex items-center gap-2 min-w-0">
								<span class="w-2 h-2 rounded-full shrink-0" style={`background:${cat.color}`}></span>
								<span class="truncate">{cat.name}</span>
							</div>
							<div class="text-right text-slate-600 whitespace-nowrap">
								{formatRupiahFull(cat.amount)}
								<span class="ml-2 text-slate-500">{cat.percentage}%</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<button class="w-full mt-4 py-2.5 rounded-full text-sm font-semibold" style="background:#F4EEFF;color:#7C63D9">Lihat Detail Kategori →</button>
		</section>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
		<section class="neu-card p-5 card-hover">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-base font-semibold">Arus Kas</h3>
				<button class="text-xs font-semibold" style="color:#7C63D9">Detail</button>
			</div>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between"><span class="text-slate-600">Saldo Awal</span><span class="font-semibold">{formatRupiahFull(15250000)}</span></div>
				<div class="flex justify-between"><span style="color:rgba(16,185,129,0.8)">+ Total Pemasukan</span><span style="color:rgba(16,185,129,0.8)">{formatRupiahFull(summary.pemasukan)}</span></div>
				<div class="flex justify-between"><span style="color:rgba(239,68,68,0.8)">- Total Pengeluaran</span><span style="color:rgba(239,68,68,0.8)">{formatRupiahFull(summary.pengeluaran)}</span></div>
				<div class="mt-2 pt-2 border-t border-black/5 flex justify-between"><span class="font-semibold">Saldo Akhir</span><span class="font-bold">{formatRupiahFull(22770000)}</span></div>
			</div>
		</section>

		<section class="neu-card p-5 card-hover">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-base font-semibold">Laporan per Rekening</h3>
				<button class="text-xs font-semibold text-slate-500">Semua Rekening</button>
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
				<button class="text-xs font-semibold" style="color:#7C63D9">Lihat Semua</button>
			</div>
			<div class="space-y-2">
				<div class="rounded-2xl p-3" style="background:rgba(16,185,129,0.08)">
					<p class="font-semibold text-sm">Pengeluaran Turun</p>
					<p class="text-sm text-slate-600">Pengeluaranmu turun 9.4% dibanding bulan lalu.</p>
				</div>
				<div class="rounded-2xl p-3" style="background:rgba(245,158,11,0.08)">
					<p class="font-semibold text-sm">Makanan & Minuman Tinggi</p>
					<p class="text-sm text-slate-600">Kategori ini mencapai 27.7% dari total pengeluaran.</p>
				</div>
				<div class="rounded-2xl p-3" style="background:rgba(59,130,246,0.08)">
					<p class="font-semibold text-sm">Tujuan Mendekat</p>
					<p class="text-sm text-slate-600">2 tujuan keuanganmu sudah mencapai lebih dari 50%.</p>
				</div>
			</div>
		</section>
	</div>
</div>
