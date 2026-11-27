import { Download, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/routes";
import styles from "./timesheet-filters.module.css";

export function TimesheetFilters({ from, to }: { from: string; to: string }) {
  return (
    <form
      method="get"
      className={styles.filters}
      aria-label="Filter rentang tanggal"
      data-timesheet-filters
    >
      <div className={styles.field}>
        <label htmlFor="from">
          Dari <span>(Opsional)</span>
        </label>
        <input
          id="from"
          type="date"
          name="from"
          defaultValue={from}
          placeholder="Tanggal mulai"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="to">
          Sampai <span>(Opsional)</span>
        </label>
        <input
          id="to"
          type="date"
          name="to"
          defaultValue={to}
          placeholder="Tanggal selesai"
        />
      </div>
      <div className={styles.actions}>
        <Button type="submit" className={styles.apply}>
          <ListFilter className="size-4" aria-hidden="true" /> Filter
        </Button>
        <Button asChild variant="outline" className={styles.export}>
          <a href={API_ROUTES.exportTimesheetWithRange(from, to)} download>
            <Download className="size-4" aria-hidden="true" /> Unduh CSV
          </a>
        </Button>
      </div>
    </form>
  );
}
