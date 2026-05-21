# Requirements Document

## Introduction

Finova adalah aplikasi pencatatan keuangan berbasis SvelteKit 5 + TypeScript yang saat ini menampilkan data statis dari `dummy.ts`. Fitur ini bertujuan membuat seluruh halaman aplikasi menjadi interaktif penuh sebagai prototype — tanpa backend atau database — menggunakan state in-memory dan localStorage sebagai persistence sementara.

Cakupan meliputi 11 halaman: Dashboard, Transaksi, Anggaran, Tujuan, OCR, Insight, Laporan, Investasi, Rekening, Pengaturan, dan Bantuan.

## Glossary

- **App_Store**: Svelte store terpusat (`$lib/stores/`) yang menyimpan seluruh state aplikasi secara in-memory dan disinkronkan ke localStorage.
- **Transaction**: Entitas transaksi keuangan dengan field: id, merchant, category, date, amount, type (income/expense), icon, walletId, notes.
- **Budget**: Entitas anggaran per kategori dengan field: id, name, budget, used, color, icon.
- **Goal**: Entitas tujuan keuangan dengan field: id, name, target, current, deadline, icon, color.
- **Investment**: Entitas investasi dengan field: id, product, provider, value, profit, roi, color.
- **Wallet**: Entitas rekening/dompet dengan field: id, name, type, balance, icon, color.
- **Insight**: Entitas insight AI dengan field: id, type, title, description, color, dismissed, read.
- **Modal**: Komponen overlay dialog untuk form tambah/edit.
- **Toast**: Notifikasi singkat yang muncul setelah aksi berhasil atau gagal.
- **OCR_Simulator**: Modul yang mensimulasikan proses OCR dengan delay dan menghasilkan data transaksi mock.
- **User_Profile**: Data profil pengguna dengan field: name, email, avatar, plan, preferences.

---

## Requirements

### Requirement 1: Centralized In-Memory State Store

**User Story:** As a developer, I want a centralized Svelte store that holds all app data, so that all pages share and mutate the same state without a backend.

#### Acceptance Criteria

1. THE App_Store SHALL initialize its state from `dummy.ts` data as default values on first load.
2. WHEN the App_Store state changes, THE App_Store SHALL persist the updated state to localStorage under the key `finova_state`.
3. WHEN the application loads, THE App_Store SHALL rehydrate state from localStorage if a saved state exists, otherwise use default values from `dummy.ts`.
4. THE App_Store SHALL expose writable stores for: transactions, budgetCategories, financialGoals, investments, wallets, insights, userProfile, and summary.
5. THE App_Store SHALL expose derived stores for: totalSaldo (sum of all wallet balances), totalPemasukan, totalPengeluaran, and sisaBudget.
6. IF localStorage data is corrupted or unparseable, THEN THE App_Store SHALL fall back to default values from `dummy.ts` and log a warning to the console.

---

### Requirement 2: Transaction Management (Halaman Transaksi)

**User Story:** As a user, I want to add, edit, delete, search, filter, and sort transactions, so that I can manage my financial records interactively.

#### Acceptance Criteria

1. WHEN the user clicks "Tambah Transaksi", THE Transaction_Form_Modal SHALL open with empty fields for: merchant, amount, category, date, type (income/expense), walletId, and notes.
2. WHEN the user submits a valid Transaction_Form_Modal, THE App_Store SHALL add the new Transaction to the transactions list with a unique generated id, and THE Toast SHALL display "Transaksi berhasil ditambahkan".
3. IF the user submits a Transaction_Form_Modal with amount ≤ 0 or empty merchant, THEN THE Transaction_Form_Modal SHALL display inline validation errors and SHALL NOT add the transaction.
4. WHEN the user clicks the action menu (CircleEllipsis) on a Transaction row, THE Transaction_Action_Menu SHALL display options: "Edit" and "Hapus".
5. WHEN the user selects "Edit" from Transaction_Action_Menu, THE Transaction_Form_Modal SHALL open pre-filled with the selected Transaction's data.
6. WHEN the user submits an edited Transaction_Form_Modal, THE App_Store SHALL update the matching Transaction in the transactions list, and THE Toast SHALL display "Transaksi berhasil diperbarui".
7. WHEN the user selects "Hapus" from Transaction_Action_Menu, THE Confirm_Dialog SHALL ask for confirmation before deletion.
8. WHEN the user confirms deletion in Confirm_Dialog, THE App_Store SHALL remove the Transaction from the transactions list, and THE Toast SHALL display "Transaksi berhasil dihapus".
9. WHEN the user types in the search input, THE Transaction_List SHALL filter displayed transactions to those whose merchant or category contains the search string (case-insensitive), within 300ms of the last keystroke.
10. WHEN the user selects a category from the filter dropdown, THE Transaction_List SHALL display only transactions matching that category.
11. WHEN the user selects a tab (Semua / Pemasukan / Pengeluaran), THE Transaction_List SHALL filter transactions by the selected type.
12. WHEN a Transaction is added or deleted, THE App_Store derived stores (totalPemasukan, totalPengeluaran, sisaBudget) SHALL recalculate automatically.

