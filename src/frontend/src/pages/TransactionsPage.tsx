import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { TransactionCategory } from "../backend.d";
import { SkeletonTransactionItem } from "../components/SkeletonCard";
import { TransactionItem } from "../components/TransactionItem";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTransactions } from "../hooks/useQueries";

const CATEGORIES = ["All", ...Object.values(TransactionCategory)];

export function TransactionsPage() {
  const { identity } = useInternetIdentity();
  const { data: transactions, isLoading } = useTransactions();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const principal = identity?.getPrincipal();

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((tx) => {
      const matchesCategory =
        categoryFilter === "All" || (tx.category as string) === categoryFilter;
      const matchesSearch =
        search === "" ||
        (tx.category as string).toLowerCase().includes(search.toLowerCase()) ||
        tx.senderId.toString().includes(search) ||
        tx.receiverId.toString().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [transactions, search, categoryFilter]);

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl surface-subtle flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={17} />
          </Link>
          <h1 className="text-xl font-black font-display">Transactions</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="transactions.search.input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="pl-9 h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </header>

      {/* Category filter tabs */}
      <section className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid="transactions.filter.tab"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "surface-subtle text-muted-foreground hover:text-foreground",
              )}
            >
              {cat === "All" ? "All" : `${cat}`}
            </button>
          ))}
        </div>
      </section>

      {/* Results count */}
      <div className="px-5 mb-2">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Transactions list */}
      <section className="px-5 flex-1">
        <div className="rounded-2xl overflow-hidden surface-subtle">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonTransactionItem key={i} />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-14 px-6 text-center"
              data-ocid="transactions.empty_state"
            >
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold">No transactions found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((tx, i) => (
                <motion.div
                  key={tx.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <TransactionItem
                    tx={tx}
                    currentPrincipal={principal}
                    index={i + 1}
                  />
                  {i < filtered.length - 1 && (
                    <div className="mx-3 h-px bg-border/50" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
