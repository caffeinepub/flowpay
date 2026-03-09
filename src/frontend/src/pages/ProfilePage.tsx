import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  ChevronRight,
  Edit3,
  Fingerprint,
  Loader2,
  Lock,
  LogOut,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile, useUpdateProfile } from "../hooks/useQueries";
import { formatDate, formatPrincipal, getInitials } from "../utils/format";

export function ProfilePage() {
  const { identity, clear } = useInternetIdentity();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark"),
  );
  const [biometric, setBiometric] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const principal = identity?.getPrincipal();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    clear();
    toast.success("Logged out");
  };

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-black font-display">Profile</h1>
      </header>

      {/* Avatar + Info */}
      <section className="px-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl balance-gradient flex items-center justify-center shadow-primary-glow shrink-0">
            <span className="text-xl font-black font-display text-white">
              {isLoading ? "?" : getInitials(profile?.name ?? "FP")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-32 rounded mb-1.5" />
                <Skeleton className="h-3.5 w-44 rounded" />
              </>
            ) : (
              <>
                <p className="text-lg font-black font-display truncate">
                  {profile?.name ?? "FlowPay User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.email ?? "No email"}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-9 h-9 rounded-xl surface-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="profile.edit.button"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* Principal */}
        {principal && (
          <div className="mt-3 px-3 py-2 rounded-xl surface-subtle">
            <p className="text-[10px] text-muted-foreground mb-0.5">
              Principal ID
            </p>
            <p className="text-xs font-mono font-medium text-muted-foreground">
              {principal.toString()}
            </p>
          </div>
        )}
      </section>

      {/* Edit form */}
      {editing && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 mb-6"
        >
          <div className="surface-subtle rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold font-display">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold">Display Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                className="flex-1 h-10 rounded-xl text-sm"
                data-ocid="profile.cancel.button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-[2] h-10 rounded-xl font-bold text-sm font-display"
                data-ocid="profile.save.button"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} className="mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Account info */}
      <section className="px-5 mb-5">
        <h2 className="text-xs font-bold font-display text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Account
        </h2>
        <div className="surface-subtle rounded-2xl overflow-hidden">
          {[
            {
              icon: User,
              label: "Member since",
              value: profile?.createdAt ? formatDate(profile.createdAt) : "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security settings */}
      <section className="px-5 mb-5">
        <h2 className="text-xs font-bold font-display text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Security
        </h2>
        <div className="surface-subtle rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Fingerprint size={15} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Biometric Login</p>
              <p className="text-xs text-muted-foreground">
                Use fingerprint or face ID
              </p>
            </div>
            <Switch
              checked={biometric}
              onCheckedChange={setBiometric}
              data-ocid="profile.biometric.switch"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Lock size={15} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Two-Factor Auth</p>
              <p className="text-xs text-muted-foreground">
                Internet Identity (enabled)
              </p>
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              Active
            </span>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="px-5 mb-5">
        <h2 className="text-xs font-bold font-display text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Preferences
        </h2>
        <div className="surface-subtle rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {darkMode ? (
                <Moon size={15} className="text-primary" />
              ) : (
                <Sun size={15} className="text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                {darkMode ? "Currently dark" : "Currently light"}
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              data-ocid="profile.darkmode.toggle"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell size={15} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                Transaction alerts
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="px-5">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl font-semibold font-display text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
          data-ocid="profile.logout.button"
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </section>

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary/60 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