---

### Requirement 3: Budget Management (Halaman Anggaran)

**User Story:** As a user, I want to add, edit, and delete budget categories and update budget amounts, so that I can control my monthly spending plan.

#### Acceptance Criteria

1. WHEN the user clicks "Buat Anggaran Baru", THE Budget_Form_Modal SHALL open with fields for: name, budget amount, icon, and color.
2. WHEN the user submits a valid Budget_Form_Modal, THE App_Store SHALL add the new Budget to budgetCategories, and THE Toast SHALL display "Anggaran berhasil dibuat".
3. IF the user submits a Budget_Form_Modal with budget amount ≤ 0 or empty name, THEN THE Budget_Form_Modal SHALL display inline validation errors and SHALL NOT add the budget.
4. WHEN the user clicks the action menu (CircleEllipsis) on a Budget row, THE Budget_Action_Menu SHALL display options: "Edit" and "Hapus".
5. WHEN the user selects "Edit" from Budget_Action_Menu, THE Budget_Form_Modal SHALL open pre-filled with the selected Budget's data.
6. WHEN the user submits an edited Budget_Form_Modal, THE App_Store SHALL update the matching Budget in budgetCategories, and THE Toast SHALL display "Anggaran berhasil diperbarui".
7. WHEN the user selects "Hapus" from Budget_Action_Menu and confirms, THE App_Store SHALL remove the Budget from budgetCategories, and THE Toast SHALL display "Anggaran berhasil dihapus".
8. WHILE a Budget's used amount ≥ 85% of its budget amount, THE Budget_Row SHALL display a visual warning indicator (red/orange color on the progress bar and percentage label).
9. WHEN budgetCategories changes, THE Anggaran_Summary_Cards SHALL recalculate totalBudget, totalUsed, totalLeft, and usedPct automatically.

---

### Requirement 4: Financial Goals Management (Halaman Tujuan)

**User Story:** As a user, I want to add, edit, delete financial goals and add funds to them, so that I can track my savings progress interactively.

#### Acceptance Criteria

1. WHEN the user clicks "Buat Tujuan Baru" or "+ Buat Tujuan Keuangan Baru", THE Goal_Form_Modal SHALL open with fields for: name, target amount, current amount, deadline, icon, and color.
2. WHEN the user submits a valid Goal_Form_Modal, THE App_Store SHALL add the new Goal to financialGoals, and THE Toast SHALL display "Tujuan berhasil dibuat".
3. IF the user submits a Goal_Form_Modal with target ≤ 0 or empty name or deadline in the past, THEN THE Goal_Form_Modal SHALL display inline validation errors and SHALL NOT add the goal.
4. WHEN the user clicks the action menu (CircleEllipsis) on a Goal card, THE Goal_Action_Menu SHALL display options: "Edit", "Tambah Dana", and "Hapus".
5. WHEN the user selects "Tambah Dana" from Goal_Action_Menu, THE Add_Funds_Modal SHALL open with a numeric input for the amount to add.
6. WHEN the user submits a valid Add_Funds_Modal, THE App_Store SHALL increase the Goal's current amount by the entered value (capped at the target), and THE Toast SHALL display "Dana berhasil ditambahkan".
7. WHEN the user selects "Edit" from Goal_Action_Menu, THE Goal_Form_Modal SHALL open pre-filled with the selected Goal's data.
8. WHEN the user submits an edited Goal_Form_Modal, THE App_Store SHALL update the matching Goal, and THE Toast SHALL display "Tujuan berhasil diperbarui".
9. WHEN the user selects "Hapus" from Goal_Action_Menu and confirms, THE App_Store SHALL remove the Goal, and THE Toast SHALL display "Tujuan berhasil dihapus".
10. WHEN a Goal's current amount equals its target amount, THE Goal_Row SHALL display a "Tercapai!" badge and a completion visual indicator.
11. WHEN financialGoals changes, THE Tujuan_Summary_Cards SHALL recalculate totalGoals, totalCurrent, totalTarget, and avgProgress automatically.

