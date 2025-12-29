# YAFT - Yey another finance tracker

YAFT is a modern, premium web application designed to help you track your personal finances with ease and style. It features a sleek dark-mode interface with glassmorphism aesthetics and provides powerful tools to stay on top of your budget.

## 🚀 Features

- **Dynamic Dashboard**: Get an immediate overview of your current balance, monthly income, and monthly expenses through beautiful charts and recap cards.
- **Transaction Tracking**: Easily record every income and expense. You can edit or delete them at any time if you make a mistake.
- **Full Category Customization**: Completely manage your own category system. Add, rename, or delete categories and sub-items for both income and expenses to match your spending habits.
- **Recurring Transactions**: Set up monthly items once (like Netflix, rent, or your salary) and let the app handle the rest. YAFT automatically generates these transactions for you.
- **Installment Support**: Recurring items can have an optional end date, perfect for tracking loans or split payments that eventually stop.
- **Cloud Sync & Auth**: Securely log in with your account. All your data is automatically synced to the cloud, so you never lose your financial history.
- **Premium UI**: Experience a state-of-the-art interface built with modern web principles, smooth animations, and a responsive design.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Material UI (MUI) with custom glassmorphism theme
- **State Management**: Zustand (with persistence)
- **Backend & Auth**: Firebase Auth & Firestore
- **Date Handling**: Day.js

## 🏁 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Configure Firebase**:
   Ensure you have a `.env` file with your Firebase credentials (refer to `src/lib/firebase.ts` for the required keys).

## 📄 License

This project is for personal use. All rights reserved.
