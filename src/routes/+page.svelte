<script lang="ts">
	import {
		summary, transactions, chartData, budgetCategories,
		financialGoals, categoryExpenses, insights,
		formatRupiah, formatRupiahFull
	} from '$lib/data/dummy';
	import {
		Bell, Plus, Search, TrendingUp, TrendingDown, Wallet,
		Target, ScanLine, ReceiptText, RefreshCw, PieChart,
		BellRing, FileText, Sparkles, ArrowRight, Eye
	} from '@lucide/svelte';

	function genPath(key: 'pemasukan' | 'pengeluaran', w: number, h: number) {
		const max = Math.max(...chartData.map(d => Math.max(d.pemasukan, d.pengeluaran)));
		return chartData.map((d, i) => {
			const x = (i / (chartData.length - 1)) * w;
			const y = h - (d[key] / max) * h * 0.85;
			return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
		}).join(' ');
	}
	function genArea(key: 'pemasukan' | 'pengeluaran', w: number, h: number) {
		return `${genPath(key, w, h)} L ${w},${h} L 0,${h} Z`;
	}

	const recentTx = transactions.slice(0, 5);

	const quickActions = [
		{ label: 'Scan Struk\n(OCR)',            icon: ScanLine,   bg: '#FFF1E8', color: '#FF8A4C', href: '/ocr'       },
		{ label: 'Tambah\nTransaksi',             icon: Plus,       bg: '#F0FDF4', color: '#4ADE80', href: '/transaksi' },
		{ label: 'Transaksi\nBerulang',           icon: RefreshCw,  bg: '#EFF6FF', color: '#60A5FA', href: '#'          },
		{ label: 'Buat\nAnggaran',                icon: PieChart,   bg: '#F5F3FF', color: '#A78BFA', href: '/anggaran'  },
		{ label: 'Kirim Pengingat\nPembayaran',   icon: BellRing,   bg: '#FFFBEB', color: '#F59E0B', href: '#'          },
		{ label: 'Laporan\nKeuangan',             icon: FileText,   bg: '#F0FDFA', color: '#14B8A6', href: '/laporan'   },
	];
</script>

