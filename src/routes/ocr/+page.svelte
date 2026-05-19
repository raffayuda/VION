<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import { formatRupiahFull, ocrResult } from '$lib/data/dummy';
	import {
		Bell,
		Camera,
		CameraOff,
		CheckCircle2,
		ChevronDown,
		CircleHelp,
		Flashlight,
		History,
		Image,
		LoaderCircle,
		Store
	} from '@lucide/svelte';

	type CamState = 'idle' | 'starting' | 'live' | 'captured' | 'error';

	let camState = $state<CamState>('idle');
	let previewUrl = $state('/Scan-image-grafis.png');
	let notes = $state('');
	let category = $state('Makanan & Minuman');
	let processing = $state(false);
	let progress = $state(0);
	let errorMessage = $state('');
	let fileInputEl: HTMLInputElement | null = null;
	let videoEl: HTMLVideoElement | null = null;
	let mediaStream: MediaStream | null = null;
	let tickTimer: ReturnType<typeof setInterval> | null = null;

	let extractedItems = $state(
		ocrResult.items.map((item) => ({
			name: item.name,
			qty: item.qty,
			price: item.price * item.qty
		}))
	);

	const totalBelanja = $derived(extractedItems.reduce((sum, item) => sum + item.price, 0));

	function openUploadPicker() {
		fileInputEl?.click();
	}

	function handleFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		stopCamera();
		revokePreviewIfBlob();
		previewUrl = URL.createObjectURL(file);
		camState = 'captured';
		simulateOcr();
		target.value = '';
	}

	async function openCamera() {
		if (!browser) return;
		try {
			camState = 'starting';
			errorMessage = '';

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			mediaStream = stream;
			if (videoEl) {
				videoEl.srcObject = stream;
				await videoEl.play();
			}
			camState = 'live';
		} catch {
			camState = 'error';
			errorMessage = 'Kamera tidak bisa diakses. Cek izin kamera browser kamu.';
		}
	}

	function stopCamera() {
		if (mediaStream) {
			for (const track of mediaStream.getTracks()) track.stop();
			mediaStream = null;
		}
		if (videoEl) videoEl.srcObject = null;
	}

	function captureFromCamera() {
		if (!videoEl) return;
		const width = videoEl.videoWidth;
		const height = videoEl.videoHeight;
		if (!width || !height) return;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(videoEl, 0, 0, width, height);
		revokePreviewIfBlob();
		previewUrl = canvas.toDataURL('image/jpeg', 0.92);
		camState = 'captured';
		stopCamera();
		simulateOcr();
	}

	function resetPreview() {
		stopCamera();
		revokePreviewIfBlob();
		previewUrl = '/Scan-image-grafis.png';
		camState = 'idle';
		processing = false;
		progress = 0;
		errorMessage = '';
	}

	function revokePreviewIfBlob() {
		if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
	}

	function simulateOcr() {
		processing = true;
		progress = 18;
		if (tickTimer) clearInterval(tickTimer);
		tickTimer = setInterval(() => {
			if (progress >= 88) return;
			progress += 7;
		}, 250);
		setTimeout(() => {
			if (tickTimer) clearInterval(tickTimer);
			progress = 100;
			processing = false;
		}, 2400);
	}

	onDestroy(() => {
		stopCamera();
		revokePreviewIfBlob();
		if (tickTimer) clearInterval(tickTimer);
	});
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold" style="color:#111827">Scan Struk (OCR)</h1>
			<p class="text-sm mt-1" style="color:#64748b">Scan struk belanja dan catat transaksi otomatis</p>
		</div>
		<div class="flex items-center gap-2 w-full sm:w-auto">
			<button class="px-4 py-2.5 rounded-full bg-white/80 text-slate-700 text-sm font-semibold flex items-center gap-2">
				<History size={15} />
				Riwayat Scan
			</button>
			<button class="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center relative">
				<Bell size={16} color="#334155" />
				<span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
		<div class="space-y-4">
			<section class="neu-card p-0 overflow-hidden">
				<div class="relative min-h-[520px] rounded-[28px] overflow-hidden bg-[#1e1e1e]">
					{#if camState === 'live' || camState === 'starting'}
						<video bind:this={videoEl} class="absolute inset-0 w-full h-full object-cover" playsinline muted></video>
					{:else}
						<img src={previewUrl} alt="Preview struk" class="absolute inset-0 w-full h-full object-cover" />
					{/if}

					<div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.35))"></div>

					<div class="absolute inset-x-0 top-6 flex justify-center">
						<div class="px-5 py-2.5 rounded-full text-white text-sm font-semibold flex items-center gap-2" style="background:rgba(24,24,24,0.45);backdrop-filter:blur(3px)">
							<Camera size={16} />
							Arahkan kamera ke struk
						</div>
					</div>

					<div class="absolute left-6 top-1/2 -translate-y-1/2">
						<div class="w-20 rounded-[28px] px-2 py-4 text-white space-y-5" style="background:rgba(20,20,20,0.32);backdrop-filter:blur(4px)">
							<button class="w-full grid place-items-center gap-1.5">
								<Flashlight size={20} />
								<span class="text-xs font-medium">Flash</span>
							</button>
							<button class="w-full grid place-items-center gap-1.5" onclick={openUploadPicker}>
								<Image size={20} />
								<span class="text-xs font-medium">Galeri</span>
							</button>
						</div>
					</div>

					{#if camState === 'error'}
						<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-xl text-sm text-white bg-red-500/70">
							{errorMessage}
						</div>
					{/if}

					<div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[720px] rounded-[34px] p-3 flex items-center justify-between text-white"
						style="background:rgba(20,20,20,0.55);backdrop-filter:blur(6px)">
						<button class="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2" onclick={openCamera}>
							{#if camState === 'live'}<CameraOff size={18} />{:else}<Camera size={18} />{/if}
							{camState === 'live' ? 'Tutup Kamera' : 'Buka Kamera'}
						</button>

						<button
							class="w-20 h-20 rounded-full border-[8px] border-[#ff6b1a] bg-white flex items-center justify-center disabled:opacity-50"
							onclick={captureFromCamera}
							disabled={camState !== 'live'}
							aria-label="Ambil foto struk"
						>
							{#if camState === 'starting'}
								<LoaderCircle class="animate-spin" size={22} color="#ff6b1a" />
							{/if}
						</button>

						<button class="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2" onclick={resetPreview}>
							<CircleHelp size={18} />
							Reset
						</button>
					</div>

					<input bind:this={fileInputEl} type="file" accept="image/*" class="hidden" onchange={handleFileChange} />
				</div>
			</section>

			<section class="neu-card p-5 sm:p-6">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-lg font-bold" style="color:#0f172a">Proses OCR</p>
						<p class="text-sm mt-0.5" style="color:#64748b">
							{processing ? 'AI sedang membaca strukmu...' : 'Siap memproses struk terbaru'}
						</p>
					</div>
					<CheckCircle2 size={22} color="#FB923C" />
				</div>
				<div class="mt-4 flex items-center gap-4">
					<div class="h-2.5 rounded-full bg-orange-100 flex-1 overflow-hidden">
						<div class="h-full rounded-full transition-all duration-300" style={`width:${progress}%;background:linear-gradient(90deg,#ff8a4c,#ff6b1a)`}></div>
					</div>
					<span class="text-sm font-semibold text-slate-500">{progress}%</span>
				</div>
			</section>
		</div>

		<section class="neu-card p-5 sm:p-6 h-fit">
			<div class="flex items-center justify-between mb-5">
				<div>
					<h2 class="text-xl font-bold">Hasil Ekstraksi</h2>
					<p class="mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold text-orange-600 bg-orange-50">
						Tingkat akurasi tinggi
					</p>
				</div>
				<div class="w-14 h-14 rounded-full border-[4px] border-orange-400 grid place-items-center text-sm font-bold text-slate-700">98%</div>
			</div>

			<div class="flex items-center gap-3 pb-4 border-b border-black/8">
				<div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style="background:linear-gradient(135deg,#ff9b58,#ff6b1a)">
					<Store size={24} />
				</div>
				<div>
					<p class="text-2xl font-bold">{ocrResult.merchant}</p>
					<p class="text-sm text-slate-500">18 Mei 2026 · 10:23</p>
				</div>
			</div>

			<div class="pt-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-bold">Detail Transaksi</h3>
					<button class="px-3 py-1.5 rounded-full border border-black/10 text-xs text-slate-600 font-semibold">Edit</button>
				</div>
				<div class="space-y-1">
					{#each extractedItems as item (`${item.name}-${item.qty}-${item.price}`)}
						<div class="flex items-center gap-2 py-2.5 border-b border-black/6 last:border-b-0">
							<div class="w-8 h-8 rounded-lg grid place-items-center bg-orange-50">
								<Store size={14} color="#f97316" />
							</div>
							<p class="flex-1 text-sm font-semibold">{item.name}</p>
							<p class="w-6 text-center text-sm text-slate-500">{item.qty}</p>
							<p class="w-24 text-right text-sm font-medium text-slate-600">{formatRupiahFull(item.price)}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-4 pt-4 border-t border-black/8 flex items-center justify-between">
				<p class="text-base text-slate-700">Total Belanja</p>
				<p class="text-3xl font-bold">{formatRupiahFull(totalBelanja)}</p>
			</div>

			<div class="mt-4">
				<button class="w-full px-4 py-3 rounded-[18px] bg-black/4 text-left text-sm font-semibold text-slate-700 flex items-center justify-between">
					<span>{category}</span>
					<ChevronDown size={16} />
				</button>
			</div>

			<div class="mt-3">
				<label for="note" class="text-sm font-medium text-slate-600 block mb-1.5">Catatan (opsional)</label>
				<input
					id="note"
					bind:value={notes}
					placeholder="Tambahkan catatan..."
					class="w-full rounded-[18px] px-4 py-3 bg-black/4 text-sm outline-none"
				/>
			</div>

			<button class="mt-5 w-full py-3.5 rounded-full text-white text-sm font-semibold"
				style="background:linear-gradient(135deg,#ff8a4c,#ff6b1a)">
				Simpan Transaksi
			</button>
		</section>
	</div>
</div>
