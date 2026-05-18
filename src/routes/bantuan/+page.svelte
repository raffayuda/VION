<script lang="ts">
	import { BookOpen, MessageCircle, Mail, ChevronDown } from '@lucide/svelte';

	const faqs = [
		{ q: 'Bagaimana cara menggunakan fitur OCR?', a: 'Buka halaman Scan Struk, arahkan kamera ke struk belanja, lalu tekan tombol Buka Kamera. Finova akan otomatis memproses dan mengekstrak data transaksi.' },
		{ q: 'Apakah data saya aman?', a: 'Ya, semua data dienkripsi dan disimpan dengan aman. Kami tidak pernah menjual data pengguna ke pihak ketiga.' },
		{ q: 'Bagaimana cara upgrade ke Premium?', a: 'Klik tombol Upgrade Sekarang di sidebar atau buka menu Pengaturan > Langganan untuk melihat pilihan paket Premium.' },
		{ q: 'Bisakah saya export laporan keuangan?', a: 'Ya, pengguna Premium dapat mengexport laporan dalam format PDF dan Excel dari halaman Laporan.' },
	];

	let openFaq = $state<number | null>(null);

	const helpItems = [
		{ icon: BookOpen,       title: 'Panduan Pengguna', desc: 'Pelajari semua fitur Finova',  color: '#FF8A4C' },
		{ icon: MessageCircle,  title: 'Live Chat',         desc: 'Chat dengan tim support kami', color: '#4ADE80' },
		{ icon: Mail,           title: 'Email Support',     desc: 'support@finova.id',            color: '#60A5FA' },
	];
</script>

<div class="py-1 space-y-4">
	<div>
		<h1 class="text-xl sm:text-2xl font-bold" style="color:#1a1a2e">Bantuan & Dukungan</h1>
		<p class="text-xs sm:text-sm mt-0.5 hidden sm:block" style="color:#9ca3af">Ada yang bisa kami bantu?</p>
	</div>

	<!-- Quick help -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each helpItems as item}
			{@const HelpIcon = item.icon}
			<div class="p-5 neu-card card-hover cursor-pointer text-center">
				<div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
					style="background:{item.color}18">
					<HelpIcon size={22} color={item.color} />
				</div>
				<p class="text-sm font-semibold" style="color:#1a1a2e">{item.title}</p>
				<p class="text-xs mt-1" style="color:#9ca3af">{item.desc}</p>
			</div>
		{/each}
	</div>

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