<div class="space-y-4">

	<!-- TOPBAR -->
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Halo, Dimas! 👋</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Semangat mengatur keuangan hari ini!</p>
		</div>
		<div class="flex items-center gap-2">
			<div class="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Search size={14} color="#9ca3af" />
				<input type="text" placeholder="Cari sesuatu..." class="bg-transparent text-sm outline-none w-32" style="color:#1a1a2e" />
			</div>
			<button aria-label="Notifikasi" class="relative w-10 h-10 rounded-full flex items-center justify-center"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)">
				<Bell size={18} color="#6b7280" />
				<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style="background:#FF6B6B"></span>
			</button>
			<button aria-label="Tambah" class="w-10 h-10 rounded-full flex items-center justify-center text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
				<Plus size={20} />
			</button>
		</div>
	</div>

	<!-- SUMMARY CARDS -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
		<div class="col-span-2 lg:col-span-1 p-5 rounded-[24px] card-hover"
			style="background:linear-gradient(135deg,#FF8A4C,#ff7a35);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-11 h-11 rounded-2xl flex items-center justify-center" style="background:rgba(255,255,255,0.25)">
					<Wallet size={20} color="white" />
				</div>
				<button aria-label="Lihat saldo"><Eye size={16} color="rgba(255,255,255,0.7)" /></button>
			</div>
			<p class="text-xs font-medium mb-1" style="color:rgba(255,255,255,0.8)">Total Saldo</p>
			<p class="text-2xl font-bold text-white">{formatRupiahFull(summary.totalSaldo)}</p>
			<p class="text-xs mt-1" style="color:rgba(255,255,255,0.75)">▲ 8,45% dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(74,222,128,0.12)">
					<TrendingUp size={18} color="#4ADE80" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(74,222,128,0.12);color:#4ADE80">+12,7%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Pemasukan</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah(summary.pemasukan)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(255,107,107,0.1)">
					<TrendingDown size={18} color="#FF6B6B" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(255,107,107,0.1);color:#FF6B6B">+3,2%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Pengeluaran</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah(summary.pengeluaran)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
		<div class="p-4 rounded-[24px] card-hover" style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-start justify-between mb-3">
				<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(167,139,250,0.12)">
					<Target size={18} color="#A78BFA" />
				</div>
				<span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:rgba(74,222,128,0.12);color:#4ADE80">+5,1%</span>
			</div>
			<p class="text-xs mb-1" style="color:#9ca3af">Sisa Budget</p>
			<p class="text-lg font-bold" style="color:#1a1a2e">{formatRupiah(summary.sisaBudget)}</p>
			<p class="text-xs mt-1" style="color:#9ca3af">dari bulan lalu</p>
		</div>
	</div>

	<!-- ROW 2: OCR Promo + Chart + Quick Actions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

		<!-- OCR Promo -->
		<a href="/ocr" class="rounded-[24px] relative overflow-hidden flex flex-col"
			style="background:linear-gradient(160deg,#FFF1E8 0%,#FFD6BF 100%);min-height:360px">
			<!-- Text top -->
			<div class="px-5 pt-5 relative z-10">
				<h3 class="text-lg font-bold leading-snug mb-2" style="color:#1a1a2e">
					Scan struk,<br/>catatan otomatis!
				</h3>
				<p class="text-xs leading-relaxed" style="color:#9a6a4a;max-width:170px">
					Foto struk belanjamu dan biarkan OCR mencatat semuanya untukmu.
				</p>
			</div>
			<!-- Illustration — full width, centered, not clipped -->
			<div class="flex-1 flex items-end justify-center px-4 pt-2">
				<img
					src="/Scan-image-grafis.png"
					alt="Scan struk ilustrasi"
					class="w-full max-w-[200px] object-contain"
					style="filter:drop-shadow(0 8px 24px rgba(255,138,76,0.2))"
				/>
			</div>
			<!-- Button bottom
			<div class="px-5 pb-5 pt-3 relative z-10">
				<a href="/ocr"
					class="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
					style="background:rgba(255,255,255,0.85);color:#FF8A4C;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
					<div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#FF8A4C">
						<ScanLine size={13} color="white" />
					</div>
					Scan Sekarang
				</a>
			</div> -->
		</a>

		<!-- Chart -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Ringkasan Keuangan</h2>
				<div class="flex items-center gap-2 flex-wrap">
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full" style="background:#4ADE80"></span>
						<span class="text-xs" style="color:#9ca3af">Pemasukan</span>
					</div>
					<div class="flex items-center gap-1">
						<span class="w-2 h-2 rounded-full" style="background:#FF8A4C"></span>
						<span class="text-xs" style="color:#9ca3af">Pengeluaran</span>
					</div>
					<select class="text-xs px-2 py-1 rounded-full outline-none" style="background:rgba(0,0,0,0.04);color:#6b7280;border:none">
						<option>Bulan Ini</option><option>3 Bulan</option>
					</select>
				</div>
			</div>
			<svg viewBox="0 0 400 110" class="w-full" style="height:110px" preserveAspectRatio="none">
				<defs>
					<linearGradient id="gG2" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#4ADE80" stop-opacity="0.2"/>
						<stop offset="100%" stop-color="#4ADE80" stop-opacity="0"/>
					</linearGradient>
					<linearGradient id="oG2" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#FF8A4C" stop-opacity="0.2"/>
						<stop offset="100%" stop-color="#FF8A4C" stop-opacity="0"/>
					</linearGradient>
				</defs>
				<path d={genArea('pemasukan', 400, 100)} fill="url(#gG2)"/>
				<path d={genArea('pengeluaran', 400, 100)} fill="url(#oG2)"/>
				<path d={genPath('pemasukan', 400, 100)} fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d={genPath('pengeluaran', 400, 100)} fill="none" stroke="#FF8A4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				{#each chartData as d, i}
					{@const maxV = Math.max(...chartData.map(x => Math.max(x.pemasukan, x.pengeluaran)))}
					{@const cx = (i / (chartData.length - 1)) * 400}
					{@const yP = 100 - (d.pemasukan / maxV) * 100 * 0.85}
					{@const yE = 100 - (d.pengeluaran / maxV) * 100 * 0.85}
					<circle cx={cx} cy={yP} r="3.5" fill="#4ADE80" stroke="white" stroke-width="1.5"/>
					<circle cx={cx} cy={yE} r="3.5" fill="#FF8A4C" stroke="white" stroke-width="1.5"/>
				{/each}
			</svg>
			<div class="flex justify-between mt-1">
				{#each chartData as d}
					<span style="color:#9ca3af;font-size:10px">{d.date}</span>
				{/each}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<h2 class="text-sm font-semibold mb-4" style="color:#1a1a2e">Aksi Cepat</h2>
			<div class="grid grid-cols-3 gap-3">
				{#each quickActions as a}
					{@const ActionIcon = a.icon}
					<a href={a.href}
						class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
						style="background:{a.bg}">
						<div class="w-10 h-10 rounded-2xl flex items-center justify-center"
							style="background:white;box-shadow:2px 2px 8px rgba(0,0,0,0.06)">
							<ActionIcon size={18} color={a.color} />
						</div>
						<span class="text-center leading-tight" style="color:{a.color};white-space:pre-line;font-size:10px;font-weight:500">{a.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- ROW 3: Category + Transactions + Budget -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

		<!-- Category Donut -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<h2 class="text-sm font-semibold mb-4" style="color:#1a1a2e">Pengeluaran per Kategori</h2>
			<div class="flex items-center gap-3">
				<div class="relative w-24 h-24 shrink-0">
					<svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
						{#each categoryExpenses as cat, i}
							{@const offset = categoryExpenses.slice(0, i).reduce((s, c) => s + c.percentage * 2.51, 0)}
							{@const dash = cat.percentage * 2.51}
							<circle cx="50" cy="50" r="38" fill="none" stroke={cat.color}
								stroke-width="16"
								stroke-dasharray="{dash} {251 - dash}"
								stroke-dashoffset={-offset}/>
						{/each}
					</svg>
					<div class="absolute inset-0 flex flex-col items-center justify-center">
						<span class="font-bold leading-none" style="color:#1a1a2e;font-size:9px">Total</span>
						<span class="font-bold" style="color:#FF8A4C;font-size:9px">Rp 8,9jt</span>
					</div>
				</div>
				<div class="flex-1 space-y-1.5">
					{#each categoryExpenses as cat}
						<div class="flex items-center justify-between gap-1">
							<div class="flex items-center gap-1.5 min-w-0">
								<span class="w-2 h-2 rounded-full shrink-0" style="background:{cat.color}"></span>
								<span class="truncate" style="color:#6b7280;font-size:10px">{cat.name.split(' ')[0]}</span>
							</div>
							<div class="flex items-center gap-1 shrink-0">
								<span style="color:#1a1a2e;font-size:10px;font-weight:600">{formatRupiah(cat.amount)}</span>
								<span style="color:#9ca3af;font-size:10px">{cat.percentage}%</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<a href="/laporan"
				class="flex items-center justify-center gap-1 mt-4 py-2 rounded-full text-xs font-medium"
				style="background:#FFF1E8;color:#FF8A4C">
				Lihat Detail <ArrowRight size={12} />
			</a>
		</div>

		<!-- Recent Transactions -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Transaksi Terbaru</h2>
				<a href="/transaksi" class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-3">
				{#each recentTx as tx}
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
							style="background:{tx.type === 'income' ? 'rgba(74,222,128,0.12)' : 'rgba(255,138,76,0.1)'}">
							{#if tx.type === 'income'}
								<TrendingUp size={15} color="#4ADE80" />
							{:else}
								<TrendingDown size={15} color="#FF8A4C" />
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{tx.merchant}</p>
							<p class="text-xs truncate" style="color:#9ca3af">{tx.category}</p>
						</div>
						<span class="text-sm font-bold shrink-0"
							style="color:{tx.type === 'income' ? '#4ADE80' : '#FF6B6B'}">
							{tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Budget This Month -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Anggaran Bulan Ini</h2>
				<a href="/anggaran" class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-4">
				{#each budgetCategories.slice(0, 3) as cat}
					{@const pct = Math.round((cat.used / cat.budget) * 100)}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2 min-w-0">
								<div class="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0"
									style="background:{cat.color}18">{cat.icon}</div>
								<div class="min-w-0">
									<p class="text-xs font-semibold truncate" style="color:#1a1a2e">{cat.name}</p>
									<p style="color:#9ca3af;font-size:10px">{formatRupiah(cat.used)} / {formatRupiah(cat.budget)}</p>
								</div>
							</div>
							<span class="text-xs font-bold shrink-0 ml-2"
								style="color:{pct > 85 ? '#FF6B6B' : '#4ADE80'}">{pct}%</span>
						</div>
						<div class="progress-bar" style="height:6px">
							<div class="progress-fill"
								style="width:{pct}%;background:{pct > 85 ? '#FF6B6B' : cat.color}"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- ROW 4: Financial Goals + AI Insight -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

		<!-- Financial Goals -->
		<div class="p-5 rounded-[24px] card-hover"
			style="background:rgba(255,255,255,0.72);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.5)">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-sm font-semibold" style="color:#1a1a2e">Tujuan Keuangan</h2>
				<a href="/tujuan" class="flex items-center gap-1 text-xs font-medium" style="color:#FF8A4C">
					Lihat Semua <ArrowRight size={11} />
				</a>
			</div>
			<div class="space-y-4">
				{#each financialGoals.slice(0, 2) as goal}
					{@const pct = Math.round((goal.current / goal.target) * 100)}
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<div class="flex items-center gap-2 min-w-0">
								<div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
									style="background:{goal.color}18">
									<Target size={15} color={goal.color} />
								</div>
								<div class="min-w-0">
									<p class="text-sm font-semibold truncate" style="color:#1a1a2e">{goal.name}</p>
									<p class="text-xs" style="color:#9ca3af">{formatRupiah(goal.current)} / {formatRupiah(goal.target)}</p>
								</div>
							</div>
							<span class="text-sm font-bold shrink-0 ml-2" style="color:{goal.color}">{pct}%</span>
						</div>
						<div class="progress-bar" style="height:8px">
							<div class="progress-fill" style="width:{pct}%;background:{goal.color}"></div>
						</div>
					</div>
				{/each}
			</div>
			<a href="/tujuan"
				class="flex items-center justify-center gap-1 mt-4 py-2 rounded-full text-xs font-medium"
				style="background:#FFF1E8;color:#FF8A4C">
				<Plus size={12} /> Buat Tujuan Baru
			</a>
		</div>

		<!-- AI Insight -->
		<div class="rounded-[24px] overflow-hidden relative"
			style="background:linear-gradient(135deg,#FFF7F2 0%,#FFE8D6 100%);min-height:120px">
			<div class="flex items-center h-full p-5 gap-4">
				<!-- Icon + text + button -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2 mb-2">
						<div class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
							style="background:rgba(255,138,76,0.15)">
							<Sparkles size={18} color="#FF8A4C" />
						</div>
						<h2 class="text-sm font-bold" style="color:#1a1a2e">Insight untukmu</h2>
					</div>
					<p class="text-xs leading-relaxed mb-4" style="color:#6b7280;max-width:260px">
						{insights[0].description}
					</p>
					<a href="/insight"
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-90"
						style="background:rgba(255,255,255,0.85);color:#FF8A4C;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
						Lihat Insight <ArrowRight size={11} />
					</a>
				</div>
				<!-- Illustration right -->
				<div class="shrink-0 hidden sm:block">
					<img
						src="/Insight-dashboard.png"
						alt="Insight ilustrasi"
						class="w-32 h-24 object-contain"
						style="filter:drop-shadow(0 4px 12px rgba(255,138,76,0.15))"
					/>
				</div>
			</div>
		</div>
	</div>

</div>
