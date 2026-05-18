<script lang="ts">
	import { categoryExpenses, summary, transactions, formatRupiahFull } from '$lib/data/dummy';
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

	const ring = categoryExpenses
		.map((cat, i) => {
			const start = categoryExpenses.slice(0, i).reduce((sum, item) => sum + item.percentage, 0);
			const end = start + cat.percentage;
			return `${cat.color} ${start}% ${end}%`;
		})
		.join(', ');

	const statCards = [
		{
			title: 'Total Pemasukan',
			value: summary.pemasukan,
			change: `+${summary.pemasukanChange}% dari bulan lalu`,
			positive: true,
			color: '#63C78A',
			bg: 'rgba(74,222,128,0.12)',
			icon: Gift
		},
		{
			title: 'Total Pengeluaran',
			value: summary.pengeluaran,
			change: `-${summary.pengeluaranChange}% dari bulan lalu`,
			positive: false,
			color: '#D97A7A',
			bg: 'rgba(255,107,107,0.12)',
			icon: Heart
		},
		{
			title: 'Saldo Bersih',
			value: summary.sisaBudget,
			change: '+5.1% dari bulan lalu',
			positive: true,
			color: '#D6A357',
			bg: 'rgba(245,158,11,0.12)',
			icon: Zap
		},
		{
			title: 'Transaksi',
			value: transactions.length,
			change: '+4 dari bulan lalu',
			positive: true,
			color: '#9D90D8',
			bg: 'rgba(167,139,250,0.12)',
			icon: Wallet
		}
	];

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
		{#each statCards as stat}
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
				<p class="text-xs mt-1" style={`color:${stat.positive ? '#63C78A' : '#D97A7A'}`}>{stat.change}</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
		<section class="neu-card p-0 overflow-hidden">
			<div class="p-4 border-b border-black/5 flex flex-wrap items-center gap-2">
				<div class="flex gap-1 p-1 rounded-full bg-black/5">
					{#each tabs as tab}
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
				{#each Object.entries(grouped) as [date, txs]}
					<div class="py-4 border-b border-black/5 last:border-b-0">
						<p class="text-xs font-semibold mb-3" style="color:#9ca3af">{formatDate(date)}</p>
						<div class="space-y-2">
							{#each txs as tx}
								{@const TxIcon = getTxIcon(tx.category)}
								<div class="flex items-center gap-3 rounded-2xl p-2">
									<div class="w-10 h-10 rounded-full flex items-center justify-center"
										style={`background:${tx.type === 'income' ? 'rgba(74,222,128,0.12)' : 'rgba(255,138,76,0.1)'}`}>
										<TxIcon size={16} color={tx.type === 'income' ? '#63C78A' : '#F08A5B'} />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{tx.merchant}</p>
										<div class="flex items-center gap-2 mt-0.5">
											<p class="text-xs sm:text-sm text-slate-500 truncate">{tx.category}</p>
											<span class="px-2 py-1 text-xs rounded-full bg-black/5 text-slate-600">{getWallet(tx.merchant)}</span>
										</div>
									</div>
									<div class="text-right">
										<p class="text-sm font-bold" style={`color:${tx.type === 'income' ? '#63C78A' : '#D97A7A'}`}>
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
					<div class="w-32 h-32 rounded-full shrink-0" style={`background:conic-gradient(${ring})`}>
						<div class="w-full h-full flex items-center justify-center">
							<div class="w-18 h-18 rounded-full bg-[#f8f6f3] flex flex-col items-center justify-center text-center">
								<p class="text-xs text-slate-500">Total</p>
								<p class="text-xs font-bold">{formatRupiahFull(summary.pengeluaran)}</p>
							</div>
						</div>
					</div>
					<div class="space-y-1.5">
						{#each categoryExpenses as cat}
							<div class="flex items-center justify-between gap-3 text-xs sm:text-sm">
								<div class="flex items-center gap-2">
									<span class="w-2 h-2 rounded-full" style={`background:${cat.color}`}></span>
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
					<div class="flex items-end gap-1">
						<div class="w-4 h-8 rounded-t bg-orange-200"></div>
						<div class="w-4 h-12 rounded-t bg-orange-300"></div>
						<div class="w-4 h-16 rounded-t bg-orange-400"></div>
					</div>
				</div>
			</section>

			<section class="neu-card p-5 card-hover">
				<h3 class="font-bold text-base mb-3" style="color:#1a1a2e">Transaksi Terbesar</h3>
				<div class="space-y-3">
					{#each topTransactions as tx}
						<div class="flex items-center justify-between gap-2">
							<div>
								<p class="font-semibold text-sm" style="color:#1a1a2e">{tx.merchant}</p>
								<p class="text-xs text-slate-500">{formatDate(tx.date)}</p>
							</div>
							<p class="font-bold text-sm" style={`color:${tx.type === 'income' ? '#63C78A' : '#D97A7A'}`}>
								{tx.type === 'income' ? '+' : '-'}{formatRupiahFull(tx.amount)}
							</p>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>
