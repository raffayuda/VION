<script lang="ts">
	import { formatRupiahFull } from '$lib/data/dummy';
	import {
		wallets, totalSaldo,
		addWallet, updateWallet, deleteWallet,
		type Wallet
	} from '$lib/stores/appStore';
	import Modal from '$lib/components/Modal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { Plus, CircleEllipsis, Wallet as WalletIcon, CreditCard, Banknote } from '@lucide/svelte';

	// ─── Modal state ──────────────────────────────────────────────────────────
	let modalOpen = $state(false);
	let editData = $state<Wallet | null>(null);

	let formName = $state('');
	let formType = $state<'Bank' | 'E-Wallet' | 'Tunai'>('Bank');
	let formBalance = $state(0);
	let formIcon = $state('🏦');
	let formColor = $state('#FF8A4C');
	let formErrors = $state<{ name?: string; balance?: string }>({});

	const COLOR_PRESETS = ['#FF8A4C', '#60A5FA', '#A78BFA', '#4ADE80', '#F59E0B', '#FF6B6B'];
	const WALLET_TYPES: Array<'Bank' | 'E-Wallet' | 'Tunai'> = ['Bank', 'E-Wallet', 'Tunai'];

	function openAddModal() {
		editData = null;
		formName = '';
		formType = 'Bank';
		formBalance = 0;
		formIcon = '🏦';
		formColor = '#FF8A4C';
		formErrors = {};
		modalOpen = true;
	}

	function openEditModal(w: Wallet) {
		editData = w;
		formName = w.name;
		formType = w.type;
		formBalance = w.balance;
		formIcon = w.icon;
		formColor = w.color;
		formErrors = {};
		openMenuId = null;
		modalOpen = true;
	}

	function closeModal() { modalOpen = false; }

	function validate(): boolean {
		const e: { name?: string; balance?: string } = {};
		if (!formName.trim()) e.name = 'Nama rekening tidak boleh kosong';
		if (formBalance < 0) e.balance = 'Saldo tidak boleh negatif';
		formErrors = e;
		return Object.keys(e).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;
		const payload = {
			name: formName.trim(),
			type: formType,
			balance: formBalance,
			icon: formIcon.trim() || '🏦',
			color: formColor
		};
		if (editData) {
			updateWallet(editData.id, payload);
		} else {
			addWallet(payload);
		}
		closeModal();
	}

	// ─── Action menu ──────────────────────────────────────────────────────────
	let openMenuId = $state<number | null>(null);
	let confirmDeleteId = $state<number | null>(null);
	let confirmOpen = $state(false);

	function handleDeleteRequest(id: number) {
		openMenuId = null;
		confirmDeleteId = id;
		confirmOpen = true;
	}

	function handleConfirmDelete() {
		if (confirmDeleteId !== null) deleteWallet(confirmDeleteId);
		confirmOpen = false;
		confirmDeleteId = null;
	}

	function walletTypeIcon(type: string) {
		if (type === 'Bank') return CreditCard;
		if (type === 'E-Wallet') return WalletIcon;
		return Banknote;
	}
</script>

