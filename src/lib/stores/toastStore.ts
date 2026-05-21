import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
	id: number;
	message: string;
	type: ToastType;
	duration: number;
}

let nextId = 1;

export const toasts = writable<ToastItem[]>([]);

export function showToast(message: string, type: ToastType = 'success', duration = 3000): void {
	const id = nextId++;
	toasts.update((list) => [...list, { id, message, type, duration }]);
}

export function dismissToast(id: number): void {
	toasts.update((list) => list.filter((t) => t.id !== id));
}
