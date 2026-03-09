import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Bell, Check, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useMarkAllRead, useNotifications } from "../hooks/useQueries";
import { formatDateTime } from "../utils/format";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const unread = notifications?.filter((n) => !n.read) ?? [];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full max-w-[380px] p-0"
        data-ocid="notifications.panel"
      >
        <SheetHeader className="px-5 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Bell size={18} />
              Notifications
              {unread.length > 0 && (
                <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {unread.length}
                </span>
              )}
            </SheetTitle>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-80px)]">
          {/* Mark all read button */}
          {unread.length > 0 && (
            <div className="px-5 py-3 border-b border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-primary font-semibold h-8 rounded-lg text-xs gap-1"
                data-ocid="notifications.markread.button"
              >
                <Check size={13} />
                Mark all as read
              </Button>
            </div>
          )}

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {isLoading ? (
              <div
                className="p-5 flex flex-col gap-3"
                data-ocid="notifications.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-3.5 w-full rounded mb-1.5" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications?.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-3 p-10 text-center"
                data-ocid="notifications.empty_state"
              >
                <div className="w-14 h-14 rounded-2xl surface-subtle flex items-center justify-center">
                  <Bell size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-1">
                {notifications?.map((notification, i) => (
                  <motion.div
                    key={notification.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl transition-colors",
                      notification.read
                        ? "opacity-60"
                        : "bg-primary/5 border border-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm",
                        notification.read ? "surface-subtle" : "bg-primary/10",
                      )}
                    >
                      🔔
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
