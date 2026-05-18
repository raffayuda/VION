<script lang="ts">
	import { insights, categoryExpenses, formatRupiah } from '$lib/data/dummy';
	import { Sparkles, AlertTriangle, CheckCircle, Lightbulb, ArrowRight, Coffee, Car, TrendingUp } from '@lucide/svelte';

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'];
	const savingsRate = [28, 32, 35, 38, 43];

	const insightIcons = { warning: AlertTriangle, success: CheckCircle, info: Lightbulb };
	const insightColors = { warning: '#F59E0B', success: '#4ADE80', info: '#60A5FA' };

	const recs = [
		{ icon: Coffee, title: 'Kurangi coffee spending', desc: 'Hemat Rp200.000/bulan jika mengurangi 3 kali kopi per minggu', color: '#F59E0B' },
		{ icon: Car, title: 'Pertimbangkan transportasi umum', desc: 'Transportasi online bisa diganti KRL untuk rute tertentu', color: '#60A5FA' },
		{ icon: TrendingUp, title: 'Kamu sudah hemat!', desc: 'Rasio tabungan 43.7% sudah di atas rata-rata nasional 35%', color: '#4ADE80' },
	];
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
		{#each insights as insight}
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
				<a href="/transaksi"
					class="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 transition-all hover:opacity-80"
					style="background:{iconColor}18;color:{iconColor}">
					Detail <ArrowRight size={11} />
				</a>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Spending by category -->
		<div class="p-5 sm:p-6 neu-card">
			<h2 class="text-base font-semibold mb-4" style="color:#1a1a2e">Pengeluaran per Kategori</h2>
			<div class="space-y-3">
				{#each categoryExpenses as cat}
					<div>
						<div class="flex items-center justify-between mb-1">
							<span class="text-sm" style="color:#1a1a2e">{cat.name}</span>
							<span class="text-sm font-semibold" style="color:#1a1a2e">{formatRupiah(cat.amount)}</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill" style="width:{cat.percentage}%;background:{cat.color}"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Savings rate bar chart -->
		<div class="p-5 sm:p-6 neu-card">
			<h2 class="text-base font-semibold mb-4" style="color:#1a1a2e">Tren Rasio Tabungan</h2>
			<div class="flex items-end gap-3 h-32 mb-3">
				{#each savingsRate as rate, i}
					{@const isLast = i === savingsRate.length - 1}
					<div class="flex-1 flex flex-col items-center gap-1">
						<span class="text-xs font-semibold" style="color:{isLast ? '#FF8A4C' : '#9ca3af'}">{rate}%</span>
						<div class="w-full rounded-t-xl transition-all duration-500"
							style="height:{rate * 2.5}px;background:{isLast ? 'linear-gradient(180deg,#FF8A4C,#FFD6BF)' : 'rgba(0,0,0,0.06)'}">
						</div>
					</div>
				{/each}
			</div>
			<div class="flex justify-between">
				{#each months as m}
					<span class="text-xs" style="color:#9ca3af">{m}</span>
				{/each}
			</div>
			<div class="mt-4 p-3 rounded-xl" style="background:rgba(74,222,128,0.08)">
				<div class="flex items-center gap-2">
					<TrendingUp size={14} color="#4ADE80" />
					<p class="text-xs font-semibold" style="color:#4ADE80">Rasio tabungan meningkat!</p>
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
			{#each recs as rec}
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
