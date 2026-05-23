<script lang="ts">
	import { BookOpen, MessageCircle, Mail, ChevronDown, X } from '@lucide/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { showToast } from '$lib/stores/toastStore';

	const faqs = [
		{ q: 'Bagaimana cara menggunakan fitur OCR?', a: 'Buka halaman Scan Struk, arahkan kamera ke struk belanja, lalu tekan tombol Buka Kamera. Finova akan otomatis memproses dan mengekstrak data transaksi.' },
		{ q: 'Apakah data saya aman?', a: 'Ya, semua data dienkripsi dan disimpan dengan aman. Kami tidak pernah menjual data pengguna ke pihak ketiga.' },
		{ q: 'Bagaimana cara upgrade ke Premium?', a: 'Klik tombol Upgrade Sekarang di sidebar atau buka menu Pengaturan > Langganan untuk melihat pilihan paket Premium.' },
		{ q: 'Bisakah saya export laporan keuangan?', a: 'Ya, pengguna Premium dapat mengexport laporan dalam format PDF dan Excel dari halaman Laporan.' },
	];

	let openFaq = $state<number | null>(null);

	// ─── Contact Form Modal (Tasks 15.2 & 15.3) ──────────────────────────────
	let contactModalOpen = $state(false);
	let contactName = $state('');
	let contactEmail = $state('');
	let contactSubject = $state('');
	let contactMessage = $state('');
	let contactErrors = $state<{ name?: string; email?: string; message?: string }>({});

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function openContactModal() {
		contactName = '';
		contactEmail = '';
		contactSubject = '';
		contactMessage = '';
		contactErrors = {};
		contactModalOpen = true;
	}

	function validateContact(): boolean {
		const e: typeof contactErrors = {};
		if (!contactName.trim()) e.name = 'Nama tidak boleh kosong';
		if (!emailRegex.test(contactEmail)) e.email = 'Format email tidak valid';
		if (!contactMessage.trim()) e.message = 'Pesan tidak boleh kosong';
		contactErrors = e;
		return Object.keys(e).length === 0;
	}

	function submitContact() {
		if (!validateContact()) return;
		contactModalOpen = false;
		showToast('Pesan berhasil dikirim! Tim kami akan menghubungimu segera.', 'success');
	}

	// ─── Guide Panel (Task 15.4) ──────────────────────────────────────────────
	let guideOpen = $state(false);

	const guides = [
		{ title: 'Scan Struk (OCR)', desc: 'Foto struk belanja dan biarkan AI mencatat transaksi otomatis.' },
		{ title: 'Kelola Transaksi', desc: 'Tambah, edit, hapus, dan filter transaksi keuanganmu.' },
		{ title: 'Atur Anggaran', desc: 'Buat anggaran per kategori dan pantau penggunaannya.' },
		{ title: 'Tujuan Keuangan', desc: 'Tetapkan target tabungan dan tambahkan dana secara berkala.' },
		{ title: 'Laporan & Export', desc: 'Lihat laporan keuangan dan export ke PDF atau Excel.' },
		{ title: 'Insight AI', desc: 'Dapatkan analisis cerdas pola pengeluaranmu.' },
	];

	const helpItems = [
		{ icon: BookOpen,      title: 'Panduan Pengguna', desc: 'Pelajari semua fitur Finova',  color: '#FF8A4C', action: () => { guideOpen = !guideOpen; } },
		{ icon: MessageCircle, title: 'Live Chat',         desc: 'Chat dengan tim support kami', color: '#4ADE80', action: openContactModal },
		{ icon: Mail,          title: 'Email Support',     desc: 'support@finova.id',            color: '#60A5FA', action: openContactModal },
	];
</script>

