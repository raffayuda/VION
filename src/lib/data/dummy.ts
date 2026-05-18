// Dummy data for Finova frontend

export const user = {
	name: 'Dimas Prayoga',
	email: 'dimas.prayoga@gmail.com',
	avatar: null,
	plan: 'premium'
};

export const summary = {
	totalSaldo: 24560000,
	pemasukan: 15850000,
	pengeluaran: 8930000,
	sisaBudget: 6920000,
	pemasukanChange: 12.7,
	pengeluaranChange: 3.2,
	sisaBudgetChange: -5.1
};

export const transactions = [
	{
		id: 1,
		merchant: 'Alfamart - Sudirman',
		category: 'Makanan & Minuman',
		date: '2026-05-18',
		amount: -19500,
		type: 'expense',
		icon: '🛒'
	},
	{
		id: 2,
		merchant: 'Gaji Bulanan',
		category: 'Pemasukan',
		date: '2026-05-17',
		amount: 8000000,
		type: 'income',
		icon: '💼'
	},
	{
		id: 3,
		merchant: 'GrabBike',
		category: 'Transportasi',
		date: '2026-05-17',
		amount: -24000,
		type: 'expense',
		icon: '🛵'
	},
	{
		id: 4,
		merchant: 'Tagihan Listrik',
		category: 'Tagihan & Utilitas',
		date: '2026-05-16',
		amount: -350000,
		type: 'expense',
		icon: '⚡'
	},
	{
		id: 5,
		merchant: 'Kopi Kenangan',
		category: 'Makanan & Minuman',
		date: '2026-05-16',
		amount: -45000,
		type: 'expense',
		icon: '☕'
	},
	{
		id: 6,
		merchant: 'Freelance Project',
		category: 'Pemasukan',
		date: '2026-05-15',
		amount: 3500000,
		type: 'income',
		icon: '💻'
	},
	{
		id: 7,
		merchant: 'Indomaret',
		category: 'Makanan & Minuman',
		date: '2026-05-15',
		amount: -67000,
		type: 'expense',
		icon: '🛒'
	},
	{
		id: 8,
		merchant: 'Netflix',
		category: 'Hiburan',
		date: '2026-05-14',
		amount: -54000,
		type: 'expense',
		icon: '🎬'
	},
	{
		id: 9,
		merchant: 'Tokopedia',
		category: 'Belanja',
		date: '2026-05-13',
		amount: -245000,
		type: 'expense',
		icon: '📦'
	},
	{
		id: 10,
		merchant: 'Bonus Kinerja',
		category: 'Pemasukan',
		date: '2026-05-12',
		amount: 2000000,
		type: 'income',
		icon: '🎁'
	}
];

export const chartData = [
	{ date: '1 Mei', pemasukan: 2000000, pengeluaran: 800000 },
	{ date: '5 Mei', pemasukan: 3500000, pengeluaran: 1200000 },
	{ date: '10 Mei', pemasukan: 1800000, pengeluaran: 2100000 },
	{ date: '15 Mei', pemasukan: 4200000, pengeluaran: 1500000 },
	{ date: '20 Mei', pemasukan: 2800000, pengeluaran: 1800000 },
	{ date: '25 Mei', pemasukan: 1550000, pengeluaran: 1430000 }
];

export const budgetCategories = [
	{ name: 'Makanan & Minuman', budget: 2000000, used: 1450000, color: '#FF8A4C', icon: '🍜' },
	{ name: 'Transportasi', budget: 800000, used: 620000, color: '#60A5FA', icon: '🚗' },
	{ name: 'Belanja', budget: 1500000, used: 1380000, color: '#A78BFA', icon: '🛍️' },
	{ name: 'Hiburan', budget: 500000, used: 210000, color: '#4ADE80', icon: '🎮' },
	{ name: 'Tagihan & Utilitas', budget: 1200000, used: 1050000, color: '#F59E0B', icon: '⚡' }
];

