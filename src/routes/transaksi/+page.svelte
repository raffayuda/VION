<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { formatRupiahFull, categoryExpenses, summary, ocrResult } from '$lib/data/dummy';
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
		Camera,
		CameraOff,
		Calendar,
		CheckCircle2,
		ChevronDown,
		CircleEllipsis,
		CircleHelp,
		Coffee,
		Flashlight,
		Gift,
		Heart,
		History,
		Image,
		LoaderCircle,
		Plus,
		Search,
		Store,
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

	const OCR_CATEGORIES = [
		'Makanan & Minuman',
		'Transportasi',
		'Belanja',
		'Hiburan',
		'Tagihan & Utilitas',
		'Lainnya'
	];

	let activeView = $state<'list' | 'ocr'>('list');

	function syncViewWithHash() {
		if (!browser) return;
		activeView = window.location.hash === '#ocr' ? 'ocr' : 'list';
	}

	function setActiveView(next: 'list' | 'ocr') {
		if (activeView === next) return;
		activeView = next;
		openMenuId = null;
		confirmOpen = false;
		categoryOpen = false;
		if (!browser) return;
		const url = new URL(window.location.href);
		url.hash = next === 'ocr' ? 'ocr' : '';
		history.replaceState(null, '', url);
	}

	// ─── Tab / filter state ───────────────────────────────────────────────────────
	let activeTab = $state('Semua');
	const tabs = ['Semua', 'Pemasukan', 'Pengeluaran'];
	let searchQuery = $state('');
	let selectedCategory = $state('');
	let selectedMonth = $state(getInitialMonthFilter($transactions));
	let categoryOpen = $state(false);
	let categorySearchQuery = $state('');
	const initialVisibleCount = 5;
	let visibleCount = $state(initialVisibleCount);

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

	type FormItem = {
		id: number;
		name: string;
		qty: number;
		unitPrice: number;
	};

	let fItems = $state<FormItem[]>([]);

	// Validation errors
	let errors = $state<{ merchant?: string; amount?: string }>({});

	// ─── OCR state (Scan Struk) ────────────────────────────────────────────────
	type OcrCamState = 'idle' | 'starting' | 'live' | 'captured' | 'error';

	let ocrCamState = $state<OcrCamState>('idle');
	let ocrPreviewUrl = $state('/Scan-image-grafis.png');
	let ocrNotes = $state('');
	let ocrCategory = $state('Makanan & Minuman');
	let ocrProcessing = $state(false);
	let ocrProgress = $state(0);
	let ocrErrorMessage = $state('');
	let ocrFileInputEl = $state<HTMLInputElement | null>(null);
	let ocrVideoEl = $state<HTMLVideoElement | null>(null);
	let ocrMediaStream: MediaStream | null = null;
	let ocrTickTimer: ReturnType<typeof setInterval> | null = null;

	let ocrExtractedItems = $state(
		ocrResult.items.map((item) => ({
			name: item.name,
			qty: item.qty,
			price: item.price * item.qty
		}))
	);

	const ocrTotalBelanja = $derived(ocrExtractedItems.reduce((sum, item) => sum + item.price, 0));

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
		fItems = [createEmptyFormItem()];
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
		fItems = [{ id: Date.now(), name: tx.merchant, qty: 1, unitPrice: tx.amount }];
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
		if (fType === 'expense') {
			if (getValidFormItems().length === 0) {
				e.amount = 'Tambahkan minimal 1 item dengan qty dan harga yang valid';
			}
		} else if (fAmount <= 0) {
			e.amount = 'Jumlah harus lebih dari 0';
		}
		errors = e;
		return Object.keys(e).length === 0;
	}

	function handleSubmit() {
		if (!validateForm()) return;
		const validItems = getValidFormItems();
		const amount = fType === 'expense' ? modalItemsTotal : fAmount;
		const itemNotes =
			fType === 'expense' && validItems.length > 0
				? validItems
						.map((item) => `${item.name} (${item.qty} x ${formatRupiahFull(item.unitPrice)})`)
						.join(', ')
				: '';
		const mergedNotes = [fNotes.trim(), itemNotes ? `Item: ${itemNotes}` : '']
			.filter(Boolean)
			.join('\n');
		const payload = {
			merchant: fMerchant.trim(),
			amount,
			category: fCategory,
			date: fDate,
			type: fType,
			notes: mergedNotes || undefined
		};
		if (editData) {
			updateTransaction(editData.id, payload);
		} else {
			addTransaction(payload);
		}
		closeModal();
	}

	function openOcrUploadPicker() {
		ocrFileInputEl?.click();
	}

	function handleOcrFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		stopOcrCamera();
		revokeOcrPreviewIfBlob();
		ocrPreviewUrl = URL.createObjectURL(file);
		ocrCamState = 'captured';
		simulateOcrProcess();
		target.value = '';
	}

	async function openOcrCamera() {
		if (!browser) return;
		try {
			ocrCamState = 'starting';
			ocrErrorMessage = '';

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			ocrMediaStream = stream;
			if (ocrVideoEl) {
				ocrVideoEl.srcObject = stream;
				await ocrVideoEl.play();
			}
			ocrCamState = 'live';
		} catch {
			ocrCamState = 'error';
			ocrErrorMessage = 'Kamera tidak bisa diakses. Cek izin kamera browser kamu.';
		}
	}

	function stopOcrCamera() {
		if (ocrMediaStream) {
			for (const track of ocrMediaStream.getTracks()) track.stop();
			ocrMediaStream = null;
		}
		if (ocrVideoEl) ocrVideoEl.srcObject = null;
	}

	function captureOcrFromCamera() {
		if (!ocrVideoEl) return;
		const width = ocrVideoEl.videoWidth;
		const height = ocrVideoEl.videoHeight;
		if (!width || !height) return;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(ocrVideoEl, 0, 0, width, height);
		revokeOcrPreviewIfBlob();
		ocrPreviewUrl = canvas.toDataURL('image/jpeg', 0.92);
		ocrCamState = 'captured';
		stopOcrCamera();
		simulateOcrProcess();
	}

	function resetOcrPreview() {
		stopOcrCamera();
		revokeOcrPreviewIfBlob();
		ocrPreviewUrl = '/Scan-image-grafis.png';
		ocrCamState = 'idle';
		ocrProcessing = false;
		ocrProgress = 0;
		ocrErrorMessage = '';
	}

	function revokeOcrPreviewIfBlob() {
		if (ocrPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(ocrPreviewUrl);
	}

	function simulateOcrProcess() {
		ocrProcessing = true;
		ocrProgress = 18;
		if (ocrTickTimer) clearInterval(ocrTickTimer);
		ocrTickTimer = setInterval(() => {
			if (ocrProgress >= 88) return;
			ocrProgress += 7;
		}, 250);
		setTimeout(() => {
			if (ocrTickTimer) clearInterval(ocrTickTimer);
			ocrProgress = 100;
			ocrProcessing = false;
		}, 2400);
	}

	function saveOcrTransaction() {
		if (ocrProcessing || ocrProgress < 100) return;
		addTransaction({
			merchant: ocrResult.merchant,
			amount: ocrTotalBelanja,
			category: ocrCategory,
			date: ocrResult.date,
			type: 'expense',
			notes: ocrNotes.trim() || undefined
		});
		resetOcrPreview();
		ocrNotes = '';
		ocrCategory = 'Makanan & Minuman';
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

	const visibleTransactions = $derived(filteredTransactions.slice(0, visibleCount));

	const grouped = $derived(
		visibleTransactions.reduce(
			(acc, tx) => {
				if (!acc[tx.date]) acc[tx.date] = [];
				acc[tx.date].push(tx);
				return acc;
			},
			{} as Record<string, Transaction[]>
		)
	);

	function createEmptyFormItem(): FormItem {
		return {
			id: Date.now() + Math.floor(Math.random() * 1000),
			name: '',
			qty: 1,
			unitPrice: 0
		};
	}

	function getValidFormItems() {
		return fItems.filter((item) => item.name.trim() && item.qty > 0 && item.unitPrice > 0);
	}

	function addFormItem() {
		fItems = [...fItems, createEmptyFormItem()];
	}

	function removeFormItem(itemId: number) {
		if (fItems.length === 1) {
			fItems = [createEmptyFormItem()];
			return;
		}
		fItems = fItems.filter((item) => item.id !== itemId);
	}

	function updateFormItem(itemId: number, key: 'name' | 'qty' | 'unitPrice', value: string | number) {
		fItems = fItems.map((item) => {
			if (item.id !== itemId) return item;
			if (key === 'name') return { ...item, name: String(value) };
			const numberValue = Number(value) || 0;
			return { ...item, [key]: numberValue };
		});
	}

	function setFormType(nextType: 'income' | 'expense') {
		fType = nextType;
		if (nextType === 'expense' && fItems.length === 0) {
			fItems = [createEmptyFormItem()];
		}
	}

	const modalItemCount = $derived(fItems.reduce((sum, item) => sum + Math.max(0, item.qty || 0), 0));
	const modalItemsTotal = $derived(
		fItems.reduce((sum, item) => sum + Math.max(0, item.qty || 0) * Math.max(0, item.unitPrice || 0), 0)
	);
	const modalTotalBelanja = $derived(
		fType === 'expense' ? modalItemsTotal : Math.max(0, Number(fAmount) || 0)
	);

	$effect(() => {
		searchQuery;
		selectedCategory;
		selectedMonth;
		activeTab;
		visibleCount = initialVisibleCount;
	});

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

	let donutCanvas = $state<HTMLCanvasElement | null>(null);
	let insightCanvas = $state<HTMLCanvasElement | null>(null);
	let donutChart: Chart<'doughnut'> | null = null;
	let insightChart: Chart<'bar'> | null = null;

	onMount(() => {
		syncViewWithHash();
		const handleHashChange = () => syncViewWithHash();
		window.addEventListener('hashchange', handleHashChange);

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	});

	$effect(() => {
		if (activeView !== 'list') {
			donutChart?.destroy();
			insightChart?.destroy();
			donutChart = null;
			insightChart = null;
			return;
		}
		if (!donutCanvas || !insightCanvas) return;

		const donutCtx = donutCanvas.getContext('2d');
		const insightCtx = insightCanvas.getContext('2d');
		if (!donutCtx || !insightCtx) return;

		donutChart?.destroy();
		insightChart?.destroy();

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
			donutChart = null;
			insightChart = null;
		};
	});

	onDestroy(() => {
		stopOcrCamera();
		revokeOcrPreviewIfBlob();
		if (ocrTickTimer) clearInterval(ocrTickTimer);
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
	size="lg"
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="space-y-4"
	>
		<div class="flex items-center gap-3 border-b border-black/8 pb-4">
			<div
				class="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
				style="background:linear-gradient(135deg,#ff9b58,#ff6b1a)"
			>
				<Store size={24} />
			</div>
			<div class="flex-1">
				<label for="f-merchant" class="mb-1 block text-xs font-semibold text-slate-500">
					Nama Merchant
				</label>
				<input
					id="f-merchant"
					type="text"
					bind:value={fMerchant}
					placeholder="Contoh: Alfamart, Grab Food..."
					class="w-full rounded-xl bg-black/4 px-3 py-2 text-base font-bold text-slate-800 outline-none"
					style="border:1.5px solid {errors.merchant ? '#EA580C' : 'transparent'}"
				/>
				<p class="mt-1 text-sm text-slate-500">
					{fDate ? formatDate(fDate) : 'Pilih tanggal transaksi'}
				</p>
			</div>
		</div>
		{#if errors.merchant}
			<p class="-mt-3 text-xs" style="color:#EA580C">{errors.merchant}</p>
		{/if}

		<div class="pt-1">
			<div class="mb-3 flex items-center justify-between">
				<h4 class="text-base font-bold">Detail Transaksi</h4>
				<div class="flex items-center gap-1 rounded-full bg-black/5 p-1">
					<button
						type="button"
						onclick={() => (fType = 'expense')}
						class="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
						style={fType === 'expense' ? 'background:#fff;color:#EA580C' : 'color:#64748b'}
					>
						Pengeluaran
					</button>
					<button
						type="button"
						onclick={() => (fType = 'income')}
						class="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
						style={fType === 'income' ? 'background:#fff;color:#FB923C' : 'color:#64748b'}
					>
						Pemasukan
					</button>
				</div>
			</div>
			{#if fType === 'expense'}
				<div class="space-y-2">
					{#each fItems as item (item.id)}
						<div class="rounded-xl border border-black/6 bg-black/[0.02] p-2.5">
							<div class="flex items-center gap-2">
								<div class="grid h-8 w-8 place-items-center rounded-lg bg-orange-50">
									<Store size={14} color="#f97316" />
								</div>
								<input
									type="text"
									value={item.name}
									oninput={(e) => updateFormItem(item.id, 'name', e.currentTarget.value)}
									placeholder="Nama item (contoh: Telur)"
									class="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"
								/>
								<button
									type="button"
									onclick={() => removeFormItem(item.id)}
									class="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-700"
								>
									Hapus
								</button>
							</div>
							<div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[90px_1fr]">
								<input
									type="number"
									min="1"
									value={item.qty}
									oninput={(e) => updateFormItem(item.id, 'qty', Number(e.currentTarget.value))}
									placeholder="Qty"
									class="w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-700 outline-none"
								/>
								<input
									type="number"
									min="0"
									value={item.unitPrice}
									oninput={(e) =>
										updateFormItem(item.id, 'unitPrice', Number(e.currentTarget.value))}
									placeholder="Harga satuan (Rp)"
									class="w-full rounded-lg bg-white px-3 py-2 text-right text-sm font-semibold text-slate-700 outline-none"
								/>
							</div>
							<p class="mt-2 text-right text-xs font-semibold text-slate-500">
								Subtotal: {formatRupiahFull(Math.max(0, item.qty || 0) * Math.max(0, item.unitPrice || 0))}
							</p>
						</div>
					{/each}
				</div>
				<div class="mt-3 flex items-center justify-between">
					<button
						type="button"
						onclick={addFormItem}
						class="rounded-full border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-500"
					>
						+ Tambah Item
					</button>
					<p class="text-xs text-slate-500">Total qty item: {modalItemCount}</p>
				</div>
			{:else}
				<div class="flex items-center gap-2 border-b border-black/6 py-2.5">
					<div class="grid h-8 w-8 place-items-center rounded-lg bg-orange-50">
						<Store size={14} color="#f97316" />
					</div>
					<p class="flex-1 text-sm font-semibold text-slate-700">Nominal Pemasukan</p>
					<div class="w-40">
						<input
							id="f-amount"
							type="number"
							bind:value={fAmount}
							min="1"
							placeholder="0"
							class="w-full rounded-lg bg-black/4 px-3 py-1.5 text-right text-sm font-semibold text-slate-700 outline-none"
							style="border:1.5px solid {errors.amount ? '#EA580C' : 'transparent'}"
						/>
					</div>
				</div>
			{/if}
			{#if errors.amount}
				<p class="mt-1 text-xs" style="color:#EA580C">{errors.amount}</p>
			{/if}
		</div>

		<div class="mt-2 flex items-center justify-between border-t border-black/8 pt-4">
			<p class="text-base text-slate-700">Total Belanja</p>
			<p class="text-3xl font-bold">{formatRupiahFull(modalTotalBelanja)}</p>
		</div>

		<div>
			<select
				id="f-category"
				bind:value={fCategory}
				class="w-full cursor-pointer appearance-none rounded-[18px] bg-black/4 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
			>
				{#each CATEGORIES as cat (cat)}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>

		<div>
			<DatePicker
				value={fDate}
				onselect={(value) => (fDate = value)}
				label="Tanggal"
				placeholder="Pilih tanggal transaksi"
				helper="Pilih tanggal agar transaksi tercatat pada hari yang tepat."
			/>
		</div>

		<div>
			<label for="f-notes" class="mb-1.5 block text-sm font-medium text-slate-600">
				Catatan (opsional)
			</label>
			<textarea
				id="f-notes"
				bind:value={fNotes}
				rows="2"
				placeholder="Tambahkan catatan..."
				class="w-full resize-none rounded-[18px] bg-black/4 px-4 py-3 text-sm outline-none"
			></textarea>
		</div>

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
				style="background:linear-gradient(135deg,#ff8a4c,#ff6b1a)"
			>
				{editData ? 'Simpan Perubahan' : 'Simpan Transaksi'}
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
		{#if activeView === 'list'}
			<div class="flex w-full items-center gap-2 lg:w-auto">
				<!-- Search -->
			<div
				class="hidden h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 shadow-sm shadow-slate-900/5 transition-all duration-200 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100/70 md:flex"
			>
				<Search size={15} class="shrink-0 text-slate-400" />

				<input
					type="text"
					placeholder="Cari transaksi..."
					class="h-full w-40 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-700 ring-0 outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-0 focus:ring-0 focus:outline-none"
					bind:value={searchQuery}
				/>

				<span
					class="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400"
				>
					⌘K
				</span>
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
					style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)"
				>
					<Plus size={16} />
					Tambah Transaksi
				</button>
			</div>
		{:else}
			<div class="flex w-full items-center gap-2 lg:w-auto">
				<button
					onclick={() => setActiveView('list')}
					class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
					style="background:rgba(255,255,255,0.72);box-shadow:4px 4px 12px rgba(0,0,0,0.06),-4px -4px 12px rgba(255,255,255,0.9);color:#F08A5B"
				>
					Kembali ke Transaksi
				</button>
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<div class="flex gap-1 rounded-full bg-black/5 p-1">
			<button
				onclick={() => setActiveView('list')}
				class="rounded-full px-4 py-1.5 text-xs font-semibold sm:text-sm"
				style={activeView === 'list'
					? 'background:#fff;color:#F08A5B;box-shadow:0 8px 18px rgba(255,138,76,0.16)'
					: 'color:#6b7280'}
			>
				Daftar Transaksi
			</button>
			<button
				onclick={() => setActiveView('ocr')}
				class="rounded-full px-4 py-1.5 text-xs font-semibold sm:text-sm"
				style={activeView === 'ocr'
					? 'background:#fff;color:#F08A5B;box-shadow:0 8px 18px rgba(255,138,76,0.16)'
					: 'color:#6b7280'}
			>
				Scan Struk
			</button>
		</div>
		<p class="text-xs text-slate-500">Pilih tampilan sesuai kebutuhanmu.</p>
	</div>

	{#if activeView === 'list'}
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
	{/if}

	{#if activeView === 'ocr'}
		<!-- OCR: Scan Struk di halaman Transaksi -->
		<section id="ocr" class="scroll-mt-24 space-y-4">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 class="text-xl font-bold" style="color:#111827">Scan Struk (OCR)</h2>
					<p class="mt-1 text-sm" style="color:#64748b">
						Scan struk belanja dan catat transaksi otomatis
					</p>
				</div>
				<div class="flex w-full items-center gap-2 sm:w-auto">
					<button
						class="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700"
					>
						<History size={15} />
						Riwayat Scan
					</button>
					<button
						class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/80"
					>
						<Bell size={16} color="#334155" />
						<span class="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
				<div class="space-y-4">
					<section class="neu-card overflow-hidden p-0">
						<div class="relative min-h-[520px] overflow-hidden rounded-[28px] bg-[#1e1e1e]">
							{#if ocrCamState === 'live' || ocrCamState === 'starting'}
								<video
									bind:this={ocrVideoEl}
									class="absolute inset-0 h-full w-full object-cover"
									playsinline
									muted
								></video>
							{:else}
								<img
									src={ocrPreviewUrl}
									alt="Preview struk"
									class="absolute inset-0 h-full w-full object-cover"
								/>
							{/if}

							<div
								class="absolute inset-0"
								style="background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.35))"
							></div>

							<div class="absolute inset-x-0 top-6 flex justify-center">
								<div
									class="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
									style="background:rgba(24,24,24,0.45);backdrop-filter:blur(3px)"
								>
									<Camera size={16} />
									Arahkan kamera ke struk
								</div>
							</div>

							<div class="absolute top-1/2 left-6 -translate-y-1/2">
								<div
									class="w-20 space-y-5 rounded-[28px] px-2 py-4 text-white"
									style="background:rgba(20,20,20,0.32);backdrop-filter:blur(4px)"
								>
									<button class="grid w-full place-items-center gap-1.5">
										<Flashlight size={20} />
										<span class="text-xs font-medium">Flash</span>
									</button>
									<button
										class="grid w-full place-items-center gap-1.5"
										onclick={openOcrUploadPicker}
									>
										<Image size={20} />
										<span class="text-xs font-medium">Galeri</span>
									</button>
								</div>
							</div>

							{#if ocrCamState === 'error'}
								<div
									class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-red-500/70 px-4 py-3 text-sm text-white"
								>
									{ocrErrorMessage}
								</div>
							{/if}

							<div
								class="absolute bottom-6 left-1/2 flex w-[92%] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-[34px] p-3 text-white"
								style="background:rgba(20,20,20,0.55);backdrop-filter:blur(6px)"
							>
								<button
									class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
									onclick={openOcrCamera}
								>
									{#if ocrCamState === 'live'}<CameraOff size={18} />{:else}<Camera
											size={18}
										/>{/if}
									{ocrCamState === 'live' ? 'Tutup Kamera' : 'Buka Kamera'}
								</button>

								<button
									class="flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-[#ff6b1a] bg-white disabled:opacity-50"
									onclick={captureOcrFromCamera}
									disabled={ocrCamState !== 'live'}
									aria-label="Ambil foto struk"
								>
									{#if ocrCamState === 'starting'}
										<LoaderCircle class="animate-spin" size={22} color="#ff6b1a" />
									{/if}
								</button>

								<button
									class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
									onclick={resetOcrPreview}
								>
									<CircleHelp size={18} />
									Reset
								</button>
							</div>

							<input
								bind:this={ocrFileInputEl}
								type="file"
								accept="image/*"
								class="hidden"
								onchange={handleOcrFileChange}
							/>
						</div>
					</section>

					<section class="neu-card p-5 sm:p-6">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-lg font-bold" style="color:#0f172a">Proses OCR</p>
								<p class="mt-0.5 text-sm" style="color:#64748b">
									{ocrProcessing ? 'AI sedang membaca strukmu...' : 'Siap memproses struk terbaru'}
								</p>
							</div>
							<CheckCircle2 size={22} color="#FB923C" />
						</div>
						<div class="mt-4 flex items-center gap-4">
							<div class="h-2.5 flex-1 overflow-hidden rounded-full bg-orange-100">
								<div
									class="h-full rounded-full transition-all duration-300"
									style={`width:${ocrProgress}%;background:linear-gradient(90deg,#ff8a4c,#ff6b1a)`}
								></div>
							</div>
							<span class="text-sm font-semibold text-slate-500">{ocrProgress}%</span>
						</div>
					</section>
				</div>

				<section class="neu-card h-fit p-5 sm:p-6">
					<div class="mb-5 flex items-center justify-between">
						<div>
							<h3 class="text-xl font-bold">Hasil Ekstraksi</h3>
							<p
								class="mt-1 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600"
							>
								Tingkat akurasi tinggi
							</p>
						</div>
						<div
							class="grid h-14 w-14 place-items-center rounded-full border-[4px] border-orange-400 text-sm font-bold text-slate-700"
						>
							98%
						</div>
					</div>

					<div class="flex items-center gap-3 border-b border-black/8 pb-4">
						<div
							class="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
							style="background:linear-gradient(135deg,#ff9b58,#ff6b1a)"
						>
							<Store size={24} />
						</div>
						<div>
							<p class="text-2xl font-bold">{ocrResult.merchant}</p>
							<p class="text-sm text-slate-500">18 Mei 2026 · 10:23</p>
						</div>
					</div>

					<div class="pt-4">
						<div class="mb-3 flex items-center justify-between">
							<h4 class="text-base font-bold">Detail Transaksi</h4>
							<button
								class="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-600"
							>
								Edit
							</button>
						</div>
						<div class="space-y-1">
							{#each ocrExtractedItems as item (`${item.name}-${item.qty}-${item.price}`)}
								<div class="flex items-center gap-2 border-b border-black/6 py-2.5 last:border-b-0">
									<div class="grid h-8 w-8 place-items-center rounded-lg bg-orange-50">
										<Store size={14} color="#f97316" />
									</div>
									<p class="flex-1 text-sm font-semibold">{item.name}</p>
									<p class="w-6 text-center text-sm text-slate-500">{item.qty}</p>
									<p class="w-24 text-right text-sm font-medium text-slate-600">
										{formatRupiahFull(item.price)}
									</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="mt-4 flex items-center justify-between border-t border-black/8 pt-4">
						<p class="text-base text-slate-700">Total Belanja</p>
						<p class="text-3xl font-bold">{formatRupiahFull(ocrTotalBelanja)}</p>
					</div>

					<div class="mt-4">
						<select
							bind:value={ocrCategory}
							class="w-full cursor-pointer appearance-none rounded-[18px] bg-black/4 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
						>
							{#each OCR_CATEGORIES as cat (cat)}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<div class="mt-3">
						<label for="ocr-note" class="mb-1.5 block text-sm font-medium text-slate-600">
							Catatan (opsional)
						</label>
						<input
							id="ocr-note"
							bind:value={ocrNotes}
							placeholder="Tambahkan catatan..."
							class="w-full rounded-[18px] bg-black/4 px-4 py-3 text-sm outline-none"
						/>
					</div>

					<button
						onclick={saveOcrTransaction}
						disabled={ocrProcessing || ocrProgress < 100}
						class="mt-5 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
						style="background:linear-gradient(135deg,#ff8a4c,#ff6b1a)"
					>
						{#if ocrProcessing}
							Memproses...
						{:else}
							Simpan Transaksi
						{/if}
					</button>
				</section>
			</div>
		</section>
	{/if}

	{#if activeView === 'list'}
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
			<section class="neu-card overflow-hidden p-0">
				<div class="flex flex-wrap items-center gap-3 border-b border-black/5 p-4">
					<div class="flex items-center gap-1 rounded-full bg-black/5 p-1">
						{#each tabs as tab (tab)}
							<button
								onclick={() => (activeTab = tab)}
								class="rounded-full px-3.5 py-1.5 text-[11px] font-semibold sm:text-xs"
								style={activeTab === tab ? 'background:#fff;color:#F08A5B' : 'color:#6b7280'}
							>
								{tab}
							</button>
						{/each}
					</div>
					<div class="ml-auto flex flex-wrap items-center gap-2">
						<div class="relative w-full sm:w-[210px]" use:clickOutside>
							<button
								type="button"
								onclick={() => setCategoryOpen(!categoryOpen)}
								class="group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-200"
								style={`background:${categoryOpen ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)'};border-color:${categoryOpen ? 'rgba(240,138,91,0.28)' : 'rgba(0,0,0,0.05)'};box-shadow:${categoryOpen ? '0 10px 24px rgba(255,138,76,0.12)' : '0 6px 16px rgba(15,23,42,0.05)'}`}
								aria-expanded={categoryOpen}
							>
								<div class="min-w-0">
									<p
										class="text-[10px] font-semibold tracking-[0.16em] uppercase"
										style="color:#F08A5B"
									>
										Kategori
									</p>
									<p class="mt-0.5 text-xs font-semibold text-slate-700">
										{getCategoryLabel(selectedCategory)}
									</p>
								</div>
								<span
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-[1.03]"
									style="background:linear-gradient(135deg,rgba(255,138,76,0.16),rgba(253,186,116,0.24));color:#E07A47"
								>
									<ChevronDown
										size={16}
										style={`transform:rotate(${categoryOpen ? 180 : 0}deg);transition:transform 0.2s ease;`}
									/>
								</span>
							</button>

							{#if categoryOpen}
								<div
									class="absolute top-[calc(100%+10px)] left-0 z-40 w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-3 shadow-xl shadow-slate-900/10"
								>
									<!-- Header -->
									<div class="px-2 pt-1 pb-3">
										<p class="text-[11px] font-bold tracking-[0.16em] text-orange-500 uppercase">
											Pilih kategori
										</p>
										<p class="mt-1 text-xs leading-relaxed text-slate-500">
											Filter transaksi berdasarkan kategori.
										</p>
									</div>

									<!-- List -->
									<div class="max-h-[320px] space-y-1 overflow-y-auto px-1">
										<button
											type="button"
											onclick={() => {
												selectedCategory = '';
												setCategoryOpen(false);
											}}
											class="group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
											class:bg-orange-50={selectedCategory === ''}
										>
											<div class="min-w-0">
												<p class="text-sm font-semibold text-slate-900">Semua Kategori</p>
												<p class="mt-0.5 truncate text-xs text-slate-500">
													Tampilkan semua transaksi
												</p>
											</div>

											{#if selectedCategory === ''}
												<span
													class="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-600"
												>
													Aktif
												</span>
											{/if}
										</button>

										{#if getFilteredCategories().length === 0}
											<div class="rounded-2xl px-3 py-8 text-center">
												<p class="text-sm font-semibold text-slate-700">Kategori tidak ditemukan</p>
												<p class="mt-1 text-xs text-slate-500">Coba gunakan kata kunci lain.</p>
											</div>
										{:else}
											{#each getFilteredCategories() as cat (cat)}
												<button
													type="button"
													onclick={() => {
														selectedCategory = cat;
														setCategoryOpen(false);
													}}
													class="group flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
													class:bg-slate-50={selectedCategory === cat}
												>
													<div class="flex min-w-0 items-center gap-3">
														<span
															class="h-2.5 w-2.5 shrink-0 rounded-full"
															style={getCategoryBadgeStyle(cat)}
														></span>

														<div class="min-w-0">
															<p class="truncate text-sm font-semibold text-slate-900">
																{cat}
															</p>
															<p class="mt-0.5 truncate text-xs text-slate-500">
																{cat === 'Pemasukan'
																	? 'Transaksi pemasukan'
																	: `Kategori ${cat.toLowerCase()}`}
															</p>
														</div>
													</div>

													{#if selectedCategory === cat}
														<span
															class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
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
						<div class="w-full sm:w-[200px]">
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
							{visibleTransactions.length} dari {filteredTransactions.length} transaksi tampil
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
						{#if filteredTransactions.length > visibleTransactions.length}
							<div class="flex items-center justify-center py-5">
								<button
									onclick={() => (visibleCount += 5)}
									class="rounded-full border border-orange-200 px-5 py-2 text-sm font-semibold text-orange-500"
								>
									Muat Lebih Banyak
								</button>
							</div>
						{/if}
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
	{/if}
</div>
