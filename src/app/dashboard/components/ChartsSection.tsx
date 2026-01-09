// src/app/dashboard/components/ChartsSection.tsx
"use client";

import { DashboardChartsResponse } from "@/types/dashboard";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  charts: DashboardChartsResponse;
}

export default function ChartsSection({ charts }: Props) {
  const { ideas_created, ideas_scheduled } = charts;

  // Merge two series by date
  const merged = ideas_created.map((c, idx) => ({
    date: c.date,
    created: c.count,
    scheduled: ideas_scheduled[idx]?.count ?? 0,
  }));

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-4 sm:p-6">
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={merged} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262538" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#A1A1AA" }}
            />
            <YAxis tick={{ fontSize: 10, fill: "#A1A1AA" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #27272a",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="created"
              name="Created"
              stroke="#6C63FF"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="scheduled"
              name="Scheduled"
              stroke="#22c55e"
              dot={false}
              strokeWidth={2}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
