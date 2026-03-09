import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Card {
    id: bigint;
    maskedNumber: string;
    owner: Principal;
    cardType: CardType;
    expiry: string;
}
export type Time = bigint;
export interface MonthlySpending {
    month: string;
    amount: bigint;
}
export interface Notification {
    id: bigint;
    owner: Principal;
    read: boolean;
    message: string;
    timestamp: Time;
}
export interface CategorySpending {
    category: TransactionCategory;
    amount: bigint;
}
export interface UserProfile {
    balance: bigint;
    name: string;
    createdAt: Time;
    email: string;
}
export interface Transaction {
    id: bigint;
    status: TransactionStatus;
    date: Time;
    receiverId: Principal;
    category: TransactionCategory;
    amount: bigint;
    senderId: Principal;
}
export enum CardType {
    Amex = "Amex",
    Visa = "Visa",
    Mastercard = "Mastercard"
}
export enum TransactionCategory {
    Food = "Food",
    Health = "Health",
    Entertainment = "Entertainment",
    Shopping = "Shopping",
    Other = "Other",
    Transport = "Transport"
}
export enum TransactionStatus {
    Failed = "Failed",
    Completed = "Completed",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCard(maskedNumber: string, expiry: string, cardType: CardType): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCards(): Promise<Array<Card>>;
    getCurrentMonthSpending(): Promise<Array<CategorySpending>>;
    getLast6MonthsSpending(): Promise<Array<MonthlySpending>>;
    getNotifications(): Promise<Array<Notification>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAllNotificationsAsRead(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoData(): Promise<void>;
    sendMoney(receiver: Principal, amount: bigint, category: TransactionCategory): Promise<void>;
    updateProfile(name: string, email: string): Promise<void>;
}
