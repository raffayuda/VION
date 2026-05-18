<script lang="ts">
	import { financialGoals, formatRupiahFull } from '$lib/data/dummy';
	import {
		Bell,
		ChevronDown,
		CircleEllipsis,
		Clock3,
		Plus,
		Target,
		TrendingUp,
		Wallet
	} from '@lucide/svelte';

	const totalGoals = financialGoals.length;
	const totalCurrent = financialGoals.reduce((sum, g) => sum + g.current, 0);
	const totalTarget = financialGoals.reduce((sum, g) => sum + g.target, 0);
	const avgProgress = Math.round((totalCurrent / totalTarget) * 100);

	const goalRows = financialGoals.map((goal, idx) => {
		const pct = Math.round((goal.current / goal.target) * 100);
		const period = idx % 3 === 0 ? 'Jangka Panjang' : idx % 3 === 1 ? 'Jangka Menengah' : 'Jangka Pendek';
		const tones = [
			{ solid: 'rgba(16,185,129,0.78)', soft: 'rgba(16,185,129,0.10)' }, // emerald
			{ solid: 'rgba(59,130,246,0.78)', soft: 'rgba(59,130,246,0.10)' }, // blue
			{ solid: 'rgba(139,92,246,0.78)', soft: 'rgba(139,92,246,0.10)' }, // violet
			{ solid: 'rgba(245,158,11,0.78)', soft: 'rgba(245,158,11,0.12)' } // amber
		];
		return { ...goal, pct, period, tone: tones[idx % tones.length] };
	});

	const periodCount = {
		pendek: goalRows.filter((g) => g.period === 'Jangka Pendek').length,
		menengah: goalRows.filter((g) => g.period === 'Jangka Menengah').length,
		panjang: goalRows.filter((g) => g.period === 'Jangka Panjang').length
	};
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Tujuan Keuangan ✨</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Wujudkan impianmu dengan perencanaan yang terarah</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#6b7280">
				<Clock3 size={14} />
				Riwayat Tujuan
			</button>
			<button class="w-10 h-10 rounded-full flex items-center justify-center relative"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Bell size={16} color="#6b7280" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background:#D97A7A"></span>
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#F08A5B,#E07A47);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
				<Plus size={16} />
				Buat Tujuan Baru
			</button>
		</div>
	</div>

	<section class="neu-card p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
		<div class="px-2 sm:px-3">
			<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style="background:rgba(255,138,76,0.12)">
				<Target size={16} color="#F08A5B" />
			</div>
			<p class="text-xs" style="color:#9ca3af">Total Tujuan</p>
			<p class="text-xl font-bold" style="color:#1a1a2e">{totalGoals}</p>
			<p class="text-xs" style="color:#6b7280">tujuan aktif</p>
		</div>
		<div class="px-2 sm:px-3 border-l border-black/5">
			<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style="background:rgba(74,222,128,0.12)">
				<Wallet size={16} color="#63C78A" />
			</div>
			<p class="text-xs" style="color:#9ca3af">Total Terkumpul</p>
			<p class="text-xl font-bold" style="color:#1a1a2e">{formatRupiahFull(totalCurrent)}</p>
			<p class="text-xs" style="color:#4E9C66">+18.6% dari bulan lalu</p>
		</div>
		<div class="px-2 sm:px-3 border-l border-black/5">
			<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style="background:rgba(96,165,250,0.12)">
				<TrendingUp size={16} color="#6FA7E8" />
			</div>
			<p class="text-xs" style="color:#9ca3af">Total Target</p>
			<p class="text-xl font-bold" style="color:#1a1a2e">{formatRupiahFull(totalTarget)}</p>
		</div>
		<div class="px-2 sm:px-3 border-l border-black/5">
			<div class="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style="background:rgba(245,158,11,0.12)">
				<Target size={16} color="#D6A357" />
			</div>
			<p class="text-xs" style="color:#9ca3af">Rata-rata Progress</p>
			<p class="text-xl font-bold" style="color:#1a1a2e">{avgProgress}%</p>
			<div class="mt-2 h-1.5 rounded-full bg-black/5 overflow-hidden">
				<div class="h-full rounded-full" style={`width:${avgProgress}%;background:#F08A5B`}></div>
			</div>
		</div>
	</section>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
		<section class="neu-card p-0 overflow-hidden">
			<div class="p-4 border-b border-black/5 flex flex-wrap items-center gap-2">
				<div class="flex gap-1 p-1 rounded-full bg-black/5">
					<button class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white" style="color:#F08A5B">Semua Tujuan</button>
					<button class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium" style="color:#6b7280">Jangka Pendek</button>
					<button class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium" style="color:#6b7280">Jangka Menengah</button>
					<button class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium" style="color:#6b7280">Jangka Panjang</button>
				</div>
				<button class="ml-auto px-4 py-2 rounded-full bg-black/5 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
					Urutkan
					<ChevronDown size={14} />
				</button>
			</div>

			<div class="p-4 space-y-3">
				{#each goalRows as goal}
					<div class="rounded-2xl border border-black/5 p-3 sm:p-4">
						<div class="grid grid-cols-[1fr_180px_28px] gap-3 items-start">
							<div>
								<div class="flex items-center gap-2 mb-1.5">
									<p class="text-base sm:text-lg font-semibold" style="color:#1f2937">{goal.name}</p>
									<span class="px-2 py-1 rounded-full text-xs font-semibold"
										style={`background:${goal.tone.soft};color:${goal.tone.solid}`}>{goal.period}</span>
								</div>
								<p class="text-xs sm:text-sm mb-2" style="color:#6b7280">
									Target: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
								</p>
								<div class="h-2 rounded-full bg-black/5 overflow-hidden max-w-[360px]">
									<div class="h-full rounded-full" style={`width:${goal.pct}%;background:${goal.tone.solid}`}></div>
								</div>
								<p class="text-xs sm:text-sm font-semibold mt-1" style="color:#374151">{goal.pct}%</p>
							</div>
							<div class="text-right">
								<p class="text-xl sm:text-2xl leading-tight font-semibold text-slate-700">{formatRupiahFull(goal.current)}</p>
								<p class="text-xs sm:text-sm text-slate-500">dari {formatRupiahFull(goal.target)}</p>
								<button class="mt-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
									style="background:#F5ECE6;color:#C37A59">Detail</button>
							</div>
							<button class="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center">
								<CircleEllipsis size={14} color="#9ca3af" />
							</button>
						</div>
					</div>
				{/each}

				<button class="w-full py-3 rounded-full text-sm font-semibold"
					style="background:rgba(0,0,0,0.04);color:#475569">
					+ Buat Tujuan Keuangan Baru
				</button>
			</div>
		</section>

		<div class="space-y-4">
			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Ringkasan Progres</h3>
				<div class="flex items-center gap-4">
					<div class="w-36 h-36 rounded-full shrink-0"
						style="background:conic-gradient(rgba(16,185,129,0.82) 0 40%, rgba(59,130,246,0.82) 40% 60%, rgba(139,92,246,0.82) 60% 100%)">
						<div class="w-full h-full flex items-center justify-center">
							<div class="w-24 h-24 rounded-full bg-[#f8f6f3] flex flex-col items-center justify-center">
								<p class="text-4xl font-bold" style="color:#1a1a2e">{avgProgress}%</p>
								<p class="text-xs" style="color:#6b7280">Rata-rata</p>
							</div>
						</div>
					</div>
					<div class="space-y-2 text-sm">
						<p><span class="inline-block w-2 h-2 rounded-full mr-2" style="background:rgba(16,185,129,0.78)"></span>Jangka Pendek ({periodCount.pendek})</p>
						<p><span class="inline-block w-2 h-2 rounded-full mr-2" style="background:rgba(59,130,246,0.78)"></span>Jangka Menengah ({periodCount.menengah})</p>
						<p><span class="inline-block w-2 h-2 rounded-full mr-2" style="background:rgba(139,92,246,0.78)"></span>Jangka Panjang ({periodCount.panjang})</p>
					</div>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="text-base font-semibold mb-3" style="color:#1a1a2e">Tips Mencapai Tujuan</h3>
				<div class="rounded-2xl p-4" style="background:linear-gradient(135deg,#FFF7F2,#FFE8D6)">
					<p class="text-sm leading-relaxed" style="color:#6b7280">
						Disiplin menabung setiap hari membuat tujuan besar lebih mudah tercapai.
					</p>
					<button class="mt-3 px-4 py-2 rounded-full text-sm font-semibold" style="background:#FFF1E8;color:#F08A5B">
						Lihat Tips Lainnya →
					</button>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold" style="color:#1a1a2e">Terbaru Ditambahkan</h3>
					<button class="text-xs font-semibold" style="color:#6FA7E8">Lihat Semua</button>
				</div>
				<div class="space-y-3">
					{#each goalRows.slice(0, 3) as goal}
						<div class="flex items-center justify-between gap-2">
							<div>
								<p class="text-sm font-semibold">{goal.name}</p>
								<p class="text-xs text-slate-500">
									Ditambahkan {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
								</p>
							</div>
							<p class="text-sm font-bold" style={`color:${goal.color}`}>{formatRupiahFull(goal.current)}</p>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>
