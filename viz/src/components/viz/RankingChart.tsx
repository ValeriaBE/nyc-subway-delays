import * as d3 from "d3";
import React, { useMemo } from "react";
import type { OtpRow } from "../../types";
import type { QueensLine } from "../../lineMeta";
import { QUEENS_LINES, LINE_COLORS } from "../../lineMeta";
import { SubwayBullet } from "../SubwayBullet";

export function RankingChart({
  data,
  highlightLine,
}: {
  data: OtpRow[];
  highlightLine?: QueensLine;
}) {
  const width = 860;
  const height = 340;
  const margin = { top: 16, right: 16, bottom: 34, left: 80 };

  const stats = useMemo(() => {
    const grouped = d3.group(data, (d) => d.line);
    return QUEENS_LINES.map((line) => {
      const rows = grouped.get(line) ?? [];
      return {
        line,
        avgOtp: d3.mean(rows, (r) => r.otp_pct) ?? NaN,
      };
    })
      .filter((d) => !Number.isNaN(d.avgOtp))
      .sort((a, b) => a.avgOtp - b.avgOtp);
  }, [data]);

  const x = useMemo(() => {
    const min = Math.max(0, (d3.min(stats, (d) => d.avgOtp) ?? 60) - 5);
    const max = Math.min(100, (d3.max(stats, (d) => d.avgOtp) ?? 95) + 3);
    return d3.scaleLinear().domain([min, max]).range([margin.left, width - margin.right]);
  }, [stats]);

  const y = useMemo(() => {
    return d3
      .scaleBand<string>()
      .domain(stats.map((d) => d.line))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);
  }, [stats]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {stats.map((d) => {
          const y0 = y(d.line) ?? 0;
          const isHighlight = highlightLine === d.line;
          const fill = isHighlight ? LINE_COLORS[d.line as QueensLine] : "rgba(0,0,0,0.75)";

          return (
            <g key={d.line}>
              <rect
                x={x(x.domain()[0])}
                y={y0}
                width={x(d.avgOtp) - x(x.domain()[0])}
                height={y.bandwidth()}
                rx={10}
                fill={fill}
                opacity={isHighlight ? 1 : 0.9}
              >
                <title>
                  Line {d.line}
                  {"\n"}Avg OTP: {d.avgOtp.toFixed(1)}%
                </title>
              </rect>

              <text
                x={x(d.avgOtp) + 8}
                y={y0 + y.bandwidth() / 2}
                alignmentBaseline="middle"
                fontSize={11}
                fill="#111"
              >
                {d.avgOtp.toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* x-axis */}
        {x.ticks(5).map((t) => (
          <g key={t} transform={`translate(${x(t)}, ${height - margin.bottom})`}>
            <line y2={6} stroke="rgba(0,0,0,0.45)" />
            <text y={22} textAnchor="middle" fontSize={10} fill="rgba(0,0,0,0.7)">
              {t}%
            </text>
          </g>
        ))}
        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={height - margin.bottom}
          y2={height - margin.bottom}
          stroke="rgba(0,0,0,0.45)"
        />
      </svg>

      {/* legend row with bullets */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {QUEENS_LINES.map((l) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <SubwayBullet line={l} size={20} />
            <span style={{ fontSize: 12, color: "#333" }}>{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
