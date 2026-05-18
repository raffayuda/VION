<script lang="ts">
	import { budgetCategories, formatRupiahFull } from '$lib/data/dummy';
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
			color: '#4ADE80',
			bg: 'rgba(74,222,128,0.12)'
		},
		{
			title: 'Sisa Anggaran',
			value: formatRupiahFull(totalLeft),
			note: `${100 - usedPct}% masih tersedia`,
			icon: Clock3,
			color: '#60A5FA',
			bg: 'rgba(96,165,250,0.12)'
		},
		{
			title: 'Kategori Aktif',
			value: `${activeCategories} Kategori`,
			note: `Dari ${budgetCategories.length} kategori`,
			icon: Target,
			color: '#A78BFA',
			bg: 'rgba(167,139,250,0.12)'
		}
	];

	const trend = [1.5, 2.7, 3.1, 4.2, 4.6, 5.1, 6.0, 6.2, 5.8, 6.0, 7.1, 7.5, 8.0, 8.0, 8.0, 8.0, 10.0];

	function genPath(values: number[], w: number, h: number) {
		const max = 15;
		return values
			.map((v, i) => {
				const x = (i / (values.length - 1)) * w;
				const y = h - (v / max) * h;
				return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
			})
			.join(' ');
	}

	const usagePath = genPath(trend, 600, 220);
	const usageArea = `${usagePath} L 600,220 L 0,220 Z`;
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
		{#each summaryCards as card}
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
					<div class="w-44 h-44 rounded-full relative grid place-items-center"
						style={`background:conic-gradient(#FF6B1B 0 ${usedPct}%, rgba(0,0,0,0.06) ${usedPct}% 100%)`}>
						<div class="w-34 h-34 rounded-full bg-[#f8f6f3] flex flex-col items-center justify-center">
							<p class="text-4xl font-bold" style="color:#1a1a2e">{usedPct}%</p>
							<p class="text-sm" style="color:#6b7280">Terpakai</p>
						</div>
					</div>
				</div>

				<div>
					<svg viewBox="0 0 600 220" class="w-full h-[220px]">
						<defs>
							<linearGradient id="budgetArea" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stop-color="#FF8A4C" stop-opacity="0.2" />
								<stop offset="100%" stop-color="#FF8A4C" stop-opacity="0" />
							</linearGradient>
						</defs>

						<line x1="0" y1="0" x2="600" y2="0" stroke="#cbd5e1" stroke-dasharray="5 5" />
						<line x1="0" y1="220" x2="600" y2="220" stroke="#e5e7eb" />

						<path d={usageArea} fill="url(#budgetArea)" />
						<path d={usagePath} fill="none" stroke="#FF6B1B" stroke-width="3" stroke-linecap="round" />

						<circle cx="600" cy={220 - (10 / 15) * 220} r="4.5" fill="#FF6B1B" />
					</svg>
					<div class="flex justify-between text-xs px-1 -mt-1" style="color:#64748b">
						<span>1 Mei</span><span>8 Mei</span><span>15 Mei</span><span>22 Mei</span><span>31 Mei</span>
					</div>
				</div>
			</div>

			<div class="mt-5 pt-4 border-t border-black/5">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Anggaran per Kategori</h3>
				<div class="space-y-2">
					{#each budgetCategories as cat}
						{@const pct = Math.round((cat.used / cat.budget) * 100)}
						<div class="grid grid-cols-[1fr_110px_110px_100px_60px_28px] items-center gap-2 py-2.5 border-b border-black/5 last:border-b-0">
							<div class="min-w-0">
								<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{cat.name}</p>
								<div class="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
									<div class="h-full rounded-full" style={`width:${Math.min(pct, 100)}%;background:${cat.color}`}></div>
								</div>
							</div>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.used)}</p>
							<p class="text-sm text-slate-600 text-right">{formatRupiahFull(cat.budget - cat.used)}</p>
							<p class="text-sm font-bold text-right" style={`color:${pct >= 85 ? '#FF6B6B' : '#1a1a2e'}`}>{pct}%</p>
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
						Kamu sudah menghemat <span class="font-bold" style="color:#4ADE80">Rp 1.200.000</span> dari anggaran bulan lalu. Pertahankan!
					</p>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Anggaran Mendekati Batas</h3>
				<div class="space-y-3">
					{#each [...budgetCategories].sort((a, b) => b.used / b.budget - a.used / a.budget).slice(0, 3) as cat}
						{@const pct = Math.round((cat.used / cat.budget) * 100)}
						<div>
							<div class="flex items-center justify-between mb-1">
								<p class="text-sm font-semibold" style="color:#1a1a2e">{cat.name}</p>
								<p class="text-sm font-bold" style="color:#1a1a2e">{pct}%</p>
							</div>
							<div class="h-1.5 rounded-full bg-black/5 overflow-hidden">
								<div class="h-full rounded-full" style={`width:${Math.min(pct, 100)}%;background:${cat.color}`}></div>
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
						<span class="px-2 py-1 rounded-full text-xs font-semibold" style="background:rgba(74,222,128,0.12);color:#16a34a">Aktif</span>
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
