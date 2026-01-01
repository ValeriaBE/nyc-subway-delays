import React from "react";
import type { QueensLine } from "../lineMeta";
import { LINE_COLORS } from "../lineMeta";
import { motion } from "framer-motion";

export function SubwayBullet({ line, size = 24 }: { line: QueensLine; size?: number }) {
  const fill = LINE_COLORS[line];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300 }}
      aria-label={`Train ${line}`}
    >
      <circle cx="50" cy="50" r="50" fill={fill} />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="58"
        fill="#000"
      >
        {line}
      </text>
    </motion.svg>
  );
}
