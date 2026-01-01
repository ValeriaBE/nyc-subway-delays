// src/components/Heatmap.tsx
import * as d3 from "d3";
import { useMemo } from "react";
import type { OtpRow } from "../types";

interface HeatmapProps {
  data: OtpRow[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  // dimensions
  const width = 900;
  const height = 500;
  const margin = { top: 40, right: 20, bottom: 70, left: 70 };

  const { lines, xScale, yScale, colorScale, cells } = useMemo(() => {
    const lines = Array.from(new Set(data.map((d) => d.line))).sort();

    const timeExtent = d3.extent(data, (d) => d.month_date) as [Date, Date];

    const xScale = d3
      .scaleTime()
      .domain(timeExtent)
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand<string>()
      .domain(lines)
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const otpExtent = d3.extent(data, (d) => d.otp_pct) as [number, number];

    // High OTP = good = green; low OTP = bad = red
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([otpExtent[0] || 70, otpExtent[1] || 100]);

    const cells = data.map((d) => ({
      x: xScale(d.month_date),
      y: yScale(d.line) ?? 0,
      width:
        ((width - margin.left - margin.right) /
          d3.timeMonth.count(timeExtent[0], timeExtent[1] || timeExtent[0])) *
        1.1,
      height: yScale.bandwidth(),
      value: d.otp_pct,
      line: d.line,
      date: d.month_date,
    }));

    return { lines, xScale, yScale, colorScale, cells };
  }, [data]);

  // x-axis ticks: show years
  const xTicks = useMemo(
    () =>
      (xScale.ticks(d3.timeYear.every(1)) as Date[]).map((d) => ({
        value: d,
        x: xScale(d),
        label: d.getFullYear().toString(),
      })),
    [xScale]
  );

  const yTicks = useMemo(
    () =>
      lines.map((l) => ({
        line: l,
        y: (yScale(l) ?? 0) + yScale.bandwidth() / 2,
      })),
    [lines, yScale]
  );

  return (
    <svg width={width} height={height} role="img" aria-label="Heatmap of subway OTP by line and month">
      {/* cells */}
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          fill={isNaN(cell.value) ? "#f0f0f0" : colorScale(cell.value)}
        >
          <title>
            Line {cell.line}
            {"\n"}
            {cell.date.toISOString().slice(0, 7)}{" "}
            {"\n"}
            OTP: {cell.value.toFixed(1)}%
          </title>
        </rect>
      ))}

      {/* x-axis */}
      {xTicks.map((t, i) => (
        <g key={i} transform={`translate(${t.x}, ${height - margin.bottom})`}>
          <line y2={6} stroke="#000" />
          <text y={20} textAnchor="middle" fontSize={10}>
            {t.label}
          </text>
        </g>
      ))}

      {/* y-axis */}
      {yTicks.map((t, i) => (
        <g key={i} transform={`translate(${margin.left - 5}, ${t.y})`}>
          <text textAnchor="end" alignmentBaseline="middle" fontSize={10}>
            {t.line}
          </text>
        </g>
      ))}

      {/* axis lines */}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={height - margin.bottom}
        y2={height - margin.bottom}
        stroke="#000"
      />
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="#000"
      />
    </svg>
  );
};
