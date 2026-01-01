// src/types.ts

export type DayTypeLabel = "Weekday" | "Weekend";

export interface OtpRow {
  line: string;
  division: string;
  day_type: string;
  day_type_label: DayTypeLabel;
  month_date: Date;
  year: number;
  period: string;
  otp_pct: number;
  on_time: number;
  scheduled: number;
}
