<script lang="ts">
	import { userProfile, updateUserProfile, type UserProfile } from '$lib/stores/appStore';
	import { showToast } from '$lib/stores/toastStore';
	import Modal from '$lib/components/Modal.svelte';
	import { User, Shield, Bell, Palette, Crown, Pencil } from '@lucide/svelte';

	// ─── Profile Edit Modal (Task 14.2) ──────────────────────────────────────────
	let profileModalOpen = $state(false);
	let profileName = $state('');
	let profileEmail = $state('');
	let profilePhone = $state('');
	let nameError = $state('');
	let emailError = $state('');

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function openProfileModal() {
		profileName = $userProfile.name;
		profileEmail = $userProfile.email;
		profilePhone = $userProfile.phone ?? '';
		nameError = '';
		emailError = '';
		profileModalOpen = true;
	}

	function validateProfile(): boolean {
		nameError = profileName.trim() === '' ? 'Nama tidak boleh kosong.' : '';
		emailError = !emailRegex.test(profileEmail) ? 'Format email tidak valid.' : '';
		return nameError === '' && emailError === '';
	}

	function submitProfile() {
		if (!validateProfile()) return;
		updateUserProfile({ name: profileName.trim(), email: profileEmail.trim(), phone: profilePhone.trim() || undefined });
		profileModalOpen = false;
	}

	// ─── Security Info Modal (Task 14.5) ─────────────────────────────────────────
	let infoModalOpen = $state(false);
	let infoModalTitle = $state('');
	let infoModalMessage = $state('');

	function openInfoModal(title: string, message: string) {
		infoModalTitle = title;
		infoModalMessage = message;
		infoModalOpen = true;
	}

	// ─── Notification toggle handler (Task 14.3) ─────────────────────────────────
	function toggleNotification(key: keyof UserProfile['preferences']['notifications'], value: boolean) {
		updateUserProfile({
			preferences: {
				...$userProfile.preferences,
				notifications: { ...$userProfile.preferences.notifications, [key]: value }
			}
		});
	}

	// ─── Theme / Language change handlers (Task 14.4) ────────────────────────────
	function changeTheme(theme: UserProfile['preferences']['theme']) {
		userProfile.update((p) => ({ ...p, preferences: { ...p.preferences, theme } }));
		showToast('Pengaturan tampilan disimpan', 'success');
	}

	function changeLanguage(language: UserProfile['preferences']['language']) {
		userProfile.update((p) => ({ ...p, preferences: { ...p.preferences, language } }));
		showToast('Bahasa berhasil diubah', 'success');
	}

	const notifItems: { label: string; key: keyof UserProfile['preferences']['notifications'] }[] = [
		{ label: 'Pengingat Tagihan',  key: 'billReminder' },
		{ label: 'Alert Over Budget',  key: 'overBudgetAlert' },
		{ label: 'Laporan Mingguan',   key: 'weeklyReport' },
		{ label: 'Promo & Update',     key: 'promoUpdate' },
	];

	const securityItems = [
		{ label: 'Ubah Password',        message: 'Fitur ubah password akan tersedia segera.' },
		{ label: 'PIN Aplikasi',         message: 'Fitur PIN aplikasi akan tersedia segera.' },
		{ label: 'Autentikasi 2 Faktor', message: 'Fitur autentikasi 2 faktor akan tersedia segera.' },
	];
</script>

