import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import type { Transaction } from "../backend.d";
import { TransactionStatus } from "../backend.d";
import { formatBalance, formatDate, getCategoryEmoji } from "../utils/format";

interface TransactionItemProps {
  tx: Transaction;
  currentPrincipal?: Principal;
  index?: number;
}

const STATUS_STYLES: Record<string, string> = {
  [TransactionStatus.Completed]:
    "bg-green-500/10 text-green-600 dark:text-green-400",
  [TransactionStatus.Pending]:
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  [TransactionStatus.Failed]: "bg-destructive/10 text-destructive",
};

export function TransactionItem({
  tx,
  currentPrincipal,
  index = 1,
}: TransactionItemProps) {
  const isSent =
    currentPrincipal && tx.senderId.toString() === currentPrincipal.toString();
  const emoji = getCategoryEmoji(tx.category as string);
  const sign = isSent ? "-" : "+";
  const amountClass = isSent
    ? "text-foreground"
    : "text-green-600 dark:text-green-400";

  return (
    <div
      data-ocid={`transactions.item.${index}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-150 cursor-default"
    >
      {/* Category icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg surface-subtle shrink-0">
        {emoji}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold font-display truncate">
            {tx.category as string}
          </p>
          <span
            className={cn(
              "text-sm font-bold font-display tabular-nums shrink-0",
              amountClass,
            )}
          >
            {sign}
            {formatBalance(tx.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatDate(tx.date)}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 h-4",
              STATUS_STYLES[tx.status as string] ?? "",
            )}
          >
            {tx.status as string}
          </Badge>
        </div>
      </div>
    </div>
  );
}
