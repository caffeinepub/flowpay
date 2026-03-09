import { Button } from "@/components/ui/button";
import { Loader2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    { icon: Shield, text: "Secured by Internet Identity" },
    { icon: TrendingUp, text: "Track every transaction" },
    { icon: Zap, text: "Instant transfers" },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/4 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-[340px] px-6 flex flex-col items-center gap-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl balance-gradient shadow-primary-glow mb-5">
            <span className="text-3xl font-black font-display text-white">
              F
            </span>
          </div>
          <h1 className="text-4xl font-black font-display tracking-tight text-foreground">
            FlowPay
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Your money, intelligently managed
          </p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full flex flex-col gap-3"
        >
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl surface-subtle"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {feat.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full flex flex-col gap-3"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            size="lg"
            className="w-full h-14 text-base font-bold font-display rounded-2xl balance-gradient text-white border-0 shadow-primary-glow hover:opacity-90 transition-opacity"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Powered by Internet Computer blockchain
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 text-xs text-muted-foreground/60"
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary/60 hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
