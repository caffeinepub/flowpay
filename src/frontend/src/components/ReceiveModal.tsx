import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Principal } from "@icp-sdk/core/principal";
import { Check, Copy, Share2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { QR_GRID_PX, QR_MODULE_PX, generateQRModules } from "../utils/qrcode";

interface ReceiveModalProps {
  open: boolean;
  onClose: () => void;
  principal?: Principal;
}

interface QRCodeProps {
  data: string;
}

function QRCodeDisplay({ data }: QRCodeProps) {
  const modules = generateQRModules(data);
  const padding = QR_MODULE_PX * 2;
  const totalSize = QR_GRID_PX + padding * 2;

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QR Code"
      role="img"
    >
      <rect width={totalSize} height={totalSize} fill="white" rx={8} />
      {modules.map((m) => (
        <rect
          key={`${m.x}-${m.y}`}
          x={m.x + padding}
          y={m.y + padding}
          width={QR_MODULE_PX}
          height={QR_MODULE_PX}
          fill="#0F172A"
        />
      ))}
    </svg>
  );
}

export function ReceiveModal({ open, onClose, principal }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  const principalStr = principal?.toString() ?? "Loading...";
  const paymentLink = `https://${window.location.hostname}/pay/${principalStr}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalStr);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "FlowPay Payment",
          text: `Send me money at: ${principalStr}`,
          url: paymentLink,
        });
      } else {
        await navigator.clipboard.writeText(paymentLink);
        toast.success("Payment link copied!");
      }
    } catch {
      toast.error("Failed to share");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl p-0 max-w-[430px] mx-auto border-t border-border/50"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-bold">
              Receive Money
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

        <div className="px-6 py-6 flex flex-col items-center gap-6">
          {/* QR Code */}
          {principal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-52 h-52 rounded-2xl overflow-hidden shadow-card flex items-center justify-center"
            >
              <QRCodeDisplay data={principalStr} />
            </motion.div>
          )}

          {/* Principal display */}
          <div className="w-full rounded-xl surface-subtle p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Your Wallet Address
            </p>
            <p className="text-sm font-mono font-medium break-all leading-relaxed">
              {principalStr}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="flex-1 h-12 rounded-xl font-semibold gap-2"
              data-ocid="receive.copy.button"
            >
              {copied ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copied!" : "Copy Address"}
            </Button>
            <Button
              type="button"
              onClick={handleShare}
              className="flex-1 h-12 rounded-xl font-semibold gap-2 balance-gradient text-white border-0"
              data-ocid="receive.share.button"
            >
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
