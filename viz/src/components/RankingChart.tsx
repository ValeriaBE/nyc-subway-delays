// src/components/RankingChart.tsx
import * as d3 from "d3";
import { useMemo } from "react";
import type { OtpRow } from "../types";

interface RankingChartProps {
  data: OtpRow[];
}

export const RankingChart: React.FC<RankingChartProps> = ({ data }) => {
  const width = 900;
  const height = 450;
  const margin = { top: 30, right: 20, bottom: 40, left: 80 };

  const { stats, xScale, yScale } = useMemo(() => {
    // aggregate average OTP by line
    const grouped = d3.group(data, (d) => d.line);

    const stats = Array.from(grouped, ([line, rows]) => ({
      line,
      avgOtp: d3.mean(rows, (r) => r.otp_pct) ?? NaN,
      nMonths: rows.length,
    }))
      .filter((d) => !isNaN(d.avgOtp))
      .sort((a, b) => a.avgOtp - b.avgOtp); // worst at top

    const xMax = d3.max(stats, (d) => d.avgOtp) ?? 100;

    const xScale = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand<string>()
      .domain(stats.map((d) => d.line))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    return { stats, xScale, yScale };
  }, [data]);

  return (
    <svg width={width} height={height} role="img" aria-label="Average on-time performance by line">
      {stats.map((d) => (
        <g key={d.line}>
          <rect
            x={xScale(0)}
            y={yScale(d.line)}
            width={xScale(d.avgOtp) - xScale(0)}
            height={yScale.bandwidth()}
            fill="#444"
          >
            <title>
              Line {d.line}
              {"\n"}
              Avg OTP: {d.avgOtp.toFixed(1)}%
              {"\n"}
              Months: {d.nMonths}
            </title>
          </rect>
        </g>
      ))}

      {/* y labels */}
      {stats.map((d) => (
        <text
          key={d.line}
          x={margin.left - 8}
          y={(yScale(d.line) ?? 0) + yScale.bandwidth() / 2}
          textAnchor="end"
          alignmentBaseline="middle"
          fontSize={10}
        >
          {d.line}
        </text>
      ))}

      {/* x-axis */}
      {xScale.ticks(5).map((t, i) => (
        <g
          key={i}
          transform={`translate(${xScale(t)}, ${height - margin.bottom})`}
        >
          <line y2={6} stroke="#000" />
          <text y={20} textAnchor="middle" fontSize={10}>
            {t}%
          </text>
        </g>
      ))}

      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={height - margin.bottom}
        y2={height - margin.bottom}
        stroke="#000"
      />
    </svg>
  );
};
