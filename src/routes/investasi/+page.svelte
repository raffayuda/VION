<script lang="ts">
	import { onMount } from 'svelte';
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
	import { formatRupiahFull } from '$lib/data/dummy';
	import { Bell, ChevronDown, CircleEllipsis, Clock3, Coins, Plus, TrendingUp } from '@lucide/svelte';
	import {
		investments,
		addInvestment,
		updateInvestment,
		deleteInvestment,
		type Investment
	} from '$lib/stores/appStore';
	import Modal from '$lib/components/Modal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

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

	// ── Static portfolio data for donut chart (visual only) ──────────────────
	const portfolio = [
		{ name: 'Reksa Dana', pct: 45, amount: 20610000, color: '#FF8A4C' },
		{ name: 'Saham', pct: 25, amount: 11445000, color: '#FB923C' },
		{ name: 'Emas Digital', pct: 15, amount: 6867000, color: '#FDBA74' },
		{ name: 'Obligasi', pct: 10, amount: 4578000, color: '#F59E0B' },
		{ name: 'Deposito', pct: 5, amount: 2280000, color: '#FED7AA' }
	];

	// ── Derived totals from store ─────────────────────────────────────────────
	const totalValue = $derived($investments.reduce((s, i) => s + i.value, 0));
	const totalProfit = $derived($investments.reduce((s, i) => s + i.profit, 0));

	// ── Chart data ────────────────────────────────────────────────────────────
	const perfData = [
		{ month: 'Des', nilai: 38000000 },
		{ month: 'Jan', nilai: 39500000 },
		{ month: 'Feb', nilai: 40200000 },
		{ month: 'Mar', nilai: 41800000 },
		{ month: 'Apr', nilai: 43100000 },
		{ month: 'Mei', nilai: 45920000 }
	];
	let perfCanvas: HTMLCanvasElement;
	let allocCanvas: HTMLCanvasElement;
	let perfChart: Chart<'line'> | null = null;
	let allocChart: Chart<'doughnut'> | null = null;
	const totalAllocation = portfolio.reduce((sum, item) => sum + item.amount, 0);
	const warmDonutPalette = ['#FF8A4C', '#FDBA74', '#F59E0B', '#FB923C', '#FED7AA'];
	const portfolioWithWarmColor = portfolio.map((item, idx) => ({
		...item,
		warmColor: warmDonutPalette[idx] ?? '#FF8A4C'
	}));

	// ── Modal state (Task 11.2) ───────────────────────────────────────────────
	let modalOpen = $state(false);
	let editData = $state<Investment | null>(null);

	// Form fields
	let formProduct = $state('');
	let formProvider = $state('');
	let formValue = $state(0);
	let formProfit = $state(0);
	let formRoi = $state(0);
	let formColor = $state('#FF8A4C');
	let formErrors = $state({ product: '', value: '' });

	const colorPresets = ['#FF8A4C', '#FB923C', '#FDBA74', '#F59E0B', '#FED7AA', '#60A5FA'];

	function openAddModal() {
		editData = null;
		formProduct = '';
		formProvider = '';
		formValue = 0;
		formProfit = 0;
		formRoi = 0;
		formColor = '#FF8A4C';
		formErrors = { product: '', value: '' };
		modalOpen = true;
	}

	function openEditModal(inv: Investment) {
		editData = inv;
		formProduct = inv.product;
		formProvider = inv.provider;
		formValue = inv.value;
		formProfit = inv.profit;
		formRoi = inv.roi;
		formColor = inv.color;
		formErrors = { product: '', value: '' };
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editData = null;
	}

	function validateForm(): boolean {
		let valid = true;
		formErrors = { product: '', value: '' };
		if (!formProduct.trim()) {
			formErrors.product = 'Nama produk tidak boleh kosong';
			valid = false;
		}
		if (formValue <= 0) {
			formErrors.value = 'Nilai harus lebih dari 0';
			valid = false;
		}
		return valid;
	}

	function handleSubmit() {
		if (!validateForm()) return;
		if (editData) {
			updateInvestment(editData.id, {
				product: formProduct.trim(),
				provider: formProvider.trim(),
				value: formValue,
				profit: formProfit,
				roi: formRoi,
				color: formColor
			});
		} else {
			addInvestment({
				product: formProduct.trim(),
				provider: formProvider.trim(),
				value: formValue,
				profit: formProfit,
				roi: formRoi,
				color: formColor
			});
		}
		closeModal();
	}

	// ── Action menu state (Task 11.3) ─────────────────────────────────────────
	let openMenuId = $state<number | null>(null);
	let confirmDeleteId = $state<number | null>(null);
	let confirmOpen = $state(false);

	function toggleMenu(id: number) {
		openMenuId = openMenuId === id ? null : id;
	}

	function handleEdit(inv: Investment) {
		openMenuId = null;
		openEditModal(inv);
	}

	function handleDeleteRequest(id: number) {
		confirmDeleteId = id;
		confirmOpen = true;
		openMenuId = null;
	}

	function handleConfirmDelete() {
		if (confirmDeleteId !== null) {
			deleteInvestment(confirmDeleteId);
		}
		confirmOpen = false;
		confirmDeleteId = null;
	}

	function handleCancelDelete() {
		confirmOpen = false;
		confirmDeleteId = null;
	}

	// ── Charts ────────────────────────────────────────────────────────────────
	onMount(() => {
		if (!perfCanvas || !allocCanvas) return;
		const perfCtx = perfCanvas.getContext('2d');
		const allocCtx = allocCanvas.getContext('2d');
		if (!perfCtx || !allocCtx) return;

		const perfGradient = perfCtx.createLinearGradient(0, 0, 0, 260);
		perfGradient.addColorStop(0, 'rgba(255,138,76,0.32)');
		perfGradient.addColorStop(1, 'rgba(255,138,76,0.03)');

		const perfConfig: ChartConfiguration<'line'> = {
			type: 'line',
			data: {
				labels: perfData.map((d) => d.month),
				datasets: [
					{
						label: 'Nilai Portofolio',
						data: perfData.map((d) => d.nilai),
						borderColor: '#FF8A4C',
						backgroundColor: perfGradient,
						fill: true,
						tension: 0.42,
						borderWidth: 3,
						pointRadius: 4,
						pointHoverRadius: 6,
						pointBackgroundColor: '#FF8A4C',
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						displayColors: false,
						callbacks: {
							label: (ctx) => `Nilai Portofolio: ${formatRupiahFull(Number(ctx.parsed.y))}`
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: '#94A3B8', font: { size: 11 } },
						border: { display: false }
					},
					y: {
						ticks: {
							color: '#94A3B8',
							font: { size: 11 },
							callback: (value) => `${(Number(value) / 1000000).toFixed(1)}jt`
						},
						grid: { color: 'rgba(15,23,42,0.08)' },
						border: { display: false }
					}
				},
				animation: {
					duration: 1100,
					easing: 'easeOutQuart'
				}
			}
		};

		const allocConfig: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: portfolio.map((p) => p.name),
				datasets: [
					{
						data: portfolio.map((p) => p.amount),
						backgroundColor: warmDonutPalette,
						borderColor: '#ffffff',
						borderWidth: 4,
						hoverOffset: 8
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '54%',
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: 'rgba(15,23,42,0.92)',
						padding: 10,
						callbacks: {
							title: (items) => items[0]?.label ?? '',
							label: (ctx) => formatRupiahFull(Number(ctx.parsed))
						}
					}
				},
				animation: false
			}
		};

		perfChart = new Chart(perfCtx, perfConfig);
		allocChart = new Chart(allocCtx, allocConfig);

		return () => {
			perfChart?.destroy();
			allocChart?.destroy();
			perfChart = null;
			allocChart = null;
		};
	});
