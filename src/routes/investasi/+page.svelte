<script lang="ts">
	import { formatRupiahFull } from '$lib/data/dummy';
	import {
		Bell,
		BriefcaseBusiness,
		ChevronDown,
		CircleEllipsis,
		Clock3,
		Coins,
		Plus,
		TrendingUp
	} from '@lucide/svelte';

	const portfolio = [
		{ name: 'Reksa Dana', pct: 45, amount: 20610000, color: 'rgba(139,92,246,0.78)' },
		{ name: 'Saham', pct: 25, amount: 11445000, color: 'rgba(59,130,246,0.78)' },
		{ name: 'Emas Digital', pct: 15, amount: 6867000, color: 'rgba(16,185,129,0.78)' },
		{ name: 'Obligasi', pct: 10, amount: 4578000, color: 'rgba(245,158,11,0.78)' },
		{ name: 'Deposito', pct: 5, amount: 2280000, color: 'rgba(148,163,184,0.78)' }
	];

	const investments = [
		{ product: 'Reksa Dana Pasar Uang', provider: 'Manulife Dana Kas II Kelas A', value: 8750000, profit: 750000, roi: 9.8, color: 'rgba(139,92,246,0.78)' },
		{ product: 'Saham', provider: 'BBCA - Bank Central Asia Tbk', value: 11445000, profit: 1945000, roi: 20.5, color: 'rgba(59,130,246,0.78)' },
		{ product: 'Emas Digital', provider: 'Pegadaian Digital', value: 6867000, profit: 467000, roi: 7.3, color: 'rgba(16,185,129,0.78)' },
		{ product: 'Obligasi', provider: 'ORI023 - Obligasi Negara Ritel', value: 4578000, profit: 328000, roi: 7.8, color: 'rgba(245,158,11,0.78)' },
		{ product: 'Deposito', provider: 'BCA Deposito Berjangka', value: 2280000, profit: 90000, roi: 4.2, color: 'rgba(148,163,184,0.78)' }
	];

	const totalValue = investments.reduce((sum, i) => sum + i.value, 0);
	const totalProfit = investments.reduce((sum, i) => sum + i.profit, 0);

	const ring = portfolio
		.map((cat, i) => {
			const start = portfolio.slice(0, i).reduce((sum, item) => sum + item.pct, 0);
			const end = start + cat.pct;
			return `${cat.color} ${start}% ${end}%`;
		})
		.join(', ');
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Investasi</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Pantau dan kembangkan aset investasimu</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Clock3 size={14} />
				Riwayat Investasi
			</button>
			<button class="w-10 h-10 rounded-full flex items-center justify-center relative"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Bell size={16} color="#6b7280" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background:#D97A7A"></span>
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#8B5CF6,#7C63D9);box-shadow:0 4px 14px rgba(124,99,217,0.35)">
				<Plus size={16} />
				Tambah Investasi
				<ChevronDown size={14} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<div class="neu-card p-4 card-hover">
			<p class="text-xs" style="color:#9ca3af">Total Nilai Investasi</p>
			<p class="text-lg font-bold mt-1" style="color:#1a1a2e">{formatRupiahFull(totalValue)}</p>
			<p class="text-xs mt-1" style="color:#6b7280">↑ 12.4% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs" style="color:#9ca3af">Keuntungan</p>
			<p class="text-lg font-bold mt-1" style="color:#1a1a2e">{formatRupiahFull(totalProfit)}</p>
			<p class="text-xs mt-1" style="color:#4E9C66">↑ 18.6% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs" style="color:#9ca3af">Imbal Hasil (XIRR)</p>
			<p class="text-lg font-bold mt-1" style="color:#1a1a2e">14.2% p.a.</p>
			<p class="text-xs mt-1" style="color:#4E9C66">↑ 2.1% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs" style="color:#9ca3af">Total Investasi Aktif</p>
			<p class="text-lg font-bold mt-1" style="color:#1a1a2e">{investments.length}</p>
			<p class="text-xs mt-1" style="color:#6b7280">di {investments.length} produk berbeda</p>
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
		<section class="space-y-4">
			<div class="neu-card p-4 sm:p-5">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-base font-semibold" style="color:#1a1a2e">Portofolio Investasi</h2>
					<button class="px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
						Semua Investasi <ChevronDown size={14} />
					</button>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 items-center">
					<div class="flex items-center justify-center">
						<div class="w-48 h-48 rounded-full shrink-0" style={`background:conic-gradient(${ring})`}>
							<div class="w-full h-full flex items-center justify-center">
								<div class="w-32 h-32 rounded-full bg-[#f8f6f3] flex flex-col items-center justify-center">
									<p class="text-sm" style="color:#6b7280">Total</p>
									<p class="text-base font-bold" style="color:#1a1a2e">{formatRupiahFull(totalValue)}</p>
								</div>
							</div>
						</div>
					</div>
					<div class="space-y-2">
						{#each portfolio as p}
							<div class="grid grid-cols-[1fr_52px_120px] items-center gap-2 text-sm">
								<div class="flex items-center gap-2">
									<span class="w-2 h-2 rounded-full" style={`background:${p.color}`}></span>
									<span style="color:#1f2937">{p.name}</span>
								</div>
								<span class="text-slate-500 text-right">{p.pct}%</span>
								<span class="text-slate-600 text-right">{formatRupiahFull(p.amount)}</span>
							</div>
						{/each}
						<button class="mt-2 text-sm font-semibold" style="color:#7C63D9">Lihat Detail Portofolio →</button>
					</div>
				</div>
			</div>

			<div class="neu-card p-0 overflow-hidden">
				<div class="p-4 border-b border-black/5 flex items-center justify-between gap-2 flex-wrap">
					<h2 class="text-base font-semibold" style="color:#1a1a2e">Daftar Investasi</h2>
					<div class="flex items-center gap-2">
						<button class="px-3 py-1.5 rounded-full bg-[#F4EEFF] text-xs font-semibold" style="color:#7C63D9">Semua</button>
						<button class="px-3 py-1.5 rounded-full bg-black/5 text-xs" style="color:#64748b">Reksa Dana</button>
						<button class="px-3 py-1.5 rounded-full bg-black/5 text-xs" style="color:#64748b">Saham</button>
						<button class="px-3 py-1.5 rounded-full bg-black/5 text-xs" style="color:#64748b">Emas</button>
					</div>
				</div>
				<div class="p-4 overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left" style="color:#64748b">
								<th class="pb-2 font-medium">Produk</th>
								<th class="pb-2 font-medium">Nilai Investasi</th>
								<th class="pb-2 font-medium">Keuntungan</th>
								<th class="pb-2 font-medium">Imbal Hasil</th>
								<th class="pb-2 font-medium text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each investments as inv}
								<tr class="border-t border-black/5">
									<td class="py-3">
										<div class="flex items-center gap-2">
											<div class="w-8 h-8 rounded-xl flex items-center justify-center" style={`background:${inv.color.replace('0.78','0.12')}`}>
												<Coins size={14} color={inv.color} />
											</div>
											<div>
												<p class="font-semibold" style="color:#1a1a2e">{inv.product}</p>
												<p class="text-xs text-slate-500">{inv.provider}</p>
											</div>
										</div>
									</td>
									<td class="py-3 font-semibold" style="color:#1a1a2e">{formatRupiahFull(inv.value)}</td>
									<td class="py-3">
										<p class="font-semibold" style="color:#4E9C66">+{formatRupiahFull(inv.profit)}</p>
									</td>
									<td class="py-3">
										<p class="font-semibold" style="color:#1a1a2e">{inv.roi}%</p>
										<p class="text-xs text-slate-500">(1 Tahun)</p>
									</td>
									<td class="py-3 text-right">
										<button class="w-8 h-8 rounded-full bg-black/5 inline-flex items-center justify-center">
											<CircleEllipsis size={14} color="#9ca3af" />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<button class="w-full mt-3 py-2.5 rounded-full text-sm font-semibold" style="background:rgba(0,0,0,0.04);color:#6b7280">
						Lihat Semua Investasi →
					</button>
				</div>
			</div>
		</section>

		<div class="space-y-4">
			<section class="neu-card p-5 card-hover">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold" style="color:#1a1a2e">Ringkasan Pasar</h3>
					<span class="text-xs text-slate-500">Update 18 Mei 2026, 10:30</span>
				</div>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between"><span>IHSG</span><span class="font-semibold">7.136,42</span><span style="color:#4E9C66">↑ 0.89%</span></div>
					<div class="flex justify-between"><span>LQ45</span><span class="font-semibold">865,21</span><span style="color:#4E9C66">↑ 1.12%</span></div>
					<div class="flex justify-between"><span>USD/IDR</span><span class="font-semibold">16.080</span><span style="color:#C07070">↓ 0.32%</span></div>
					<div class="flex justify-between"><span>Emas (Antam)</span><span class="font-semibold">{formatRupiahFull(1086000)}</span><span style="color:#4E9C66">↑ 0.74%</span></div>
				</div>
				<button class="w-full mt-4 py-2.5 rounded-full text-sm font-semibold" style="background:#F4EEFF;color:#7C63D9">Lihat Selengkapnya →</button>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-2" style="color:#1a1a2e">Insight Investasimu</h3>
				<p class="text-sm leading-relaxed text-slate-600">
					Portofoliomu berkinerja baik. Keuntunganmu 18.6% lebih tinggi dibanding rata-rata investor serupa.
				</p>
				<button class="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style="background:#F4EEFF;color:#7C63D9">Lihat Insight Lengkap →</button>
			</section>

			<section class="neu-card p-5 card-hover">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-base font-semibold" style="color:#1a1a2e">Rekomendasi Untukmu</h3>
					<span class="px-2 py-1 rounded-full text-xs font-semibold" style="background:rgba(16,185,129,0.12);color:#4E9C66">Baru</span>
				</div>
				<div class="rounded-2xl p-3" style="background:rgba(0,0,0,0.03)">
					<div class="flex items-center gap-2 mb-1">
						<div class="w-9 h-9 rounded-xl grid place-items-center" style="background:rgba(245,158,11,0.14)">
							<BriefcaseBusiness size={15} color="#D6A357" />
						</div>
						<p class="font-semibold">Reksa Dana Campuran</p>
					</div>
					<p class="text-sm text-slate-600">Diversifikasi optimal antara saham dan obligasi untuk pertumbuhan stabil.</p>
				</div>
				<button class="w-full mt-3 py-2.5 rounded-full text-sm font-semibold" style="background:#F4EEFF;color:#7C63D9">Lihat Rekomendasi →</button>
			</section>
		</div>
	</div>
</div>