<!-- Backdrop -->
{#if openMenuId !== null}
	<div class="fixed inset-0 z-10" role="presentation" onclick={() => (openMenuId = null)}></div>
{/if}

<!-- Wallet Form Modal -->
<Modal open={modalOpen} title={editData ? 'Edit Rekening' : 'Tambah Rekening'} onclose={closeModal} size="md">
	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		<div>
			<label for="w-name" class="block text-xs font-semibold mb-1.5" style="color:#6b7280">Nama Rekening</label>
			<input id="w-name" type="text" bind:value={formName} placeholder="Contoh: BCA, OVO, Cash..."
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {formErrors.name ? '#EA580C' : 'transparent'}" />
			{#if formErrors.name}<p class="text-xs mt-1" style="color:#EA580C">{formErrors.name}</p>{/if}
		</div>

		<div>
			<p class="text-xs font-semibold mb-1.5" style="color:#6b7280">Tipe Rekening</p>
			<div class="flex gap-2">
				{#each WALLET_TYPES as t (t)}
					<button type="button" onclick={() => (formType = t)}
						class="flex-1 py-2 rounded-full text-xs font-semibold transition-all"
						style={formType === t
							? 'background:linear-gradient(135deg,#FF8A4C,#ff6b1a);color:#fff'
							: 'background:rgba(0,0,0,0.05);color:#6b7280'}>
						{t}
					</button>
				{/each}
			</div>
		</div>

		<div>
			<label for="w-balance" class="block text-xs font-semibold mb-1.5" style="color:#6b7280">Saldo (Rp)</label>
			<input id="w-balance" type="number" bind:value={formBalance} min="0" placeholder="0"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {formErrors.balance ? '#EA580C' : 'transparent'}" />
			{#if formErrors.balance}<p class="text-xs mt-1" style="color:#EA580C">{formErrors.balance}</p>{/if}
		</div>

		<div>
			<label for="w-icon" class="block text-xs font-semibold mb-1.5" style="color:#6b7280">Ikon (emoji)</label>
			<input id="w-icon" type="text" bind:value={formIcon} placeholder="🏦"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid transparent" />
		</div>

		<div>
			<p class="text-xs font-semibold mb-2" style="color:#6b7280">Warna</p>
			<div class="flex gap-2 flex-wrap">
				{#each COLOR_PRESETS as color (color)}
					<button type="button" onclick={() => (formColor = color)} aria-label="Pilih warna {color}"
						class="w-8 h-8 rounded-full transition-transform hover:scale-110"
						style="background:{color};outline:{formColor === color ? `3px solid ${color}` : 'none'};outline-offset:2px"></button>
				{/each}
			</div>
		</div>

		<div class="flex gap-3 justify-end pt-1">
			<button type="button" onclick={closeModal}
				class="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black/5" style="color:#6b7280">Batal</button>
			<button type="submit"
				class="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)">
				{editData ? 'Simpan' : 'Tambah'}
			</button>
		</div>
	</form>
</Modal>

<!-- Confirm Delete -->
<ConfirmDialog open={confirmOpen} title="Hapus Rekening"
	description="Apakah kamu yakin ingin menghapus rekening ini? Tindakan ini tidak dapat dibatalkan."
	confirmLabel="Hapus"
	onconfirm={handleConfirmDelete}
	oncancel={() => { confirmOpen = false; confirmDeleteId = null; }} />

<div class="space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between gap-3 flex-wrap">
		<div>
			<h1 class="text-xl lg:text-2xl font-bold" style="color:#1a1a2e">Rekening</h1>
			<p class="text-xs lg:text-sm mt-0.5" style="color:#9ca3af">Kelola semua rekening dan dompet digitalmu</p>
		</div>
		<button onclick={openAddModal}
			class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
			style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a);box-shadow:0 4px 14px rgba(255,138,76,0.4)">
			<Plus size={16} /> Tambah Rekening
		</button>
	</div>

	<!-- Total Saldo card -->
	<div class="p-5 rounded-[24px]"
		style="background:linear-gradient(135deg,#FF8A4C,#ff7a35);box-shadow:8px 8px 20px rgba(0,0,0,0.08),-8px -8px 20px rgba(255,255,255,0.9)">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 rounded-2xl flex items-center justify-center" style="background:rgba(255,255,255,0.25)">
				<WalletIcon size={20} color="white" />
			</div>
			<p class="text-sm font-medium text-white/80">Total Saldo Semua Rekening</p>
		</div>
		<p class="text-3xl font-bold text-white">{formatRupiahFull($totalSaldo)}</p>
		<p class="text-xs mt-1 text-white/70">{$wallets.length} rekening aktif</p>
	</div>

	<!-- Wallet cards grid -->
	{#if $wallets.length === 0}
		<div class="py-16 text-center neu-card">
			<WalletIcon size={40} color="#d1d5db" class="mx-auto mb-3" />
			<p class="text-sm font-medium" style="color:#9ca3af">Belum ada rekening</p>
			<p class="text-xs mt-1" style="color:#d1d5db">Tambahkan rekening pertamamu</p>
			<button onclick={openAddModal}
				class="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)">
				Tambah Rekening
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each $wallets as wallet (wallet.id)}
				{@const TypeIcon = walletTypeIcon(wallet.type)}
				<div class="neu-card p-5 card-hover relative">
					<!-- Action menu -->
					<div class="absolute top-4 right-4 z-20">
						<button onclick={() => (openMenuId = openMenuId === wallet.id ? null : wallet.id)}
							class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
							<CircleEllipsis size={16} color="#9ca3af" />
						</button>
						{#if openMenuId === wallet.id}
							<div class="absolute right-0 top-9 w-32 rounded-2xl py-1 z-30"
								style="background:rgba(255,255,255,0.97);box-shadow:0 8px 24px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.06)">
								<button onclick={() => openEditModal(wallet)}
									class="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5 transition-colors"
									style="color:#1a1a2e">Edit</button>
								<button onclick={() => handleDeleteRequest(wallet.id)}
									class="w-full text-left px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
									style="color:#EA580C">Hapus</button>
							</div>
						{/if}
					</div>

					<!-- Icon -->
					<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
						style="background:{wallet.color}18">
						{wallet.icon}
					</div>

					<!-- Info -->
					<p class="text-base font-bold" style="color:#1a1a2e">{wallet.name}</p>
					<div class="flex items-center gap-1.5 mt-0.5 mb-3">
						<TypeIcon size={12} color="#9ca3af" />
						<span class="text-xs" style="color:#9ca3af">{wallet.type}</span>
					</div>
					<p class="text-xl font-bold" style="color:{wallet.color}">{formatRupiahFull(wallet.balance)}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
