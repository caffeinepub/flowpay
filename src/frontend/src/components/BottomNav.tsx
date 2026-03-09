import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart2, CreditCard, Home, User } from "lucide-react";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.home.link" },
  {
    to: "/insights",
    label: "Insights",
    icon: BarChart2,
    ocid: "nav.insights.link",
  },
  { to: "/wallet", label: "Wallet", icon: CreditCard, ocid: "nav.wallet.link" },
  { to: "/profile", label: "Profile", icon: User, ocid: "nav.profile.link" },
] as const;

export function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe">
      <div className="mx-3 mb-3 rounded-2xl glass-card shadow-card overflow-hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.to;
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.ocid}
                className="flex-1 flex flex-col items-center gap-0.5 relative py-2 px-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 p-1 rounded-xl transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-all duration-200"
                  />
                </div>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
