<script lang="ts">
	import { user } from '$lib/data/dummy';
	import { User, Shield, Bell, Palette, ChevronRight, Crown, Pencil } from '@lucide/svelte';

	const sections = [
		{ title: 'Profil',      icon: User,    items: ['Nama', 'Email', 'Foto Profil', 'Nomor Telepon'] },
		{ title: 'Keamanan',    icon: Shield,  items: ['Ubah Password', 'PIN Aplikasi', 'Autentikasi 2 Faktor'] },
		{ title: 'Notifikasi',  icon: Bell,    items: ['Pengingat Tagihan', 'Alert Over Budget', 'Laporan Mingguan', 'Promo & Update'] },
		{ title: 'Tampilan',    icon: Palette, items: ['Tema', 'Bahasa', 'Format Mata Uang'] },
	];
</script>

<div class="py-1 space-y-4">
	<div>
		<h1 class="text-xl sm:text-2xl font-bold" style="color:#1a1a2e">Pengaturan</h1>
		<p class="text-xs sm:text-sm mt-0.5 hidden sm:block" style="color:#9ca3af">Kelola preferensi akunmu</p>
	</div>

	<!-- Profile card -->
	<div class="p-5 sm:p-6 neu-card flex items-center gap-4 sm:gap-5">
		<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0"
			style="background:linear-gradient(135deg,#FF8A4C,#A78BFA)">
			{user.name.charAt(0)}
		</div>
		<div class="flex-1 min-w-0">
			<p class="text-base sm:text-lg font-bold truncate" style="color:#1a1a2e">{user.name}</p>
			<p class="text-sm truncate" style="color:#9ca3af">{user.email}</p>
			<div class="flex items-center gap-1.5 mt-1">
				<Crown size={12} color="#FF8A4C" />
				<span class="text-xs font-medium" style="color:#FF8A4C">Premium</span>
			</div>
		</div>
		<button class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all hover:opacity-80"
			style="background:rgba(0,0,0,0.04);color:#6b7280">
			<Pencil size={14} /> <span class="hidden sm:inline">Edit Profil</span>
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		{#each sections as section}
			{@const SectionIcon = section.icon}
			<div class="p-5 sm:p-6 neu-card">
				<div class="flex items-center gap-2 mb-4">
					<SectionIcon size={16} color="#FF8A4C" />
					<h2 class="text-sm font-semibold" style="color:#9ca3af">{section.title}</h2>
				</div>
				<div class="space-y-1">
					{#each section.items as item}
						<button class="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all hover:bg-black/[0.03]">
							<span class="text-sm" style="color:#1a1a2e">{item}</span>
							<ChevronRight size={15} color="#9ca3af" />
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
