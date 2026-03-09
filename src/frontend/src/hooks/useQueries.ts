import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CardType, TransactionCategory } from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  profile: ["profile"] as const,
  transactions: ["transactions"] as const,
  cards: ["cards"] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["unreadCount"] as const,
  categorySpending: ["categorySpending"] as const,
  monthlySpending: ["monthlySpending"] as const,
};

// ─── Profile ───────────────────────────────────────────────────────────────────
export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Cards ─────────────────────────────────────────────────────────────────────
export function useCards() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.cards,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCards();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUnreadNotificationCount() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.unreadCount,
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Spending ──────────────────────────────────────────────────────────────────
export function useCategorySpending() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.categorySpending,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCurrentMonthSpending();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlySpending() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.monthlySpending,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLast6MonthsSpending();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────
export function useSeedDemoData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.seedDemoData();
    },
    onSuccess: () => {
      void qc.invalidateQueries();
    },
  });
}

export function useSendMoney() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      receiver,
      amount,
      category,
    }: {
      receiver: Principal;
      amount: bigint;
      category: TransactionCategory;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.sendMoney(receiver, amount, category);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.categorySpending });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.monthlySpending });
    },
  });
}

export function useAddCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      maskedNumber,
      expiry,
      cardType,
    }: {
      maskedNumber: string;
      expiry: string;
      cardType: CardType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCard(maskedNumber, expiry, cardType);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.cards });
    },
  });
}

export function useMarkAllRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.markAllNotificationsAsRead();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.unreadCount });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateProfile(name, email);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
}

// Re-export enums for convenience
export { CardType, TransactionCategory };
