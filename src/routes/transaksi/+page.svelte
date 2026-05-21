<script lang="ts">
	import { onMount } from 'svelte';
	import { formatRupiahFull, categoryExpenses, summary } from '$lib/data/dummy';
	import {
		transactions,
		wallets,
		totalPemasukan,
		totalPengeluaran,
		sisaBudget,
		addTransaction,
		updateTransaction,
		deleteTransaction,
		type Transaction
	} from '$lib/stores/appStore';
	import Modal from '$lib/components/Modal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
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

	Chart.register(
		DoughnutController,
		BarController,
		ArcElement,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	);

	// ─── Categories ───────────────────────────────────────────────────────────────
	const CATEGORIES = [
		'Makanan & Minuman',
		'Transportasi',
		'Belanja',
		'Hiburan',
		'Tagihan & Utilitas',
		'Pemasukan',
		'Lainnya'
	];

	// ─── Tab / filter state ───────────────────────────────────────────────────────
	let activeTab = $state('Semua');
	const tabs = ['Semua', 'Pemasukan', 'Pengeluaran'];
	let searchQuery = $state('');
	let selectedCategory = $state('');
	let selectedMonth = $state(getInitialMonthFilter($transactions));
	let categoryOpen = $state(false);
	let categorySearchQuery = $state('');

	const monthFilterFormatter = new Intl.DateTimeFormat('id-ID', {
		month: 'long',
		year: 'numeric'
	});

	// ─── Modal state (Task 5.1) ───────────────────────────────────────────────────
	let modalOpen = $state(false);
	let editData = $state<Transaction | null>(null);

	// Form fields
	let fMerchant = $state('');
	let fAmount = $state(0);
	let fCategory = $state(CATEGORIES[0]);
	let fDate = $state('');
	let fType = $state<'income' | 'expense'>('expense');
	let fNotes = $state('');

	// Validation errors
	let errors = $state<{ merchant?: string; amount?: string }>({});

	function getInitialMonthFilter(list: Transaction[]) {
		if (list.length === 0) return new Date().toISOString().slice(0, 7);
		const latestTimestamp = Math.max(
			...list.map((transaction) => new Date(transaction.date).getTime())
		);
		return new Date(latestTimestamp).toISOString().slice(0, 7);
	}

	function formatMonthFilter(value: string) {
		if (!value) return 'Semua bulan';
		const [year, month] = value.split('-').map(Number);
		return monthFilterFormatter.format(new Date(year, month - 1, 1));
	}

	function clickOutside(node: HTMLElement) {
		const handlePointerDown = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				setCategoryOpen(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown, true);

		return {
			destroy() {
				document.removeEventListener('mousedown', handlePointerDown, true);
			}
		};
	}

	function getCategoryLabel(value: string) {
		return value || 'Semua Kategori';
	}

	function getFilteredCategories() {
		const query = categorySearchQuery.trim().toLowerCase();
		if (!query) return CATEGORIES;
		return CATEGORIES.filter((category) => category.toLowerCase().includes(query));
	}

	function setCategoryOpen(next: boolean) {
		categoryOpen = next;
		if (!next) {
			categorySearchQuery = '';
		}
	}

	function getCategoryBadgeStyle(value: string) {
		if (!value) return 'background:rgba(255,138,76,0.12);color:#C46A3B';
		if (value === 'Makanan & Minuman') return 'background:rgba(251,146,60,0.12);color:#C46A3B';
		if (value === 'Transportasi') return 'background:rgba(96,165,250,0.12);color:#2563EB';
		if (value === 'Belanja') return 'background:rgba(244,114,182,0.12);color:#DB2777';
		if (value === 'Hiburan') return 'background:rgba(167,139,250,0.14);color:#7C3AED';
		if (value === 'Tagihan & Utilitas') return 'background:rgba(245,158,11,0.12);color:#B45309';
		if (value === 'Pemasukan') return 'background:rgba(74,222,128,0.14);color:#15803D';
		return 'background:rgba(15,23,42,0.06);color:#475569';
	}

	function openAddModal() {
		editData = null;
		fMerchant = '';
		fAmount = 0;
		fCategory = CATEGORIES[0];
		fDate = new Date().toISOString().slice(0, 10);
		fType = 'expense';
		fNotes = '';
		errors = {};
		modalOpen = true;
	}

	function openEditModal(tx: Transaction) {
		editData = tx;
		fMerchant = tx.merchant;
		fAmount = tx.amount;
		fCategory = tx.category;
		fDate = tx.date;
		fType = tx.type;
		fNotes = tx.notes ?? '';
		errors = {};
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editData = null;
	}

	function validateForm(): boolean {
		const e: { merchant?: string; amount?: string } = {};
		if (!fMerchant.trim()) e.merchant = 'Nama merchant tidak boleh kosong';
		if (fAmount <= 0) e.amount = 'Jumlah harus lebih dari 0';
		errors = e;
		return Object.keys(e).length === 0;
	}

	function handleSubmit() {
		if (!validateForm()) return;
		const payload = {
			merchant: fMerchant.trim(),
			amount: fAmount,
			category: fCategory,
			date: fDate,
			type: fType,
			notes: fNotes.trim() || undefined
		};
		if (editData) {
			updateTransaction(editData.id, payload);
		} else {
			addTransaction(payload);
		}
		closeModal();
	}

	// ─── Action menu state (Task 5.3) ─────────────────────────────────────────────
	let openMenuId = $state<number | null>(null);
	let confirmDeleteId = $state<number | null>(null);
	let confirmOpen = $state(false);

	function toggleMenu(id: number) {
		openMenuId = openMenuId === id ? null : id;
	}

	function handleEdit(tx: Transaction) {
		openMenuId = null;
		openEditModal(tx);
	}

	function handleDeleteRequest(id: number) {
		openMenuId = null;
		confirmDeleteId = id;
		confirmOpen = true;
	}

	function handleDeleteConfirm() {
		if (confirmDeleteId !== null) {
			deleteTransaction(confirmDeleteId);
		}
		confirmOpen = false;
		confirmDeleteId = null;
	}

	function handleDeleteCancel() {
		confirmOpen = false;
		confirmDeleteId = null;
	}

	// ─── Filtered / grouped transactions (Task 5.2) ───────────────────────────────
	const filteredTransactions = $derived(
		$transactions.filter((tx) => {
			const q = searchQuery.toLowerCase();
			const matchSearch =
				!q || tx.merchant.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
			const matchCategory = !selectedCategory || tx.category === selectedCategory;
			const matchMonth = !selectedMonth || tx.date.slice(0, 7) === selectedMonth;
			const matchTab =
				activeTab === 'Semua' ||
				(activeTab === 'Pemasukan' && tx.type === 'income') ||
				(activeTab === 'Pengeluaran' && tx.type === 'expense');
			return matchSearch && matchCategory && matchMonth && matchTab;
		})
	);

	const grouped = $derived(
		filteredTransactions.reduce(
			(acc, tx) => {
				if (!acc[tx.date]) acc[tx.date] = [];
				acc[tx.date].push(tx);
				return acc;
			},
			{} as Record<string, Transaction[]>
		)
	);

	// ─── Stat cards (Task 5.2) ────────────────────────────────────────────────────
	const statCards = $derived([
		{
			title: 'Total Pemasukan',
			value: $totalPemasukan,
			change: '+12.7% dari bulan lalu',
			positive: true,
			color: '#FB923C',
			bg: 'rgba(251,146,60,0.12)',
			icon: Gift
		},
		{
			title: 'Total Pengeluaran',
			value: $totalPengeluaran,
			change: '-3.2% dari bulan lalu',
			positive: false,
			color: '#EA580C',
			bg: 'rgba(234,88,12,0.12)',
			icon: Heart
		},
		{
			title: 'Saldo Bersih',
			value: $sisaBudget,
			change: '+5.1% dari bulan lalu',
			positive: true,
			color: '#FDBA74',
			bg: 'rgba(253,186,116,0.18)',
			icon: Zap
		},
		{
			title: 'Transaksi',
			value: $transactions.length,
			change: '+4 dari bulan lalu',
			positive: true,
			color: '#F59E0B',
			bg: 'rgba(245,158,11,0.12)',
			icon: Wallet
		}
	]);

	// ─── Chart data (kept intact) ─────────────────────────────────────────────────
	const warmPalette = ['#FF8A4C', '#FB923C', '#FDBA74', '#F59E0B', '#FED7AA'];
	const categoryWarm = categoryExpenses.map((c, i) => ({
		...c,
		warmColor: warmPalette[i] ?? '#FF8A4C'
	}));

	const topTransactions = $derived(
		[...$transactions].sort((a, b) => b.amount - a.amount).slice(0, 3)
	);

	let donutCanvas: HTMLCanvasElement;
	let insightCanvas: HTMLCanvasElement;
	let donutChart: Chart<'doughnut'> | null = null;
	let insightChart: Chart<'bar'> | null = null;

	onMount(() => {
		const donutCtx = donutCanvas.getContext('2d');
		const insightCtx = insightCanvas.getContext('2d');
		if (!donutCtx || !insightCtx) return;

		const donutConfig: ChartConfiguration<'doughnut'> = {
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
				cutout: '58%',
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: { label: (ctx) => formatRupiahFull(Number(ctx.parsed)) }
					}
				},
				animation: false
			}
		};

		const insightConfig: ChartConfiguration<'bar'> = {
			type: 'bar',
			data: {
				labels: ['M-2', 'M-1', 'M'],
				datasets: [
					{
						label: 'Pengeluaran',
						data: [7.2, 8.1, 9.3],
						backgroundColor: ['#FED7AA', '#FDBA74', '#FF8A4C'],
						borderRadius: 8,
						borderSkipped: false,
						maxBarThickness: 22
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false }, tooltip: { enabled: false } },
				scales: {
					x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
					y: { grid: { display: false }, ticks: { display: false }, border: { display: false } }
				},
				animation: false
			}
		};

		donutChart = new Chart(donutCtx, donutConfig);
		insightChart = new Chart(insightCtx, insightConfig);

		return () => {
			donutChart?.destroy();
			insightChart?.destroy();
		};
	});

	function formatDate(value: string) {
		return new Date(value).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
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

<!-- ─── Backdrop to close action menu when clicking outside ─────────────────── -->
{#if openMenuId !== null}
	<div class="fixed inset-0 z-10" role="presentation" onclick={() => (openMenuId = null)}></div>
{/if}

<!-- ─── Transaction Form Modal (Task 5.1) ──────────────────────────────────── -->
<Modal
	open={modalOpen}
	title={editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
	onclose={closeModal}
	size="md"
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-4"
	>
		<!-- Type toggle -->
		<div>
			<p class="mb-2 block text-xs font-semibold" style="color:#6b7280">Tipe Transaksi</p>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => (fType = 'expense')}
					class="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all"
					style={fType === 'expense'
						? 'background:linear-gradient(135deg,#F08A5B,#E07A47);color:#fff;box-shadow:0 4px 12px rgba(255,138,76,0.35)'
						: 'background:rgba(0,0,0,0.05);color:#6b7280'}
				>
					Pengeluaran
				</button>
				<button
					type="button"
					onclick={() => (fType = 'income')}
					class="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all"
					style={fType === 'income'
						? 'background:linear-gradient(135deg,#FB923C,#F59E0B);color:#fff;box-shadow:0 4px 12px rgba(251,146,60,0.35)'
						: 'background:rgba(0,0,0,0.05);color:#6b7280'}
				>
					Pemasukan
				</button>
			</div>
		</div>

		<!-- Merchant -->
		<div>
			<label for="f-merchant" class="mb-1.5 block text-xs font-semibold" style="color:#6b7280"
				>Nama Merchant</label
			>
			<input
				id="f-merchant"
				type="text"
				bind:value={fMerchant}
				placeholder="Contoh: Alfamart, Grab Food..."
				class="w-full rounded-2xl px-4 py-2.5 text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {errors.merchant
					? '#EA580C'
					: 'transparent'}"
			/>
			{#if errors.merchant}
				<p class="mt-1 text-xs" style="color:#EA580C">{errors.merchant}</p>
			{/if}
		</div>

		<!-- Amount -->
		<div>
			<label for="f-amount" class="mb-1.5 block text-xs font-semibold" style="color:#6b7280"
				>Jumlah (Rp)</label
			>
			<input
				id="f-amount"
				type="number"
				bind:value={fAmount}
				min="1"
				placeholder="0"
				class="w-full rounded-2xl px-4 py-2.5 text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {errors.amount
					? '#EA580C'
					: 'transparent'}"
			/>
			{#if errors.amount}
				<p class="mt-1 text-xs" style="color:#EA580C">{errors.amount}</p>
			{/if}
		</div>

		<!-- Category -->
		<div>
			<label for="f-category" class="mb-1.5 block text-xs font-semibold" style="color:#6b7280"
				>Kategori</label
			>
			<select
				id="f-category"
				bind:value={fCategory}
				class="w-full appearance-none rounded-2xl px-4 py-2.5 text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid transparent"
			>
				{#each CATEGORIES as cat (cat)}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>

		<!-- Date -->
		<div>
			<DatePicker
				value={fDate}
				onselect={(value) => (fDate = value)}
				label="Tanggal"
				placeholder="Pilih tanggal transaksi"
				helper="Pilih tanggal agar transaksi tercatat pada hari yang tepat."
			/>
		</div>

		<!-- Notes -->
		<div>
			<label for="f-notes" class="mb-1.5 block text-xs font-semibold" style="color:#6b7280"
				>Catatan <span class="font-normal">(opsional)</span></label
			>
			<textarea
				id="f-notes"
				bind:value={fNotes}
				rows="2"
				placeholder="Tambahkan catatan..."
				class="w-full resize-none rounded-2xl px-4 py-2.5 text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid transparent"
			></textarea>
		</div>

		<!-- Actions -->
		<div class="flex gap-3 pt-1">
			<button
				type="button"
				onclick={closeModal}
				class="flex-1 rounded-full py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
				style="color:#6b7280"
			>
				Batal
			</button>
			<button
				type="submit"
				class="flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				style="background:linear-gradient(135deg,#F08A5B,#E07A47);box-shadow:0 4px 14px rgba(255,138,76,0.4)"
			>
				{editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
			</button>
		</div>
	</form>
</Modal>

<!-- ─── Confirm Delete Dialog (Task 5.3) ───────────────────────────────────── -->
<ConfirmDialog
	open={confirmOpen}
	title="Hapus Transaksi"
	description="Apakah kamu yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
	confirmLabel="Hapus"
	onconfirm={handleDeleteConfirm}
	oncancel={handleDeleteCancel}
/>

<div class="space-y-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-xl font-bold lg:text-2xl" style="color:#1a1a2e">Transaksi</h1>
			<p class="mt-0.5 text-xs lg:text-sm" style="color:#9ca3af">
				Kelola semua transaksi keuanganmu dengan mudah
			</p>
		</div>
		<div class="flex w-full items-center gap-2 lg:w-auto">
			<div
				class="flex flex-1 items-center gap-2 rounded-full px-4 py-2.5 lg:w-72"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)"
			>
				<Search size={14} color="#9ca3af" />
				<input
					class="flex-1 bg-transparent text-sm outline-none"
					placeholder="Cari transaksi..."
					bind:value={searchQuery}
				/>
			</div>
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full"
				style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9)"
			>
				<Bell size={16} color="#6b7280" />
			</button>
			<button
				onclick={openAddModal}
				class="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#F08A5B,#E07A47);box-shadow:0 4px 14px rgba(255,138,76,0.4)"
			>
				<Plus size={16} />
				Tambah Transaksi
			</button>
		</div>
	</div>

	<!-- Stat cards (Task 5.2 — reactive) -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each statCards as stat (stat.title)}
			<div class="neu-card card-hover p-4">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-2xl"
					style={`background:${stat.bg}`}
				>
					<stat.icon size={17} color={stat.color} />
				</div>
				<p class="mt-3 text-xs" style="color:#9ca3af">{stat.title}</p>
				<p class="mt-1 text-base font-bold lg:text-lg" style="color:#1a1a2e">
					{stat.title === 'Transaksi'
						? `${stat.value} Transaksi`
						: formatRupiahFull(Number(stat.value))}
				</p>
				<p class="mt-1 text-xs" style={`color:${stat.positive ? '#FB923C' : '#EA580C'}`}>
					{stat.change}
				</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
		<section class="neu-card overflow-hidden p-0">
			<div class="flex flex-wrap items-center gap-2 border-b border-black/5 p-4">
				<div class="flex gap-1 rounded-full bg-black/5 p-1">
					{#each tabs as tab (tab)}
						<button
							onclick={() => (activeTab = tab)}
							class="rounded-full px-4 py-1.5 text-xs font-medium sm:text-sm"
							style={activeTab === tab ? 'background:#fff;color:#F08A5B' : 'color:#6b7280'}
						>
							{tab}
						</button>
					{/each}
				</div>
				<div class="ml-auto flex w-full gap-2 sm:w-auto">
					<div class="relative w-full sm:w-[260px]" use:clickOutside>
						<button
							type="button"
							onclick={() => setCategoryOpen(!categoryOpen)}
							class="group flex w-full items-center justify-between gap-3 rounded-[22px] border px-4 py-3 text-left transition-all duration-200"
							style={`background:${categoryOpen ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)'};border-color:${categoryOpen ? 'rgba(240,138,91,0.35)' : 'rgba(0,0,0,0.05)'};box-shadow:${categoryOpen ? '0 14px 32px rgba(255,138,76,0.12)' : '0 8px 20px rgba(15,23,42,0.06)'}`}
							aria-expanded={categoryOpen}
						>
							<div class="min-w-0">
								<p
									class="text-[11px] font-semibold uppercase tracking-[0.18em]"
									style="color:#F08A5B"
								>
									Filter kategori
								</p>
								<div class="mt-1 flex items-center gap-2">
									<span
										class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
										style={getCategoryBadgeStyle(selectedCategory)}
									>
										{getCategoryLabel(selectedCategory)}
									</span>
								</div>
							</div>
							<span
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-[1.03]"
								style="background:linear-gradient(135deg,rgba(255,138,76,0.16),rgba(253,186,116,0.24));color:#E07A47"
							>
								<ChevronDown
									size={18}
									style={`transform:rotate(${categoryOpen ? 180 : 0}deg);transition:transform 0.2s ease;`}
								/>
							</span>
						</button>

						{#if categoryOpen}
							<div
								class="absolute left-0 top-[calc(100%+12px)] z-40 w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/96 p-3 backdrop-blur-xl"
								style="box-shadow:0 24px 48px rgba(15,23,42,0.16), 0 8px 24px rgba(255,138,76,0.12);"
							>
								<div class="mb-3 px-2 pt-1">
									<p
										class="text-[11px] font-semibold uppercase tracking-[0.18em]"
										style="color:#F08A5B"
									>
										Pilih kategori
									</p>
									<p class="mt-1 text-xs text-slate-500">
										Fokuskan daftar transaksi ke kategori yang ingin kamu lihat.
									</p>
								</div>

								<div class="mb-3 px-2">
									<div
										class="flex items-center gap-2 rounded-2xl border px-3 py-2.5"
										style="background:rgba(15,23,42,0.03);border-color:rgba(0,0,0,0.04)"
									>
										<Search size={14} color="#94a3b8" />
										<input
											bind:value={categorySearchQuery}
											type="text"
											placeholder="Cari kategori..."
											class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<button
										type="button"
										onclick={() => {
											selectedCategory = '';
											setCategoryOpen(false);
										}}
										class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all hover:bg-orange-50"
										style={selectedCategory === ''
											? 'background:linear-gradient(135deg,rgba(255,138,76,0.12),rgba(253,186,116,0.18));'
											: ''}
									>
										<div>
											<p class="text-sm font-semibold text-slate-900">Semua Kategori</p>
											<p class="text-xs text-slate-500">Tampilkan semua transaksi tanpa batasan kategori</p>
										</div>
										{#if selectedCategory === ''}
											<span
												class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
												style="background:rgba(255,138,76,0.14);color:#C46A3B"
											>
												Aktif
											</span>
										{/if}
									</button>

									{#if getFilteredCategories().length === 0}
										<div class="rounded-2xl px-3 py-6 text-center">
											<p class="text-sm font-semibold text-slate-700">
												Kategori tidak ditemukan
											</p>
											<p class="mt-1 text-xs text-slate-500">
												Coba kata kunci lain untuk menemukan kategori yang kamu cari.
											</p>
										</div>
									{:else}
										{#each getFilteredCategories() as cat (cat)}
											<button
												type="button"
												onclick={() => {
													selectedCategory = cat;
													setCategoryOpen(false);
												}}
												class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-all hover:bg-black/[0.03]"
												style={selectedCategory === cat
													? 'background:rgba(15,23,42,0.035);box-shadow:inset 0 0 0 1px rgba(0,0,0,0.04)'
													: ''}
											>
												<div class="flex items-center gap-3">
													<span
														class="h-2.5 w-2.5 rounded-full"
														style={getCategoryBadgeStyle(cat)}
													></span>
													<div>
														<p class="text-sm font-semibold text-slate-900">{cat}</p>
														<p class="text-xs text-slate-500">
															{cat === 'Pemasukan'
																? 'Filter khusus transaksi pemasukan'
																: `Tampilkan transaksi kategori ${cat.toLowerCase()}`}
														</p>
													</div>
												</div>
												{#if selectedCategory === cat}
													<span
														class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
														style={getCategoryBadgeStyle(cat)}
													>
														Aktif
													</span>
												{/if}
											</button>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
					<div class="w-full sm:w-[240px]">
						<DatePicker
							value={selectedMonth}
							onselect={(value) => (selectedMonth = value)}
							mode="month"
							placeholder="Pilih bulan"
							align="right"
							clearable={true}
						/>
					</div>
				</div>
			</div>

			<div class="px-4 pb-3">
				<div class="flex flex-wrap items-center gap-2 border-b border-black/5 py-3">
					<div
						class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
						style="background:rgba(255,138,76,0.1);color:#C46A3B"
					>
						<Calendar size={14} />
						{formatMonthFilter(selectedMonth)}
					</div>
					{#if selectedCategory}
						<div
							class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
							style="background:rgba(15,23,42,0.05);color:#475569"
						>
							Kategori: {selectedCategory}
						</div>
					{/if}
					{#if searchQuery}
						<div
							class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
							style="background:rgba(245,158,11,0.08);color:#B45309"
						>
							Cari: "{searchQuery}"
						</div>
					{/if}
					<div class="ml-auto text-xs font-medium text-slate-400">
						{filteredTransactions.length} transaksi tampil
					</div>
				</div>

				{#if filteredTransactions.length === 0}
					<div class="py-12 text-center">
						<p class="text-sm" style="color:#9ca3af">Tidak ada transaksi yang sesuai filter.</p>
					</div>
				{:else}
					{#each Object.entries(grouped) as [date, txs] (date)}
						<div class="border-b border-black/5 py-4 last:border-b-0">
							<p class="mb-3 text-xs font-semibold" style="color:#9ca3af">{formatDate(date)}</p>
							<div class="space-y-2">
								{#each txs as tx (tx.id)}
									{@const TxIcon = getTxIcon(tx.category)}
									<div class="relative flex items-center gap-3 rounded-2xl p-2">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full"
											style={`background:${tx.type === 'income' ? 'rgba(253,186,116,0.18)' : 'rgba(255,138,76,0.12)'}`}
										>
											<TxIcon size={16} color={tx.type === 'income' ? '#FB923C' : '#FF8A4C'} />
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate text-sm font-semibold" style="color:#1a1a2e">
												{tx.merchant}
											</p>
											<div class="mt-0.5 flex items-center gap-2">
												<p class="truncate text-xs text-slate-500 sm:text-sm">{tx.category}</p>
												<span class="rounded-full bg-black/5 px-2 py-1 text-xs text-slate-600"
													>{getWallet(tx.merchant)}</span
												>
											</div>
										</div>
										<div class="text-right">
											<p
												class="text-sm font-bold"
												style={`color:${tx.type === 'income' ? '#FB923C' : '#EA580C'}`}
											>
												{tx.type === 'income' ? '+' : '-'}{formatRupiahFull(tx.amount)}
											</p>
											<p class="text-xs text-slate-500">
												{new Date(tx.date).toLocaleDateString('id-ID', {
													day: '2-digit',
													month: '2-digit'
												})}
											</p>
										</div>
										<!-- Action menu button (Task 5.3) -->
										<div class="relative z-20">
											<button
												onclick={() => toggleMenu(tx.id)}
												class="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
											>
												<CircleEllipsis size={16} color="#6b7280" />
											</button>
											{#if openMenuId === tx.id}
												<div
													class="absolute top-9 right-0 z-30 w-36 overflow-hidden rounded-2xl"
													style="background:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.06)"
												>
													<button
														onclick={() => handleEdit(tx)}
														class="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-black/5"
														style="color:#1a1a2e"
													>
														Edit
													</button>
													<button
														onclick={() => handleDeleteRequest(tx.id)}
														class="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-red-50"
														style="color:#EA580C"
													>
														Hapus
													</button>
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>

		<div class="space-y-4">
			<section class="neu-card card-hover p-5">
				<div class="flex items-center justify-between">
					<h2 class="text-base font-bold" style="color:#1a1a2e">Ringkasan Kategori</h2>
					<button class="text-xs font-semibold" style="color:#F08A5B">Lihat Semua</button>
				</div>
				<div class="mt-4 flex items-center gap-4">
					<div class="relative h-32 w-32 shrink-0">
						<canvas bind:this={donutCanvas}></canvas>
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div
								class="rounded-full border border-orange-100 bg-white/92 px-2 py-1 text-center shadow-sm"
							>
								<p class="text-[10px] text-slate-500">Total</p>
								<p class="text-[11px] font-bold text-orange-500">
									{formatRupiahFull(summary.pengeluaran)}
								</p>
							</div>
						</div>
					</div>
					<div class="space-y-1.5">
						{#each categoryWarm as cat (cat.name)}
							<div class="flex items-center justify-between gap-3 text-xs sm:text-sm">
								<div class="flex items-center gap-2">
									<span class="h-2 w-2 rounded-full" style={`background:${cat.warmColor}`}></span>
									<span class="text-slate-600">{cat.name}</span>
								</div>
								<span class="font-semibold text-slate-500">{cat.percentage}%</span>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<section class="neu-card card-hover p-5">
				<h3 class="text-base font-bold" style="color:#1a1a2e">Insight Bulan Ini</h3>
				<p class="mt-2 text-sm text-slate-600">
					Pengeluaran untuk Makanan & Minuman meningkat 15% dari bulan lalu.
				</p>
				<div class="mt-4 flex items-end justify-between gap-3">
					<button
						class="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500"
					>
						Lihat Insight
					</button>
					<div class="h-16 w-20">
						<canvas bind:this={insightCanvas}></canvas>
					</div>
				</div>
			</section>

			<section class="neu-card card-hover p-5">
				<h3 class="mb-3 text-base font-bold" style="color:#1a1a2e">Transaksi Terbesar</h3>
				<div class="space-y-3">
					{#each topTransactions as tx (tx.id)}
						<div class="flex items-center justify-between gap-2">
							<div>
								<p class="text-sm font-semibold" style="color:#1a1a2e">{tx.merchant}</p>
								<p class="text-xs text-slate-500">{formatDate(tx.date)}</p>
							</div>
							<p
								class="text-sm font-bold"
								style={`color:${tx.type === 'income' ? '#FB923C' : '#EA580C'}`}
							>
								{tx.type === 'income' ? '+' : '-'}{formatRupiahFull(tx.amount)}
							</p>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>
