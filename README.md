# DeFi Position Protection System

> AI-powered automated position manager that protects users from liquidation without requiring asset custody

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Vincent](https://img.shields.io/badge/Built%20with-Vincent-FF4205)](https://vincent.lol)
[![Powered by Lit Protocol](https://img.shields.io/badge/Powered%20by-Lit%20Protocol-purple)](https://litprotocol.com)

## 🚀 Overview

The DeFi Position Protection System is an automated position management solution that safeguards users from liquidation events in volatile crypto markets. Built on Vincent (Lit Protocol's automation platform), it provides intelligent monitoring and automatic position adjustments without requiring users to custody their assets.

### The Problem

On October 10, 2024, the crypto market experienced its largest liquidation event with **$19 billion in assets liquidated**. The core issues facing DeFi users include:

- ⚡ **Extreme Volatility** - Prices can fluctuate dramatically within minutes, leading to sudden liquidations
- 👁️ **Monitoring Challenges** - Impossible to watch positions 24/7 across multiple protocols
- 🐋 **Whale-Only Solutions** - Existing tools like DeFiSaver require large deposits and asset custody
- 💰 **Limited Accessibility** - High barriers prevent average users from accessing protection tools

### Our Solution

An intelligent, non-custodial position management system offering multiple automated protection modes:

- 🛑 **Stop Loss** - Auto-close positions when price hits configured thresholds
- 🎯 **Take Profit** - Secure gains by closing at target prices
- 📉 **Auto-Repay** - Reduce leverage when prices drop to prevent liquidation
- 📈 **Auto-Boost** - Increase leverage when prices rise to maximize returns
- ⚖️ **Leverage Management** - Continuously rebalance to maintain healthy ratios

## ✨ Key Features

### Non-Custodial Architecture

- **No asset custody required** - Users only delegate permissions, never transfer assets
- **Revocable anytime** - Full control retained by users
- **PKP-based security** - Powered by Lit Protocol's Programmable Key Pairs

### Accessibility

- **No minimum deposit** - Unlike whale-focused solutions
- **Gas-only costs** - Pay only for transaction execution
- **Retail-friendly** - Built for average users, not just large holders

### Automation

- **Price monitoring** - Continuous off-chain price surveillance
- **TEE execution** - Secure, verifiable execution in Trusted Execution Environments
- **Multi-protocol support** - Works with Aave and other DeFi protocols

### Flexibility

- **Multiple protection modes** - Choose from 5 different position management strategies
- **Configurable parameters** - Set custom thresholds for each protection type
- **Cross-chain ready** - Built on Vincent's cross-chain infrastructure

## 🏗️ Architecture

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ (1) Connect & Delegate Permission
       │
┌──────▼──────────────────────────────────┐
│         Frontend (Vite + React)         │
│  - Wallet Connection                    │
│  - Position Configuration               │
│  - Dashboard & Monitoring               │
└──────┬──────────────────────────────────┘
       │
       │ (2) API Calls
       │
┌──────▼──────────────────────────────────┐
│         Backend (Node.js)               │
│  - Vincent App Integration              │
│  - Position Monitoring Service          │
│  - Trigger Detection Logic              │
└──────┬──────────────────────────────────┘
       │
       │ (3) Execute Lit Action
       │
┌──────▼──────────────────────────────────┐
│      Vincent / Lit Protocol             │
│  - PKP Wallet (Agent)                   │
│  - Lit Actions (TEE Execution)          │
│  - MPC-TSS Key Management               │
└──────┬──────────────────────────────────┘
       │
       │ (4) Sign & Submit Transactions
       │
┌──────▼──────────────────────────────────┐
│          Aave Protocol                  │
│  - Supply Collateral                    │
│  - Borrow Assets                        │
│  - Repay Debt                           │
│  - Withdraw Collateral                  │
└─────────────────────────────────────────┘
```

### Component Breakdown

**Frontend (Vite + React)**

- User interface for wallet connection
- Position creation and configuration
- Real-time dashboard showing position health
- Protection mode selection and parameter setting

**Backend (Node.js)**

- REST API for frontend communication
- Off-chain rebalancer agent (monitors positions)
- Vincent App integration
- Price feed aggregation from oracles
- Trigger detection and Lit Action execution

**Vincent / Lit Protocol**

- PKP wallet management (agent identity)
- Lit Actions execution in TEE
- Secure transaction signing via MPC-TSS
- Permission delegation and revocation

**Aave Protocol**

- Collateral supply and withdrawal
- Debt borrowing and repayment
- Position health factor calculation

## 🛠️ Technology Stack

### Frontend

- **Vite** - Fast build tool and dev server
- **React** - UI framework
- **Web3.js / Ethers.js** - Blockchain interaction
- **TailwindCSS** - Styling (if applicable)

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Yarn** - Package manager
- **Vincent SDK** - Automation platform integration
- **Lit Protocol SDK** - PKP and Lit Actions

### Blockchain & DeFi

- **Aave V3** - Lending protocol
- **EVM Chains** - Ethereum, Polygon, Arbitrum, etc.
- **Solana** - (via Vincent's cross-chain support)

## 📦 Installation

### Prerequisites

- Node.js v16 or higher
- Yarn package manager
- MetaMask or compatible Web3 wallet

### Clone Repository

```bash
git clone https://github.com/yourusername/defi-position-protection.git
cd defi-position-protection
```

### Backend Setup

```bash
cd backend
yarn install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URI=
VINCENT_DELEGATEE_PRIVATE_KEY=
CHRONICLE_YELLOWSTONE_RPC=
BASE_SEPOLIA_RPC=
```

### Frontend Setup

```bash
cd frontend
yarn install
```

Create a `.env` file in the frontend directory:

```code
MONGODB_URI=
VINCENT_DELEGATEE_PRIVATE_KEY=
CHRONICLE_YELLOWSTONE_RPC=
BASE_SEPOLIA_RPC=
```

## 🚀 Running the Application

### Start Backend

```bash
cd backend
yarn start
```

The backend server will start on `http://localhost:3000`

Create a .env file in the `lending-automation-backend`

### Start Frontend

```bash
cd frontend
yarn run dev
```

The frontend will start on `http://localhost:5173`

### Access Application

Open your browser and navigate to `http://localhost:5173`

## 🔧 Usage

### 1. Connect Wallet

- Click "Connect Wallet" in the application
- Approve the wallet connection request

### 2. Delegate Permission

- Click "Create Position"
- Review the permission delegation details
- Sign the delegation transaction
- A PKP wallet will be created for your position

### 3. Configure Protection

Choose your protection mode:

**Stop Loss**

- Set minimum collateral price (long) or maximum debt price (short)
- Position auto-closes when threshold is reached

**Take Profit**

- Set maximum collateral price (long) or minimum debt price (short)
- Secure gains automatically at target price

**Leverage Position**

- Set target health ratio (e.g., 1.8)
- System continuously rebalances to maintain ratio

### 4. Supply Collateral

- Enter collateral amount
- Approve token spending
- Supply collateral to Aave via PKP wallet

### 5. Revoke Permission (Optional)

- Click "Revoke Permission" anytime
- Agent will no longer manage your position
- You retain full control of your assets

## 🔗 Integration with Vincent

This project is built on **Vincent**, Lit Protocol's automation and delegation platform that enables secure cross-chain transactions and agent-based automation.

### Vincent Project Configuration

**Vincent Project ID:** 3658078518

Replace `3658078518` with your actual Vincent project ID in the environment variables.

### How Vincent Powers This Project

**1. Programmable Key Pairs (PKPs)**

- Each user position is managed by a unique PKP wallet
- PKPs are decentralized identities secured by Lit Protocol's MPC-TSS network
- Users delegate signing permission to the PKP without transferring assets
- Private keys never exist in a single location - distributed across 100+ nodes

**12 Programmable Key Pairs (PKPs)**



### Vincent Benefits for This Project

✅ **Security** - MPC-TSS and TEE ensure no single point of failure
✅ **Non-Custodial** - Users maintain asset ownership at all times
✅ **Verifiable** - All agent actions are auditable on-chain
✅ **Revocable** - Users can revoke delegation instantly

### Getting Your Vincent Project ID

1. Visit Vincet dashboard
2. Create a new Vincent App
3. Configure your app's abilities(add aave, erc20 approval and transfer)
4. Copy your Project ID from the dashboard
5. Add it to your `.env` files

## 📊 Protection Modes Explained

### Stop Loss Mode

**Purpose:** Prevent liquidation by closing position at predetermined price

**How it works:**

- Set minimum collateral price (long positions)
- Set maximum debt price (short positions)
- When trigger hits, agent repays debt and withdraws collateral
- Position closes automatically

**Use case:** Conservative protection against sudden market drops

---

### Take Profit Mode

**Purpose:** Lock in gains at target price

**How it works:**

- Set maximum collateral price (long positions)
- Set minimum debt price (short positions)
- When target reached, position automatically closes
- Profits secured to wallet

**Use case:** Automated exit strategy for profitable positions

---


### Leverage Position Mode

**Purpose:** Maintain stable leverage ratio

**How it works:**

- Set target health ratio (e.g., 1.8)
- Agent continuously rebalances position
- Borrows more or repays debt to stay at target
- Adapts to price changes automatically

**Use case:** Consistent leverage exposure with automated management

## 🛡️ Security Considerations

### Non-Custodial Design

- **No asset transfers** - Users never send assets to smart contracts or third parties
- **Permission only** - PKP can only sign transactions, not hold assets
- **User-controlled** - Original wallet retains full ownership

### Lit Protocol Security

- **MPC-TSS** - Private key shards distributed across 100+ nodes
- **TEE Execution** - Lit Actions run in tamper-proof environments
- **Threshold Signatures** - Requires 2/3+ nodes to sign transactions
- **Decentralized** - No single point of failure or trust

### Smart Contract Risk

- **Aave audits** - Built on battle-tested Aave V3 protocol
- **Limited scope** - Only interacts with approved contracts
- **Policy constraints** - Agent actions limited by user-defined rules

### Revocation

- Users can revoke PKP permissions instantly
- No lock-up periods or withdrawal delays
- Full control retained at all times

## 🗺️ Roadmap

### Phase 1: MVP (Current)

- ✅ Basic position creation and delegation
- ✅ Stop Loss and Take Profit modes
- ✅ Aave integration on Polygon
- ✅ Simple dashboard UI

### Phase 2: Enhanced Features

- ⏳ Auto-Repay and Auto-Boost modes
- ⏳ Leverage Position continuous rebalancing
- ⏳ Multi-collateral support
- ⏳ Advanced analytics dashboard

### Phase 3: Multi-Chain

- 🔮 Ethereum mainnet support
- 🔮 Arbitrum and Optimism integration
- 🔮 Solana DeFi protocols
- 🔮 Cross-chain position management

### Phase 4: Advanced Automation

- 🔮 AI-powered optimal protection strategies
- 🔮 Social trading features (copy positions)
- 🔮 Portfolio-level risk management
- 🔮 Integration with more lending protocols (Compound, Maker, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vincent Team** - For building the incredible automation platform
- **Lit Protocol** - For pioneering decentralized key management
- **Aave** - For the robust lending protocol

## 🔗 Links

- [Vincent Platform](https://vincent.lol)
- [Lit Protocol Docs](https://developer.litprotocol.com)
- [Aave V3 Docs](https://docs.aave.com)
- [Project Demo](https://demo.yourproject.com)

---

**Built with ❤️ using Vincent and Lit Protocol**

_Protecting DeFi users from the $19B liquidation problem, one position at a time._