---

### Requirement 5: OCR Scan Simulation (Halaman OCR)

**User Story:** As a user, I want to simulate the OCR scan flow with a mock result and save the extracted transaction, so that I can experience the full OCR prototype workflow.

#### Acceptance Criteria

1. WHEN the user clicks "Buka Kamera" or uploads an image via "Galeri", THE OCR_Simulator SHALL start a simulated processing sequence with a progress bar animating from 0% to 100% over approximately 2.4 seconds.
2. WHEN the OCR_Simulator completes processing, THE Extraction_Result_Panel SHALL display the mock OCR data from `ocrResult` in `dummy.ts` (merchant, date, items, total).
3. WHEN the user clicks "Edit" in the Extraction_Result_Panel, THE OCR_Edit_Mode SHALL allow inline editing of merchant name, date, each item's name and price, and category.
4. WHEN the user changes the category dropdown in the Extraction_Result_Panel, THE selected category SHALL update immediately in the UI state.
5. WHEN the user clicks "Simpan Transaksi", THE App_Store SHALL add a new Transaction derived from the OCR result (using current merchant, total, category, date, notes), and THE Toast SHALL display "Transaksi OCR berhasil disimpan".
6. AFTER "Simpan Transaksi" is clicked successfully, THE OCR_Page SHALL reset to its idle state (preview cleared, progress at 0%, form cleared).
7. IF the user clicks "Simpan Transaksi" while OCR_Simulator is still processing (progress < 100%), THEN THE save button SHALL be disabled and display a loading indicator.

---

### Requirement 6: Insight Interaction (Halaman Insight)

**User Story:** As a user, I want to dismiss or mark insight cards as read, so that I can manage which insights are relevant to me.

#### Acceptance Criteria

1. WHEN the user clicks "Detail" on an Insight card, THE Insight_Detail_Panel SHALL expand inline to show the full description and a "Tandai Sudah Dibaca" button.
2. WHEN the user clicks "Tandai Sudah Dibaca", THE App_Store SHALL mark the Insight as read (read: true), THE Insight_Card SHALL display a visual "read" state (reduced opacity or a checkmark badge), and THE Toast SHALL display "Insight ditandai sudah dibaca".
3. WHEN the user clicks the dismiss (×) button on an Insight card, THE App_Store SHALL mark the Insight as dismissed (dismissed: true) and THE Insight_Card SHALL be removed from the visible list with a fade-out animation.
4. WHEN all Insights are dismissed, THE Insight_List SHALL display an empty state message: "Tidak ada insight baru saat ini."
5. WHEN the user changes the period filter (Bulan Ini / 3 Bulan / Tahun Ini), THE Insight_Page SHALL update the displayed period label and show a simulated loading state for 500ms before re-rendering the charts.

---

### Requirement 7: Report Filtering and Export Simulation (Halaman Laporan)

**User Story:** As a user, I want to filter reports by date range and simulate an export, so that I can interact with the reporting features as a prototype.

#### Acceptance Criteria

1. WHEN the user clicks the date range button ("1 - 31 Mei 2026"), THE Date_Range_Picker SHALL open allowing selection of start and end dates.
2. WHEN the user confirms a date range in Date_Range_Picker, THE Laporan_Page SHALL update the displayed date range label and recalculate the stats cards and charts based on transactions within that range.
3. WHEN the user clicks "Export" and selects "PDF", THE Export_Simulator SHALL display a Toast: "Mengunduh laporan PDF... (simulasi)" and after 1.5 seconds display a success Toast: "Laporan PDF berhasil diunduh (simulasi)".
4. WHEN the user clicks "Export" and selects "Excel", THE Export_Simulator SHALL display a Toast: "Mengunduh laporan Excel... (simulasi)" and after 1.5 seconds display a success Toast: "Laporan Excel berhasil diunduh (simulasi)".
5. WHEN the user clicks "Filter", THE Filter_Panel SHALL open with options to filter by: category, transaction type (income/expense), and minimum/maximum amount.
6. WHEN the user applies filters in Filter_Panel, THE Laporan_Charts and transaction summary SHALL update to reflect only the filtered data.

