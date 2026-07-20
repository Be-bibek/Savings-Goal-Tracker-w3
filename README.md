# 🎯 Savings Goal Tracker — Stellar Web3 Ledger Sync

A stunning, responsive, and friendly 2-page **Savings Goal Tracker** application that combines modern financial planning with on-chain Stellar blockchain transparency. Track your goals, visualize deposits, and interact with the **Stellar Testnet** using our built-in wallet kit.

**Home Screen**
<img width="1278" height="638" alt="image" src="https://github.com/user-attachments/assets/60ab2a6b-fdbe-4236-800b-86ad9212a90c" /> 

**Home Screen -  mobile view light mode**<img width="269" height="497" alt="image" src="https://github.com/user-attachments/assets/e0967661-bb6d-43cc-8761-cc6edadf707e" />

**Home Screen -  mobile view dark mode** <img width="271" height="499" alt="image" src="https://github.com/user-attachments/assets/adbd602d-cbe3-44e6-9601-23e2bd29b121" />

## ✨ Key Features

- **📊 Interactive Goals Dashboard (Page 1):**
  - Styled bento-box grid displaying all savings milestones (e.g., "Dream Vacation", "New Workstation", "Emergency Fund").
  - Circular and linear progress indicators built using custom vector strokes and animated offsets.
  - Overall progress indicators representing aggregate savings totals and completion rates.

- **📈 Deep Goal Details & Charting (Page 2):**
  - **Dynamic SVG area-progress charts** that visually render your cumulative savings curves over time, customized automatically per category theme.
  - Complete history ledger of recent deposits with descriptive notes.
  - Fast **Add Funds** interaction directly integrated with simulated or Freighter-signed ledger states.

- **🚀 Stellar Web3 Integrations:**
  - Standardized wallet connections built using the static **`@creit.tech/stellar-wallets-kit` (v2 API)**.
  - Connect and check public keys using Freighter Module auth modal panels.
  - Immersive transaction progress stepper indicating sequence load, operation compiling, consensus broadcasting, and block minting.
  - Direct ledger links to check tx hashes live on the **Stellar Testnet Expert Explorer**.

- **🌓 System-Connected Light & Dark Modes:**
  - Robust CSS variable-based color-graph implemented with `next-themes` and Tailwind v4.
  - Beautiful glassmorphic overlays, ambient neon auroras, and fluid micro-animations.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server-side optimized)
- **Styling:** Tailwind CSS (v4 layout styling system)
- **Animations:** Framer Motion (`motion/react` fluid state morphing)
- **State Management:** Zustand (Persisted client-side storage engine)
- **Web3 Ecosystem:** `@creit.tech/stellar-wallets-kit` v2, `@stellar/stellar-sdk`
- **Icons:** Lucide React (Clean vector symbols)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher) installed.

### Installation

1. Install base package dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to explore the tracker.

---

*Made with 💖 by the Savings Goal Tracker Engineering Team* ![Home Screen](https://picsum.photos/seed/savings_goal_tracker/1200/630)
