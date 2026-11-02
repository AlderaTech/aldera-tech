/**
 * Pill bar ringkas untuk tab detail proyek dan pemanggil dashboard yang tersedia.
 * AI Relay pengguna/admin dan kalkulator admin memakai WorkspaceSegmentedTabs
 * agar setiap pilihan mengisi track navigasi secara merata.
 */
export const dashboardTabsListClass =
  "h-auto w-full max-w-full justify-center gap-1 overflow-x-auto rounded-[0.85rem] border border-slate-200/90 bg-white p-1 text-slate-500 shadow-2xs";

export const dashboardTabsTriggerClass =
  "min-h-9 shrink-0 sm:flex-1 gap-1.5 rounded-[0.6rem] px-3 py-1.5 text-[0.8125rem] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white";
