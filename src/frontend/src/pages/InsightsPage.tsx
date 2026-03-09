import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCategorySpending, useMonthlySpending } from "../hooks/useQueries";
import {
  formatBalance,
  getCategoryColor,
  getCategoryEmoji,
} from "../utils/format";

const CHART_COLORS = [
  "oklch(0.65 0.2 210)",
  "oklch(0.7 0.18 145)",
  "oklch(0.78 0.2 70)",
  "oklch(0.72 0.2 300)",
  "oklch(0.68 0.22 30)",
  "oklch(0.6 0.15 240)",
];

export function InsightsPage() {
  const { data: monthlySpending, isLoading: monthlyLoading } =
    useMonthlySpending();
  const { data: categorySpending, isLoading: catLoading } =
    useCategorySpending();

  const monthlyData = useMemo(
    () =>
      (monthlySpending ?? []).map((m) => ({
        month: m.month,
        amount: Number(m.amount) / 100,
      })),
    [monthlySpending],
  );

  const categoryData = useMemo(
    () =>
      (categorySpending ?? []).map((cs, i) => ({
        name: cs.category as string,
        value: Number(cs.amount) / 100,
        emoji: getCategoryEmoji(cs.category as string),
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [categorySpending],
  );

  const totalThisMonth = categoryData.reduce((sum, c) => sum + c.value, 0);
  const daysInMonth = new Date().getDate();
  const avgPerDay = totalThisMonth / daysInMonth;
  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0];

  const statsLoading = monthlyLoading || catLoading;

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-black font-display">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your spending overview
        </p>
      </header>

      {/* Stats row */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "This Month",
              value: statsLoading ? null : `$${totalThisMonth.toFixed(0)}`,
              sub: "total spent",
            },
            {
              label: "Daily Avg",
              value: statsLoading ? null : `$${avgPerDay.toFixed(0)}`,
              sub: "per day",
            },
            {
              label: "Top Category",
              value: statsLoading ? null : (topCategory?.emoji ?? "—"),
              sub: topCategory?.name ?? "—",
            },
          ].map(({ label, value, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="surface-subtle rounded-2xl p-4 flex flex-col gap-1"
            >
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </p>
              {value === null ? (
                <Skeleton className="h-6 w-14 rounded mt-1" />
              ) : (
                <p className="text-xl font-black font-display">{value}</p>
              )}
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Monthly spending bar chart */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold font-display mb-3">
          6-Month Overview
        </h2>
        <div className="surface-subtle rounded-2xl p-4">
          {monthlyLoading ? (
            <div
              className="h-48 flex items-end gap-2"
              data-ocid="insights.loading_state"
            >
              {[40, 70, 55, 85, 60, 75].map((h) => (
                <Skeleton
                  key={`skeleton-${h}`}
                  className="flex-1 rounded-lg"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barCategoryGap="25%">
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                  tickFormatter={(v: number) => `$${v}`}
                  width={40}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Spent",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid oklch(var(--border))",
                    background: "oklch(var(--popover))",
                    color: "oklch(var(--foreground))",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "oklch(var(--muted))" }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`month-${entry.month}`}
                      fill={
                        index === monthlyData.length - 1
                          ? CHART_COLORS[0]
                          : "oklch(var(--muted))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Category breakdown */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold font-display mb-3">
          Category Breakdown
        </h2>
        <div className="surface-subtle rounded-2xl p-4">
          {catLoading ? (
            <div
              className="h-48 flex items-center justify-center"
              data-ocid="insights.loading_state"
            >
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No spending data this month
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry) => (
                    <Cell key={`cat-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Spent",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid oklch(var(--border))",
                    background: "oklch(var(--popover))",
                    color: "oklch(var(--foreground))",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ fontSize: "11px", color: "currentColor" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Category list */}
      {categoryData.length > 0 && (
        <section className="px-5">
          <h2 className="text-sm font-bold font-display mb-3">
            Spending Breakdown
          </h2>
          <div className="surface-subtle rounded-2xl overflow-hidden">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .map((cat, i) => {
                const pct =
                  totalThisMonth > 0 ? (cat.value / totalThisMonth) * 100 : 0;
                return (
                  <div key={cat.name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.emoji}</span>
                        <span className="text-sm font-semibold">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-display">
                          ${cat.value.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          delay: i * 0.05 + 0.2,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full"
                        style={{ background: cat.color }}
                      />
                    </div>
                    {i < categoryData.length - 1 && (
                      <div className="mt-4 h-px bg-border/50" />
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
