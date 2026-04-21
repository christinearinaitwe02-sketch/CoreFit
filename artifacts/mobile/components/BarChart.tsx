import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  color?: string;
  height?: number;
  unit?: string;
}

export function BarChart({
  data,
  maxValue,
  color,
  height = 120,
  unit = "",
}: BarChartProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const barWidth = 28;
  const gap = 12;
  const chartWidth = data.length * (barWidth + gap) - gap;
  const chartHeight = height;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight + 4}>
        {/* Grid line at top */}
        <Line
          x1={0}
          y1={0}
          x2={chartWidth}
          y2={0}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        {/* Grid line at half */}
        <Line
          x1={0}
          y1={chartHeight / 2}
          x2={chartWidth}
          y2={chartHeight / 2}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.value / max) * chartHeight : 0;
          const x = i * (barWidth + gap);
          const y = chartHeight - barHeight;
          const isLast = i === data.length - 1;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={8}
              fill={isLast ? accentColor : accentColor + "55"}
            />
          );
        })}
      </Svg>
      <View style={[styles.labels, { width: chartWidth }]}>
        {data.map((d, i) => (
          <View key={i} style={[styles.labelCol, { width: barWidth }]}>
            <Text style={[styles.labelText, { color: colors.mutedForeground }]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    gap: 6,
  },
  labels: {
    flexDirection: "row",
    gap: 12,
  },
  labelCol: {
    alignItems: "center",
  },
  labelText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
});
