import * as d3 from "d3";
import React, { useMemo } from "react";
import type { OtpRow } from "../../types";
import type { QueensLine } from "../../lineMeta";
import { QUEENS_LINES, LINE_COLORS } from "../../lineMeta";
import { SubwayBullet } from "../SubwayBullet";

export function TimelineSmallMultiples({
  data,
  highlightLine,
  onSelectLine,
}: {
  data: OtpRow[];
  highlightLine: QueensLine;
  onSelectLine?: (l: QueensLine) => void;
}) {
  const width = 860;
  const height = 420;
  const margin = { top: 20, right: 18, bottom: 44, left: 50 };
  const clipId = "plot-clip";

  // ✅ 1) Filter to latest 12 months
  const dataLast12 = useMemo(() => {
    const maxDate = d3.max(data, (d) => d.month_date);
    if (!maxDate) return [];

    // end = start of max month; start = 11 months before (12 months total)
    const end = d3.timeMonth.floor(maxDate);
    const start = d3.timeMonth.offset(end, -11);

    return data.filter((d) => d.month_date >= start && d.month_date <= end);
  }, [data]);

  const byLine = useMemo(() => d3.group(dataLast12, (d) => d.line), [dataLast12]);

  const timeDomain = useMemo(() => {
    const extent = d3.extent(dataLast12, (d) => d.month_date) as [Date, Date];
    if (!extent[0] || !extent[1]) {
      // fallback domain so app doesn't crash if empty
      const now = new Date();
      return [d3.timeMonth.offset(now, -11), now] as [Date, Date];
    }
    return extent;
  }, [dataLast12]);

  const x = useMemo(
    () => d3.scaleTime().domain(timeDomain).range([margin.left, width - margin.right]),
    [timeDomain]
  );

  // ✅ keep y based on filtered window so the last-year shape is readable
  const y = useMemo(() => {
    const vals = dataLast12.map((d) => d.otp_pct).filter((v) => Number.isFinite(v));
    const min = d3.quantile(vals, 0.05) ?? d3.min(vals) ?? 60;
    const max = d3.quantile(vals, 0.95) ?? d3.max(vals) ?? 95;

    const pad = 2;
    const lo = Math.max(0, min - pad);
    const hi = Math.min(100, max + pad);

    return d3.scaleLinear().domain([lo, hi]).range([height - margin.bottom, margin.top]);
  }, [dataLast12]);

  const lineGen = useMemo(
    () =>
      d3
        .line<OtpRow>()
        .x((d) => x(d.month_date))
        .y((d) => y(d.otp_pct))
        .curve(d3.curveMonotoneX),
    [x, y]
  );

  // ✅ 2) Monthly ticks + month labels
  const monthTicks = useMemo(() => {
    // ticks at each month boundary within last 12 months
    const start = d3.timeMonth.floor(timeDomain[0]);
    const end = d3.timeMonth.floor(timeDomain[1]);
    return d3.timeMonths(start, d3.timeMonth.offset(end, 1)); // inclusive end
  }, [timeDomain]);

  const formatMonth = useMemo(() => d3.timeFormat("%b"), []);

  // Optional: show year label once (for context)
  const yearLabel = useMemo(() => d3.timeFormat("%Y")(timeDomain[1]), [timeDomain]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="bulletRow">
        {QUEENS_LINES.map((l) => (
          <button
            key={l}
            onClick={() => onSelectLine?.(l)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.10)",
              background: highlightLine === l ? "rgba(0,0,0,0.05)" : "white",
              cursor: "pointer",
            }}
          >
            <SubwayBullet line={l} size={22} />
            <span style={{ fontSize: 13 }}>{l}</span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={margin.left}
              y={margin.top}
              width={width - margin.left - margin.right}
              height={height - margin.top - margin.bottom}
            />
          </clipPath>
        </defs>

        {/* y grid + labels */}
        {y.ticks(5).map((t) => (
          <g key={t} transform={`translate(0, ${y(t)})`}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              stroke="rgba(0,0,0,0.08)"
            />
            <text
              x={margin.left - 10}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize={10}
              fill="rgba(0,0,0,0.55)"
            >
              {t}%
            </text>
          </g>
        ))}

        {/* clipped plot area */}
        <g clipPath={`url(#${clipId})`}>
          {QUEENS_LINES.map((l) => {
            const rows = (byLine.get(l) ?? []).slice().sort((a, b) => +a.month_date - +b.month_date);
            if (rows.length === 0) return null;

            const isHighlight = highlightLine === l;
            const stroke = LINE_COLORS[l];
            const path = lineGen(rows) ?? "";

            return (
              <g key={l} opacity={isHighlight ? 1 : 0.12}>
                <path
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isHighlight ? 4 : 2}
                />
                {isHighlight &&
                  rows.map((r, i) => (
                    <circle
                      key={i}
                      cx={x(r.month_date)}
                      cy={y(r.otp_pct)}
                      r={1.6}
                      fill={stroke}
                      opacity={0.8}
                    />
                  ))}
              </g>
            );
          })}
        </g>

        {/* x axis baseline */}
        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={height - margin.bottom}
          y2={height - margin.bottom}
          stroke="rgba(0,0,0,0.35)"
        />

        {/* x axis month ticks */}
        {monthTicks.map((t, i) => (
          <g key={i} transform={`translate(${x(t)}, ${height - margin.bottom})`}>
            <line y2={6} stroke="rgba(0,0,0,0.35)" />
            <text
              y={22}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(0,0,0,0.65)"
            >
              {formatMonth(t)}
            </text>
          </g>
        ))}

        {/* little year label in the corner */}
        <text
          x={width - margin.right}
          y={margin.top}
          textAnchor="end"
          fontSize={11}
          fill="rgba(0,0,0,0.55)"
        >
          {yearLabel}
        </text>
      </svg>

      <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>
        Showing the latest 12 months. Tip: click a bullet to spotlight a line.
      </div>
    </div>
  );
}