export const financialGoals = [
	{
		id: 1,
		name: 'Dana Darurat',
		target: 30000000,
		current: 18000000,
		deadline: '2026-12-31',
		icon: '🛡️',
		color: '#4ADE80'
	},
	{
		id: 2,
		name: 'Liburan ke Jepang',
		target: 15000000,
		current: 7500000,
		deadline: '2026-09-30',
		icon: '✈️',
		color: '#60A5FA'
	},
	{
		id: 3,
		name: 'Beli Laptop',
		target: 12000000,
		current: 9600000,
		deadline: '2026-07-15',
		icon: '💻',
		color: '#A78BFA'
	},
	{
		id: 4,
		name: 'Renovasi Rumah',
		target: 50000000,
		current: 12500000,
		deadline: '2027-06-30',
		icon: '🏠',
		color: '#FF8A4C'
	}
];

export const wallets = [
	{ id: 1, name: 'BCA', type: 'Bank', balance: 13450000, icon: '🏦', color: '#003087' },
	{ id: 2, name: 'OVO', type: 'E-Wallet', balance: 1200000, icon: '💜', color: '#4C3494' },
	{ id: 3, name: 'GoPay', type: 'E-Wallet', balance: 548000, icon: '💚', color: '#00AED6' },
	{ id: 4, name: 'Cash', type: 'Tunai', balance: 320000, icon: '💵', color: '#4ADE80' }
];

export const insights = [
	{
		id: 1,
		type: 'warning',
		title: 'Pengeluaran makanan naik 25%',
		description:
			'Pengeluaran Makanan & Minuman meningkat 25% dari bulan lalu. Kamu bisa hemat Rp300.000 jika mengurangi coffee spending.',
		color: '#FF8A4C'
	},
	{
		id: 2,
		type: 'info',
		title: 'Transportasi jadi kategori terbesar',
		description:
			'Transportasi menjadi kategori pengeluaran terbesar bulan ini dengan total Rp620.000.',
		color: '#60A5FA'
	},
	{
		id: 3,
		type: 'success',
		title: 'Kamu sudah hemat bulan ini!',
		description: 'Rasio tabungan kamu bulan ini 43.7%, lebih baik dari rata-rata 35% bulan lalu.',
		color: '#4ADE80'
	}
];

export const categoryExpenses = [
	{ name: 'Makanan & Minuman', amount: 1450000, percentage: 32, color: '#FF8A4C' },
	{ name: 'Transportasi', amount: 620000, percentage: 14, color: '#60A5FA' },
	{ name: 'Belanja', amount: 1380000, percentage: 31, color: '#A78BFA' },
	{ name: 'Tagihan & Utilitas', amount: 1050000, percentage: 12, color: '#F59E0B' },
	{ name: 'Hiburan', amount: 210000, percentage: 5, color: '#4ADE80' },
	{ name: 'Lainnya', amount: 220000, percentage: 6, color: '#94A3B8' }
];

export const ocrResult = {
	merchant: 'Indomaret',
	date: '2026-05-18',
	items: [
		{ name: 'Indomie Goreng', qty: 2, price: 4500 },
		{ name: 'Aqua 600ml', qty: 1, price: 4000 },
		{ name: 'Roti Tawar', qty: 1, price: 13500 },
		{ name: 'Susu UHT', qty: 2, price: 8500 },
		{ name: 'Gula Pasir', qty: 1, price: 11000 }
	],
	total: 54500,
	paymentMethod: 'Tunai',
	category: 'Belanja'
};

export function formatRupiah(amount: number): string {
	const abs = Math.abs(amount);
	if (abs >= 1000000) {
		return `Rp ${(abs / 1000000).toFixed(1).replace('.0', '')}jt`;
	}
	return `Rp ${abs.toLocaleString('id-ID')}`;
}

export function formatRupiahFull(amount: number): string {
	return `Rp ${Math.abs(amount).toLocaleString('id-ID')}`;
}
