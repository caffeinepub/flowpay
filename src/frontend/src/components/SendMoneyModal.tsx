import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Principal } from "@dfinity/principal";
import { ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionCategory } from "../backend.d";
import { useSendMoney } from "../hooks/useQueries";
import { dollarsToCents, getCategoryEmoji } from "../utils/format";

interface SendMoneyModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "recipient" | "amount" | "confirm" | "success";

const CATEGORIES = Object.values(TransactionCategory);

export function SendMoneyModal({ open, onClose }: SendMoneyModalProps) {
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>(
    TransactionCategory.Other,
  );
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");

  const sendMoney = useSendMoney();

  const handleClose = () => {
    setStep("recipient");
    setRecipient("");
    setAmount("");
    setCategory(TransactionCategory.Other);
    setRecipientError("");
    setAmountError("");
    onClose();
  };

  const validateRecipient = (): boolean => {
    try {
      Principal.fromText(recipient.trim());
      setRecipientError("");
      return true;
    } catch {
      setRecipientError("Invalid principal address");
      return false;
    }
  };

  const validateAmount = (): boolean => {
    const num = Number.parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      setAmountError("Enter a valid amount");
      return false;
    }
    if (num > 100000) {
      setAmountError("Amount too large");
      return false;
    }
    setAmountError("");
    return true;
  };

  const handleRecipientNext = () => {
    if (validateRecipient()) setStep("amount");
  };

  const handleAmountNext = () => {
    if (validateAmount()) setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      const receiverPrincipal = Principal.fromText(recipient.trim());
      const amountCents = dollarsToCents(amount);
      await sendMoney.mutateAsync({
        receiver: receiverPrincipal,
        amount: amountCents,
        category,
      });
      setStep("success");
    } catch {
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl p-0 max-w-[430px] mx-auto border-t border-border/50 max-h-[85dvh] overflow-y-auto"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-bold">
              {step === "success" ? "Money Sent!" : "Send Money"}
            </SheetTitle>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {step !== "success" && (
            <div className="flex gap-1 mt-3">
              {(["recipient", "amount", "confirm"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    step === s ||
                      i < ["recipient", "amount", "confirm"].indexOf(step)
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Recipient */}
            {step === "recipient" && (
              <motion.div
                key="recipient"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="recipient-input"
                    className="text-sm font-semibold"
                  >
                    Recipient Principal
                  </Label>
                  <Input
                    id="recipient-input"
                    data-ocid="send.recipient.input"
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      setRecipientError("");
                    }}
                    placeholder="aaaaa-aa..."
                    className={cn(
                      "h-12 rounded-xl font-mono text-sm",
                      recipientError && "border-destructive",
                    )}
                  />
                  {recipientError && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="send.recipient.error_state"
                    >
                      {recipientError}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as TransactionCategory)}
                  >
                    <SelectTrigger
                      data-ocid="send.category.select"
                      className="h-12 rounded-xl"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="cursor-pointer"
                        >
                          {getCategoryEmoji(cat)} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRecipientNext}
                  className="h-12 rounded-xl font-semibold font-display"
                  data-ocid="send.next.button"
                >
                  Continue <ArrowRight size={16} className="ml-1" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Amount */}
            {step === "amount" && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col items-center gap-3 py-4">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Enter Amount
                  </Label>
                  <div className="flex items-center gap-1">
                    <span className="text-4xl font-black font-display text-muted-foreground">
                      $
                    </span>
                    <Input
                      data-ocid="send.amount.input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setAmountError("");
                      }}
                      placeholder="0.00"
                      className={cn(
                        "text-5xl font-black font-display border-0 bg-transparent text-foreground p-0 w-40 focus-visible:ring-0 text-center",
                        amountError && "text-destructive",
                      )}
                    />
                  </div>
                  {amountError && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="send.amount.error_state"
                    >
                      {amountError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("recipient")}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleAmountNext}
                    className="flex-[2] h-12 rounded-xl font-semibold font-display"
                    data-ocid="send.confirm.button"
                  >
                    Review <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div className="rounded-2xl surface-subtle p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">To</span>
                    <span className="text-sm font-mono font-medium truncate max-w-[180px]">
                      {recipient.slice(0, 16)}...
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                    <span className="text-2xl font-black font-display">
                      ${Number.parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Category
                    </span>
                    <span className="text-sm font-semibold">
                      {getCategoryEmoji(category)} {category}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("amount")}
                    disabled={sendMoney.isPending}
                    className="flex-1 h-12 rounded-xl"
                    data-ocid="send.cancel.button"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={sendMoney.isPending}
                    className="flex-[2] h-12 rounded-xl font-bold font-display balance-gradient text-white border-0 shadow-primary-glow"
                    data-ocid="send.submit.button"
                  >
                    {sendMoney.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Money"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6 py-8"
                data-ocid="send.success.panel"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <CheckCircle2 size={40} className="text-green-500" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-2xl font-black font-display">
                    ${Number.parseFloat(amount).toFixed(2)}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Successfully sent
                  </p>
                </div>
                <Button
                  onClick={handleClose}
                  className="w-full h-12 rounded-xl font-semibold font-display"
                  data-ocid="send.close.button"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
