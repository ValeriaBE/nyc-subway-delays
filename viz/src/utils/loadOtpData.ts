import * as d3 from "d3";
import type { OtpRow, DayTypeLabel } from "../types";
import { QUEENS_LINES } from "../lineMeta";

interface OtpRowRaw {
  line: string;
  division: string;
  day_type: string;
  day_type_label: string;
  month_date: string;
  year: string;
  period: string;
  otp_pct: string;
  on_time: string;
  scheduled: string;
}

export async function loadOtpData(): Promise<OtpRow[]> {
  const url = `${import.meta.env.BASE_URL}data/otp_for_viz.csv`;
  const rows = await d3.csv<OtpRowRaw>(url);
  return rows
    .filter((d) => d.line && d.month_date && d.otp_pct)
    .filter((d) => QUEENS_LINES.includes(d.line as any)) // keep only R/7/M/F/E
    .map((d) => {
      const dayTypeLabel = (d.day_type_label || "Other") as DayTypeLabel;
const otpRaw = Number(d.otp_pct);
const otpPct = otpRaw <= 1.5 ? otpRaw * 100 : otpRaw; // ✅ normalize to 0–100

      return {
        line: d.line,
        division: d.division,
        day_type: d.day_type,
        day_type_label: dayTypeLabel,
        month_date: new Date(d.month_date),
        year: Number(d.year),
        period: d.period,
        otp_pct: otpPct,
        on_time: Number(d.on_time),
        scheduled: Number(d.scheduled),
      };
    })
    .filter((d) => !Number.isNaN(d.month_date.getTime()) && !Number.isNaN(d.otp_pct));
}