</script>

<!-- Backdrop to close action menu when clicking outside -->
{#if openMenuId !== null}
	<div
		class="fixed inset-0 z-10"
		role="presentation"
		onclick={() => { openMenuId = null; }}
	></div>
{/if}

<!-- Investment Form Modal (Task 11.2) -->
<Modal
	open={modalOpen}
	title={editData ? 'Edit Investasi' : 'Tambah Investasi'}
	onclose={closeModal}
	size="md"
>
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		<!-- Product name -->
		<div>
			<label class="block text-xs font-medium text-slate-600 mb-1" for="inv-product">
				Nama Produk <span class="text-red-400">*</span>
			</label>
			<input
				id="inv-product"
				type="text"
				bind:value={formProduct}
				placeholder="cth. Reksa Dana Pasar Uang"
				class="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-300 {formErrors.product ? 'border-red-300' : 'border-black/10'}"
			/>
			{#if formErrors.product}
				<p class="mt-1 text-xs text-red-500">{formErrors.product}</p>
			{/if}
		</div>

		<!-- Provider -->
		<div>
			<label class="block text-xs font-medium text-slate-600 mb-1" for="inv-provider">
				Penyedia
			</label>
			<input
				id="inv-provider"
				type="text"
				bind:value={formProvider}
				placeholder="cth. Manulife Dana Kas II"
				class="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-300"
			/>
		</div>

		<!-- Value & Profit -->
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="block text-xs font-medium text-slate-600 mb-1" for="inv-value">
					Nilai (Rp) <span class="text-red-400">*</span>
				</label>
				<input
					id="inv-value"
					type="number"
					bind:value={formValue}
					min="1"
					placeholder="0"
					class="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-300 {formErrors.value ? 'border-red-300' : 'border-black/10'}"
				/>
				{#if formErrors.value}
					<p class="mt-1 text-xs text-red-500">{formErrors.value}</p>
				{/if}
			</div>
			<div>
				<label class="block text-xs font-medium text-slate-600 mb-1" for="inv-profit">
					Keuntungan (Rp)
				</label>
				<input
					id="inv-profit"
					type="number"
					bind:value={formProfit}
					placeholder="0"
					class="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-300"
				/>
			</div>
		</div>

		<!-- ROI -->
		<div>
			<label class="block text-xs font-medium text-slate-600 mb-1" for="inv-roi">
				ROI (%)
			</label>
			<input
				id="inv-roi"
				type="number"
				bind:value={formRoi}
				step="0.1"
				placeholder="0.0"
				class="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-orange-300"
			/>
		</div>

		<!-- Color swatches -->
		<div>
			<p class="text-xs font-medium text-slate-600 mb-2">Warna</p>
			<div class="flex gap-2">
				{#each colorPresets as color (color)}
					<button
						type="button"
						onclick={() => { formColor = color; }}
						class="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
						style="background:{color}; border-color:{formColor === color ? '#1a1a2e' : 'transparent'}"
						aria-label="Pilih warna {color}"
					></button>
				{/each}
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-3 justify-end pt-2">
			<button
				type="button"
				onclick={closeModal}
				class="px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-black/5"
				style="color:#6b7280"
			>
				Batal
			</button>
			<button
				type="submit"
				class="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
				style="background:#EA580C"
			>
				{editData ? 'Simpan Perubahan' : 'Tambah'}
			</button>
		</div>
	</form>
</Modal>

<!-- Confirm Delete Dialog (Task 11.3) -->
<ConfirmDialog
	open={confirmOpen}
	title="Hapus Investasi"
	description="Apakah kamu yakin ingin menghapus investasi ini? Tindakan ini tidak dapat dibatalkan."
	confirmLabel="Hapus"
	onconfirm={handleConfirmDelete}
	oncancel={handleCancelDelete}
/>

<div class="space-y-4 page-enter">
	<div class="flex items-center justify-between gap-3 flex-wrap section-enter section-1">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Investasi</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Pantau dan kembangkan aset investasimu</p>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<button class="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 surface-btn">
				<Clock3 size={14} /> Riwayat Investasi
			</button>
			<button class="relative w-10 h-10 rounded-full flex items-center justify-center surface-btn">
				<Bell size={16} color="#6b7280" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400"></span>
			</button>
			<button
				onclick={openAddModal}
				class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white primary-btn"
			>
				<Plus size={16} /> Tambah Investasi <ChevronDown size={14} />
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 section-enter section-2">
		<div class="neu-card p-4 card-hover">
			<p class="text-xs text-slate-400">Total Nilai Investasi</p>
			<p class="text-base lg:text-lg font-bold text-slate-900 mt-1">{formatRupiahFull(totalValue)}</p>
			<p class="mt-1 text-xs text-orange-500">+12.4% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs text-slate-400">Keuntungan</p>
			<p class="text-base lg:text-lg font-bold text-slate-900 mt-1">{formatRupiahFull(totalProfit)}</p>
			<p class="mt-1 text-xs text-orange-500">+18.6% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs text-slate-400">Imbal Hasil (XIRR)</p>
			<p class="text-base lg:text-lg font-bold text-slate-900 mt-1">14.2% p.a.</p>
			<p class="mt-1 text-xs text-orange-500">+2.1% dari bulan lalu</p>
		</div>
		<div class="neu-card p-4 card-hover">
			<p class="text-xs text-slate-400">Investasi Aktif</p>
			<p class="text-base lg:text-lg font-bold text-slate-900 mt-1">{$investments.length} produk</p>
			<p class="text-xs text-slate-500 mt-1">di {$investments.length} instrumen</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px] section-enter section-3">
		<section class="neu-card p-5 chart-enter">
				<div class="flex items-center justify-between mb-4">
					<div>
						<h2 class="text-base font-semibold text-slate-900">Performa Portofolio</h2>
						<p class="text-xs text-slate-400 mt-0.5">6 bulan terakhir</p>
					</div>
					<div class="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-500">
						<TrendingUp size={13} />
						<span class="text-xs font-semibold">+14.2% p.a.</span>
					</div>
				</div>
				<div class="h-[260px]">
					<canvas bind:this={perfCanvas}></canvas>
				</div>
		</section>

		<section class="neu-card p-5 chart-enter">
				<h2 class="text-base font-semibold mb-4 text-slate-900">Alokasi Portofolio</h2>
				<div class="relative h-[250px]">
					<canvas bind:this={allocCanvas}></canvas>
					<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div class="rounded-full border border-orange-100 bg-white/92 px-4 py-2 text-center shadow-sm backdrop-blur-[2px]">
							<p class="text-[11px] font-medium text-orange-300">Total Alokasi</p>
							<p class="text-[18px] font-bold leading-tight text-orange-500">{formatRupiahFull(totalAllocation)}</p>
						</div>
					</div>
				</div>
				<div class="mt-2 space-y-2.5 rounded-2xl bg-orange-50/50 p-3 ring-1 ring-orange-100/60">
					{#each portfolioWithWarmColor as p (p.name)}
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="h-2 w-2 rounded-full" style={`background:${p.warmColor}`}></span>
								<span class="text-slate-800">{p.name}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-slate-400">{p.pct}%</span>
								<span class="font-semibold text-slate-900">{formatRupiahFull(p.amount)}</span>
							</div>
						</div>
					{/each}
				</div>
		</section>
	</div>

	<section class="neu-card overflow-hidden section-enter section-4">
		<div class="p-4 border-b border-black/5 flex items-center justify-between gap-2 flex-wrap">
			<h2 class="text-base font-semibold text-slate-900">Daftar Investasi</h2>
			<div class="flex items-center gap-2">
				<button class="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-500">Semua</button>
				<button class="px-3 py-1.5 rounded-full text-xs bg-black/5 text-slate-500">Reksa Dana</button>
				<button class="px-3 py-1.5 rounded-full text-xs bg-black/5 text-slate-500">Saham</button>
			</div>
		</div>
		<div class="p-4 overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="text-left text-slate-400">
						<th class="pb-3 font-medium">Produk</th>
						<th class="pb-3 font-medium">Nilai</th>
						<th class="pb-3 font-medium">Keuntungan</th>
						<th class="pb-3 font-medium">ROI</th>
						<th class="pb-3 font-medium w-10"></th>
					</tr>
				</thead>
				<tbody>
					{#each $investments as inv (inv.id)}
						<tr class="border-t border-black/5">
							<td class="py-3">
								<div class="flex items-center gap-2">
									<div class="w-8 h-8 rounded-xl flex items-center justify-center" style={`background:${inv.color}1a`}>
										<Coins size={14} color={inv.color} />
									</div>
									<div>
										<p class="font-semibold text-slate-900">{inv.product}</p>
										<p class="text-xs text-slate-400">{inv.provider}</p>
									</div>
								</div>
							</td>
							<td class="py-3 font-semibold text-slate-900">{formatRupiahFull(inv.value)}</td>
							<td class="py-3 font-semibold" class:text-orange-500={inv.profit >= 0} class:text-red-500={inv.profit < 0}>
								{inv.profit >= 0 ? '+' : ''}{formatRupiahFull(inv.profit)}
							</td>
							<td class="py-3">
								<span class="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-500">{inv.roi}%</span>
							</td>
							<td class="py-3 relative">
								<button
									onclick={() => toggleMenu(inv.id)}
									class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
									aria-label="Opsi untuk {inv.product}"
								>
									<CircleEllipsis size={16} color="#9ca3af" />
								</button>

								{#if openMenuId === inv.id}
									<div
										class="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-2xl border border-black/5 bg-white py-1 shadow-lg"
										role="menu"
									>
										<button
											role="menuitem"
											onclick={() => handleEdit(inv)}
											class="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
										>
											Edit
										</button>
										<button
											role="menuitem"
											onclick={() => handleDeleteRequest(inv.id)}
											class="w-full px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
										>
											Hapus
										</button>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<style>
	.page-enter {
		animation: lift-in 420ms ease-out both;
	}
	.chart-enter {
		animation: fade-up 560ms ease-out both;
	}
	.section-enter {
		opacity: 0;
		animation: section-in 560ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.section-1 { animation-delay: 40ms; }
	.section-2 { animation-delay: 120ms; }
	.section-3 { animation-delay: 200ms; }
	.section-4 { animation-delay: 280ms; }
	@keyframes section-in {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.995);
			filter: blur(2px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}
	@keyframes lift-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes fade-up {
		from { opacity: 0; transform: translateY(16px) scale(0.99); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
</style>