---

### Requirement 8: Investment Management (Halaman Investasi)

**User Story:** As a user, I want to add, edit, and delete investment entries, so that I can manage my investment portfolio interactively.

#### Acceptance Criteria

1. WHEN the user clicks "Tambah Investasi", THE Investment_Form_Modal SHALL open with fields for: product name, provider, value, profit, and ROI percentage.
2. WHEN the user submits a valid Investment_Form_Modal, THE App_Store SHALL add the new Investment to the investments list, and THE Toast SHALL display "Investasi berhasil ditambahkan".
3. IF the user submits an Investment_Form_Modal with value ≤ 0 or empty product name, THEN THE Investment_Form_Modal SHALL display inline validation errors and SHALL NOT add the investment.
4. WHEN the user clicks on an Investment row in the table, THE Investment_Action_Menu SHALL display options: "Edit" and "Hapus".
5. WHEN the user selects "Edit" from Investment_Action_Menu, THE Investment_Form_Modal SHALL open pre-filled with the selected Investment's data.
6. WHEN the user submits an edited Investment_Form_Modal, THE App_Store SHALL update the matching Investment, and THE Toast SHALL display "Investasi berhasil diperbarui".
7. WHEN the user selects "Hapus" from Investment_Action_Menu and confirms, THE App_Store SHALL remove the Investment, and THE Toast SHALL display "Investasi berhasil dihapus".
8. WHEN investments changes, THE Investasi_Summary_Cards SHALL recalculate totalValue, totalProfit, and investment count automatically.

---

### Requirement 9: Wallet/Account Management (Halaman Rekening)

**User Story:** As a user, I want to add, edit, and delete wallets/accounts, so that I can manage my financial accounts interactively.

#### Acceptance Criteria

1. THE Rekening_Page SHALL display all wallets from the App_Store wallets list with their name, type, balance, and icon.
2. WHEN the user clicks "Tambah Rekening", THE Wallet_Form_Modal SHALL open with fields for: name, type (Bank / E-Wallet / Tunai), balance, icon, and color.
3. WHEN the user submits a valid Wallet_Form_Modal, THE App_Store SHALL add the new Wallet to the wallets list, and THE Toast SHALL display "Rekening berhasil ditambahkan".
4. IF the user submits a Wallet_Form_Modal with empty name or balance < 0, THEN THE Wallet_Form_Modal SHALL display inline validation errors and SHALL NOT add the wallet.
5. WHEN the user clicks the action menu on a Wallet card, THE Wallet_Action_Menu SHALL display options: "Edit" and "Hapus".
6. WHEN the user selects "Edit" from Wallet_Action_Menu, THE Wallet_Form_Modal SHALL open pre-filled with the selected Wallet's data.
7. WHEN the user submits an edited Wallet_Form_Modal, THE App_Store SHALL update the matching Wallet, and THE Toast SHALL display "Rekening berhasil diperbarui".
8. WHEN the user selects "Hapus" from Wallet_Action_Menu and confirms, THE App_Store SHALL remove the Wallet, and THE Toast SHALL display "Rekening berhasil dihapus".
9. WHEN wallets changes, THE App_Store derived store totalSaldo SHALL recalculate as the sum of all wallet balances automatically.

---

### Requirement 10: Settings (Halaman Pengaturan)

**User Story:** As a user, I want to update my profile and preferences and save settings, so that I can personalize the app experience.

#### Acceptance Criteria

1. WHEN the user clicks "Edit Profil", THE Profile_Edit_Modal SHALL open with editable fields for: name, email, and phone number.
2. WHEN the user submits a valid Profile_Edit_Modal, THE App_Store SHALL update the userProfile, THE sidebar and profile card SHALL reflect the new name immediately, and THE Toast SHALL display "Profil berhasil diperbarui".
3. IF the user submits a Profile_Edit_Modal with an empty name or invalid email format, THEN THE Profile_Edit_Modal SHALL display inline validation errors and SHALL NOT update the profile.
4. WHEN the user clicks a settings item (e.g., "Ubah Password", "PIN Aplikasi"), THE Settings_Item_Modal SHALL open with a relevant form or informational panel for that setting.
5. WHEN the user toggles a notification preference (e.g., "Pengingat Tagihan"), THE App_Store SHALL update the corresponding preference in userProfile.preferences, and THE toggle SHALL reflect the new state immediately.
6. WHEN the user selects a theme option (e.g., "Tema Gelap"), THE App_Store SHALL update userProfile.preferences.theme, and THE Toast SHALL display "Pengaturan tampilan disimpan".
7. WHEN the user selects a language option, THE App_Store SHALL update userProfile.preferences.language, and THE Toast SHALL display "Bahasa berhasil diubah".

