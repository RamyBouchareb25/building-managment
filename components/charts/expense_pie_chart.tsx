"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface ExpenseChartProps {
  data: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
  colors: string[];
}

export function ExpensePieChart({ data, colors }: ExpenseChartProps) {
  return (
    <ChartContainer
      config={{
        monthly: {
          label: "Monthly",
          color: "hsl(var(--chart-1))",
        },
        occasional: {
          label: "One-time",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ type, amount }) => `${type}: $${amount}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}