"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
export default function ProgressChart({
  data,
}: {
  data: { label: string; questions: number }[];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={230} minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -25, bottom: 0 }}
          accessibilityLayer
        >
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#e6e9e2"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#5f6e58", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#5f6e58", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#f1f4ec" }}
            contentStyle={{
              border: "1px solid #dde3d7",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="questions"
            name="Questions answered"
            fill="#72916d"
            radius={[5, 5, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
