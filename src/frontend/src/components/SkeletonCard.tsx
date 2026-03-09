import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonBalanceCard() {
  return (
    <div className="w-full rounded-3xl balance-gradient p-6 relative overflow-hidden min-h-[160px]">
      <Skeleton className="h-4 w-24 bg-white/20 rounded mb-4" />
      <Skeleton className="h-12 w-48 bg-white/30 rounded mb-2" />
      <Skeleton className="h-3 w-32 bg-white/20 rounded" />
    </div>
  );
}

export function SkeletonTransactionItem() {
  return (
    <div
      className="flex items-center gap-3 p-3"
      data-ocid="transactions.loading_state"
    >
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 rounded mb-1.5" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-4 w-16 rounded" />
    </div>
  );
}

export function SkeletonCardItem() {
  return (
    <div className="w-full rounded-2xl h-44 overflow-hidden">
      <Skeleton className="w-full h-full rounded-2xl" />
    </div>
  );
}
