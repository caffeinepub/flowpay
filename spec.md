# FlowPay

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full fintech web wallet app with mobile-responsive layout
- Authentication: register, login, JWT-style session via Internet Computer auth
- Dashboard: balance display, quick actions (Send/Receive/Scan QR), spending summary chart, recent transactions, notifications
- Send Money: contact selection, amount entry, confirmation screen, success screen, real-time balance update
- Receive Money: QR code generation, shareable payment link, incoming transactions view
- Transaction list: amount, date, category, status, search and filter
- Budget & Insights: monthly spending chart, category breakdown, budget limits, spending alerts
- Cards & Bank: add card (mock), add bank account (mock), view linked accounts
- Profile & Settings: user profile, security settings, notifications toggle, logout
- Bottom tab navigation: Home, Insights, Wallet, Profile
- Loading skeletons, success animations, error states
- Dark mode toggle

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend (Motoko):
   - User data model: id, name, email, balance, createdAt
   - Transaction model: id, senderId, receiverId, amount, category, status, date
   - Card model: id, userId, cardNumber (masked), expiry, type
   - APIs: register, login, getProfile, getBalance, sendMoney, getTransactions, addCard, getCards, getBudgetInsights
   - Seed sample data for demo

2. Frontend (React + TypeScript + Tailwind):
   - Auth screens: Register, Login
   - Main layout with bottom tab navigation (Home, Insights, Wallet, Profile)
   - Dashboard screen: balance card, quick action buttons, mini spending chart, recent transactions list
   - Send Money flow: contact picker → amount input → confirm → success
   - Receive Money screen: QR code display, copy link
   - Transactions screen: full list with search/filter
   - Insights screen: recharts bar/pie charts for spending by category and monthly trends
   - Wallet screen: linked cards and bank accounts
   - Profile screen: user info, settings toggles, logout
   - Skeleton loaders for async states
   - Toast notifications for actions
   - Dark mode support
