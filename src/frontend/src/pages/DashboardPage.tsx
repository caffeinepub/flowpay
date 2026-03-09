import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Download,
  QrCode,
  ScanLine,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { NotificationsPanel } from "../components/NotificationsPanel";
import { ReceiveModal } from "../components/ReceiveModal";
import { SendMoneyModal } from "../components/SendMoneyModal";
import {
  SkeletonBalanceCard,
  SkeletonTransactionItem,
} from "../components/SkeletonCard";
import { TransactionItem } from "../components/TransactionItem";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCategorySpending,
  useProfile,
  useSeedDemoData,
  useTransactions,
  useUnreadNotificationCount,
} from "../hooks/useQueries";
import {
  formatBalance,
  formatDate,
  getCategoryColor,
  getCategoryEmoji,
  getInitials,
} from "../utils/format";

export function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: categorySpending } = useCategorySpending();
  const seedDemoData = useSeedDemoData();

  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Seed demo data on first load if no transactions
  useEffect(() => {
    if (
      !seeded &&
      transactions !== undefined &&
      transactions.length === 0 &&
      profile !== undefined
    ) {
      setSeeded(true);
      seedDemoData.mutate();
    }
  }, [transactions, profile, seeded, seedDemoData]);

  const recentTxs = transactions?.slice(0, 5) ?? [];
  const principal = identity?.getPrincipal();
  const unread = Number(unreadCount ?? 0);

  // Chart data
  const chartData = (categorySpending ?? []).map((cs) => ({
    name: cs.category as string,
    amount: Number(cs.amount) / 100,
    emoji: getCategoryEmoji(cs.category as string),
    color: getCategoryColor(cs.category as string),
  }));

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl balance-gradient flex items-center justify-center shadow-primary-glow">
            <span className="text-sm font-black font-display text-white">
              {profile?.name ? getInitials(profile.name) : "FP"}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            {profileLoading ? (
              <Skeleton className="h-4 w-24 rounded mt-0.5" />
            ) : (
              <p className="text-sm font-bold font-display">
                {profile?.name ?? "FlowPay User"}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          className="relative w-10 h-10 rounded-xl surface-subtle flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </header>

      {/* Balance Card */}
      <section className="px-5 mb-5">
        {profileLoading ? (
          <SkeletonBalanceCard />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-3xl balance-gradient p-6 relative overflow-hidden shadow-primary-glow"
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-6 w-48 h-48 rounded-full bg-white/5" />

            <div className="relative z-10">
              <p className="text-white/70 text-sm font-medium mb-2">
                Total Balance
              </p>
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-4xl font-black font-display text-white tracking-tight"
              >
                {formatBalance(profile?.balance ?? BigInt(0))}
              </motion.h2>
              <p className="text-white/50 text-xs mt-2">
                Last updated:{" "}
                {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
              </p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Send",
              icon: Send,
              onClick: () => setSendOpen(true),
              ocid: "dashboard.send.button",
              accent: true,
            },
            {
              label: "Receive",
              icon: Download,
              onClick: () => setReceiveOpen(true),
              ocid: "dashboard.receive.button",
              accent: false,
            },
            {
              label: "Scan",
              icon: ScanLine,
              onClick: () => setScanOpen(true),
              ocid: "dashboard.scan.button",
              accent: false,
            },
          ].map(({ label, icon: Icon, onClick, ocid, accent }, i) => (
            <motion.button
              key={label}
              data-ocid={ocid}
              onClick={onClick}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex flex-col items-center gap-2 py-4 rounded-2xl font-medium text-sm transition-all duration-200",
                accent
                  ? "balance-gradient text-white shadow-primary-glow"
                  : "surface-subtle text-foreground hover:bg-muted",
              )}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-xs font-semibold">{label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Spending Overview */}
      {chartData.length > 0 && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-display">This Month</h3>
          </div>
          <div className="rounded-2xl surface-subtle p-4">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={chartData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
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
                  {chartData.map((entry) => (
                    <Cell key={`cat-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-display">Recent Activity</h3>
          <Link
            to="/transactions"
            className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          >
            See all <ChevronRight size={13} />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden surface-subtle">
          {txLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <SkeletonTransactionItem key={i} />
              ))}
            </>
          ) : recentTxs.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-10 px-6 text-center"
              data-ocid="transactions.empty_state"
            >
              <span className="text-3xl">💸</span>
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
              <button
                type="button"
                onClick={() => setSendOpen(true)}
                className="text-xs text-primary font-semibold"
              >
                Make your first transfer →
              </button>
            </div>
          ) : (
            recentTxs.map((tx, i) => (
              <TransactionItem
                key={tx.id.toString()}
                tx={tx}
                currentPrincipal={principal}
                index={i + 1}
              />
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <SendMoneyModal open={sendOpen} onClose={() => setSendOpen(false)} />
      <ReceiveModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        principal={principal}
      />
      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* Scan Modal (visual only) */}
      {scanOpen && (
        // biome-ignore lint/a11y/useSemanticElements: custom fullscreen overlay
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR Scanner"
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-6"
          onClick={() => setScanOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setScanOpen(false)}
        >
          <div className="relative w-64 h-64 rounded-3xl border-2 border-white/60">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode size={64} className="text-white/40" />
            </div>
          </div>
          <p className="text-white/70 text-sm">Point camera at QR code</p>
          <button
            type="button"
            className="text-white text-sm font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              setScanOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
