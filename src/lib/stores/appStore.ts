import { writable, derived } from 'svelte/store';
import {
	transactions as dummyTransactions,
	budgetCategories as dummyBudgets,
	financialGoals as dummyGoals,
	wallets as dummyWallets,
	insights as dummyInsights,
	user as dummyUser
} from '$lib/data/dummy';
import { showToast } from './toastStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Transaction {
	id: number;
	merchant: string;
	category: string;
	date: string;
	amount: number;
	type: 'income' | 'expense';
	icon?: string;
	walletId?: number;
	notes?: string;
}

export interface BudgetCategory {
	id: number;
	name: string;
	budget: number;
	used: number;
	color: string;
	icon: string;
}

export interface FinancialGoal {
	id: number;
	name: string;
	target: number;
	current: number;
	deadline: string;
	icon: string;
	color: string;
}

export interface Investment {
	id: number;
	product: string;
	provider: string;
	value: number;
	profit: number;
	roi: number;
	color: string;
}

export interface Wallet {
	id: number;
	name: string;
	type: 'Bank' | 'E-Wallet' | 'Tunai';
	balance: number;
	icon: string;
	color: string;
}

export interface Insight {
	id: number;
	type: 'warning' | 'info' | 'success';
	title: string;
	description: string;
	color: string;
	dismissed: boolean;
	read: boolean;
}

export interface UserProfile {
	name: string;
	email: string;
	phone?: string;
	avatar: string | null;
	plan: 'free' | 'premium';
	preferences: {
		theme: 'light' | 'dark' | 'system';
		language: 'id' | 'en';
		currency: string;
		notifications: {
			billReminder: boolean;
			overBudgetAlert: boolean;
			weeklyReport: boolean;
			promoUpdate: boolean;
		};
	};
}

export interface AppState {
	transactions: Transaction[];
	budgetCategories: BudgetCategory[];
	financialGoals: FinancialGoal[];
	investments: Investment[];
	wallets: Wallet[];
	insights: Insight[];
	userProfile: UserProfile;
	version: number;
}

// ─── Default data ─────────────────────────────────────────────────────────────

const defaultInvestments: Investment[] = [
	{ id: 1, product: 'Reksa Dana Pasar Uang', provider: 'Manulife Dana Kas II', value: 8750000, profit: 750000, roi: 9.8, color: '#FF8A4C' },
	{ id: 2, product: 'Saham', provider: 'BBCA - Bank Central Asia', value: 11445000, profit: 1945000, roi: 20.5, color: '#FB923C' },
	{ id: 3, product: 'Emas Digital', provider: 'Pegadaian Digital', value: 6867000, profit: 467000, roi: 7.3, color: '#FDBA74' },
	{ id: 4, product: 'Obligasi', provider: 'ORI023 - Obligasi Negara', value: 4578000, profit: 328000, roi: 7.8, color: '#F59E0B' },
	{ id: 5, product: 'Deposito', provider: 'BCA Deposito Berjangka', value: 2280000, profit: 90000, roi: 4.2, color: '#FED7AA' }
];

const defaultProfile: UserProfile = {
	name: dummyUser.name,
	email: dummyUser.email,
	avatar: dummyUser.avatar,
	plan: dummyUser.plan as 'free' | 'premium',
	preferences: {
		theme: 'light',
		language: 'id',
		currency: 'IDR',
		notifications: {
			billReminder: true,
			overBudgetAlert: true,
			weeklyReport: false,
			promoUpdate: false
		}
	}
};