---

### Requirement 11: Help / FAQ Interaction (Halaman Bantuan)

**User Story:** As a user, I want to interact with the FAQ accordion and submit a contact form, so that I can get help and provide feedback.

#### Acceptance Criteria

1. WHEN the user clicks a FAQ question, THE FAQ_Accordion SHALL expand to show the answer with a smooth height animation.
2. WHEN the user clicks an already-open FAQ question, THE FAQ_Accordion SHALL collapse it with a smooth height animation.
3. THE FAQ_Accordion SHALL allow only one question to be open at a time (clicking a new question closes the previously open one).
4. WHEN the user clicks "Live Chat" or "Email Support", THE Contact_Form_Modal SHALL open with fields for: name, email, subject, and message.
5. WHEN the user submits a valid Contact_Form_Modal, THE Toast SHALL display "Pesan berhasil dikirim! Tim kami akan menghubungimu segera." and THE Contact_Form_Modal SHALL close.
6. IF the user submits a Contact_Form_Modal with empty name, invalid email, or empty message, THEN THE Contact_Form_Modal SHALL display inline validation errors and SHALL NOT submit.
7. WHEN the user clicks "Panduan Pengguna", THE Guide_Panel SHALL expand inline or open a modal displaying a list of feature guides with brief descriptions.

---

### Requirement 12: Global Toast Notification System

**User Story:** As a user, I want to see brief feedback notifications after every action, so that I know whether my actions succeeded or failed.

#### Acceptance Criteria

1. THE Toast_System SHALL display a floating notification at the top-right of the screen after any CRUD operation.
2. WHEN a Toast is displayed, THE Toast SHALL automatically dismiss after 3 seconds.
3. THE Toast_System SHALL support three types: success (green), error (red), and info (orange/primary).
4. WHEN multiple actions are triggered in quick succession, THE Toast_System SHALL queue and display toasts sequentially without overlap.
5. WHEN the user clicks a Toast, THE Toast SHALL dismiss immediately.

---

### Requirement 13: Global Modal and Confirm Dialog System

**User Story:** As a developer, I want reusable Modal and ConfirmDialog components, so that all pages use a consistent interaction pattern for forms and destructive actions.

#### Acceptance Criteria

1. THE Modal_Component SHALL render as a centered overlay with a glassmorphism backdrop (backdrop-blur, semi-transparent background) matching the Finova design system.
2. WHEN a Modal is open, THE Modal_Component SHALL trap focus within the modal and prevent scrolling of the background page.
3. WHEN the user presses Escape or clicks the backdrop, THE Modal_Component SHALL close.
4. THE Confirm_Dialog SHALL display a title, description, and two buttons: "Batal" (cancel) and a destructive action button (e.g., "Hapus").
5. WHEN the user clicks "Batal" in Confirm_Dialog, THE Confirm_Dialog SHALL close without performing any action.

---

### Requirement 14: Dashboard Interactivity

**User Story:** As a user, I want the dashboard to reflect live state changes and have clickable quick actions, so that it serves as a real-time overview of my finances.

#### Acceptance Criteria

1. WHEN App_Store state changes (transactions, wallets, budgets, goals), THE Dashboard_Summary_Cards SHALL reactively display the updated totalSaldo, totalPemasukan, totalPengeluaran, and sisaBudget.
2. WHEN the user clicks a Quick Action button on the dashboard, THE App SHALL navigate to the corresponding page (e.g., "Tambah Transaksi" → /transaksi, "Scan Struk" → /ocr).
3. WHEN the user clicks a recent transaction row on the dashboard, THE App SHALL navigate to /transaksi.
4. WHEN the user clicks "Buat Tujuan Baru" on the dashboard, THE App SHALL navigate to /tujuan.
5. WHEN the user clicks the Eye icon on the Total Saldo card, THE Saldo_Value SHALL toggle between showing the actual value and a masked value ("Rp ••••••").