<div class="py-1 space-y-4">
	<div>
		<h1 class="text-xl sm:text-2xl font-bold" style="color:#1a1a2e">Bantuan & Dukungan</h1>
		<p class="text-xs sm:text-sm mt-0.5 hidden sm:block" style="color:#9ca3af">Ada yang bisa kami bantu?</p>
	</div>

	<!-- Quick help -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each helpItems as item (item.title)}
			{@const HelpIcon = item.icon}
			<button onclick={item.action} class="p-5 neu-card card-hover text-center w-full transition-all hover:scale-[1.02]">
				<div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
					style="background:{item.color}18">
					<HelpIcon size={22} color={item.color} />
				</div>
				<p class="text-sm font-semibold" style="color:#1a1a2e">{item.title}</p>
				<p class="text-xs mt-1" style="color:#9ca3af">{item.desc}</p>
			</button>
		{/each}
	</div>

	<!-- Guide Panel (Task 15.4) -->
	{#if guideOpen}
		<div class="neu-card p-5 sm:p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-base font-semibold" style="color:#1a1a2e">Panduan Pengguna</h2>
				<button onclick={() => (guideOpen = false)} class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5">
					<X size={16} color="#9ca3af" />
				</button>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{#each guides as guide (guide.title)}
					<div class="p-4 rounded-2xl" style="background:rgba(255,138,76,0.06);border:1px solid rgba(255,138,76,0.12)">
						<p class="text-sm font-semibold mb-1" style="color:#1a1a2e">{guide.title}</p>
						<p class="text-xs" style="color:#6b7280">{guide.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- FAQ -->
	<div class="neu-card p-5 sm:p-6">
		<h2 class="text-base font-semibold mb-4" style="color:#1a1a2e">Pertanyaan Umum</h2>
		<div class="space-y-2">
			{#each faqs as faq, i}
				<div class="rounded-2xl overflow-hidden" style="background:rgba(0,0,0,0.02)">
					<button onclick={() => openFaq = openFaq === i ? null : i}
						class="w-full flex items-center justify-between p-4 text-left gap-3">
						<span class="text-sm font-medium" style="color:#1a1a2e">{faq.q}</span>
						<div class="shrink-0 transition-transform duration-200" style="transform:{openFaq === i ? 'rotate(180deg)' : 'rotate(0)'}">
							<ChevronDown size={16} color="#9ca3af" />
						</div>
					</button>
					{#if openFaq === i}
						<div class="px-4 pb-4">
							<p class="text-sm" style="color:#6b7280">{faq.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Contact Form Modal (Tasks 15.2 & 15.3) -->
<Modal open={contactModalOpen} title="Hubungi Kami" onclose={() => (contactModalOpen = false)} size="md">
	<form onsubmit={(e) => { e.preventDefault(); submitContact(); }} class="space-y-4">
		<div>
			<label for="c-name" class="block text-xs font-medium mb-1" style="color:#6b7280">Nama</label>
			<input id="c-name" type="text" bind:value={contactName} placeholder="Nama lengkap"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {contactErrors.name ? '#EA580C' : 'transparent'}" />
			{#if contactErrors.name}<p class="text-xs mt-1" style="color:#EA580C">{contactErrors.name}</p>{/if}
		</div>
		<div>
			<label for="c-email" class="block text-xs font-medium mb-1" style="color:#6b7280">Email</label>
			<input id="c-email" type="text" bind:value={contactEmail} placeholder="email@contoh.com"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {contactErrors.email ? '#EA580C' : 'transparent'}" />
			{#if contactErrors.email}<p class="text-xs mt-1" style="color:#EA580C">{contactErrors.email}</p>{/if}
		</div>
		<div>
			<label for="c-subject" class="block text-xs font-medium mb-1" style="color:#6b7280">Subjek <span style="color:#9ca3af">(opsional)</span></label>
			<input id="c-subject" type="text" bind:value={contactSubject} placeholder="Topik pertanyaan"
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid transparent" />
		</div>
		<div>
			<label for="c-message" class="block text-xs font-medium mb-1" style="color:#6b7280">Pesan</label>
			<textarea id="c-message" bind:value={contactMessage} rows="4" placeholder="Tulis pesanmu di sini..."
				class="w-full px-4 py-2.5 rounded-2xl text-sm outline-none resize-none"
				style="background:rgba(0,0,0,0.04);border:1.5px solid {contactErrors.message ? '#EA580C' : 'transparent'}"></textarea>
			{#if contactErrors.message}<p class="text-xs mt-1" style="color:#EA580C">{contactErrors.message}</p>{/if}
		</div>
		<div class="flex gap-3 pt-1">
			<button type="button" onclick={() => (contactModalOpen = false)}
				class="flex-1 py-2.5 rounded-full text-sm font-medium hover:bg-black/5" style="color:#6b7280">Batal</button>
			<button type="submit"
				class="flex-1 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90"
				style="background:linear-gradient(135deg,#FF8A4C,#ff6b1a)">Kirim Pesan</button>
		</div>
	</form>
</Modal>
