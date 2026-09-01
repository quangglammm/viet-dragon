"use client";

import { useState } from "react";

export interface DonutSlice {
  label: string;
  value: number;
  percent: number;
  amount: string;
  color: string;
  sublabel?: string;
  flag?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  title?: string;
  subtitle?: string;
  totalLabel?: string;
  totalValue?: string;
  size?: number;
  isDark?: boolean;
}

// Preset vibrant gradients matching reference image
const GRADIENT_PAIRS = [
  { id: "blueGrad", from: "#0052D4", to: "#00C6FF" },   // 62.7% Blue slice in reference image
  { id: "pinkGrad", from: "#FF0844", to: "#FF4E50" },   // 23.5% Pink/Red slice in reference image
  { id: "greenGrad", from: "#11998E", to: "#38EF7D" },  // 13.8% Green slice in reference image
  { id: "goldGrad", from: "#F59E0B", to: "#FBBF24" },   // Additional slices
  { id: "cyanGrad", from: "#06B6D4", to: "#22D3EE" },
];

export function DonutChart({
  data,
  title,
  subtitle,
  size = 240,
  isDark = false,
}: Readonly<DonutChartProps>) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const center = 100;
  const radius = 92;

  // Calculate SVG Pie paths and text placement coordinates purely without mutation
  const pieSlices = data.map((slice, idx) => {
    const startPercent = data.slice(0, idx).reduce((sum, s) => sum + s.percent, 0);
    const endPercent = startPercent + slice.percent;

    // Convert percentages to angles in radians starting at top (-Math.PI / 2)
    const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    // Position of direct percentage text inside slice
    const textRadius = radius * 0.58;
    const textX = center + textRadius * Math.cos(midAngle);
    const textY = center + textRadius * Math.sin(midAngle);

    // Subtle explode offset when slice is hovered
    const explodeDist = 6;
    const explodeX = explodeDist * Math.cos(midAngle);
    const explodeY = explodeDist * Math.sin(midAngle);

    const largeArcFlag = slice.percent > 50 ? 1 : 0;
    const pathData = `M ${center},${center} L ${x1.toFixed(2)},${y1.toFixed(2)} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;

    const gradient = GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length];

    return {
      ...slice,
      pathData,
      textX,
      textY,
      explodeX,
      explodeY,
      gradientId: gradient.id,
      fromColor: gradient.from,
      toColor: gradient.to,
    };
  });

  const activeSlice = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* SVG Full Pie Chart Canvas (Matching reference image) */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="overflow-visible"
        >
          <defs>
            {/* Vibrant Linear Gradients matching reference image */}
            {GRADIENT_PAIRS.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={g.from} />
                <stop offset="100%" stopColor={g.to} />
              </linearGradient>
            ))}

            {/* Drop Shadow filter for internal text labels */}
            <filter id="pieTextShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.75" />
            </filter>

            {/* Hover Glow filter */}
            <filter id="pieGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0052D4" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* SVG Pie Wedges */}
          {pieSlices.map((slice, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="transition-transform duration-300 cursor-pointer"
                style={{
                  transform: isHovered
                    ? `translate(${slice.explodeX}px, ${slice.explodeY}px)`
                    : "translate(0px, 0px)",
                }}
              >
                {/* Solid Pie Slice with White Border */}
                <path
                  d={slice.pathData}
                  fill={`url(#${slice.gradientId})`}
                  stroke={isDark ? "#1e293b" : "#ffffff"}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="transition-all duration-200"
                />

                {/* Direct Percentage Text Label inside slice (Matching Reference Image) */}
                {slice.percent > 4 && (
                  <text
                    x={slice.textX}
                    y={slice.textY}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                    filter="url(#pieTextShadow)"
                    className="select-none font-mono tracking-tight pointer-events-none"
                  >
                    {slice.percent}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {title && (
        <p className={`mt-2 text-xs font-bold text-center ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {title}
        </p>
      )}

      {subtitle && (
        <p className={`mt-0.5 text-[11px] text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {subtitle}
        </p>
      )}

      {/* Active Hover Banner Display */}
      {activeSlice && (
        <div className={`mt-3 w-full rounded-xl p-2.5 text-center text-xs font-bold transition-all animate-in fade-in ${
          isDark ? "bg-slate-800 text-white border border-slate-700" : "bg-purple-50 text-slate-900 border border-purple-100"
        }`}>
          <span className="text-brand-primary mr-1">{activeSlice.flag}</span>
          <span>{activeSlice.label}: </span>
          <span className="font-mono text-emerald-500 font-extrabold ml-1">{activeSlice.amount}</span>
          <span className="font-mono text-xs opacity-75 ml-1">({activeSlice.percent}%)</span>
        </div>
      )}

      {/* Percentage Legend Grid */}
      <div className="mt-4 w-full space-y-2">
        {pieSlices.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between rounded-xl p-2 text-xs transition-all cursor-pointer ${
                isHovered
                  ? isDark
                    ? "bg-slate-800 border border-slate-700 scale-[1.02] shadow-md"
                    : "bg-purple-50 scale-[1.02] shadow-xs"
                  : isDark
                  ? "hover:bg-slate-800/50"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                  style={{ background: `linear-gradient(135deg, ${item.fromColor}, ${item.toColor})` }}
                />
                <span className={`font-bold flex items-center gap-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {item.flag && <span>{item.flag}</span>}
                  <span>{item.label}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-mono text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{item.amount}</span>
                <span
                  className="font-mono font-black text-xs px-2 py-0.5 rounded-md text-white shadow-xs"
                  style={{ background: `linear-gradient(135deg, ${item.fromColor}, ${item.toColor})` }}
                >
                  {item.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
