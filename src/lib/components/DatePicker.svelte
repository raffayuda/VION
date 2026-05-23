<script lang="ts">
	import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from '@lucide/svelte';

	type PickerMode = 'date' | 'month';

	interface Props {
		value: string;
		onselect: (value: string) => void;
		label?: string;
		placeholder?: string;
		mode?: PickerMode;
		helper?: string;
		align?: 'left' | 'right';
		clearable?: boolean;
	}

	interface CalendarCell {
		date: Date;
		iso: string;
		inCurrentMonth: boolean;
		isToday: boolean;
		isSelected: boolean;
	}

	let {
		value,
		onselect,
		label = '',
		placeholder = 'Pilih tanggal',
		mode = 'date',
		helper = '',
		align = 'left',
		clearable = false
	}: Props = $props();

	const weekdayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' });
	const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
	const dateFormatter = new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	const monthValueFormatter = new Intl.DateTimeFormat('id-ID', {
		month: 'long',
		year: 'numeric'
	});
	const monthChipFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

	const weekdays = Array.from({ length: 7 }, (_, index) =>
		weekdayFormatter.format(new Date(2024, 0, index + 1))
	);

	let open = $state(false);
	let viewDate = $state(new Date());

	function clickOutside(node: HTMLElement) {
		const handlePointerDown = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				open = false;
			}
		};

		document.addEventListener('mousedown', handlePointerDown, true);

		return {
			destroy() {
				document.removeEventListener('mousedown', handlePointerDown, true);
			}
		};
	}

	function getInitialViewDate(rawValue: string, pickerMode: PickerMode) {
		const parsed = parseValue(rawValue, pickerMode);
		return parsed ?? new Date();
	}

	function parseValue(rawValue: string, pickerMode: PickerMode) {
		if (!rawValue) return null;
		if (pickerMode === 'month') {
			const [year, month] = rawValue.split('-').map(Number);
			if (!year || !month) return null;
			return new Date(year, month - 1, 1);
		}
		const [year, month, day] = rawValue.split('-').map(Number);
		if (!year || !month || !day) return null;
		return new Date(year, month - 1, day);
	}

	function formatIsoDate(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatMonthValue(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${year}-${month}`;
	}

	function addMonths(date: Date, amount: number) {
		return new Date(date.getFullYear(), date.getMonth() + amount, 1);
	}

	function isSameDay(a: Date | null, b: Date) {
		return !!a &&
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();
	}

	function isSameMonth(a: Date | null, b: Date) {
		return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
	}

	function getDisplayValue(rawValue: string, pickerMode: PickerMode) {
		const parsed = parseValue(rawValue, pickerMode);
		if (!parsed) return placeholder;
		return pickerMode === 'month' ? monthValueFormatter.format(parsed) : dateFormatter.format(parsed);
	}

	function buildCalendarCells(baseDate: Date, selected: Date | null, pickerMode: PickerMode) {
		const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
		const calendarStart = new Date(firstDayOfMonth);
		const shift = (firstDayOfMonth.getDay() + 6) % 7;
		calendarStart.setDate(firstDayOfMonth.getDate() - shift);

		const today = new Date();
		const cells: CalendarCell[] = [];

		for (let index = 0; index < 42; index += 1) {
			const cellDate = new Date(calendarStart);
			cellDate.setDate(calendarStart.getDate() + index);
			cells.push({
				date: cellDate,
				iso: formatIsoDate(cellDate),
				inCurrentMonth: cellDate.getMonth() === baseDate.getMonth(),
				isToday: isSameDay(today, cellDate),
				isSelected: pickerMode === 'month' ? isSameMonth(selected, cellDate) : isSameDay(selected, cellDate)
			});
		}

		return cells;
	}

	function openPicker() {
		open = !open;
		if (open) {
			viewDate = getInitialViewDate(value, mode);
		}
	}

	function goToToday() {
		const now = new Date();
		viewDate = now;
		onselect(mode === 'month' ? formatMonthValue(now) : formatIsoDate(now));
		open = false;
	}

	function clearValue() {
		onselect('');
		open = false;
	}

	function selectDate(date: Date) {
		viewDate = date;
		onselect(mode === 'month' ? formatMonthValue(date) : formatIsoDate(date));
		open = false;
	}

	const quickMonths = $derived(
		Array.from({ length: 3 }, (_, index) => {
			const monthDate = addMonths(new Date(), index - 1);
			return {
				label: monthChipFormatter.format(monthDate),
				value: formatMonthValue(monthDate)
			};
		})
	);

	const selectedDate = $derived(parseValue(value, mode));
	const displayValue = $derived(getDisplayValue(value, mode));
	const calendarCells = $derived(buildCalendarCells(viewDate, selectedDate, mode));
	const alignClass = $derived(align === 'right' ? 'right-0' : 'left-0');

	$effect(() => {
		if (!open) {
			viewDate = getInitialViewDate(value, mode);
		}
	});
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && (open = false)} />

<div class="space-y-1.5" use:clickOutside>
	{#if label}
		<p class="block text-xs font-semibold" style="color:#6b7280">{label}</p>
	{/if}

	<div class="relative">
		<button
			type="button"
			onclick={openPicker}
			class="group flex w-full items-center justify-between gap-2 rounded-[18px] border px-3 py-2.5 text-left transition-all duration-200"
			style={`background:${open ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)'};border-color:${open ? 'rgba(240,138,91,0.35)' : 'rgba(0,0,0,0.05)'};box-shadow:${open ? '0 14px 32px rgba(255,138,76,0.12)' : '0 8px 20px rgba(15,23,42,0.06)'}`}
			aria-expanded={open}
		>
			<div class="min-w-0">
				<p class="text-[10px] font-semibold uppercase tracking-[0.16em]" style="color:#F08A5B">
					{mode === 'month' ? 'Filter kalender' : 'Tanggal transaksi'}
				</p>
				<p class={`truncate text-[13px] font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
					{displayValue}
				</p>
			</div>
			<span
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-[1.03]"
				style="background:linear-gradient(135deg,rgba(255,138,76,0.16),rgba(253,186,116,0.24));color:#E07A47"
			>
				<CalendarDays size={16} />
			</span>
		</button>

		{#if open}
			<div
				class={`absolute ${alignClass} top-[calc(100%+10px)] z-40 w-[min(90vw,300px)] overflow-hidden rounded-[22px] border border-white/70 bg-white/96 p-3 backdrop-blur-xl`}
				style="box-shadow:0 24px 48px rgba(15,23,42,0.16), 0 8px 24px rgba(255,138,76,0.12);"
			>
				<div class="mb-3 flex items-start justify-between gap-2">
					<div>
						<p class="text-[10px] font-semibold uppercase tracking-[0.16em]" style="color:#F08A5B">
							{mode === 'month' ? 'Pilih bulan' : 'Pilih tanggal'}
						</p>
						<h3 class="mt-1 text-[15px] font-bold text-slate-900">
							{monthFormatter.format(viewDate)}
						</h3>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => (viewDate = addMonths(viewDate, -1))}
							class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
							aria-label="Bulan sebelumnya"
						>
							<ChevronLeft size={14} />
						</button>
						<button
							type="button"
							onclick={() => (viewDate = addMonths(viewDate, 1))}
							class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
							aria-label="Bulan berikutnya"
						>
							<ChevronRight size={14} />
						</button>
					</div>
				</div>

				{#if mode === 'month'}
					<div class="mb-3 flex flex-wrap gap-1.5">
						{#each quickMonths as monthOption (monthOption.value)}
							<button
								type="button"
								onclick={() => {
									viewDate = parseValue(monthOption.value, 'month') ?? new Date();
									onselect(monthOption.value);
									open = false;
								}}
								class="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all"
								style={value === monthOption.value
									? 'background:linear-gradient(135deg,#F08A5B,#E07A47);color:white;box-shadow:0 8px 18px rgba(255,138,76,0.24)'
									: 'background:rgba(255,138,76,0.08);color:#C46A3B'}
							>
								{monthOption.label}
							</button>
						{/each}
					</div>
				{/if}

				<div class="grid grid-cols-7 gap-1">
					{#each weekdays as weekday (weekday)}
						<div class="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
							{weekday}
						</div>
					{/each}

					{#each calendarCells as cell (cell.iso)}
						<button
							type="button"
							onclick={() => selectDate(cell.date)}
							class="relative flex aspect-square items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200"
							style={`background:${cell.isSelected ? 'linear-gradient(135deg,#F08A5B,#E07A47)' : cell.isToday ? 'rgba(255,138,76,0.12)' : 'transparent'};color:${cell.isSelected ? '#ffffff' : cell.inCurrentMonth ? '#1f2937' : '#c0c7d2'};box-shadow:${cell.isSelected ? '0 10px 24px rgba(255,138,76,0.24)' : 'none'}`}
							aria-pressed={cell.isSelected}
						>
							{cell.date.getDate()}
							{#if cell.isToday && !cell.isSelected}
								<span
									class="absolute bottom-1 h-1 w-1 rounded-full"
									style="background:#F08A5B"
								></span>
							{/if}
						</button>
					{/each}
				</div>

				<div class="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
					<div>
						<p class="text-[11px] font-medium text-slate-500">
							{mode === 'month' ? 'Filter per bulan agar daftar transaksi lebih fokus.' : 'Tanggal yang dipilih akan dipakai saat menyimpan transaksi.'}
						</p>
						{#if helper}
							<p class="mt-1 text-[10px] text-slate-400">{helper}</p>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						{#if clearable}
							<button
								type="button"
								onclick={clearValue}
								class="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-black/5"
							>
								Reset
							</button>
						{/if}
						<button
							type="button"
							onclick={goToToday}
							class="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-orange-600 transition-colors hover:bg-orange-50"
						>
							<RotateCcw size={12} />
							{mode === 'month' ? 'Bulan ini' : 'Hari ini'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
