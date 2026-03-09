import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CreditCard, Loader2, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SiMastercard, SiVisa } from "react-icons/si";
import { toast } from "sonner";
import { CardType } from "../backend.d";
import type { Card } from "../backend.d";
import { useAddCard, useCards } from "../hooks/useQueries";

interface CardDisplayProps {
  card: Card;
  index: number;
}

function CardDisplay({ card, index }: CardDisplayProps) {
  const gradients: Record<string, string> = {
    [CardType.Visa]: "from-[oklch(0.35_0.22_265)] to-[oklch(0.5_0.25_210)]",
    [CardType.Mastercard]: "from-[oklch(0.35_0.18_25)] to-[oklch(0.5_0.22_45)]",
    [CardType.Amex]: "from-[oklch(0.35_0.15_145)] to-[oklch(0.5_0.2_165)]",
  };

  const gradient =
    gradients[card.cardType as string] ?? gradients[CardType.Visa];

  return (
    <motion.div
      data-ocid={`wallet.card.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        "relative w-full h-44 rounded-3xl overflow-hidden p-6 flex flex-col justify-between shadow-primary-glow",
        "bg-gradient-to-br",
        gradient,
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-4 w-44 h-44 rounded-full bg-white/5" />

      {/* Card type logo */}
      <div className="flex justify-between items-start">
        <div className="w-10 h-7 rounded-md bg-white/20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white/70" />
        </div>
        <div className="text-white/90">
          {(card.cardType as string) === "Visa" ? (
            <SiVisa size={28} />
          ) : (card.cardType as string) === "Mastercard" ? (
            <SiMastercard size={28} />
          ) : (
            <span className="text-xs font-bold font-display">AMEX</span>
          )}
        </div>
      </div>

      {/* Card number */}
      <div>
        <p className="text-white/90 font-mono text-base tracking-[0.15em] mb-1">
          {card.maskedNumber}
        </p>
        <p className="text-white/50 text-xs">Expires {card.expiry}</p>
      </div>
    </motion.div>
  );
}

export function WalletPage() {
  const { data: cards, isLoading } = useCards();
  const addCard = useAddCard();
  const [addOpen, setAddOpen] = useState(false);
  const [maskedNumber, setMaskedNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardType, setCardType] = useState<CardType>(CardType.Visa);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!maskedNumber.match(/^[\*\d\s]{13,19}$/)) {
      errs.maskedNumber =
        "Enter a valid card number format (e.g. **** **** **** 1234)";
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      errs.expiry = "Use MM/YY format";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCard = async () => {
    if (!validate()) return;
    try {
      await addCard.mutateAsync({ maskedNumber, expiry, cardType });
      toast.success("Card added successfully");
      setAddOpen(false);
      setMaskedNumber("");
      setExpiry("");
      setCardType(CardType.Visa);
    } catch {
      toast.error("Failed to add card");
    }
  };

  const handleClose = () => {
    setAddOpen(false);
    setErrors({});
    setMaskedNumber("");
    setExpiry("");
  };

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "—"
              : `${cards?.length ?? 0} linked card${(cards?.length ?? 0) !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          size="sm"
          className="h-9 rounded-xl font-semibold gap-1.5 text-xs"
          data-ocid="wallet.add_card.open_modal_button"
        >
          <Plus size={15} />
          Add Card
        </Button>
      </header>

      {/* Cards */}
      <section className="px-5 flex flex-col gap-4">
        {isLoading ? (
          <>
            {[1, 2].map((i) => (
              <Skeleton key={i} className="w-full h-44 rounded-3xl" />
            ))}
          </>
        ) : cards?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
            data-ocid="wallet.empty_state"
          >
            <div className="w-20 h-20 rounded-3xl surface-subtle flex items-center justify-center">
              <CreditCard size={32} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-bold font-display">No cards yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a card to start tracking expenses
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-xl h-11 px-6 font-semibold"
              data-ocid="wallet.add_card.primary_button"
            >
              Add Your First Card
            </Button>
          </motion.div>
        ) : (
          cards?.map((card, i) => (
            <CardDisplay key={card.id.toString()} card={card} index={i + 1} />
          ))
        )}
      </section>

      {/* Add Card Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent
          className="max-w-[380px] rounded-3xl p-0 border-border/50"
          data-ocid="wallet.add_card.dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl font-bold">
                Add Card
              </DialogTitle>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="wallet.add_card.close_button"
              >
                <X size={16} />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Card Number</Label>
              <Input
                value={maskedNumber}
                onChange={(e) => {
                  setMaskedNumber(e.target.value);
                  setErrors((prev) => ({ ...prev, maskedNumber: "" }));
                }}
                placeholder="**** **** **** 1234"
                className={cn(
                  "h-11 rounded-xl",
                  errors.maskedNumber && "border-destructive",
                )}
              />
              {errors.maskedNumber && (
                <p className="text-xs text-destructive">
                  {errors.maskedNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Expiry</Label>
                <Input
                  value={expiry}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
                    setExpiry(v);
                    setErrors((prev) => ({ ...prev, expiry: "" }));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={cn(
                    "h-11 rounded-xl",
                    errors.expiry && "border-destructive",
                  )}
                />
                {errors.expiry && (
                  <p className="text-xs text-destructive">{errors.expiry}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Type</Label>
                <Select
                  value={cardType}
                  onValueChange={(v) => setCardType(v as CardType)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {Object.values(CardType).map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {ct}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-11 rounded-xl"
                data-ocid="wallet.add_card.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCard}
                disabled={addCard.isPending}
                className="flex-[2] h-11 rounded-xl font-bold font-display"
                data-ocid="wallet.add_card.confirm_button"
              >
                {addCard.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Card"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
