# BidBay - Online Auction Platform
CSC 32200 Software Engineering Project - Fall 2024  
City College of New York

## Overview
BidBay is a modern online auction platform supporting three user types - Visitors, Users, and Super-users, each with distinct privileges and responsibilities. Built with Next.js and Supabase, it provides a comprehensive bidding ecosystem.

## Documentation
[Click here to read the documentation](documentation.md)
## User Types & Flows

### 1. Visitor (V)
- Browse active listings
- View item details and comments
- Apply for User status
  - Complete human verification (arithmetic challenge)
  - Await Super-user approval

### 2. User (U)
- Account Management
  - Deposit/withdraw funds
  - Track transaction history
  - Monitor account rating
  
- Selling
  - Create item listings
  - Set starting bids
  - Choose winning bids
  - Receive payments
  
- Buying
  - Place bids
  - Complete transactions
  - Rate sellers (1-5 scale)
  - File complaints
  
- VIP Status (Automatic upgrade when qualified)
  - Balance > $5,000
  - >5 completed transactions
  - No complaints
  - 10% transaction discount

### 3. Super-user (S)
- User Management
  - Review visitor applications
  - Handle user complaints
  - Manage suspensions
  - Process reactivation requests

## Key Features

### Rating System
- Anonymous 1-5 scale ratings
- Automatic suspension triggers:
  - Rating < 2 from ≥3 users
  - Average rating <2 or >4 (with ≥3 ratings)
- $50 fine or admin approval for reactivation
- Three suspensions result in permanent removal

### VIP Benefits
- 10% discount on transactions
- Suspension immunity (downgrades to User)
- All standard User privileges

### Transaction Security
- Balance verification
- Real-time bid validation
- Escrow system
- Dispute resolution

### Smart Bid Analysis
- AI-powered bidding recommendations
- Real-time price analysis
- Historical data comparison
- Market value assessment
- Powered by Google's Gemini AI

## Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: 
  - Supabase
    - PostgreSQL Database
    - Authentication
    - Real-time subscriptions
    - Row Level Security
  - Google Gemini AI
- Deployment: Vercel

## Installation

1. Clone the repository
```bash
git clone https://github.com/dchen024/csc322-project
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```txt
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>
```

4. Start development server
```bash
npm run dev
```

## Database Schema
Includes tables for:
- Users (authentication & profiles)
- Posts (auction listings)
- Bids (auction participation)
- Orders (transactions)
- Reviews (ratings)
- Issues (complaints)
- Applications (user registration)
- Watchlist (saved items)

## Team

* Evan: Led frontend development using Next.js and Tailwind CSS. Implemented the live bidding feature and suspended user functionality. Suggested bonus for exceptional creativity and UI work.
* Daniel: Developed AI Bid Insight, database schema, and VIP logic. 
* MD: Implemented the rating systems for buyers and sellers and designed
personalized GUI.
* Darien: Designed and developed the admin dashboard. Managed the deployment pipeline.

## License
This project is part of the CSC 32200 Software Engineering course and is for educational purposes only.