<div class="py-1 space-y-4">
	<div>
		<h1 class="text-xl sm:text-2xl font-bold" style="color:#1a1a2e">Pengaturan</h1>
		<p class="text-xs sm:text-sm mt-0.5 hidden sm:block" style="color:#9ca3af">Kelola preferensi akunmu</p>
	</div>

	<!-- Profile card (Task 14.1) -->
	<div class="p-5 sm:p-6 neu-card flex items-center gap-4 sm:gap-5">
		<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0"
			style="background:linear-gradient(135deg,#FF8A4C,#A78BFA)">
			{$userProfile.name.charAt(0)}
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-base sm:text-lg font-bold truncate" style="color:#1a1a2e">{$userProfile.name}</p>
			<p class="text-sm truncate" style="color:#9ca3af">{$userProfile.email}</p>
			<div class="flex items-center gap-1.5 mt-1">
				<Crown size={12} color="#FF8A4C" />
				<span class="text-xs font-medium" style="color:#FF8A4C">{$userProfile.plan === 'premium' ? 'Premium' : 'Free'}</span>
			</div>
		</div>
		<button onclick={openProfileModal}
			class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all hover:opacity-80"
			style="background:rgba(0,0,0,0.04);color:#6b7280">
			<Pencil size={14} /> <span class="hidden sm:inline">Edit Profil</span>
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

		<!-- Profil section -->
		<div class="p-5 sm:p-6 neu-card">
			<div class="flex items-center gap-2 mb-4">
				<User size={16} color="#FF8A4C" />
				<h2 class="text-sm font-semibold" style="color:#9ca3af">Profil</h2>
			</div>
			<div class="space-y-1">
				<div class="p-3 rounded-xl" style="background:rgba(0,0,0,0.02)">
					<p class="text-xs" style="color:#9ca3af">Nama</p>
					<p class="text-sm font-medium mt-0.5" style="color:#1a1a2e">{$userProfile.name}</p>
				</div>
				<div class="p-3 rounded-xl" style="background:rgba(0,0,0,0.02)">
					<p class="text-xs" style="color:#9ca3af">Email</p>
					<p class="text-sm font-medium mt-0.5" style="color:#1a1a2e">{$userProfile.email}</p>
				</div>
				{#if $userProfile.phone}
					<div class="p-3 rounded-xl" style="background:rgba(0,0,0,0.02)">
						<p class="text-xs" style="color:#9ca3af">Nomor Telepon</p>
						<p class="text-sm font-medium mt-0.5" style="color:#1a1a2e">{$userProfile.phone}</p>
					</div>
				{/if}
				<button onclick={openProfileModal}
					class="w-full mt-2 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
					style="background:linear-gradient(135deg,#FF8A4C,#FB923C);color:white">
					Edit Profil
				</button>
			</div>
		</div>

		<!-- Keamanan section (Task 14.5) -->
		<div class="p-5 sm:p-6 neu-card">
			<div class="flex items-center gap-2 mb-4">
				<Shield size={16} color="#FF8A4C" />
				<h2 class="text-sm font-semibold" style="color:#9ca3af">Keamanan</h2>
			</div>
			<div class="space-y-1">
				{#each securityItems as item (item.label)}
					<button onclick={() => openInfoModal(item.label, item.message)}
						class="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all hover:bg-black/3">
						<span class="text-sm" style="color:#1a1a2e">{item.label}</span>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</button>
				{/each}
			</div>
		</div>

		<!-- Notifikasi section (Task 14.3) -->
		<div class="p-5 sm:p-6 neu-card">
			<div class="flex items-center gap-2 mb-4">
				<Bell size={16} color="#FF8A4C" />
				<h2 class="text-sm font-semibold" style="color:#9ca3af">Notifikasi</h2>
			</div>
			<div class="space-y-1">
				{#each notifItems as item (item.key)}
					<div class="flex items-center justify-between p-3 rounded-xl">
						<span class="text-sm" style="color:#1a1a2e">{item.label}</span>
						<button
							role="switch"
							aria-checked={$userProfile.preferences.notifications[item.key]}
							aria-label={item.label}
							onclick={() => toggleNotification(item.key, !$userProfile.preferences.notifications[item.key])}
							class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
							style="background:{$userProfile.preferences.notifications[item.key] ? '#FF8A4C' : '#d1d5db'}">
							<span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
								style="transform:translateX({$userProfile.preferences.notifications[item.key] ? '20px' : '0px'})">
							</span>
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- Tampilan section (Task 14.4) -->
		<div class="p-5 sm:p-6 neu-card">
			<div class="flex items-center gap-2 mb-4">
				<Palette size={16} color="#FF8A4C" />
				<h2 class="text-sm font-semibold" style="color:#9ca3af">Tampilan</h2>
			</div>
			<div class="space-y-3">
				<div class="p-3 rounded-xl" style="background:rgba(0,0,0,0.02)">
					<label class="text-xs mb-1.5 block" style="color:#9ca3af" for="select-tema">Tema</label>
					<select id="select-tema"
						value={$userProfile.preferences.theme}
						onchange={(e) => changeTheme((e.currentTarget as HTMLSelectElement).value as UserProfile['preferences']['theme'])}
						class="w-full text-sm rounded-lg px-3 py-2 border outline-none"
						style="color:#1a1a2e;border-color:#e5e7eb;background:white">
						<option value="light">Terang</option>
						<option value="dark">Gelap</option>
						<option value="system">Ikuti Sistem</option>
					</select>
				</div>
				<div class="p-3 rounded-xl" style="background:rgba(0,0,0,0.02)">
					<label class="text-xs mb-1.5 block" style="color:#9ca3af" for="select-bahasa">Bahasa</label>
					<select id="select-bahasa"
						value={$userProfile.preferences.language}
						onchange={(e) => changeLanguage((e.currentTarget as HTMLSelectElement).value as UserProfile['preferences']['language'])}
						class="w-full text-sm rounded-lg px-3 py-2 border outline-none"
						style="color:#1a1a2e;border-color:#e5e7eb;background:white">
						<option value="id">Indonesia</option>
						<option value="en">English</option>
					</select>
				</div>
			</div>
		</div>

	</div>
</div>

<!-- Profile Edit Modal (Task 14.2) -->
<Modal open={profileModalOpen} title="Edit Profil" onclose={() => (profileModalOpen = false)} size="sm">
	<form onsubmit={(e) => { e.preventDefault(); submitProfile(); }} class="space-y-4">
		<div>
			<label class="block text-xs font-medium mb-1" style="color:#6b7280" for="profile-name">Nama</label>
			<input id="profile-name" type="text" bind:value={profileName}
				oninput={() => { if (profileName.trim()) nameError = ''; }}
				placeholder="Nama lengkap"
				class="w-full text-sm rounded-xl px-3 py-2.5 border outline-none"
				style="color:#1a1a2e;border-color:{nameError ? '#ef4444' : '#e5e7eb'};background:white" />
			{#if nameError}<p class="text-xs mt-1" style="color:#ef4444">{nameError}</p>{/if}
		</div>
		<div>
			<label class="block text-xs font-medium mb-1" style="color:#6b7280" for="profile-email">Email</label>
			<input id="profile-email" type="text" bind:value={profileEmail}
				oninput={() => { if (emailRegex.test(profileEmail)) emailError = ''; }}
				placeholder="email@contoh.com"
				class="w-full text-sm rounded-xl px-3 py-2.5 border outline-none"
				style="color:#1a1a2e;border-color:{emailError ? '#ef4444' : '#e5e7eb'};background:white" />
			{#if emailError}<p class="text-xs mt-1" style="color:#ef4444">{emailError}</p>{/if}
		</div>
		<div>
			<label class="block text-xs font-medium mb-1" style="color:#6b7280" for="profile-phone">
				Nomor Telepon <span style="color:#9ca3af">(opsional)</span>
			</label>
			<input id="profile-phone" type="text" bind:value={profilePhone}
				placeholder="+62 812 3456 7890"
				class="w-full text-sm rounded-xl px-3 py-2.5 border outline-none"
				style="color:#1a1a2e;border-color:#e5e7eb;background:white" />
		</div>
		<div class="flex gap-3 pt-1">
			<button type="button" onclick={() => (profileModalOpen = false)}
				class="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-80"
				style="background:rgba(0,0,0,0.05);color:#6b7280">Batal</button>
			<button type="submit"
				class="flex-1 py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
				style="background:linear-gradient(135deg,#FF8A4C,#FB923C);color:white">Simpan</button>
		</div>
	</form>
</Modal>

<!-- Security Info Modal (Task 14.5) -->
<Modal open={infoModalOpen} title={infoModalTitle} onclose={() => (infoModalOpen = false)} size="sm">
	<div class="space-y-4">
		<p class="text-sm" style="color:#6b7280">{infoModalMessage}</p>
		<button onclick={() => (infoModalOpen = false)}
			class="w-full py-2.5 rounded-xl text-sm font-medium hover:opacity-90"
			style="background:linear-gradient(135deg,#FF8A4C,#FB923C);color:white">Mengerti</button>
	</div>
</Modal>
