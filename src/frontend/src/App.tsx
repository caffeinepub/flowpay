import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { DashboardPage } from "./pages/DashboardPage";
import { InsightsPage } from "./pages/InsightsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { WalletPage } from "./pages/WalletPage";

// ─── Layout ───────────────────────────────────────────────────────────────────
function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();

  // Restore dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl balance-gradient flex items-center justify-center shadow-primary-glow">
            <span className="text-2xl font-black font-display text-white">
              F
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return (
    <div className="desktop-bg min-h-dvh">
      <div className="app-container bg-background">
        <main className="flex-1">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insights",
  component: InsightsPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  insightsRoute,
  walletRoute,
  profileRoute,
  transactionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "14px",
            fontSize: "13px",
            fontFamily: "Sora, system-ui, sans-serif",
          },
        }}
      />
    </>
  );
}