function getDefaults(): AppState {
	return {
		transactions: dummyTransactions.map((t) => ({
			...t,
			amount: Math.abs(t.amount),
			type: t.type as 'income' | 'expense'
		})),
		budgetCategories: dummyBudgets.map((b, i) => ({ ...b, id: i + 1 })),
		financialGoals: dummyGoals.map((g) => ({ ...g })),
		investments: defaultInvestments,
		wallets: dummyWallets.map((w) => ({ ...w, type: w.type as 'Bank' | 'E-Wallet' | 'Tunai' })),
		insights: dummyInsights.map((ins) => ({
			...ins,
			type: ins.type as 'warning' | 'info' | 'success',
			dismissed: false,
			read: false
		})),
		userProfile: defaultProfile,
		version: 1
	};
}

// ─── Load / persist ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'finova_state';

function loadState(): AppState {
	if (typeof localStorage === 'undefined') return getDefaults();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return getDefaults();
		return JSON.parse(raw) as AppState;
	} catch {
		console.warn('[finova] finova_state corrupt, using defaults');
		return getDefaults();
	}
}

function saveState(state: AppState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		console.warn('[finova] localStorage quota exceeded, running in-memory only');
	}
}

// ─── Writable stores ──────────────────────────────────────────────────────────

const initial = loadState();

export const transactions = writable<Transaction[]>(initial.transactions);
export const budgetCategories = writable<BudgetCategory[]>(initial.budgetCategories);
export const financialGoals = writable<FinancialGoal[]>(initial.financialGoals);
export const investments = writable<Investment[]>(initial.investments);
export const wallets = writable<Wallet[]>(initial.wallets);
export const insights = writable<Insight[]>(initial.insights);
export const userProfile = writable<UserProfile>(initial.userProfile);

// ─── Derived stores ───────────────────────────────────────────────────────────

export const totalSaldo = derived(wallets, ($w) => $w.reduce((s, w) => s + w.balance, 0));

export const totalPemasukan = derived(transactions, ($t) =>
	$t.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
);

export const totalPengeluaran = derived(transactions, ($t) =>
	$t.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
);

export const sisaBudget = derived(
	[totalPemasukan, totalPengeluaran],
	([$inc, $exp]) => $inc - $exp
);

// ─── Persistence: subscribe all stores and save on change ────────────────────

let _transactions = initial.transactions;
let _budgets = initial.budgetCategories;
let _goals = initial.financialGoals;
let _investments = initial.investments;
let _wallets = initial.wallets;
let _insights = initial.insights;
let _profile = initial.userProfile;

function persist() {
	saveState({
		transactions: _transactions,
		budgetCategories: _budgets,
		financialGoals: _goals,
		investments: _investments,
		wallets: _wallets,
		insights: _insights,
		userProfile: _profile,
		version: 1
	});
}

transactions.subscribe((v) => { _transactions = v; persist(); });
budgetCategories.subscribe((v) => { _budgets = v; persist(); });
financialGoals.subscribe((v) => { _goals = v; persist(); });
investments.subscribe((v) => { _investments = v; persist(); });
wallets.subscribe((v) => { _wallets = v; persist(); });
insights.subscribe((v) => { _insights = v; persist(); });
userProfile.subscribe((v) => { _profile = v; persist(); });

// ─── ID generator ─────────────────────────────────────────────────────────────

function genId(list: { id: number }[]): number {
	return list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
}

// ─── Transaction actions ──────────────────────────────────────────────────────

export function addTransaction(tx: Omit<Transaction, 'id'>): void {
	if (!tx.merchant?.trim() || tx.amount <= 0) return;
	transactions.update((list) => [...list, { ...tx, id: genId(list) }]);
	showToast('Transaksi berhasil ditambahkan', 'success');
}

export function updateTransaction(id: number, tx: Partial<Transaction>): void {
	transactions.update((list) => list.map((t) => (t.id === id ? { ...t, ...tx } : t)));
	showToast('Transaksi berhasil diperbarui', 'success');
}

export function deleteTransaction(id: number): void {
	transactions.update((list) => list.filter((t) => t.id !== id));
	showToast('Transaksi berhasil dihapus', 'success');
}

// ─── Budget actions ───────────────────────────────────────────────────────────

export function addBudget(b: Omit<BudgetCategory, 'id'>): void {
	if (!b.name?.trim() || b.budget <= 0) return;
	budgetCategories.update((list) => [...list, { ...b, id: genId(list) }]);
	showToast('Anggaran berhasil dibuat', 'success');
}

export function updateBudget(id: number, b: Partial<BudgetCategory>): void {
	budgetCategories.update((list) => list.map((c) => (c.id === id ? { ...c, ...b } : c)));
	showToast('Anggaran berhasil diperbarui', 'success');
}

export function deleteBudget(id: number): void {
	budgetCategories.update((list) => list.filter((c) => c.id !== id));
	showToast('Anggaran berhasil dihapus', 'success');
}

// ─── Goal actions ─────────────────────────────────────────────────────────────

export function addGoal(g: Omit<FinancialGoal, 'id'>): void {
	if (!g.name?.trim() || g.target <= 0) return;
	financialGoals.update((list) => [...list, { ...g, id: genId(list) }]);
	showToast('Tujuan berhasil dibuat', 'success');
}

export function updateGoal(id: number, g: Partial<FinancialGoal>): void {
	financialGoals.update((list) => list.map((goal) => (goal.id === id ? { ...goal, ...g } : goal)));
	showToast('Tujuan berhasil diperbarui', 'success');
}

export function deleteGoal(id: number): void {
	financialGoals.update((list) => list.filter((g) => g.id !== id));
	showToast('Tujuan berhasil dihapus', 'success');
}

export function addFundsToGoal(id: number, amount: number): void {
	if (amount <= 0) return;
	financialGoals.update((list) =>
		list.map((g) =>
			g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
		)
	);
	showToast('Dana berhasil ditambahkan', 'success');
}

// ─── Investment actions ───────────────────────────────────────────────────────

export function addInvestment(inv: Omit<Investment, 'id'>): void {
	if (!inv.product?.trim() || inv.value <= 0) return;
	investments.update((list) => [...list, { ...inv, id: genId(list) }]);
	showToast('Investasi berhasil ditambahkan', 'success');
}

export function updateInvestment(id: number, inv: Partial<Investment>): void {
	investments.update((list) => list.map((i) => (i.id === id ? { ...i, ...inv } : i)));
	showToast('Investasi berhasil diperbarui', 'success');
}

export function deleteInvestment(id: number): void {
	investments.update((list) => list.filter((i) => i.id !== id));
	showToast('Investasi berhasil dihapus', 'success');
}

// ─── Wallet actions ───────────────────────────────────────────────────────────

export function addWallet(w: Omit<Wallet, 'id'>): void {
	if (!w.name?.trim() || w.balance < 0) return;
	wallets.update((list) => [...list, { ...w, id: genId(list) }]);
	showToast('Rekening berhasil ditambahkan', 'success');
}

export function updateWallet(id: number, w: Partial<Wallet>): void {
	wallets.update((list) => list.map((wallet) => (wallet.id === id ? { ...wallet, ...w } : wallet)));
	showToast('Rekening berhasil diperbarui', 'success');
}

export function deleteWallet(id: number): void {
	wallets.update((list) => list.filter((w) => w.id !== id));
	showToast('Rekening berhasil dihapus', 'success');
}

// ─── Profile & insight actions ────────────────────────────────────────────────

export function updateUserProfile(patch: Partial<UserProfile>): void {
	userProfile.update((p) => ({ ...p, ...patch }));
	showToast('Profil berhasil diperbarui', 'success');
}

export function dismissInsight(id: number): void {
	insights.update((list) => list.map((ins) => (ins.id === id ? { ...ins, dismissed: true } : ins)));
}

export function markInsightRead(id: number): void {
	insights.update((list) => list.map((ins) => (ins.id === id ? { ...ins, read: true } : ins)));
	showToast('Insight ditandai sudah dibaca', 'info');
}
